# @AI-HINT: Activity feed router — user activity and notifications feed
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


@router.get("/")
async def get_activity_feed(
    type_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    where = "WHERE user_id = ?"
    params = [current_user.id]

    if type_filter:
        where += " AND type = ?"
        params.append(type_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"SELECT id, type, title, message, link, is_read, created_at FROM activity_feed {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.get("/{activity_id}")
async def get_activity(activity_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, type, title, message, link, is_read, created_at FROM activity_feed WHERE id = ? AND user_id = ?",
        [activity_id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Activity not found")
    return rows[0]


@router.post("/{activity_id}/read")
async def mark_activity_read(activity_id: int, current_user=Depends(get_current_user)):
    execute_query(
        "UPDATE activity_feed SET is_read = 1 WHERE id = ? AND user_id = ?",
        [activity_id, current_user.id],
    )
    return {"message": "Activity marked as read"}


@router.post("/read-all")
async def mark_all_read(current_user=Depends(get_current_user)):
    execute_query(
        "UPDATE activity_feed SET is_read = 1 WHERE user_id = ? AND is_read = 0",
        [current_user.id],
    )
    return {"message": "All activities marked as read"}


@router.get("/unread-count")
async def get_unread_count(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT COUNT(*) as count FROM activity_feed WHERE user_id = ? AND is_read = 0",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"unread_count": rows[0]["count"] if rows else 0}
