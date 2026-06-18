# @AI-HINT: Invoices router — invoice generation, management, payment.
# Uses the REAL invoices table schema: from_user_id (freelancer/issuer),
# to_user_id (client/payer), subtotal, tax, total, notes, items. Responses are
# mapped to the field names the frontend expects (amount, client_id, etc.).
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import json
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class InvoiceItem(BaseModel):
    description: Optional[str] = ""
    amount: float = 0


class InvoiceCreate(BaseModel):
    contract_id: int
    # Either provide line items, or a single amount.
    items: Optional[List[InvoiceItem]] = None
    amount: Optional[float] = None
    tax_rate: float = 0
    description: Optional[str] = None
    notes: Optional[str] = None
    due_date: Optional[str] = None


class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    due_date: Optional[str] = None


_SELECT = """
    SELECT i.id, i.invoice_number, i.contract_id, i.from_user_id, i.to_user_id,
           i.subtotal, i.tax, i.total, i.due_date, i.paid_date, i.status,
           i.items, i.notes, i.created_at, i.updated_at,
           c.project_id AS project_id, pr.title AS project_title,
           fr.name AS freelancer_name, cl.name AS client_name
    FROM invoices i
    LEFT JOIN contracts c ON i.contract_id = c.id
    LEFT JOIN projects pr ON c.project_id = pr.id
    LEFT JOIN users fr ON i.from_user_id = fr.id
    LEFT JOIN users cl ON i.to_user_id = cl.id
"""


def _map_invoice(row: dict) -> dict:
    """Map a raw invoices row (real schema) to the API/frontend shape."""
    try:
        items = json.loads(row.get("items")) if row.get("items") else []
    except Exception:
        items = []
    total = float(row.get("total") or 0)
    notes = row.get("notes") or ""
    return {
        "id": row.get("id"),
        "invoice_number": row.get("invoice_number"),
        "contract_id": row.get("contract_id"),
        # Canonical + frontend-friendly party fields
        "from_user_id": row.get("from_user_id"),
        "to_user_id": row.get("to_user_id"),
        "freelancer_id": row.get("from_user_id"),
        "client_id": row.get("to_user_id"),
        "freelancer_name": row.get("freelancer_name") or "",
        "client_name": row.get("client_name") or "",
        "project_id": row.get("project_id"),
        "project_title": row.get("project_title") or "",
        "subtotal": float(row.get("subtotal") or 0),
        "tax": float(row.get("tax") or 0),
        "total": total,
        "amount": total,
        "currency": "USD",
        "status": row.get("status") or "draft",
        "description": notes,
        "notes": notes,
        "items": items,
        "due_date": row.get("due_date"),
        "paid_date": row.get("paid_date"),
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
    }


@router.get("")
async def list_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    # Parenthesised party predicate so an added status filter can't leak rows.
    where = "WHERE (i.from_user_id = ? OR i.to_user_id = ?)"
    params: list = [current_user.id, current_user.id]
    if status_filter:
        where += " AND i.status = ?"
        params.append(status_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"{_SELECT} {where} ORDER BY i.created_at DESC LIMIT ? OFFSET ?",
        params,
    )
    rows = parse_rows(result) or []
    items = [_map_invoice(r) for r in rows]
    return {"items": items, "total": len(items), "page": page}


@router.get("/{invoice_id}")
async def get_invoice(invoice_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        f"{_SELECT} WHERE i.id = ? AND (i.from_user_id = ? OR i.to_user_id = ?)",
        [invoice_id, current_user.id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return _map_invoice(rows[0])


@router.post("")
async def create_invoice(request: InvoiceCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    invoice_number = f"INV-{int(datetime.now(timezone.utc).timestamp())}"

    contract_rows = parse_rows(execute_query(
        "SELECT id, client_id, freelancer_id FROM contracts WHERE id = ?",
        [request.contract_id],
    ))
    if not contract_rows:
        raise HTTPException(status_code=404, detail="Contract not found")
    contract = contract_rows[0]

    # Only a party on the contract may raise an invoice against it.
    if current_user.id not in (contract["client_id"], contract["freelancer_id"]):
        raise HTTPException(status_code=403, detail="Only a contract party can create an invoice")

    # The freelancer is always the issuer/payee; the client is the payer.
    from_user_id = contract["freelancer_id"]
    to_user_id = contract["client_id"]

    # Resolve amount from line items or a flat amount.
    items_list = [{"description": i.description or "", "amount": float(i.amount or 0)} for i in (request.items or [])]
    if items_list:
        subtotal = sum(i["amount"] for i in items_list)
    else:
        subtotal = float(request.amount or 0)
    if subtotal <= 0:
        raise HTTPException(status_code=400, detail="Invoice amount must be greater than zero")
    tax = round(subtotal * (float(request.tax_rate or 0) / 100), 2)
    total = round(subtotal + tax, 2)
    notes = request.notes or request.description or ""

    result = execute_query(
        """INSERT INTO invoices (invoice_number, contract_id, from_user_id, to_user_id,
                  subtotal, tax, total, due_date, status, notes, items, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)""",
        [
            invoice_number, request.contract_id, from_user_id, to_user_id,
            subtotal, tax, total, request.due_date, notes,
            json.dumps(items_list), now, now,
        ],
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create invoice")

    return {
        "message": "Invoice created",
        "invoice_id": result.get("last_insert_rowid"),
        "invoice_number": invoice_number,
    }


@router.put("/{invoice_id}")
async def update_invoice(invoice_id: int, request: InvoiceUpdate, current_user=Depends(get_current_user)):
    rows = parse_rows(execute_query("SELECT id, from_user_id, status FROM invoices WHERE id = ?", [invoice_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice = rows[0]
    if invoice["from_user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the invoice creator can edit it")

    # Map friendly fields to real columns.
    set_parts: list = []
    values: list = []
    if request.status is not None:
        set_parts.append("status = ?"); values.append(request.status)
    if request.notes is not None or request.description is not None:
        set_parts.append("notes = ?"); values.append(request.notes if request.notes is not None else request.description)
    if request.due_date is not None:
        set_parts.append("due_date = ?"); values.append(request.due_date)
    if request.amount is not None:
        if invoice["status"] not in ("draft",):
            raise HTTPException(status_code=400, detail="Amount can only be changed on draft invoices")
        set_parts.append("subtotal = ?"); values.append(request.amount)
        set_parts.append("total = ?"); values.append(request.amount)

    if not set_parts:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts.append("updated_at = ?")
    values.append(datetime.now(timezone.utc).isoformat())
    values.append(invoice_id)
    execute_query(f"UPDATE invoices SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Invoice updated"}


@router.delete("/{invoice_id}")
async def delete_invoice(invoice_id: int, current_user=Depends(get_current_user)):
    rows = parse_rows(execute_query("SELECT id, from_user_id, status FROM invoices WHERE id = ?", [invoice_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice = rows[0]
    if invoice["from_user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the invoice creator can delete it")
    if invoice["status"] not in ("draft", "cancelled"):
        raise HTTPException(status_code=400, detail=f"Cannot delete invoice in '{invoice['status']}' status — cancel it first")
    execute_query("DELETE FROM invoices WHERE id = ?", [invoice_id])
    return {"message": "Invoice deleted"}


@router.post("/{invoice_id}/send")
async def send_invoice(invoice_id: int, current_user=Depends(get_current_user)):
    """Send an invoice — only the freelancer (issuer) who created it can send."""
    rows = parse_rows(execute_query(
        "SELECT id, from_user_id, to_user_id, status FROM invoices WHERE id = ?",
        [invoice_id],
    ))
    if not rows:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice = rows[0]
    if invoice["from_user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the invoice creator can send it")
    if invoice["status"] not in ("draft", "pending", "updated"):
        raise HTTPException(status_code=400, detail=f"Cannot send invoice in '{invoice['status']}' status")

    now = datetime.now(timezone.utc).isoformat()
    execute_query("UPDATE invoices SET status = 'sent', updated_at = ? WHERE id = ?", [now, invoice_id])
    logger.info(f"invoice_sent invoice={invoice_id} freelancer={current_user.id} client={invoice['to_user_id']}")
    return {"message": "Invoice sent"}


@router.post("/{invoice_id}/pay")
async def pay_invoice(invoice_id: int, current_user=Depends(get_current_user)):
    """Pay an invoice (escrow-first, wallet fallback).

    from_user_id = freelancer (payee), to_user_id = client (payer). The invoice
    amount is released from the contract's funded escrow if available, otherwise
    pulled from the client's wallet balance. The platform fee is deducted from
    the freelancer payout. Written as one atomic batch.
    """
    from app.db.turso_http import get_turso_http
    from app.services.escrow_service import get_user_balance
    from app.api.v1.payments_domain.payments import calculate_tiered_fee

    rows = parse_rows(execute_query(
        "SELECT id, contract_id, from_user_id, to_user_id, status, total FROM invoices WHERE id = ?",
        [invoice_id],
    ))
    if not rows:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice = rows[0]
    client_id = invoice["to_user_id"]
    freelancer_id = invoice["from_user_id"]

    if client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can pay an invoice")
    if invoice["status"] not in ("sent", "overdue"):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot pay an invoice in '{invoice['status']}' status. "
                "The freelancer must send the invoice before it can be paid."
            ),
        )

    amount = float(invoice["total"] or 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invoice amount must be greater than zero")
    if not freelancer_id:
        raise HTTPException(status_code=400, detail="Invoice has no payee (freelancer) attached")

    contract_id = invoice.get("contract_id")
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
    escrow_available = 0.0
    if escrow and escrow.get("status") in ("funded", "active"):
        escrow_available = float(escrow.get("amount") or 0) - float(escrow.get("released_amount") or 0)

    if escrow and escrow_available >= amount:
        new_released = float(escrow.get("released_amount") or 0) + amount
        new_status = "released" if new_released >= float(escrow.get("amount") or 0) else escrow.get("status")
        statements.append({
            "q": "UPDATE escrow SET released_amount = ?, status = ?, updated_at = ? WHERE id = ?",
            "params": [new_released, new_status, now, escrow["id"]],
        })
        funding_source = "escrow"
    else:
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
        "q": "UPDATE users SET account_balance = COALESCE(account_balance, 0) + ? WHERE id = ?",
        "params": [freelancer_amount, freelancer_id],
    })

    # Record the payment using the REAL payments schema.
    statements.append({
        "q": """INSERT INTO payments (contract_id, from_user_id, to_user_id, amount, payment_type,
                       payment_method, status, platform_fee, freelancer_amount, description, processed_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'invoice', ?, 'completed', ?, ?, ?, ?, ?, ?)""",
        "params": [
            contract_id, client_id, freelancer_id, amount, funding_source,
            platform_fee, freelancer_amount,
            f"Invoice #{invoice_id} payment (platform fee ${platform_fee:.2f})", now, now, now,
        ],
    })

    # Ledger entry for the freelancer payout.
    statements.append({
        "q": """INSERT INTO wallet_transactions (user_id, type, amount, currency, description, status, reference_id, created_at)
                VALUES (?, 'invoice_payment', ?, 'USD', ?, 'completed', ?, ?)""",
        "params": [freelancer_id, freelancer_amount, f"Invoice #{invoice_id} paid", str(invoice_id), now],
    })

    # Mark the invoice paid.
    statements.append({
        "q": "UPDATE invoices SET status = 'paid', paid_date = ?, updated_at = ? WHERE id = ?",
        "params": [now, now, invoice_id],
    })

    try:
        get_turso_http().execute_many(statements)
    except Exception as e:
        logger.error(f"invoice_pay_failed invoice={invoice_id} client={current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Payment failed — no funds were moved. Please try again.")

    # Refresh cached dashboard stats so earnings/spending update immediately.
    try:
        from app.services.portal_service import _invalidate_stats_cache
        _invalidate_stats_cache(f"freelancer_stats_{freelancer_id}")
        _invalidate_stats_cache(f"client_stats_{client_id}")
    except Exception:
        pass

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
