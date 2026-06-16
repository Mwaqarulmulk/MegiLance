# @AI-HINT: Proposal Templates router — reusable proposal templates for freelancers
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

TEMPLATE_VARIABLES = [
    {"name": "{{client_name}}", "description": "Client's full name"},
    {"name": "{{project_title}}", "description": "Title of the project"},
    {"name": "{{my_rate}}", "description": "Your hourly/fixed rate"},
    {"name": "{{delivery_time}}", "description": "Estimated delivery in days"},
    {"name": "{{my_name}}", "description": "Your full name"},
    {"name": "{{my_skills}}", "description": "Your top skills"},
]


def _ensure_table():
    execute_query("""
        CREATE TABLE IF NOT EXISTS proposal_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            subject TEXT,
            content TEXT NOT NULL,
            category TEXT DEFAULT 'general',
            use_count INTEGER DEFAULT 0,
            is_shared INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])


@router.get("")
async def list_templates(
    category: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    _ensure_table()
    conditions = ["user_id = ?"]
    params: list = [current_user.id]
    if category:
        conditions.append("category = ?")
        params.append(category)
    where = f"WHERE {' AND '.join(conditions)}"
    result = execute_query(
        f"SELECT id, user_id, name, subject, content, category, use_count, is_shared, created_at, updated_at "
        f"FROM proposal_templates {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params + [limit, skip]
    )
    return parse_rows(result) if result else []


@router.get("/variables")
async def get_variables(current_user=Depends(get_current_user)):
    return {"variables": TEMPLATE_VARIABLES}


@router.get("/analytics")
async def get_analytics(current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT COUNT(*) as total, SUM(use_count) as total_uses FROM proposal_templates WHERE user_id = ?",
        [current_user.id]
    )
    total = uses = 0
    if result and result.get("rows"):
        rows = parse_rows(result)
        total = int(rows[0].get("total", 0) or 0) if rows else 0
        uses = int(rows[0].get("total_uses", 0) or 0) if rows else 0
    return {"total_templates": total, "total_uses": uses}


@router.get("/{template_id}")
async def get_template(template_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT id, user_id, name, subject, content, category, use_count, is_shared, created_at, updated_at "
        "FROM proposal_templates WHERE id = ? AND user_id = ?",
        [template_id, current_user.id]
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Template not found")
    return rows[0]


class TemplateCreate(BaseModel):
    name: str
    subject: Optional[str] = None
    content: str
    category: str = "general"
    is_shared: bool = False


@router.post("", status_code=201)
async def create_template(body: TemplateCreate, current_user=Depends(get_current_user)):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO proposal_templates (user_id, name, subject, content, category, is_shared, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [current_user.id, body.name, body.subject, body.content, body.category,
         1 if body.is_shared else 0, now, now]
    )
    return {"message": "Template created"}


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    is_shared: Optional[bool] = None


@router.put("/{template_id}")
async def update_template(template_id: int, body: TemplateUpdate, current_user=Depends(get_current_user)):
    _ensure_table()
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        return {"message": "No changes"}
    now = datetime.now(timezone.utc).isoformat()
    parts = []
    params = []
    for k, v in updates.items():
        parts.append(f"{k} = ?")
        params.append(1 if isinstance(v, bool) and v else (0 if isinstance(v, bool) else v))
    parts.append("updated_at = ?")
    params.extend([now, template_id, current_user.id])
    execute_query(
        f"UPDATE proposal_templates SET {', '.join(parts)} WHERE id = ? AND user_id = ?", params
    )
    return {"message": "Template updated"}


@router.delete("/{template_id}", status_code=204)
async def delete_template(template_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    execute_query(
        "DELETE FROM proposal_templates WHERE id = ? AND user_id = ?",
        [template_id, current_user.id]
    )


@router.post("/{template_id}/use")
async def use_template(template_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    execute_query(
        "UPDATE proposal_templates SET use_count = use_count + 1 WHERE id = ? AND user_id = ?",
        [template_id, current_user.id]
    )
    return {"message": "Template usage recorded"}
