# @AI-HINT: Tags router — project tagging system
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


@router.get("")
def list_tags(search: Optional[str] = None, limit: int = Query(50, ge=1)):
    where = ""
    params: list = [limit]
    if search:
        where = "WHERE name LIKE ?"
        params = [f"%{search}%", limit]
    result = execute_query(f"SELECT id, name, slug, type, usage_count FROM tags {where} ORDER BY usage_count DESC LIMIT ?", params)
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.get("/popular")
def get_popular_tags(limit: int = Query(20, ge=1)):
    result = execute_query("SELECT id, name, slug, type, usage_count FROM tags ORDER BY usage_count DESC LIMIT ?", [limit])
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.post("")
def create_tag(name: str, tag_type: str = "skill", current_user=Depends(get_current_user)):
    from urllib.parse import quote
    slug = name.lower().replace(" ", "-")
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query("INSERT INTO tags (name, slug, type, usage_count, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)", [name, slug, tag_type, now, now])
    return {"message": "Tag created", "tag_id": result.get("last_insert_rowid")}
