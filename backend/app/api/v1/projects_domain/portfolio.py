# @AI-HINT: Portfolio router — portfolio items management
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class PortfolioCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    project_url: Optional[str] = None
    category: Optional[str] = None
    skills: Optional[str] = None


@router.get("/")
async def list_portfolio(user_id: Optional[int] = None, current_user=Depends(get_current_user)):
    uid = user_id or current_user.id
    result = execute_query(
        "SELECT id, user_id, title, description, image_url, project_url, category, skills, views, created_at, updated_at FROM portfolio_items WHERE user_id = ? ORDER BY created_at DESC",
        [uid],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.get("/{item_id}")
async def get_portfolio_item(item_id: int, current_user=Depends(get_current_user)):
    result = execute_query("SELECT id, user_id, title, description, image_url, project_url, category, skills, views, created_at, updated_at FROM portfolio_items WHERE id = ?", [item_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return rows[0]


@router.post("/")
async def create_portfolio_item(request: PortfolioCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO portfolio_items (user_id, title, description, image_url, project_url, category, skills, views, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)",
        [current_user.id, request.title, request.description or "", request.image_url or "", request.project_url or "", request.category or "", request.skills or "", now, now],
    )
    return {"message": "Portfolio item created", "item_id": result.get("last_insert_rowid")}


@router.put("/{item_id}")
async def update_portfolio_item(item_id: int, request: PortfolioCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE portfolio_items SET title = ?, description = ?, image_url = ?, project_url = ?, category = ?, skills = ?, updated_at = ? WHERE id = ? AND user_id = ?",
        [request.title, request.description or "", request.image_url or "", request.project_url or "", request.category or "", request.skills or "", now, item_id, current_user.id],
    )
    return {"message": "Portfolio item updated"}


@router.delete("/{item_id}")
async def delete_portfolio_item(item_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM portfolio_items WHERE id = ? AND user_id = ?", [item_id, current_user.id])
    return {"message": "Portfolio item deleted"}
