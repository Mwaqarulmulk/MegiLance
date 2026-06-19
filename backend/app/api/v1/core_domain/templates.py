# @AI-HINT: Templates router — proposal and contract templates
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class TemplateCreate(BaseModel):
    name: str
    template_type: str
    content: str
    category: Optional[str] = None

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None


@router.get("")
def list_templates(
    template_type: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    where = "WHERE (is_public = 1 OR user_id = ?)"
    params = [current_user.id]
    if template_type:
        where += " AND template_type = ?"
        params.append(template_type)

    result = execute_query(
        f"SELECT id, name, template_type, category, is_public, created_at, updated_at FROM templates {where} ORDER BY created_at DESC",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.get("/{template_id}")
def get_template(template_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, user_id, name, template_type, category, content, is_public, created_at, updated_at FROM templates WHERE id = ? AND (is_public = 1 OR user_id = ?)",
        [template_id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Template not found")
    return rows[0]


@router.post("")
def create_template(request: TemplateCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO templates (user_id, name, template_type, category, content, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)",
        [current_user.id, request.name, request.template_type, request.category or "", request.content, now, now],
    )
    return {"message": "Template created", "template_id": result.get("last_insert_rowid")}


@router.put("/{template_id}")
def update_template(template_id: int, request: TemplateUpdate, current_user=Depends(get_current_user)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), template_id, current_user.id]

    execute_query(f"UPDATE templates SET {', '.join(set_parts)} WHERE id = ? AND user_id = ?", values)
    return {"message": "Template updated"}


@router.delete("/{template_id}")
def delete_template(template_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM templates WHERE id = ? AND user_id = ?", [template_id, current_user.id])
    return {"message": "Template deleted"}
