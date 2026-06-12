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
                   c.project_id, pr.title as project_title
            FROM invoices i
            LEFT JOIN contracts c ON i.contract_id = c.id
            LEFT JOIN projects pr ON c.project_id = pr.id
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
                  i.invoice_number, i.created_at, i.updated_at
           FROM invoices i WHERE i.id = ? AND (i.client_id = ? OR i.freelancer_id = ?)""",
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
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), invoice_id]

    execute_query(f"UPDATE invoices SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Invoice updated"}


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
    """Pay an invoice — only the client who received it can mark as paid."""
    result = execute_query(
        "SELECT id, freelancer_id, client_id, status, amount FROM invoices WHERE id = ?",
        [invoice_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice = rows[0]
    if invoice["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can pay an invoice")
    if invoice["status"] not in ("sent", "overdue"):
        raise HTTPException(status_code=400, detail=f"Cannot pay invoice in '{invoice['status']}' status")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE invoices SET status = 'paid', updated_at = ? WHERE id = ?",
        [now, invoice_id],
    )

    # Create payment record
    execute_query(
        """INSERT INTO payments (contract_id, client_id, freelancer_id, amount, currency, payment_method, status, description, created_at, updated_at)
           VALUES ((SELECT contract_id FROM invoices WHERE id = ?), ?, ?, ?, 'USD', 'invoice', 'completed', ?, ?, ?)""",
        [invoice_id, current_user.id, invoice["freelancer_id"], invoice["amount"], f"Invoice #{invoice_id} payment", now, now],
    )

    # Update freelancer balance
    execute_query(
        "UPDATE users SET account_balance = account_balance + ? WHERE id = ?",
        [invoice["amount"], invoice["freelancer_id"]],
    )

    logger.info(f"invoice_paid invoice={invoice_id} client={current_user.id} amount={invoice['amount']}")

    return {"message": "Invoice marked as paid"}
