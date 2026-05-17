# @AI-HINT: Realtime notifications router — online users, user status, presence
from fastapi import APIRouter, Depends, Query
from typing import Optional
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


@router.get("/online-users")
async def get_online_users(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id FROM users WHERE is_online = 1 ORDER BY last_seen DESC LIMIT 100",
        [],
    )
    rows = parse_rows(result)
    user_ids = [r["id"] for r in rows] if rows else []
    return {"online_users": user_ids, "count": len(user_ids)}


@router.get("/user-status/{user_id}")
async def get_user_status(user_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, is_online, last_seen FROM users WHERE id = ?",
        [user_id],
    )
    rows = parse_rows(result)
    if not rows:
        return {"user_id": user_id, "online": False}
    return {"user_id": user_id, "online": bool(rows[0].get("is_online", 0))}


@router.post("/heartbeat")
async def heartbeat(current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE users SET is_online = 1, last_seen = ? WHERE id = ?",
        [now, current_user.id],
    )
    return {"status": "ok"}


@router.post("/offline")
async def mark_offline(current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE users SET is_online = 0, last_seen = ? WHERE id = ?",
        [now, current_user.id],
    )
    return {"status": "ok"}
