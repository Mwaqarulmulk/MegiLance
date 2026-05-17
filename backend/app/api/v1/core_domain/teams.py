# @AI-HINT: Teams router — team collaboration management
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None

class TeamInvite(BaseModel):
    email: str
    role: str = "member"


@router.get("/")
async def list_teams(current_user=Depends(get_current_user)):
    result = execute_query(
        """SELECT t.id, t.name, t.description, t.owner_id, t.created_at,
                  COUNT(tm.user_id) as member_count
           FROM teams t
           LEFT JOIN team_members tm ON t.id = tm.team_id
           WHERE t.owner_id = ? OR tm.user_id = ?
           GROUP BY t.id
           ORDER BY t.created_at DESC""",
        [current_user.id, current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.post("/")
async def create_team(request: TeamCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO teams (name, description, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        [request.name, request.description or "", current_user.id, now, now],
    )
    team_id = result.get("last_insert_rowid")
    execute_query(
        "INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES (?, ?, 'owner', ?)",
        [team_id, current_user.id, now],
    )
    return {"message": "Team created", "team_id": team_id}


@router.get("/{team_id}")
async def get_team(team_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, name, description, owner_id, created_at FROM teams WHERE id = ?",
        [team_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Team not found")

    members = execute_query(
        "SELECT tm.user_id, tm.role, tm.joined_at, u.name, u.email, u.profile_image_url FROM team_members tm LEFT JOIN users u ON tm.user_id = u.id WHERE tm.team_id = ?",
        [team_id],
    )
    rows[0]["members"] = parse_rows(members) or []
    return rows[0]


@router.post("/{team_id}/invite")
async def invite_member(team_id: int, request: TeamInvite, current_user=Depends(get_current_user)):
    result = execute_query("SELECT owner_id FROM teams WHERE id = ?", [team_id])
    rows = parse_rows(result)
    if not rows or rows[0]["owner_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only team owner can invite members")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO team_invitations (team_id, email, role, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [team_id, request.email, request.role, secrets.token_urlsafe(32), (datetime.now(timezone.utc) + __import__('datetime').timedelta(days=7)).isoformat(), now],
    )
    return {"message": "Invitation sent"}


@router.delete("/{team_id}/members/{user_id}")
async def remove_member(team_id: int, user_id: int, current_user=Depends(get_current_user)):
    result = execute_query("SELECT owner_id FROM teams WHERE id = ?", [team_id])
    rows = parse_rows(result)
    if not rows or rows[0]["owner_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only team owner can remove members")

    execute_query("DELETE FROM team_members WHERE team_id = ? AND user_id = ?", [team_id, user_id])
    return {"message": "Member removed"}
