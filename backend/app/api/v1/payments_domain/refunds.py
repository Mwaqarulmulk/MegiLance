# @AI-HINT: Refunds router — refund processing and management
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class RefundCreate(BaseModel):
    payment_id: int
    amount: float
    reason: str

class RefundUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None


@router.get("/")
async def list_refunds(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    where = "WHERE r.requested_by = ?"
    params = [current_user.id]
    if status_filter:
        where += " AND r.status = ?"
        params.append(status_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT r.id, r.payment_id, r.requested_by, r.amount, r.reason, r.status,
                   r.admin_notes, r.created_at, r.updated_at,
                   p.contract_id, pr.title as project_title
            FROM refunds r
            LEFT JOIN payments p ON r.payment_id = p.id
            LEFT JOIN contracts c ON p.contract_id = c.id
            LEFT JOIN projects pr ON c.project_id = pr.id
            {where}
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.post("/")
async def create_refund(request: RefundCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO refunds (payment_id, requested_by, amount, reason, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'pending', ?, ?)",
        [request.payment_id, current_user.id, request.amount, request.reason, now, now],
    )
    return {"message": "Refund requested", "refund_id": result.get("last_insert_rowid")}


@router.put("/{refund_id}")
async def update_refund(refund_id: int, request: RefundUpdate, current_user=Depends(require_admin)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), refund_id]

    execute_query(f"UPDATE refunds SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Refund updated"}


@router.post("/{refund_id}/approve")
async def approve_refund(refund_id: int, current_user=Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE refunds SET status = 'approved', updated_at = ? WHERE id = ?",
        [now, refund_id],
    )
    return {"message": "Refund approved"}


@router.post("/{refund_id}/reject")
async def reject_refund(refund_id: int, request: dict, current_user=Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE refunds SET status = 'rejected', admin_notes = ?, updated_at = ? WHERE id = ?",
        [request.get("reason", ""), now, refund_id],
    )
    return {"message": "Refund rejected"}
