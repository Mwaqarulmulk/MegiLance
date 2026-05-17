# @AI-HINT: User feedback router — feedback submission and management
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class FeedbackSubmit(BaseModel):
    type: str
    message: str
    page: Optional[str] = None
    rating: Optional[int] = None


class FeedbackUpdate(BaseModel):
    status: Optional[str] = None
    admin_response: Optional[str] = None


@router.post("/")
async def submit_feedback(request: FeedbackSubmit, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO user_feedback (user_id, type, message, page, rating, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', ?)",
        [current_user.id, request.type, request.message, request.page or "", request.rating, now],
    )
    return {"message": "Feedback submitted", "feedback_id": result.get("last_insert_rowid")}


@router.get("/")
async def list_feedback(
    type_filter: Optional[str] = None,
    status_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(require_admin),
):
    where = "WHERE 1=1"
    params: list = []

    if type_filter:
        where += " AND type = ?"
        params.append(type_filter)
    if status_filter:
        where += " AND status = ?"
        params.append(status_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"SELECT f.id, f.user_id, f.type, f.message, f.page, f.rating, f.status, f.admin_response, f.created_at, u.name as user_name, u.email as user_email FROM user_feedback f LEFT JOIN users u ON f.user_id = u.id {where} ORDER BY f.created_at DESC LIMIT ? OFFSET ?",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.get("/{feedback_id}")
async def get_feedback(feedback_id: int, current_user=Depends(require_admin)):
    result = execute_query(
        "SELECT f.id, f.user_id, f.type, f.message, f.page, f.rating, f.status, f.admin_response, f.created_at, u.name as user_name, u.email as user_email FROM user_feedback f LEFT JOIN users u ON f.user_id = u.id WHERE f.id = ?",
        [feedback_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return rows[0]


@router.put("/{feedback_id}")
async def update_feedback(feedback_id: int, request: FeedbackUpdate, current_user=Depends(require_admin)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = [f"{k} = ?" for k in updates]
    values = list(updates.values()) + [feedback_id]

    execute_query(f"UPDATE user_feedback SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Feedback updated"}
