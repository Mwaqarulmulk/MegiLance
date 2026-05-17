# @AI-HINT: Notifications router — CRUD, mark as read, preferences
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows, parse_date

router = APIRouter()


class NotificationCreate(BaseModel):
    type: str
    title: str
    message: str
    link: Optional[str] = None

class NotificationPreferences(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    proposal_alerts: bool = True
    project_alerts: bool = True
    message_alerts: bool = True
    payment_alerts: bool = True


@router.get("/")
async def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    unread_only: bool = False,
    current_user=Depends(get_current_user),
):
    where = "WHERE user_id = ?"
    params = [current_user.id]

    if unread_only:
        where += " AND is_read = 0"

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT id, user_id, type, title, message, link, is_read, created_at
            FROM notifications
            {where}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    notifications = rows if rows else []

    count_result = execute_query(
        f"SELECT COUNT(*) as total FROM notifications {where}",
        [p for p in params[:-2]],
    )
    total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0

    return {"items": notifications, "total": total, "page": page, "page_size": page_size}


@router.get("/unread-count")
async def unread_count(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"count": rows[0]["count"] if rows else 0}


@router.get("/{notification_id}")
async def get_notification(notification_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, user_id, type, title, message, link, is_read, created_at FROM notifications WHERE id = ? AND user_id = ?",
        [notification_id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Notification not found")
    return rows[0]


@router.post("/{notification_id}/read")
async def mark_read(notification_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id FROM notifications WHERE id = ? AND user_id = ?",
        [notification_id, current_user.id],
    )
    if not parse_rows(result):
        raise HTTPException(status_code=404, detail="Notification not found")

    execute_query("UPDATE notifications SET is_read = 1 WHERE id = ?", [notification_id])
    return {"message": "Notification marked as read"}


@router.post("/mark-all-read")
async def mark_all_read(current_user=Depends(get_current_user)):
    execute_query("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0", [current_user.id])
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(notification_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id FROM notifications WHERE id = ? AND user_id = ?",
        [notification_id, current_user.id],
    )
    if not parse_rows(result):
        raise HTTPException(status_code=404, detail="Notification not found")

    execute_query("DELETE FROM notifications WHERE id = ?", [notification_id])
    return {"message": "Notification deleted"}


@router.get("/preferences")
async def get_preferences(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT email_notifications, push_notifications, proposal_alerts, project_alerts, message_alerts, payment_alerts FROM notification_preferences WHERE user_id = ?",
        [current_user.id],
    )
    rows = parse_rows(result)
    if rows:
        return rows[0]
    return {
        "email_notifications": True,
        "push_notifications": True,
        "proposal_alerts": True,
        "project_alerts": True,
        "message_alerts": True,
        "payment_alerts": True,
    }


@router.put("/preferences")
async def update_preferences(request: NotificationPreferences, current_user=Depends(get_current_user)):
    data = request.model_dump()
    set_parts = [f"{k} = ?" for k in data]
    values = list(data.values()) + [current_user.id]

    result = execute_query(
        "SELECT id FROM notification_preferences WHERE user_id = ?",
        [current_user.id],
    )
    if parse_rows(result):
        execute_query(f"UPDATE notification_preferences SET {', '.join(set_parts)} WHERE user_id = ?", values)
    else:
        values.insert(0, current_user.id)
        keys_str = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data])
        execute_query(f"INSERT INTO notification_preferences (user_id, {keys_str}) VALUES (?, {placeholders})", values)

    return {"message": "Preferences updated"}
