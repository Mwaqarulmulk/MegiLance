# @AI-HINT: Webhooks router — webhook management for external integrations
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging
import secrets

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class WebhookCreate(BaseModel):
    url: str
    events: list[str]
    secret: Optional[str] = None

class WebhookUpdate(BaseModel):
    url: Optional[str] = None
    events: Optional[list[str]] = None
    is_active: Optional[bool] = None


@router.get("")
def list_webhooks(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, url, events, is_active, secret, created_at, updated_at FROM webhooks WHERE user_id = ? ORDER BY created_at DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.get("/events")
def get_available_events():
    return {
        "events": [
            "project.created", "project.updated", "project.closed",
            "proposal.submitted", "proposal.accepted", "proposal.rejected",
            "contract.created", "contract.completed",
            "payment.completed", "payment.failed",
            "message.received",
            "review.created",
        ]
    }


@router.post("")
def create_webhook(request: WebhookCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    secret = request.secret or secrets.token_urlsafe(32)
    result = execute_query(
        "INSERT INTO webhooks (user_id, url, events, secret, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)",
        [current_user.id, request.url, str(request.events), secret, now, now],
    )
    return {"message": "Webhook created", "webhook_id": result.get("last_insert_rowid"), "secret": secret}


@router.put("/{webhook_id}")
def update_webhook(webhook_id: int, request: WebhookUpdate, current_user=Depends(get_current_user)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    for k, v in updates.items():
        if isinstance(v, bool):
            updates[k] = 1 if v else 0
        elif isinstance(v, list):
            updates[k] = str(v)

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), webhook_id, current_user.id]

    execute_query(f"UPDATE webhooks SET {', '.join(set_parts)} WHERE id = ? AND user_id = ?", values)
    return {"message": "Webhook updated"}


@router.delete("/{webhook_id}")
def delete_webhook(webhook_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM webhooks WHERE id = ? AND user_id = ?", [webhook_id, current_user.id])
    return {"message": "Webhook deleted"}


@router.get("/delivery-history")
def list_webhook_events(
    webhook_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    offset = (page - 1) * page_size
    result = execute_query(
        "SELECT id, webhook_id, event_type, payload, status, attempts, last_attempt_at, created_at FROM webhook_events WHERE webhook_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [webhook_id, page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}
