# @AI-HINT: Portfolio router — portfolio items management
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class PortfolioCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: Optional[str] = Field(default=None, max_length=5000)
    image_url: Optional[str] = Field(default=None, max_length=2048)
    project_url: Optional[str] = Field(default=None, max_length=2048)
    category: Optional[str] = Field(default=None, max_length=100)
    skills: Optional[str] = Field(default=None, max_length=1000)


def _require_freelancer(current_user) -> None:
    if current_user.user_type != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can manage portfolio items")


@router.get("")
def list_portfolio(user_id: Optional[int] = None, current_user=Depends(get_current_user)):
    uid = user_id or current_user.id
    result = execute_query(
        "SELECT id, user_id, title, description, image_url, project_url, category, skills, views, created_at, updated_at FROM portfolio_items WHERE user_id = ? ORDER BY created_at DESC",
        [uid],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.get("/{item_id}")
def get_portfolio_item(item_id: int, current_user=Depends(get_current_user)):
    result = execute_query("SELECT id, user_id, title, description, image_url, project_url, category, skills, views, created_at, updated_at FROM portfolio_items WHERE id = ?", [item_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return rows[0]


@router.post("")
def create_portfolio_item(request: PortfolioCreate, current_user=Depends(get_current_user)):
    _require_freelancer(current_user)
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO portfolio_items (user_id, title, description, image_url, project_url, category, skills, views, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)",
        [current_user.id, request.title, request.description or "", request.image_url or "", request.project_url or "", request.category or "", request.skills or "", now, now],
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create portfolio item")
    return {"message": "Portfolio item created", "item_id": result.get("last_insert_rowid")}


@router.put("/{item_id}")
def update_portfolio_item(item_id: int, request: PortfolioCreate, current_user=Depends(get_current_user)):
    _require_freelancer(current_user)
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "UPDATE portfolio_items SET title = ?, description = ?, image_url = ?, project_url = ?, category = ?, skills = ?, updated_at = ? WHERE id = ? AND user_id = ?",
        [request.title, request.description or "", request.image_url or "", request.project_url or "", request.category or "", request.skills or "", now, item_id, current_user.id],
    )
    if not result or not result.get("rows_affected"):
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return {"message": "Portfolio item updated"}


@router.delete("/{item_id}")
def delete_portfolio_item(item_id: int, current_user=Depends(get_current_user)):
    _require_freelancer(current_user)
    result = execute_query("DELETE FROM portfolio_items WHERE id = ? AND user_id = ?", [item_id, current_user.id])
    if not result or not result.get("rows_affected"):
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return {"message": "Portfolio item deleted"}
