# @AI-HINT: Portfolio Builder router — portfolio showcase, templates, layout management
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

SHOWCASE_TEMPLATES = [
    {"id": "minimal", "name": "Minimal", "description": "Clean single-column layout"},
    {"id": "grid", "name": "Grid Gallery", "description": "Masonry grid showcase"},
    {"id": "timeline", "name": "Timeline", "description": "Chronological project history"},
    {"id": "featured", "name": "Featured", "description": "Hero + grid hybrid layout"},
]


def _ensure_table():
    execute_query("""
        CREATE TABLE IF NOT EXISTS portfolio_showcase (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            template_id TEXT DEFAULT 'minimal',
            layout_config TEXT DEFAULT '{}',
            is_public INTEGER DEFAULT 1,
            updated_at TEXT NOT NULL
        )
    """, [])


@router.get("/portfolio-showcase/user/{user_id}")
def get_user_showcase(user_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT user_id, template_id, layout_config, is_public, updated_at FROM portfolio_showcase WHERE user_id = ?",
        [user_id]
    )
    if not result or not result.get("rows"):
        return {"user_id": user_id, "template_id": "minimal", "layout_config": {}, "is_public": True}
    rows = parse_rows(result)
    row = rows[0] if rows else {}
    return {
        "user_id": row.get("user_id"),
        "template_id": row.get("template_id") or "minimal",
        "layout_config": json.loads(row.get("layout_config") or "{}"),
        "is_public": bool(row.get("is_public", 1)),
        "updated_at": row.get("updated_at"),
    }


class ShowcaseLayout(BaseModel):
    template_id: Optional[str] = None
    layout_config: Optional[dict] = None
    is_public: Optional[bool] = None


@router.post("/portfolio-showcase/layout")
def save_showcase_layout(body: ShowcaseLayout, current_user=Depends(get_current_user)):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()
    existing = execute_query(
        "SELECT id FROM portfolio_showcase WHERE user_id = ?", [current_user.id]
    )
    if existing and existing.get("rows"):
        parts = []
        params = []
        if body.template_id is not None:
            parts.append("template_id = ?")
            params.append(body.template_id)
        if body.layout_config is not None:
            parts.append("layout_config = ?")
            params.append(json.dumps(body.layout_config))
        if body.is_public is not None:
            parts.append("is_public = ?")
            params.append(1 if body.is_public else 0)
        parts.append("updated_at = ?")
        params.append(now)
        params.append(current_user.id)
        execute_query(
            f"UPDATE portfolio_showcase SET {', '.join(parts)} WHERE user_id = ?", params
        )
    else:
        execute_query(
            "INSERT INTO portfolio_showcase (user_id, template_id, layout_config, is_public, updated_at) VALUES (?, ?, ?, ?, ?)",
            [current_user.id, body.template_id or "minimal",
             json.dumps(body.layout_config or {}),
             1 if (body.is_public is not False) else 0, now]
        )
    return {"message": "Layout saved"}


@router.get("/portfolio-showcase/templates")
def get_templates(current_user=Depends(get_current_user)):
    return {"templates": SHOWCASE_TEMPLATES}


@router.post("/portfolio-showcase/templates/{template_id}/apply")
def apply_template(template_id: str, current_user=Depends(get_current_user)):
    template = next((t for t in SHOWCASE_TEMPLATES if t["id"] == template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO portfolio_showcase (user_id, template_id, updated_at) VALUES (?, ?, ?) "
        "ON CONFLICT(user_id) DO UPDATE SET template_id = excluded.template_id, updated_at = excluded.updated_at",
        [current_user.id, template_id, now]
    )
    return {"message": f"Template '{template_id}' applied", "template": template}
