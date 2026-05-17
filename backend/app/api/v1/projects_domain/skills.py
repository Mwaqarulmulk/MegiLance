# @AI-HINT: Skills router — skill listing and management
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class SkillCreate(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    icon_url: Optional[str] = None


@router.get("/")
async def list_skills(
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
):
    where = "WHERE is_active = 1"
    params: list = []

    if category:
        where += " AND category = ?"
        params.append(category)
    if search:
        where += " AND name LIKE ?"
        params.append(f"%{search}%")

    params.append(limit)
    result = execute_query(
        f"SELECT id, name, category, description, icon_url, is_active, sort_order, created_at, updated_at FROM skills {where} ORDER BY name ASC LIMIT ?",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.post("/")
async def create_skill(request: SkillCreate, current_user=Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO skills (name, category, description, icon_url, is_active, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, 1, 0, ?, ?)",
        [request.name, request.category or "", request.description or "", request.icon_url or "", now, now],
    )
    return {"message": "Skill created", "skill_id": result.get("last_insert_rowid")}
