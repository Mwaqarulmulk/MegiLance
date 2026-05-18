# @AI-HINT: Feature Flags router — admin-controlled feature toggles and gradual rollouts
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query

router = APIRouter()


def _ensure_table():
    execute_query("""
        CREATE TABLE IF NOT EXISTS feature_flags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            is_active INTEGER DEFAULT 0,
            rollout_percentage INTEGER DEFAULT 0,
            target_roles TEXT DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])


def _row_to_flag(row: list) -> dict:
    return {
        "id": row[0], "name": row[1], "description": row[2],
        "is_active": bool(row[3]), "rollout_percentage": row[4] or 0,
        "target_roles": json.loads(row[5] or "[]"),
        "created_at": row[6], "updated_at": row[7],
    }


@router.get("/feature-flags/check/{flag_name}")
async def check_flag(flag_name: str, current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT name, is_active, rollout_percentage FROM feature_flags WHERE name = ?", [flag_name]
    )
    if not result or not result.get("rows"):
        return {"flag_name": flag_name, "is_enabled": False}
    row = result["rows"][0]
    is_active = bool(row[1])
    return {"flag_name": flag_name, "is_enabled": is_active}


@router.post("/feature-flags/check-multiple")
async def check_multiple_flags(body: dict, current_user=Depends(get_current_user)):
    _ensure_table()
    flag_names = body.get("flag_names", [])
    if not flag_names:
        return {"flags": {}}
    result = execute_query(
        f"SELECT name, is_active FROM feature_flags WHERE name IN ({','.join(['?']*len(flag_names))})",
        flag_names
    )
    flags = {name: False for name in flag_names}
    if result and result.get("rows"):
        for row in result["rows"]:
            flags[row[0]] = bool(row[1])
    return {"flags": flags}


@router.get("/feature-flags/my-flags")
async def get_my_flags(current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT id, name, description, is_active, rollout_percentage, target_roles, created_at, updated_at FROM feature_flags WHERE is_active = 1",
        []
    )
    flags = []
    if result and result.get("rows"):
        flags = [_row_to_flag(r) for r in result["rows"]]
    return {"flags": flags}


@router.get("/feature-flags/admin/all")
async def admin_list_flags(current_user=Depends(require_admin)):
    _ensure_table()
    result = execute_query(
        "SELECT id, name, description, is_active, rollout_percentage, target_roles, created_at, updated_at FROM feature_flags ORDER BY name",
        []
    )
    flags = []
    if result and result.get("rows"):
        flags = [_row_to_flag(r) for r in result["rows"]]
    return flags


@router.get("/feature-flags/admin/{flag_name}")
async def admin_get_flag(flag_name: str, current_user=Depends(require_admin)):
    _ensure_table()
    result = execute_query(
        "SELECT id, name, description, is_active, rollout_percentage, target_roles, created_at, updated_at FROM feature_flags WHERE name = ?",
        [flag_name]
    )
    if not result or not result.get("rows"):
        raise HTTPException(status_code=404, detail="Flag not found")
    return _row_to_flag(result["rows"][0])


class FlagCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = False
    rollout_percentage: int = 0
    target_roles: List[str] = []


@router.post("/feature-flags/admin/create", status_code=201)
async def admin_create_flag(body: FlagCreate, current_user=Depends(require_admin)):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO feature_flags (name, description, is_active, rollout_percentage, target_roles, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [body.name, body.description, 1 if body.is_active else 0, body.rollout_percentage,
         json.dumps(body.target_roles), now, now]
    )
    return {"message": "Flag created", "name": body.name}


class FlagUpdate(BaseModel):
    description: Optional[str] = None
    is_active: Optional[bool] = None
    rollout_percentage: Optional[int] = None
    target_roles: Optional[List[str]] = None


@router.put("/feature-flags/admin/{flag_name}")
async def admin_update_flag(flag_name: str, body: FlagUpdate, current_user=Depends(require_admin)):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        return {"message": "No changes"}
    parts = []
    params = []
    for k, v in updates.items():
        parts.append(f"{k} = ?")
        if k == "target_roles":
            params.append(json.dumps(v))
        elif isinstance(v, bool):
            params.append(1 if v else 0)
        else:
            params.append(v)
    parts.append("updated_at = ?")
    params.append(now)
    params.append(flag_name)
    execute_query(f"UPDATE feature_flags SET {', '.join(parts)} WHERE name = ?", params)
    return {"message": "Flag updated"}


@router.delete("/feature-flags/admin/{flag_name}", status_code=204)
async def admin_delete_flag(flag_name: str, current_user=Depends(require_admin)):
    _ensure_table()
    execute_query("DELETE FROM feature_flags WHERE name = ?", [flag_name])


@router.post("/feature-flags/admin/{flag_name}/rollout")
async def admin_rollout_flag(flag_name: str, body: dict, current_user=Depends(require_admin)):
    _ensure_table()
    percentage = min(100, max(0, int(body.get("percentage", 0))))
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE feature_flags SET rollout_percentage = ?, updated_at = ? WHERE name = ?",
        [percentage, now, flag_name]
    )
    return {"flag_name": flag_name, "rollout_percentage": percentage}


@router.get("/feature-flags/admin/{flag_name}/analytics")
async def admin_flag_analytics(flag_name: str, current_user=Depends(require_admin)):
    return {"flag_name": flag_name, "checks": 0, "enabled_for": 0}


@router.get("/feature-flags/admin/analytics/summary")
async def admin_flags_analytics_summary(current_user=Depends(require_admin)):
    _ensure_table()
    result = execute_query("SELECT COUNT(*), SUM(is_active) FROM feature_flags", [])
    total = active = 0
    if result and result.get("rows"):
        total = int(result["rows"][0][0] or 0)
        active = int(result["rows"][0][1] or 0)
    return {"total_flags": total, "active_flags": active, "inactive_flags": total - active}
