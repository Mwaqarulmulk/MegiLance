# @AI-HINT: Favorites router — save/favorite projects and freelancers
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class FavoriteCreate(BaseModel):
    project_id: Optional[int] = None
    freelancer_id: Optional[int] = None


@router.get("")
async def list_favorites(current_user=Depends(get_current_user)):
    result = execute_query(
        """SELECT f.id, f.project_id, f.freelancer_id, f.created_at,
                  p.title as project_title, p.category, p.budget_min, p.budget_max,
                  u.name as freelancer_name, u.bio as freelancer_bio, u.hourly_rate
           FROM favorites f
           LEFT JOIN projects p ON f.project_id = p.id
           LEFT JOIN users u ON f.freelancer_id = u.id
           WHERE f.user_id = ?
           ORDER BY f.created_at DESC""",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.post("")
async def add_favorite(request: FavoriteCreate, current_user=Depends(get_current_user)):
    # Check for duplicate
    conditions = ["user_id = ?"]
    params = [current_user.id]
    if request.project_id:
        conditions.append("project_id = ?")
        params.append(request.project_id)
    if request.freelancer_id:
        conditions.append("freelancer_id = ?")
        params.append(request.freelancer_id)

    existing = execute_query(
        f"SELECT id FROM favorites WHERE {' AND '.join(conditions)}",
        params,
    )
    if existing and parse_rows(existing):
        raise HTTPException(status_code=409, detail="Already in favorites")

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO favorites (user_id, project_id, freelancer_id, created_at) VALUES (?, ?, ?, ?)",
        [current_user.id, request.project_id, request.freelancer_id, now],
    )
    return {"message": "Added to favorites", "favorite_id": result.get("last_insert_rowid")}


@router.delete("/{favorite_id}")
async def remove_favorite(favorite_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM favorites WHERE id = ? AND user_id = ?", [favorite_id, current_user.id])
    return {"message": "Removed from favorites"}
