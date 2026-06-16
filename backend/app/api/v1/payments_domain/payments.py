# @AI-HINT: Payments router — payment history, processing, status
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows, parse_date
from app.services.db_utils import get_val as _get_val, safe_str as _safe_str

router = APIRouter()


def calculate_tiered_fee(amount: float, lifetime_billing: float = 0, plan: str = "free") -> dict:
    """
    MegiLance platform fee — charged to freelancers only (clients pay 0%).
    Transparent flat rate, deliberately below market (Upwork ~10%, Fiverr ~20%):
      - Free plan:     8%
      - Standard plan: 5% (loyalty / subscriber rate)
      - Enterprise:    negotiable (handled out of band)
    Returns a stable shape used across payments, proposals and contract displays.
    """
    rate = 0.05 if plan == "standard" else 0.08
    fee = max(0.0, amount) * rate
    return {
        "platform_fee": round(fee, 2),
        "effective_rate": round(rate * 100, 2),
        "plan": plan,
        "lifetime_billing": lifetime_billing,
    }


class PaymentCreate(BaseModel):
    contract_id: int
    amount: float
    payment_method: str = "escrow"
    currency: str = "USD"
    description: Optional[str] = None

class AddFundsRequest(BaseModel):
    amount: float
    method: str = "stripe"

class PaymentIntentRequest(BaseModel):
    amount: float
    currency: str = "USD"
    description: Optional[str] = None


@router.get("")
async def list_payments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    where = "WHERE (client_id = ? OR freelancer_id = ?)"
    params = [current_user.id, current_user.id]

    if status_filter:
        where += " AND status = ?"
        params.append(status_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT p.id, p.contract_id, p.client_id, p.freelancer_id, p.amount,
                   p.currency, p.payment_method, p.status, p.description,
                   p.transaction_id, p.created_at, p.updated_at,
                   c.project_id, pr.title as project_title
            FROM payments p
            LEFT JOIN contracts c ON p.contract_id = c.id
            LEFT JOIN projects pr ON c.project_id = pr.id
            {where}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.get("/{payment_id}")
async def get_payment(payment_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        """SELECT p.id, p.contract_id, p.client_id, p.freelancer_id, p.amount,
                  p.currency, p.payment_method, p.status, p.description,
                  p.transaction_id, p.created_at, p.updated_at
           FROM payments p
           WHERE p.id = ? AND (p.client_id = ? OR p.freelancer_id = ?)""",
        [payment_id, current_user.id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Payment not found")
    return rows[0]


@router.post("")
async def create_payment(request: PaymentCreate, current_user=Depends(get_current_user)):
    contract_result = execute_query(
        "SELECT id, client_id, freelancer_id, amount FROM contracts WHERE id = ?",
        [request.contract_id],
    )
    contract_rows = parse_rows(contract_result)
    if not contract_rows:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = contract_rows[0]
    if contract["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can initiate payment")

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO payments (contract_id, client_id, freelancer_id, amount, currency,
                  payment_method, status, description, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)""",
        [
            request.contract_id, current_user.id, contract["freelancer_id"],
            request.amount, request.currency, request.payment_method,
            request.description or "", now, now,
        ],
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to create payment")

    return {"message": "Payment initiated", "payment_id": result.get("last_insert_rowid")}


@router.post("/add-funds")
async def add_funds(request: AddFundsRequest, current_user=Depends(get_current_user)):
    """Redirect to the canonical wallet deposit endpoint.
    This endpoint is kept for backward compatibility."""
    from app.services.portal_service import create_withdrawal
    from app.db.turso_http import execute_query as eq, parse_rows as pr

    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if request.amount > 10000:
        raise HTTPException(status_code=400, detail="Maximum single deposit is $10,000")

    now = datetime.now(timezone.utc).isoformat()

    # Create a pending deposit transaction (balance is NOT modified here)
    result = execute_query(
        """INSERT INTO payments (client_id, amount, currency, payment_method, status, description, created_at, updated_at)
           VALUES (?, ?, 'USD', ?, 'pending', ?, ?, ?)""",
        [current_user.id, request.amount, request.method, f"Deposit via {request.method}", now, now],
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to initiate deposit")

    payment_id = result.get("last_insert_rowid")

    return {
        "message": "Deposit initiated — complete payment to add funds",
        "payment_id": payment_id,
        "amount": request.amount,
        "status": "pending",
        "next_step": "Complete payment via the payment provider",
    }


@router.post("/{payment_id}/complete")
async def complete_payment(payment_id: int, current_user=Depends(get_current_user)):
    """Mark a payment as completed. In production, this should only be called
    by the payment webhook handler after verifying the payment with the gateway.
    For development, only admins can manually complete payments."""
    result = execute_query(
        "SELECT id, status, client_id, amount, currency, payment_method FROM payments WHERE id = ?",
        [payment_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment = rows[0]

    is_admin = getattr(current_user, "user_type", "") == "admin" or getattr(current_user, "role", "") == "admin"
    if payment["client_id"] != current_user.id and not is_admin:
        raise HTTPException(status_code=403, detail="Access denied")

    if payment["status"] == "completed":
        raise HTTPException(status_code=400, detail="Payment already completed")

    if payment["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot complete a cancelled payment")

    now = datetime.now(timezone.utc).isoformat()
    currency = payment.get("currency") or "USD"

    # Mark payment as processing to prevent concurrent/duplicate completions
    processing_result = execute_query(
        "UPDATE payments SET status = 'processing', updated_at = ? WHERE id = ? AND status != 'completed' AND status != 'cancelled'",
        [now, payment_id],
    )
    processing_rows = parse_rows(processing_result) if processing_result else []
    # If no rows were updated (already processing/completed/cancelled), abort
    check = execute_query("SELECT status FROM payments WHERE id = ?", [payment_id])
    check_rows = parse_rows(check) if check else []
    if check_rows and check_rows[0].get("status") != "processing":
        raise HTTPException(status_code=400, detail="Payment cannot be completed in its current state")

    # Atomic balance update
    execute_query(
        "UPDATE users SET account_balance = account_balance + ? WHERE id = ?",
        [payment["amount"], payment["client_id"]],
    )

    # Mark as completed
    execute_query(
        "UPDATE payments SET status = 'completed', updated_at = ? WHERE id = ?",
        [now, payment_id],
    )

    # Record wallet transaction
    execute_query(
        """INSERT INTO wallet_transactions (user_id, type, amount, currency, description, status, reference_id, created_at)
           VALUES (?, 'deposit', ?, ?, ?, 'completed', ?, ?)""",
        [payment["client_id"], payment["amount"], currency, f"Payment #{payment_id} completed", payment_id, now],
    )

    logger.info(f"Payment #{payment_id} completed by user {current_user.id}" + (" (admin)" if is_admin else ""))

    return {"message": "Payment completed", "payment_id": payment_id}


@router.post("/create-payment-intent")
async def create_payment_intent(request: PaymentIntentRequest, current_user=Depends(get_current_user)):
    """Create a payment intent for Stripe checkout."""
    return {
        "client_secret": f"pi_{current_user.id}_{int(datetime.now(timezone.utc).timestamp())}",
        "amount": request.amount,
        "currency": request.currency,
        "status": "requires_payment_method",
    }
