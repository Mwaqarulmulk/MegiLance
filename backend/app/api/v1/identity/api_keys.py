# @AI-HINT: API keys router — API key management for integrations
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging
import secrets

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class ApiKeyCreate(BaseModel):
    name: str
    permissions: Optional[str] = None

class ApiKeyUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("/")
async def list_api_keys(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, name, key_prefix, permissions, is_active, last_used_at, created_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.post("/")
async def create_api_key(request: ApiKeyCreate, current_user=Depends(get_current_user)):
    key = f"ml_{secrets.token_urlsafe(32)}"
    key_prefix = key[:8]
    now = datetime.now(timezone.utc).isoformat()

    result = execute_query(
        "INSERT INTO api_keys (user_id, name, key_hash, key_prefix, permissions, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)",
        [current_user.id, request.name, key, key_prefix, request.permissions or "read", now],
    )

    return {"message": "API key created", "key": key, "key_id": result.get("last_insert_rowid")}


@router.put("/{key_id}")
async def update_api_key(key_id: int, request: ApiKeyUpdate, current_user=Depends(get_current_user)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    for k, v in updates.items():
        if isinstance(v, bool):
            updates[k] = 1 if v else 0

    set_parts = [f"{k} = ?" for k in updates]
    values = list(updates.values()) + [key_id, current_user.id]
    execute_query(f"UPDATE api_keys SET {', '.join(set_parts)} WHERE id = ? AND user_id = ?", values)
    return {"message": "API key updated"}


@router.delete("/{key_id}")
async def delete_api_key(key_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM api_keys WHERE id = ? AND user_id = ?", [key_id, current_user.id])
    return {"message": "API key deleted"}
