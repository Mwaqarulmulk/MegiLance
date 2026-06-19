# @AI-HINT: Communication router — SMS, email, push notifications
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class SMSRequest(BaseModel):
    phone_number: str
    message: str


class EmailRequest(BaseModel):
    to: str
    subject: str
    body: str
    template: Optional[str] = None


class PushRequest(BaseModel):
    user_id: int
    title: str
    body: str
    data: Optional[dict] = None


@router.post("/sms/send")
def send_sms(request: SMSRequest, current_user=Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO communication_log (channel, recipient, subject, body, status, created_at) VALUES (?, ?, '', ?, 'sent', ?)",
        ["sms", request.phone_number, request.message, now],
    )
    return {"message": "SMS sent", "id": result.get("last_insert_rowid")}


@router.post("/email/send")
def send_email(request: EmailRequest, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO communication_log (channel, recipient, subject, body, template, status, created_at) VALUES (?, ?, ?, ?, ?, 'sent', ?)",
        ["email", request.to, request.subject, request.body, request.template or "", now],
    )
    return {"message": "Email sent", "id": result.get("last_insert_rowid")}


@router.post("/push/send")
def send_push(request: PushRequest, current_user=Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO communication_log (channel, recipient, subject, body, status, created_at) VALUES (?, ?, ?, ?, 'sent', ?)",
        ["push", str(request.user_id), request.title, request.body, now],
    )
    return {"message": "Push notification sent", "id": result.get("last_insert_rowid")}


@router.get("/history")
def get_history(
    channel: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    where = "WHERE 1=1"
    params: list = []

    if channel:
        where += " AND channel = ?"
        params.append(channel)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"SELECT id, channel, recipient, subject, body, status, created_at FROM communication_log {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.get("/preferences")
def get_preferences(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT email_notifications, push_notifications, sms_notifications FROM notification_preferences WHERE user_id = ?",
        [current_user.id],
    )
    rows = parse_rows(result)
    if rows:
        return rows[0]
    return {
        "email_notifications": True,
        "push_notifications": True,
        "sms_notifications": False,
    }


@router.put("/preferences")
def update_preferences(data: dict, current_user=Depends(get_current_user)):
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

    return {"message": "Communication preferences updated"}
