# @AI-HINT: Admin router — user management, platform stats, moderation
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows, parse_date

router = APIRouter()


class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None
    email_verified: Optional[bool] = None


@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    search: Optional[str] = None,
    current_user=Depends(require_admin),
):
    where = "WHERE 1=1"
    params: list = []

    if role:
        where += " AND role = ?"
        params.append(role)
    if search:
        where += " AND (name LIKE ? OR email LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT id, email, name, user_type, role, is_active, email_verified,
                   profile_image_url, created_at, account_balance
            FROM users
            {where}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)

    count_result = execute_query(f"SELECT COUNT(*) as total FROM users {where}", [p for p in params[:-2]])
    total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0

    return {"items": rows if rows else [], "total": total, "page": page}


@router.get("/users/{user_id}")
async def get_user(user_id: int, current_user=Depends(require_admin)):
    result = execute_query(
        "SELECT id, email, name, user_type, role, is_active, email_verified, profile_image_url, created_at, account_balance, bio, skills, hourly_rate, location FROM users WHERE id = ?",
        [user_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")
    return rows[0]


@router.put("/users/{user_id}")
async def update_user(user_id: int, request: AdminUserUpdate, current_user=Depends(require_admin)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    for k, v in updates.items():
        if isinstance(v, bool):
            updates[k] = 1 if v else 0

    set_parts = [f"{k} = ?" for k in updates]
    values = list(updates.values()) + [user_id]
    execute_query(f"UPDATE users SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "User updated"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: int, current_user=Depends(require_admin)):
    execute_query("DELETE FROM users WHERE id = ?", [user_id])
    return {"message": "User deleted"}


@router.get("/stats")
async def get_stats(current_user=Depends(require_admin)):
    users = execute_query("SELECT COUNT(*) as count FROM users", [])
    projects = execute_query("SELECT COUNT(*) as count FROM projects", [])
    proposals = execute_query("SELECT COUNT(*) as count FROM proposals", [])
    contracts = execute_query("SELECT COUNT(*) as count FROM contracts", [])

    return {
        "total_users": parse_rows(users)[0]["count"] if parse_rows(users) else 0,
        "total_projects": parse_rows(projects)[0]["count"] if parse_rows(projects) else 0,
        "total_proposals": parse_rows(proposals)[0]["count"] if parse_rows(proposals) else 0,
        "total_contracts": parse_rows(contracts)[0]["count"] if parse_rows(contracts) else 0,
    }
