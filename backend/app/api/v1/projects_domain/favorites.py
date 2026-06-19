# @AI-HINT: Favorites router — save/favorite projects and freelancers.
# The favorites table schema is (user_id, target_type, target_id) — see
# alembic 85124def9342 and app/models/favorite.py. Enriches rows with project /
# freelancer details so the Favorites and Saved Jobs pages can render directly.
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

_VALID_TYPES = {"project", "freelancer", "client"}


class FavoriteCreate(BaseModel):
    # Preferred contract used by the frontend favoritesApi:
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    # Legacy fields (kept for backward compatibility):
    project_id: Optional[int] = None
    freelancer_id: Optional[int] = None

    def resolve(self) -> tuple[str, int]:
        if self.target_type and self.target_id:
            return self.target_type.lower(), int(self.target_id)
        if self.project_id:
            return "project", int(self.project_id)
        if self.freelancer_id:
            return "freelancer", int(self.freelancer_id)
        raise ValueError("target_type/target_id (or project_id/freelancer_id) required")


def _enrich(rows: list[dict]) -> list[dict]:
    """Attach project/freelancer display fields to each favorite row."""
    project_ids = [r["target_id"] for r in rows if r.get("target_type") == "project"]
    user_ids = [r["target_id"] for r in rows if r.get("target_type") in ("freelancer", "client")]

    projects: dict[int, dict] = {}
    if project_ids:
        placeholders = ",".join(["?"] * len(project_ids))
        presult = execute_query(
            f"""SELECT p.id, p.title, p.description, p.category, p.budget_type,
                       p.budget_min, p.budget_max, p.skills, p.proposals_count,
                       p.created_at, c.name as client_name
                FROM projects p LEFT JOIN users c ON p.client_id = c.id
                WHERE p.id IN ({placeholders})""",
            project_ids,
        )
        for p in parse_rows(presult) or []:
            projects[p["id"]] = p

    users: dict[int, dict] = {}
    if user_ids:
        placeholders = ",".join(["?"] * len(user_ids))
        uresult = execute_query(
            f"""SELECT id, name, bio, hourly_rate, profile_image_url, headline
                FROM users WHERE id IN ({placeholders})""",
            user_ids,
        )
        for u in parse_rows(uresult) or []:
            users[u["id"]] = u

    for r in rows:
        if r.get("target_type") == "project":
            p = projects.get(r["target_id"], {})
            r["project_id"] = r["target_id"]
            r["project_title"] = p.get("title")
            r["project_description"] = p.get("description")
            r["category"] = p.get("category")
            r["budget_type"] = p.get("budget_type")
            r["budget_min"] = p.get("budget_min")
            r["budget_max"] = p.get("budget_max")
            r["project_skills"] = p.get("skills")
            r["proposals_count"] = p.get("proposals_count")
            r["project_created_at"] = p.get("created_at")
            r["client_name"] = p.get("client_name")
            r["title"] = p.get("title")
        else:
            u = users.get(r["target_id"], {})
            r["freelancer_id"] = r["target_id"]
            r["freelancer_name"] = u.get("name")
            r["freelancer_bio"] = u.get("bio")
            r["hourly_rate"] = u.get("hourly_rate")
            r["headline"] = u.get("headline")
            r["name"] = u.get("name")
            r["title"] = u.get("name")
    return rows


@router.get("")
def list_favorites(
    target_type: Optional[str] = Query(None, regex="^(project|freelancer|client)$"),
    current_user=Depends(get_current_user),
):
    where = "WHERE user_id = ?"
    params: list = [current_user.id]
    if target_type:
        where += " AND target_type = ?"
        params.append(target_type)

    result = execute_query(
        f"""SELECT id, user_id, target_type, target_id, created_at
            FROM favorites {where} ORDER BY created_at DESC""",
        params,
    )
    rows = parse_rows(result) or []
    rows = _enrich(rows)
    # `items` for new consumers, `favorites` for the Favorites page — both supported.
    return {"items": rows, "favorites": rows, "total": len(rows)}


@router.post("")
def add_favorite(request: FavoriteCreate, current_user=Depends(get_current_user)):
    try:
        target_type, target_id = request.resolve()
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if target_type not in _VALID_TYPES:
        raise HTTPException(status_code=422, detail="Invalid target_type")

    existing = execute_query(
        "SELECT id FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?",
        [current_user.id, target_type, target_id],
    )
    existing_rows = parse_rows(existing)
    if existing_rows:
        # Idempotent — return the existing favorite instead of erroring.
        return {"message": "Already in favorites", "favorite_id": existing_rows[0]["id"]}

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO favorites (user_id, target_type, target_id, created_at) VALUES (?, ?, ?, ?)",
        [current_user.id, target_type, target_id, now],
    )
    id_result = execute_query("SELECT last_insert_rowid() as id", [])
    id_rows = parse_rows(id_result)
    new_id = id_rows[0]["id"] if id_rows else None
    return {"message": "Added to favorites", "favorite_id": new_id}


@router.get("/check/{target_type}/{target_id}")
def check_favorite(target_type: str, target_id: int, current_user=Depends(get_current_user)):
    if target_type not in _VALID_TYPES:
        raise HTTPException(status_code=422, detail="Invalid target_type")
    result = execute_query(
        "SELECT id FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?",
        [current_user.id, target_type, target_id],
    )
    rows = parse_rows(result)
    return {
        "is_favorite": bool(rows),
        "favorite_id": rows[0]["id"] if rows else None,
    }


@router.delete("/{favorite_id}")
def remove_favorite(favorite_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM favorites WHERE id = ? AND user_id = ?", [favorite_id, current_user.id])
    return {"message": "Removed from favorites"}
