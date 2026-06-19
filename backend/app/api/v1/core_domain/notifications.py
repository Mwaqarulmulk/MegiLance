# @AI-HINT: Notifications router — CRUD, mark as read, preferences
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class NotificationCreate(BaseModel):
    notification_type: str
    title: str
    content: str
    action_url: Optional[str] = None
    priority: str = "normal"
    data: Optional[str] = None


class NotificationPreferences(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    proposal_alerts: bool = True
    project_alerts: bool = True
    message_alerts: bool = True
    payment_alerts: bool = True


@router.get("")
def list_notifications(
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
        f"""SELECT id, user_id, notification_type, title, content, action_url,
                   data, is_read, read_at, priority, created_at
            FROM notifications
            {where}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result) or []

    count_result = execute_query(
        f"SELECT COUNT(*) as total FROM notifications {where}",
        [p for p in params[:-2]],
    )
    total = (parse_rows(count_result) or [{"total": 0}])[0]["total"]

    return {"items": rows, "total": total, "page": page, "page_size": page_size}


@router.get("/unread-count")
def unread_count(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"count": rows[0]["count"] if rows else 0}


@router.get("/preferences")
def get_preferences(current_user=Depends(get_current_user)):
    try:
        result = execute_query(
            "SELECT email_notifications, push_notifications, proposal_alerts, "
            "project_alerts, message_alerts, payment_alerts "
            "FROM notification_preferences WHERE user_id = ?",
            [current_user.id],
        )
        rows = parse_rows(result)
        if rows:
            return rows[0]
    except Exception:
        pass
    return {
        "email_notifications": True,
        "push_notifications": True,
        "proposal_alerts": True,
        "project_alerts": True,
        "message_alerts": True,
        "payment_alerts": True,
    }


@router.put("/preferences")
def update_preferences(request: NotificationPreferences, current_user=Depends(get_current_user)):
    try:
        execute_query("""CREATE TABLE IF NOT EXISTS notification_preferences (
            user_id INTEGER PRIMARY KEY,
            email_notifications INTEGER DEFAULT 1,
            push_notifications INTEGER DEFAULT 1,
            proposal_alerts INTEGER DEFAULT 1,
            project_alerts INTEGER DEFAULT 1,
            message_alerts INTEGER DEFAULT 1,
            payment_alerts INTEGER DEFAULT 1,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )""")
    except Exception:
        pass

    data = request.model_dump()
    result = execute_query(
        "SELECT user_id FROM notification_preferences WHERE user_id = ?",
        [current_user.id],
    )
    if parse_rows(result):
        set_parts = [f"{k} = ?" for k in data]
        values = list(data.values()) + [current_user.id]
        execute_query(f"UPDATE notification_preferences SET {', '.join(set_parts)} WHERE user_id = ?", values)
    else:
        keys_str = "user_id, " + ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in range(len(data) + 1)])
        values = [current_user.id] + list(data.values())
        execute_query(f"INSERT INTO notification_preferences ({keys_str}) VALUES ({placeholders})", values)

    return {"message": "Preferences updated"}


@router.get("/{notification_id}")
def get_notification(notification_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, user_id, notification_type, title, content, action_url, "
        "data, is_read, read_at, priority, created_at "
        "FROM notifications WHERE id = ? AND user_id = ?",
        [notification_id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Notification not found")
    return rows[0]


@router.post("/{notification_id}/read")
def mark_read(notification_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id FROM notifications WHERE id = ? AND user_id = ?",
        [notification_id, current_user.id],
    )
    if not parse_rows(result):
        raise HTTPException(status_code=404, detail="Notification not found")
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE notifications SET is_read = 1, read_at = ? WHERE id = ?",
        [now, notification_id],
    )
    return {"message": "Notification marked as read"}


@router.put("/{notification_id}")
def update_notification(notification_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id FROM notifications WHERE id = ? AND user_id = ?",
        [notification_id, current_user.id],
    )
    if not parse_rows(result):
        raise HTTPException(status_code=404, detail="Notification not found")
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE notifications SET is_read = 1, read_at = ? WHERE id = ?",
        [now, notification_id],
    )
    return {"message": "Notification marked as read"}


@router.post("/mark-all-read")
def mark_all_read(current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE notifications SET is_read = 1, read_at = ? WHERE user_id = ? AND is_read = 0",
        [now, current_user.id],
    )
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
def delete_notification(notification_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id FROM notifications WHERE id = ? AND user_id = ?",
        [notification_id, current_user.id],
    )
    if not parse_rows(result):
        raise HTTPException(status_code=404, detail="Notification not found")
    execute_query("DELETE FROM notifications WHERE id = ?", [notification_id])
    return {"message": "Notification deleted"}
