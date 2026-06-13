# @AI-HINT: Multi-channel Notifications Pro router — channels, templates, send, history, stats
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import json
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

_TABLES_CREATED = False


def _ensure_table():
    global _TABLES_CREATED
    if _TABLES_CREATED:
        return
    execute_query("""
        CREATE TABLE IF NOT EXISTS notification_channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            channel_type TEXT NOT NULL,
            channel_config TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS notification_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            subject_template TEXT,
            body_template TEXT,
            channel_type TEXT DEFAULT 'in_app',
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS notification_delivery_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            template_id INTEGER,
            channel_type TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            subject TEXT,
            body TEXT,
            error_message TEXT,
            sent_at TEXT,
            delivered_at TEXT,
            created_at TEXT NOT NULL
        )
    """, [])
    _TABLES_CREATED = True


class ChannelCreate(BaseModel):
    channel_type: str
    channel_config: Optional[dict] = None


class ChannelUpdate(BaseModel):
    channel_config: Optional[dict] = None
    is_active: Optional[bool] = None


class TemplateCreate(BaseModel):
    name: str
    subject_template: Optional[str] = None
    body_template: str
    channel_type: str = "in_app"


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    subject_template: Optional[str] = None
    body_template: Optional[str] = None
    channel_type: Optional[str] = None
    is_active: Optional[bool] = None


class SendRequest(BaseModel):
    user_id: int
    template_id: Optional[int] = None
    channel_type: str = "in_app"
    subject: Optional[str] = None
    body: Optional[str] = None
    data: Optional[dict] = None


class BulkSendRequest(BaseModel):
    user_ids: list[int]
    template_id: Optional[int] = None
    channel_type: str = "in_app"
    subject: Optional[str] = None
    body: Optional[str] = None
    data: Optional[dict] = None


def _render_template(template_text: str, data: dict) -> str:
    for key, value in (data or {}).items():
        template_text = template_text.replace(f"{{{{{key}}}}}", str(value))
    return template_text


# ── Channels ────────────────────────────────────────────────────────────────


@router.get("/channels")
async def list_channels(current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT id, user_id, channel_type, channel_config, is_active, created_at, updated_at FROM notification_channels WHERE user_id = ? ORDER BY created_at DESC",
        [current_user["user_id"]],
    )
    rows = parse_rows(result)
    items = []
    for r in rows:
        r["channel_config"] = json.loads(r["channel_config"]) if r.get("channel_config") else {}
        r["is_active"] = bool(r["is_active"])
        items.append(r)
    return {"items": items}


@router.post("/channels")
async def create_channel(request: ChannelCreate, current_user=Depends(get_current_user)):
    _ensure_table()
    valid_types = {"email", "push", "sms", "in_app"}
    if request.channel_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid channel_type. Must be one of: {', '.join(sorted(valid_types))}")

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO notification_channels (user_id, channel_type, channel_config, is_active, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)",
        [current_user["user_id"], request.channel_type, json.dumps(request.channel_config or {}), now, now],
    )
    logger.info(f"[NOTIFICATIONS_PRO] Channel created: {request.channel_type} for user {current_user['user_id']}")
    return {"message": "Channel registered", "channel_id": result.get("last_insert_rowid")}


@router.put("/channels/{channel_id}")
async def update_channel(channel_id: int, request: ChannelUpdate, current_user=Depends(get_current_user)):
    _ensure_table()
    existing = parse_rows(execute_query(
        "SELECT id, user_id FROM notification_channels WHERE id = ?",
        [channel_id],
    ))
    if not existing:
        raise HTTPException(status_code=404, detail="Channel not found")
    if existing[0]["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to modify this channel")

    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = []
    values = []
    for k, v in updates.items():
        if k == "channel_config":
            set_parts.append(f"{k} = ?")
            values.append(json.dumps(v))
        elif k == "is_active":
            set_parts.append(f"{k} = ?")
            values.append(1 if v else 0)
        else:
            set_parts.append(f"{k} = ?")
            values.append(v)

    set_parts.append("updated_at = ?")
    values.extend([datetime.now(timezone.utc).isoformat(), channel_id])

    execute_query(f"UPDATE notification_channels SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Channel updated"}


@router.delete("/channels/{channel_id}")
async def delete_channel(channel_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    existing = parse_rows(execute_query(
        "SELECT id, user_id FROM notification_channels WHERE id = ?",
        [channel_id],
    ))
    if not existing:
        raise HTTPException(status_code=404, detail="Channel not found")
    if existing[0]["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this channel")

    execute_query("DELETE FROM notification_channels WHERE id = ?", [channel_id])
    return {"message": "Channel deleted"}


# ── Templates ───────────────────────────────────────────────────────────────


@router.get("/templates")
async def list_templates(
    include_inactive: bool = Query(False),
    current_user=Depends(get_current_user),
):
    _ensure_table()
    where = "" if include_inactive else "WHERE is_active = 1"
    result = execute_query(
        f"SELECT id, name, subject_template, body_template, channel_type, is_active, created_at, updated_at FROM notification_templates {where} ORDER BY created_at DESC",
        [],
    )
    rows = parse_rows(result)
    items = []
    for r in rows:
        r["is_active"] = bool(r["is_active"])
        items.append(r)
    return {"items": items}


@router.post("/templates")
async def create_template(request: TemplateCreate, current_user=Depends(get_current_user)):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO notification_templates (name, subject_template, body_template, channel_type, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)",
        [request.name, request.subject_template or "", request.body_template, request.channel_type, now, now],
    )
    logger.info(f"[NOTIFICATIONS_PRO] Template created: {request.name}")
    return {"message": "Template created", "template_id": result.get("last_insert_rowid")}


@router.put("/templates/{template_id}")
async def update_template(template_id: int, request: TemplateUpdate, current_user=Depends(get_current_user)):
    _ensure_table()
    existing = parse_rows(execute_query("SELECT id FROM notification_templates WHERE id = ?", [template_id]))
    if not existing:
        raise HTTPException(status_code=404, detail="Template not found")

    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = []
    values = []
    for k, v in updates.items():
        if k == "is_active":
            set_parts.append(f"{k} = ?")
            values.append(1 if v else 0)
        else:
            set_parts.append(f"{k} = ?")
            values.append(v)

    set_parts.append("updated_at = ?")
    values.extend([datetime.now(timezone.utc).isoformat(), template_id])

    execute_query(f"UPDATE notification_templates SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Template updated"}


@router.delete("/templates/{template_id}")
async def delete_template(template_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    existing = parse_rows(execute_query("SELECT id FROM notification_templates WHERE id = ?", [template_id]))
    if not existing:
        raise HTTPException(status_code=404, detail="Template not found")
    execute_query("DELETE FROM notification_templates WHERE id = ?", [template_id])
    return {"message": "Template deleted"}


# ── Send ────────────────────────────────────────────────────────────────────


@router.post("/send")
async def send_notification(request: SendRequest, current_user=Depends(get_current_user)):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()
    subject = request.subject
    body = request.body

    if request.template_id:
        tpl_rows = parse_rows(execute_query(
            "SELECT id, subject_template, body_template, channel_type FROM notification_templates WHERE id = ? AND is_active = 1",
            [request.template_id],
        ))
        if not tpl_rows:
            raise HTTPException(status_code=404, detail="Template not found or inactive")
        tpl = tpl_rows[0]
        subject = _render_template(tpl["subject_template"] or "", request.data or {})
        body = _render_template(tpl["body_template"] or "", request.data or {})
        if not request.channel_type or request.channel_type == "in_app":
            request.channel_type = tpl["channel_type"]

    if not body:
        raise HTTPException(status_code=400, detail="Notification body is required")

    log_result = execute_query(
        "INSERT INTO notification_delivery_log (user_id, template_id, channel_type, status, subject, body, sent_at, created_at) VALUES (?, ?, ?, 'sent', ?, ?, ?, ?)",
        [request.user_id, request.template_id, request.channel_type, subject or "", body, now, now],
    )

    execute_query(
        "UPDATE notification_delivery_log SET delivered_at = ?, status = 'delivered' WHERE id = ?",
        [now, log_result.get("last_insert_rowid")],
    )

    logger.info(f"[NOTIFICATIONS_PRO] Notification sent to user {request.user_id} via {request.channel_type}")
    return {
        "message": "Notification sent",
        "delivery_id": log_result.get("last_insert_rowid"),
        "status": "delivered",
    }


# ── Bulk Send ───────────────────────────────────────────────────────────────


@router.post("/bulk-send")
async def bulk_send(request: BulkSendRequest, current_user=Depends(get_current_user)):
    _ensure_table()
    if not request.user_ids:
        raise HTTPException(status_code=400, detail="user_ids list cannot be empty")

    now = datetime.now(timezone.utc).isoformat()
    subject = request.subject
    body = request.body

    if request.template_id:
        tpl_rows = parse_rows(execute_query(
            "SELECT id, subject_template, body_template, channel_type FROM notification_templates WHERE id = ? AND is_active = 1",
            [request.template_id],
        ))
        if not tpl_rows:
            raise HTTPException(status_code=404, detail="Template not found or inactive")
        tpl = tpl_rows[0]
        subject = _render_template(tpl["subject_template"] or "", request.data or {})
        body = _render_template(tpl["body_template"] or "", request.data or {})
        if not request.channel_type or request.channel_type == "in_app":
            request.channel_type = tpl["channel_type"]

    if not body:
        raise HTTPException(status_code=400, detail="Notification body is required")

    sent = 0
    for uid in request.user_ids:
        log_result = execute_query(
            "INSERT INTO notification_delivery_log (user_id, template_id, channel_type, status, subject, body, sent_at, created_at) VALUES (?, ?, ?, 'sent', ?, ?, ?, ?)",
            [uid, request.template_id, request.channel_type, subject or "", body, now, now],
        )
        execute_query(
            "UPDATE notification_delivery_log SET delivered_at = ?, status = 'delivered' WHERE id = ?",
            [now, log_result.get("last_insert_rowid")],
        )
        sent += 1

    logger.info(f"[NOTIFICATIONS_PRO] Bulk notification sent to {sent} users via {request.channel_type}")
    return {"message": "Bulk notification sent", "total_sent": sent, "total_requested": len(request.user_ids)}


# ── History ─────────────────────────────────────────────────────────────────


@router.get("/history")
async def get_history(
    user_id: Optional[int] = Query(None),
    channel_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    current_user=Depends(get_current_user),
):
    _ensure_table()
    conditions = []
    params = []

    target_user = user_id if user_id else current_user["user_id"]
    conditions.append("user_id = ?")
    params.append(target_user)

    if channel_type:
        conditions.append("channel_type = ?")
        params.append(channel_type)
    if status:
        conditions.append("status = ?")
        params.append(status)

    where = " AND ".join(conditions)
    result = execute_query(
        f"SELECT id, user_id, template_id, channel_type, status, subject, body, error_message, sent_at, delivered_at, created_at FROM notification_delivery_log WHERE {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params + [limit, offset],
    )
    rows = parse_rows(result) or []
    count_result = execute_query(
        f"SELECT COUNT(*) as total FROM notification_delivery_log WHERE {where}",
        params,
    )
    total_rows = parse_rows(count_result)
    total = total_rows[0]["total"] if total_rows else 0
    return {"items": rows, "total": total, "limit": limit, "offset": offset}


# ── Stats ───────────────────────────────────────────────────────────────────


@router.get("/stats")
async def get_stats(
    user_id: Optional[int] = Query(None),
    current_user=Depends(get_current_user),
):
    _ensure_table()
    target_user = user_id if user_id else current_user["user_id"]

    total_result = execute_query(
        "SELECT COUNT(*) as total FROM notification_delivery_log WHERE user_id = ?",
        [target_user],
    )
    total_rows = parse_rows(total_result)
    total = total_rows[0]["total"] if total_rows else 0

    status_result = execute_query(
        "SELECT status, COUNT(*) as count FROM notification_delivery_log WHERE user_id = ? GROUP BY status",
        [target_user],
    )
    status_rows = parse_rows(status_result) or []
    by_status = {r["status"]: r["count"] for r in status_rows}

    channel_result = execute_query(
        "SELECT channel_type, COUNT(*) as count FROM notification_delivery_log WHERE user_id = ? GROUP BY channel_type",
        [target_user],
    )
    channel_rows = parse_rows(channel_result) or []
    by_channel = {r["channel_type"]: r["count"] for r in channel_rows}

    recent_result = execute_query(
        "SELECT id, user_id, channel_type, status, subject, body, sent_at, created_at FROM notification_delivery_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
        [target_user],
    )
    recent_rows = parse_rows(recent_result) or []

    return {
        "total_sent": total,
        "by_status": by_status,
        "by_channel": by_channel,
        "recent": recent_rows,
    }
