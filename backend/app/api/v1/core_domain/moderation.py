from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

_TABLES_CREATED = False


def _ensure_tables():
    global _TABLES_CREATED
    if _TABLES_CREATED:
        return
    execute_query("""
        CREATE TABLE IF NOT EXISTS flagged_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INTEGER,
            content TEXT,
            reporter_id INTEGER,
            reason TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            created_at DATETIME NOT NULL,
            resolved_at DATETIME,
            resolved_by INTEGER
        )
    """)
    _TABLES_CREATED = True


@router.get("/items")
def list_flagged_items(user=Depends(get_current_user)):
    _ensure_tables()
    if getattr(user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    result = execute_query(
        "SELECT id, entity_type, entity_id, content, reporter_id, reason, status, created_at "
        "FROM flagged_items ORDER BY created_at DESC LIMIT 100"
    )
    rows = parse_rows(result) if result else []
    items = []
    for r in rows:
        items.append({
            "id": str(r.get("id", "")),
            "type": r.get("entity_type", "project"),
            "content": r.get("content", ""),
            "reporter": str(r.get("reporter_id", "")),
            "reason": r.get("reason", ""),
            "created_at": r.get("created_at", ""),
            "status": r.get("status", "pending"),
        })
    return items


@router.post("/items/{item_id}/approve")
def approve_item(item_id: str, user=Depends(get_current_user)):
    _ensure_tables()
    if getattr(user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE flagged_items SET status = 'approved', resolved_at = ?, resolved_by = ? WHERE id = ?",
        [now, str(getattr(user, "id", "")), item_id],
    )
    return {"status": "approved"}


@router.post("/items/{item_id}/reject")
def reject_item(item_id: str, user=Depends(get_current_user)):
    _ensure_tables()
    if getattr(user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE flagged_items SET status = 'rejected', resolved_at = ?, resolved_by = ? WHERE id = ?",
        [now, str(getattr(user, "id", "")), item_id],
    )
    return {"status": "rejected"}
