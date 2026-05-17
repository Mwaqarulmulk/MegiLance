# @AI-HINT: Invoice API endpoints - delegates to invoices_service for all DB operations
from datetime import date
from typing import Optional

from app.core.security import get_current_user
from app.models import User
from app.schemas.invoice import (
    InvoiceCreate,
    InvoiceList,
    InvoicePayment,
    InvoiceRead,
    InvoiceUpdate,
)
from app.services import invoices_service
from app.services.db_utils import get_user_role
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import HTMLResponse

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.post("/", response_model=InvoiceRead, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice: InvoiceCreate, current_user: User = Depends(get_current_user)
):
    """Create a new invoice. Freelancers create invoices for their contracts."""
    contract = invoices_service.get_contract_freelancer(invoice.contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    if contract["freelancer_id"] != current_user.id:
        raise HTTPException(
            status_code=403, detail="Only the contract freelancer can create invoices"
        )

    tax_rate = getattr(invoice, "tax_rate", 0) or 0
    result = invoices_service.create_invoice(
        contract_id=invoice.contract_id,
        from_user_id=current_user.id,
        to_user_id=invoice.to_user_id,
        items=invoice.items,
        tax_rate=tax_rate,
        due_date=invoice.due_date,
        notes=invoice.notes,
    )

    if not result:
        raise HTTPException(
            status_code=500, detail="Failed to retrieve created invoice"
        )

    return result


@router.get("/", response_model=InvoiceList)
async def list_invoices(
    contract_id: Optional[int] = Query(None, description="Filter by contract"),
    status_filter: Optional[str] = Query(
        None, alias="status", description="Filter by status"
    ),
    from_date: Optional[date] = Query(None, description="Filter from date"),
    to_date: Optional[date] = Query(None, description="Filter to date"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    """List invoices with filters. Freelancers see invoices they created, clients see invoices sent to them."""
    user_role = get_user_role(current_user)

    data = invoices_service.list_invoices(
        user_id=current_user.id,
        user_role=user_role,
        contract_id=contract_id,
        status_filter=status_filter,
        from_date=from_date,
        to_date=to_date,
        page=page,
        page_size=page_size,
    )

    return InvoiceList(**data)


@router.get("/{invoice_id}", response_model=InvoiceRead)
async def get_invoice(invoice_id: int, current_user: User = Depends(get_current_user)):
    """Get a single invoice by ID"""
    invoice = invoices_service.get_invoice_by_id(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if (
        invoice["from_user_id"] != current_user.id
        and invoice["to_user_id"] != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not authorized")

    return invoice


@router.patch("/{invoice_id}/pay", response_model=InvoiceRead)
async def pay_invoice(
    invoice_id: int,
    payment_data: InvoicePayment,
    current_user: User = Depends(get_current_user),
):
    """Mark invoice as paid. Only clients can pay invoices."""
    inv = invoices_service.get_invoice_for_payment(invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if inv["to_user_id"] != current_user.id:
        raise HTTPException(
            status_code=403, detail="Only the invoice recipient can mark it as paid"
        )

    if inv["status"] == "paid":
        raise HTTPException(status_code=400, detail="Invoice already paid")

    resolved_payment_id = payment_data.payment_id
    if resolved_payment_id:
        if not invoices_service.verify_payment_exists(resolved_payment_id):
            raise HTTPException(status_code=404, detail="Payment not found")
    else:
        total = invoices_service.get_invoice_total(invoice_id)
        resolved_payment_id = invoices_service.create_manual_payment(
            current_user.id, total, invoice_id
        )

    invoices_service.mark_invoice_paid(invoice_id, resolved_payment_id)

    return await get_invoice(invoice_id, current_user)


@router.patch("/{invoice_id}", response_model=InvoiceRead)
async def update_invoice(
    invoice_id: int,
    update_data: InvoiceUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update invoice details. Only freelancer (creator) can update pending invoices."""
    inv = invoices_service.get_invoice_for_update(invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if inv["from_user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if inv["status"] not in ["pending", "overdue"]:
        raise HTTPException(
            status_code=400, detail="Only pending or overdue invoices can be updated"
        )

    update_dict = update_data.model_dump(exclude_unset=True)
    if update_dict:
        invoices_service.update_invoice_fields(invoice_id, update_dict)

    return await get_invoice(invoice_id, current_user)


@router.get("/{invoice_id}/download")
async def download_invoice_pdf(
    invoice_id: int, current_user: User = Depends(get_current_user)
):
    """Download invoice metadata with a view URL (use /view for printable PDF)"""
    invoice = invoices_service.get_invoice_by_id(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if (
        invoice["from_user_id"] != current_user.id
        and invoice["to_user_id"] != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not authorized")
    invoice["download_url"] = f"/api/v1/invoices/{invoice_id}/view"
    return invoice


@router.get("/{invoice_id}/view", response_class=HTMLResponse)
async def view_invoice_html(
    invoice_id: int, current_user: User = Depends(get_current_user)
):
    """View invoice as printable HTML (browser print → Save as PDF)"""
    invoice = invoices_service.get_invoice_by_id(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if (
        invoice["from_user_id"] != current_user.id
        and invoice["to_user_id"] != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Build items rows
    items_html = ""
    for item in invoice.get("items") or []:
        desc = str(item.get("description", ""))
        qty = item.get("quantity", 1)
        rate = float(item.get("rate", 0) or 0)
        amount = float(item.get("amount", 0) or 0)
        items_html += f"""<tr>
          <td>{desc}</td><td>{qty}</td>
          <td>${rate:.2f}</td><td>${amount:.2f}</td>
        </tr>"""
    if not items_html:
        items_html = '<tr><td colspan="4" style="text-align:center;color:#9ca3af">No line items</td></tr>'

    invoice_number = invoice.get("invoice_number") or f"INV-{invoice_id}"
    due_date = str(invoice.get("due_date") or "N/A")
    created_at = str(invoice.get("created_at") or "N/A")
    status_raw = str(invoice.get("status") or "pending")
    status_upper = status_raw.upper()
    subtotal = float(invoice.get("subtotal") or 0)
    tax = float(invoice.get("tax") or 0)
    total = float(invoice.get("total") or 0)
    notes = str(invoice.get("notes") or "")
    notes_block = (
        f'<div class="notes"><strong>Notes:</strong> {notes}</div>' if notes else ""
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice {invoice_number} — MegiLance</title>
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  body{{font-family:Arial,Helvetica,sans-serif;max-width:820px;margin:40px auto;padding:20px;color:#1a1a2e}}
  .header{{background:#4573df;color:#fff;padding:24px 32px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center}}
  .header h1{{font-size:1.75rem;font-weight:700}}
  .header .inv-sub{{font-size:.9rem;opacity:.85;margin-top:4px}}
  .body{{border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:32px}}
  .meta{{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem 2rem;margin-bottom:2rem}}
  .meta label{{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;display:block;margin-bottom:3px}}
  .meta span{{font-size:.9375rem;font-weight:500}}
  .badge{{display:inline-block;padding:3px 12px;border-radius:9999px;font-size:.8rem;font-weight:600}}
  .badge.paid{{background:#dcfce7;color:#166534}}
  .badge.overdue{{background:#fee2e2;color:#991b1b}}
  .badge.pending{{background:#dbeafe;color:#1e40af}}
  .badge.sent{{background:#ede9fe;color:#5b21b6}}
  table{{width:100%;border-collapse:collapse;margin-bottom:1.5rem}}
  th{{background:#f9fafb;padding:10px 14px;text-align:left;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;border-bottom:2px solid #e5e7eb}}
  td{{padding:10px 14px;border-bottom:1px solid #f3f4f6;font-size:.9375rem}}
  .totals{{display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-bottom:1rem}}
  .t-row{{display:flex;gap:3rem;font-size:.9375rem}}
  .t-row.grand{{font-size:1.25rem;font-weight:700;color:#4573df;padding-top:8px;border-top:2px solid #e5e7eb}}
  .notes{{margin-top:1.5rem;padding:1rem;background:#f9fafb;border-radius:8px;font-size:.875rem;color:#374151;line-height:1.6}}
  .print-btn{{display:block;margin:2rem auto 0;padding:12px 32px;background:#4573df;color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;font-weight:600;letter-spacing:.01em}}
  .print-btn:hover{{background:#3b5ec9}}
  @media print{{.print-btn{{display:none!important}}}}
</style>
</head>
<body>
  <div class="header">
    <div><h1>MegiLance</h1><div class="inv-sub">Invoice #{invoice_number}</div></div>
    <div><span class="badge {status_raw}">{status_upper}</span></div>
  </div>
  <div class="body">
    <div class="meta">
      <div><label>Invoice #</label><span>{invoice_number}</span></div>
      <div><label>Status</label><span><span class="badge {status_raw}">{status_upper}</span></span></div>
      <div><label>Issue Date</label><span>{created_at}</span></div>
      <div><label>Due Date</label><span>{due_date}</span></div>
    </div>
    <table>
      <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
      <tbody>{items_html}</tbody>
    </table>
    <div class="totals">
      <div class="t-row"><span>Subtotal:</span><span>${subtotal:.2f}</span></div>
      <div class="t-row"><span>Tax:</span><span>${tax:.2f}</span></div>
      <div class="t-row grand"><span>Total:</span><span>${total:.2f}</span></div>
    </div>
    {notes_block}
  </div>
  <button class="print-btn" onclick="window.print()">🖨 Print / Save as PDF</button>
</body>
</html>"""
    return HTMLResponse(content=html)


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: int, current_user: User = Depends(get_current_user)
):
    """Delete an invoice. Only pending invoices can be deleted."""
    inv = invoices_service.get_invoice_for_update(invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if inv["from_user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if inv["status"] != "pending":
        raise HTTPException(
            status_code=400, detail="Only pending invoices can be deleted"
        )

    invoices_service.delete_invoice(invoice_id)
