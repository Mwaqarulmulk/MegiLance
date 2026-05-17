# @AI-HINT: Enhanced wallet API - delegates DB operations to wallet_service
"""
Enhanced wallet management endpoints
Includes: balances, transaction history, payouts, deposits, and analytics
"""

import json
import logging
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import List, Optional

logger = logging.getLogger(__name__)

from app.core.security import get_current_active_user
from app.db.turso_http import get_turso_http
from app.models.user import User
from app.services import wallet_service
from app.services.db_utils import paginate_params
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

router = APIRouter()


# ==================== SCHEMAS ====================


class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    ESCROW_LOCK = "escrow_lock"
    ESCROW_RELEASE = "escrow_release"
    REFUND = "refund"
    BONUS = "bonus"
    FEE = "fee"
    MILESTONE_PAYMENT = "milestone_payment"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class WalletBalance(BaseModel):
    available: float = Field(default=0.0, description="Available for withdrawal")
    pending: float = Field(default=0.0, description="Pending clearance")
    escrow: float = Field(default=0.0, description="Locked in escrow")
    total: float = Field(default=0.0, description="Total balance")
    currency: str = "USD"
    last_updated: str | None = None


class WalletTransaction(BaseModel):
    id: int
    type: str
    amount: float
    currency: str
    status: str
    description: str | None = None
    reference_id: str | None = None
    created_at: str
    completed_at: str | None = None


class WithdrawalRequest(BaseModel):
    amount: float = Field(..., gt=0, le=50000, description="Amount to withdraw")
    method: str = Field(..., pattern="^(bank_transfer|paypal|crypto|wise)$")
    destination: str = Field(..., min_length=5, max_length=200)
    currency: str = Field(default="USD", pattern="^(USD|EUR|GBP|USDC|USDT)$")


class DepositRequest(BaseModel):
    amount: float = Field(..., gt=0, le=100000)
    method: str = Field(..., pattern="^(bank_transfer|crypto|binance)$")
    currency: str = Field(default="USD")


class PayoutSchedule(BaseModel):
    frequency: str = Field(..., pattern="^(instant|daily|weekly|monthly)$")
    minimum_amount: float = Field(default=100, ge=10)
    destination_type: str = Field(..., pattern="^(bank|paypal|crypto)$")
    destination_details: str


# ==================== ENDPOINTS ====================


@router.get("/balance", response_model=WalletBalance)
async def get_wallet_balance(current_user: User = Depends(get_current_active_user)):
    """Get current wallet balance with breakdown"""
    wallet_service.ensure_wallet_tables()
    balance = wallet_service.get_or_create_balance(current_user.id)
    return WalletBalance(**balance)


@router.get("/transactions", response_model=List[WalletTransaction])
async def get_transaction_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    type: Optional[str] = Query(None, description="Filter by transaction type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    from_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    to_date: Optional[str] = Query(None, description="End date (ISO format)"),
    current_user: User = Depends(get_current_active_user),
):
    """Get wallet transaction history with filters"""
    offset, limit = paginate_params(page, page_size)
    wallet_service.ensure_wallet_tables()
    rows = wallet_service.get_transaction_history(
        user_id=current_user.id,
        skip=offset,
        limit=limit,
        tx_type=type,
        tx_status=status,
        from_date=from_date,
        to_date=to_date,
    )
    return [WalletTransaction(**r) for r in rows]


@router.post("/withdraw")
async def request_withdrawal(
    request: WithdrawalRequest, current_user: User = Depends(get_current_active_user)
):
    """Request a withdrawal from available balance"""
    wallet_service.ensure_wallet_tables()

    balance = wallet_service.get_or_create_balance(current_user.id)
    if balance["available"] < request.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient available balance. Available: ${balance['available']:.2f}",
        )

    if request.amount < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum withdrawal amount is $10",
        )

    reference_id = (
        f"WD-{current_user.id}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    )

    # Atomic deduction: WHERE available >= amount prevents concurrent over-withdrawal
    if not wallet_service.deduct_for_withdrawal(current_user.id, request.amount):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient available balance (concurrent withdrawal detected)",
        )
    wallet_service.create_transaction(
        user_id=current_user.id,
        tx_type="withdrawal",
        amount=request.amount,
        currency=request.currency,
        status="processing",
        description=f"Withdrawal to {request.method}",
        reference_id=reference_id,
        metadata=json.dumps(
            {"method": request.method, "destination": request.destination}
        ),
    )

    estimated_days = {"bank_transfer": 3, "paypal": 1, "crypto": 0, "wise": 1}
    eta = datetime.now(timezone.utc) + timedelta(
        days=estimated_days.get(request.method, 3)
    )

    return {
        "message": "Withdrawal request submitted",
        "reference_id": reference_id,
        "amount": request.amount,
        "currency": request.currency,
        "method": request.method,
        "status": "processing",
        "estimated_arrival": eta.isoformat(),
    }


@router.get("/withdrawals/pending")
async def get_pending_withdrawals(
    current_user: User = Depends(get_current_active_user),
):
    """Get all pending/processing withdrawal requests for the current user."""
    wallet_service.ensure_wallet_tables()
    turso = get_turso_http()
    rows = turso.execute(
        """SELECT id, type, amount, currency, status, description, reference_id, created_at
           FROM wallet_transactions
           WHERE user_id = ? AND type = 'withdrawal' AND status IN ('pending', 'processing')
           ORDER BY created_at DESC""",
        [current_user.id],
    )
    columns = rows.get("columns", [])
    result_rows = rows.get("rows", [])
    withdrawals = [dict(zip(columns, r)) for r in result_rows]
    return {"withdrawals": withdrawals, "total": len(withdrawals)}


@router.delete("/withdrawals/{reference_id}")
async def cancel_withdrawal(
    reference_id: str, current_user: User = Depends(get_current_active_user)
):
    """Cancel a pending withdrawal and refund the amount to available balance."""
    wallet_service.ensure_wallet_tables()
    turso = get_turso_http()

    row = turso.fetch_one(
        """SELECT id, amount, currency, status FROM wallet_transactions
           WHERE reference_id = ? AND user_id = ? AND type = 'withdrawal'""",
        [reference_id, current_user.id],
    )
    if not row:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    # row indices: 0=id, 1=amount, 2=currency, 3=status
    if row[3] not in ("pending", "processing"):
        raise HTTPException(
            status_code=400,
            detail="Only pending or processing withdrawals can be cancelled",
        )

    now = datetime.now(timezone.utc).isoformat()
    amount = float(row[1])

    # Mark the transaction as cancelled
    turso.execute(
        "UPDATE wallet_transactions SET status = 'cancelled', completed_at = ? "
        "WHERE reference_id = ? AND user_id = ?",
        [now, reference_id, current_user.id],
    )
    # Refund the amount back to the user's available balance
    turso.execute(
        "UPDATE wallet_balances SET available = available + ?, updated_at = ? WHERE user_id = ?",
        [amount, now, current_user.id],
    )

    return {
        "message": "Withdrawal cancelled and amount refunded",
        "refunded_amount": amount,
    }


@router.post("/deposit")
async def initiate_deposit(
    request: DepositRequest, current_user: User = Depends(get_current_active_user)
):
    """Initiate a deposit to wallet via bank transfer, crypto, or Binance Pay"""
    wallet_service.ensure_wallet_tables()

    reference_id = (
        f"DEP-{current_user.id}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    )

    # Record pending transaction
    wallet_service.create_transaction(
        user_id=current_user.id,
        tx_type="deposit",
        amount=request.amount,
        currency=request.currency,
        status="pending",
        description=f"Deposit via {request.method}",
        reference_id=reference_id,
        metadata=json.dumps({"method": request.method}),
    )

    if request.method in ("crypto", "binance"):
        # Generate a unique deposit reference for Binance Pay / crypto
        deposit_address = f"USDT_DEPOSIT_{reference_id}"  # Placeholder until Binance API is configured
        return {
            "message": "Crypto deposit initiated",
            "reference_id": reference_id,
            "amount": request.amount,
            "currency": request.currency,
            "method": request.method,
            "status": "awaiting_payment",
            "payment_details": {
                "type": "crypto",
                "network": "BSC",  # Binance Smart Chain
                "token": "USDT",
                "deposit_reference": reference_id,
                "instructions": "Send USDT (BEP-20) to the platform wallet. Include your reference ID in the memo.",
                "note": "Deposit will be credited within 1-3 confirmations",
            },
        }
    else:
        # Bank transfer
        return {
            "message": "Deposit initiated",
            "reference_id": reference_id,
            "amount": request.amount,
            "currency": request.currency,
            "method": request.method,
            "status": "awaiting_payment",
            "payment_details": {
                "type": "bank_transfer",
                "status": "awaiting_payment",
                "reference": reference_id,
                "instructions": "Wire transfer details will be sent to your email.",
            },
        }


@router.get("/analytics")
async def get_wallet_analytics(
    period: str = Query("30d", pattern="^(7d|30d|90d|1y|all)$"),
    current_user: User = Depends(get_current_active_user),
):
    """Get wallet analytics and insights"""
    wallet_service.ensure_wallet_tables()

    period_days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365, "all": 3650}
    start_date = (
        datetime.now(timezone.utc) - timedelta(days=period_days.get(period, 30))
    ).isoformat()

    analytics = wallet_service.get_wallet_analytics(current_user.id, start_date)
    balance = wallet_service.get_or_create_balance(current_user.id)

    total_income = analytics["total_income"]
    total_expenses = analytics["total_expenses"]

    return {
        "period": period,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_flow": total_income - total_expenses,
        "transaction_count": analytics["transaction_count"],
        "current_balance": balance,
        "insights": [
            {
                "type": "tip",
                "message": "Set up automatic payouts to reduce withdrawal fees",
            },
            {
                "type": "stat",
                "message": f"You've earned ${total_income:.2f} in the last {period}",
            },
        ]
        if total_income > 0
        else [],
    }


@router.get("/payout-schedule")
async def get_payout_schedule(current_user: User = Depends(get_current_active_user)):
    """Get user's automatic payout schedule"""
    wallet_service.ensure_wallet_tables()
    schedule = wallet_service.get_payout_schedule(current_user.id)
    if schedule:
        return {"is_configured": True, **schedule}
    return {
        "is_configured": False,
        "message": "No automatic payout schedule configured",
    }


@router.post("/payout-schedule")
async def set_payout_schedule(
    schedule: PayoutSchedule, current_user: User = Depends(get_current_active_user)
):
    """Configure automatic payout schedule"""
    wallet_service.ensure_wallet_tables()

    next_payout_days = {"instant": 0, "daily": 1, "weekly": 7, "monthly": 30}
    next_payout = (
        datetime.now(timezone.utc)
        + timedelta(days=next_payout_days.get(schedule.frequency, 7))
    ).isoformat()

    wallet_service.upsert_payout_schedule(
        user_id=current_user.id,
        frequency=schedule.frequency,
        minimum_amount=schedule.minimum_amount,
        destination_type=schedule.destination_type,
        destination_details=schedule.destination_details,
        next_payout=next_payout,
    )

    return {
        "message": "Payout schedule configured",
        "frequency": schedule.frequency,
        "minimum_amount": schedule.minimum_amount,
        "destination_type": schedule.destination_type,
        "next_payout_at": next_payout,
        "is_active": True,
    }


@router.delete("/payout-schedule")
async def disable_payout_schedule(
    current_user: User = Depends(get_current_active_user),
):
    """Disable automatic payouts"""
    wallet_service.ensure_wallet_tables()
    wallet_service.disable_payout_schedule(current_user.id)
    return {"message": "Automatic payouts disabled"}
