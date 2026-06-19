# @AI-HINT: Categories router — category listing and management
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[int] = None


@router.get("")
def list_categories(active_only: bool = True):
    where = "WHERE is_active = 1" if active_only else ""
    result = execute_query(
        f"SELECT id, name, slug, description, icon, parent_id, is_active, project_count, sort_order, created_at, updated_at FROM categories {where} ORDER BY sort_order ASC, name ASC",
        [],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.get("/tree")
def get_category_tree():
    result = execute_query(
        "SELECT id, name, slug, description, icon, parent_id, is_active, project_count FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC",
        [],
    )
    rows = parse_rows(result) or []
    tree = []
    children_map = {}
    for row in rows:
        row["children"] = []
        if row["parent_id"]:
            children_map.setdefault(row["parent_id"], []).append(row)
        else:
            tree.append(row)
    for cat in tree:
        cat["children"] = children_map.get(cat["id"], [])
    return {"tree": tree}


@router.post("")
def create_category(request: CategoryCreate, current_user=Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO categories (name, slug, description, icon, parent_id, is_active, project_count, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, 0, 0, ?, ?)",
        [request.name, request.slug, request.description or "", request.icon or "", request.parent_id, now, now],
    )
    return {"message": "Category created", "category_id": result.get("last_insert_rowid")}
