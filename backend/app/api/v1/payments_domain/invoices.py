# @AI-HINT: Invoices router — invoice generation, management, PDF export
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class InvoiceCreate(BaseModel):
    contract_id: int
    amount: float
    description: Optional[str] = None
    due_date: Optional[str] = None

class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    due_date: Optional[str] = None


@router.get("")
async def list_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    where = "WHERE i.client_id = ? OR i.freelancer_id = ?"
    params = [current_user.id, current_user.id]
    if status_filter:
        where += " AND i.status = ?"
        params.append(status_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT i.id, i.contract_id, i.client_id, i.freelancer_id, i.amount,
                   i.currency, i.status, i.description, i.due_date, i.notes,
                   i.invoice_number, i.created_at, i.updated_at,
                   c.project_id, pr.title as project_title,
                   cl.name as client_name, cl.email as client_email,
                   fr.name as freelancer_name, fr.email as freelancer_email
            FROM invoices i
            LEFT JOIN contracts c ON i.contract_id = c.id
            LEFT JOIN projects pr ON c.project_id = pr.id
            LEFT JOIN users cl ON i.client_id = cl.id
            LEFT JOIN users fr ON i.freelancer_id = fr.id
            {where}
            ORDER BY i.created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.get("/{invoice_id}")
async def get_invoice(invoice_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        """SELECT i.id, i.contract_id, i.client_id, i.freelancer_id, i.amount,
                  i.currency, i.status, i.description, i.due_date, i.notes,
                  i.invoice_number, i.created_at, i.updated_at,
                  c.project_id, pr.title as project_title,
                  cl.name as client_name, cl.email as client_email,
                  fr.name as freelancer_name, fr.email as freelancer_email
           FROM invoices i
           LEFT JOIN contracts c ON i.contract_id = c.id
           LEFT JOIN projects pr ON c.project_id = pr.id
           LEFT JOIN users cl ON i.client_id = cl.id
           LEFT JOIN users fr ON i.freelancer_id = fr.id
           WHERE i.id = ? AND (i.client_id = ? OR i.freelancer_id = ?)""",
        [invoice_id, current_user.id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return rows[0]


@router.post("")
async def create_invoice(request: InvoiceCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    invoice_number = f"INV-{int(datetime.now(timezone.utc).timestamp())}"

    contract_result = execute_query(
        "SELECT id, client_id, freelancer_id FROM contracts WHERE id = ?",
        [request.contract_id],
    )
    contract_rows = parse_rows(contract_result)
    if not contract_rows:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = contract_rows[0]
    result = execute_query(
        """INSERT INTO invoices (contract_id, client_id, freelancer_id, amount, currency,
                  status, description, due_date, invoice_number, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'USD', 'draft', ?, ?, ?, ?, ?)""",
        [
            request.contract_id, contract["client_id"], contract["freelancer_id"],
            request.amount, request.description or "", request.due_date,
            invoice_number, now, now,
        ],
    )
    return {"message": "Invoice created", "invoice_id": result.get("last_insert_rowid"), "invoice_number": invoice_number}


@router.put("/{invoice_id}")
async def update_invoice(invoice_id: int, request: InvoiceUpdate, current_user=Depends(get_current_user)):
    rows = parse_rows(execute_query("SELECT id, freelancer_id, status FROM invoices WHERE id = ?", [invoice_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice = rows[0]
    if invoice["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the invoice creator can edit it")

    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Amount/description/due_date only editable while draft
    draft_only = {"amount", "description", "due_date"}
    if any(k in draft_only for k in updates) and invoice["status"] not in ("draft",):
        raise HTTPException(status_code=400, detail="Amount, description and due date can only be changed on draft invoices")

    _ALLOWED = frozenset({"status", "notes", "amount", "description", "due_date"})
    for k in updates:
        if k not in _ALLOWED:
            raise HTTPException(status_code=400, detail=f"Invalid field: {k}")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), invoice_id]
    execute_query(f"UPDATE invoices SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Invoice updated"}


@router.delete("/{invoice_id}")
async def delete_invoice(invoice_id: int, current_user=Depends(get_current_user)):
    rows = parse_rows(execute_query("SELECT id, freelancer_id, status FROM invoices WHERE id = ?", [invoice_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice = rows[0]
    if invoice["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the invoice creator can delete it")
    if invoice["status"] not in ("draft", "cancelled"):
        raise HTTPException(status_code=400, detail=f"Cannot delete invoice in '{invoice['status']}' status — cancel it first")
    execute_query("DELETE FROM invoices WHERE id = ?", [invoice_id])
    return {"message": "Invoice deleted"}


@router.post("/{invoice_id}/send")
async def send_invoice(invoice_id: int, current_user=Depends(get_current_user)):
    """Send an invoice — only the freelancer who created it can send."""
    result = execute_query(
        "SELECT id, freelancer_id, client_id, status FROM invoices WHERE id = ?",
        [invoice_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice = rows[0]
    if invoice["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the invoice creator can send it")
    if invoice["status"] not in ("draft", "updated"):
        raise HTTPException(status_code=400, detail=f"Cannot send invoice in '{invoice['status']}' status")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE invoices SET status = 'sent', updated_at = ? WHERE id = ?",
        [now, invoice_id],
    )

    # In production, send email notification to client here
    logger.info(f"invoice_sent invoice={invoice_id} freelancer={current_user.id} client={invoice['client_id']}")

    return {"message": "Invoice sent"}


@router.post("/{invoice_id}/pay")
async def pay_invoice(invoice_id: int, current_user=Depends(get_current_user)):
    """Pay an invoice (escrow-based).

    Money flow: if the contract's escrow is funded with enough remaining, the
    invoice amount is released from escrow to the freelancer; otherwise it is
    pulled from the client's wallet balance (the same balance MetaMask/crypto
    deposits credit). The platform fee is deducted from the freelancer payout.
    Everything is written in one atomic batch so a partial payment is impossible.
    """
    from app.db.turso_http import get_turso_http
    from app.services.escrow_service import get_user_balance
    from app.api.v1.payments_domain.payments import calculate_tiered_fee

    result = execute_query(
        "SELECT id, contract_id, freelancer_id, client_id, status, amount, currency FROM invoices WHERE id = ?",
        [invoice_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice = rows[0]
    if invoice["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can pay an invoice")
    if invoice["status"] not in ("sent", "overdue"):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot pay an invoice in '{invoice['status']}' status. "
                "The freelancer must send the invoice before it can be paid."
            ),
        )

    amount = float(invoice["amount"] or 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invoice amount must be greater than zero")

    freelancer_id = invoice["freelancer_id"]
    if not freelancer_id:
        raise HTTPException(status_code=400, detail="Invoice has no payee (freelancer) attached")

    currency = invoice.get("currency") or "USD"
    contract_id = invoice.get("contract_id")

    # Platform fee is charged to the freelancer (clients pay 0%).
    fee_info = calculate_tiered_fee(amount)
    platform_fee = float(fee_info["platform_fee"])
    freelancer_amount = round(amount - platform_fee, 2)

    now = datetime.now(timezone.utc).isoformat()

    # Look for a funded escrow on this contract to release from.
    escrow = None
    if contract_id:
        er = parse_rows(execute_query(
            "SELECT id, amount, released_amount, status FROM escrow WHERE contract_id = ? ORDER BY id DESC LIMIT 1",
            [contract_id],
        ))
        if er:
            escrow = er[0]

    statements: list = []
    funding_source: str

    escrow_available = 0.0
    if escrow and escrow.get("status") in ("funded", "active"):
        escrow_available = float(escrow.get("amount") or 0) - float(escrow.get("released_amount") or 0)

    if escrow and escrow_available >= amount:
        # Release from escrow.
        new_released = float(escrow.get("released_amount") or 0) + amount
        new_status = "released" if new_released >= float(escrow.get("amount") or 0) else escrow.get("status")
        statements.append({
            "q": "UPDATE escrow SET released_amount = ?, status = ?, updated_at = ? WHERE id = ?",
            "params": [new_released, new_status, now, escrow["id"]],
        })
        funding_source = "escrow"
    else:
        # Fall back to the client's wallet balance (MetaMask/crypto deposits land here).
        client_balance = get_user_balance(current_user.id)
        if client_balance < amount:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Insufficient funds to pay this invoice. Fund the contract's escrow "
                    "or add money to your wallet (deposit) and try again."
                ),
            )
        statements.append({
            "q": "UPDATE users SET account_balance = account_balance - ? WHERE id = ? AND account_balance >= ?",
            "params": [amount, current_user.id, amount],
        })
        funding_source = "wallet"

    # Credit the freelancer (net of platform fee).
    statements.append({
        "q": "UPDATE users SET account_balance = account_balance + ? WHERE id = ?",
        "params": [freelancer_amount, freelancer_id],
    })

    # Record the payment (live payments schema uses client_id/freelancer_id).
    statements.append({
        "q": """INSERT INTO payments (contract_id, client_id, freelancer_id, amount, currency,
                       payment_method, status, description, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)""",
        "params": [
            contract_id, current_user.id, freelancer_id, amount, currency, funding_source,
            f"Invoice #{invoice_id} payment (platform fee ${platform_fee:.2f})", now, now,
        ],
    })

    # Ledger entry for the freelancer payout.
    statements.append({
        "q": """INSERT INTO wallet_transactions (user_id, type, amount, currency, description, status, reference_id, created_at)
                VALUES (?, 'invoice_payment', ?, ?, ?, 'completed', ?, ?)""",
        "params": [freelancer_id, freelancer_amount, currency, f"Invoice #{invoice_id} paid", invoice_id, now],
    })

    # Mark the invoice paid.
    statements.append({
        "q": "UPDATE invoices SET status = 'paid', updated_at = ? WHERE id = ?",
        "params": [now, invoice_id],
    })

    try:
        get_turso_http().execute_many(statements)
    except Exception as e:
        logger.error(f"invoice_pay_failed invoice={invoice_id} client={current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Payment failed — no funds were moved. Please try again.")

    logger.info(
        f"invoice_paid invoice={invoice_id} client={current_user.id} freelancer={freelancer_id} "
        f"amount={amount} fee={platform_fee} via={funding_source}"
    )

    return {
        "message": "Invoice paid",
        "funding_source": funding_source,
        "amount": amount,
        "platform_fee": platform_fee,
        "freelancer_amount": freelancer_amount,
    }
