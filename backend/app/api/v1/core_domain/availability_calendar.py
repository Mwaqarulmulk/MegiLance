# @AI-HINT: Availability Calendar router — freelancer scheduling and booking slots
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


def _ensure_tables():
    execute_query("""
        CREATE TABLE IF NOT EXISTS availability_settings (
            user_id INTEGER PRIMARY KEY,
            timezone TEXT DEFAULT 'UTC',
            buffer_time INTEGER DEFAULT 15,
            max_bookings_per_day INTEGER DEFAULT 5,
            is_accepting_bookings INTEGER DEFAULT 1,
            updated_at TEXT NOT NULL
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS availability_weekly_pattern (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            day_of_week TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            is_available INTEGER DEFAULT 1
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS availability_blocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            start_datetime TEXT NOT NULL,
            end_datetime TEXT NOT NULL,
            reason TEXT,
            created_at TEXT NOT NULL
        )
    """, [])


@router.get("/settings")
def get_settings(current_user=Depends(get_current_user)):
    _ensure_tables()
    result = execute_query(
        "SELECT user_id, timezone, buffer_time, max_bookings_per_day, is_accepting_bookings, updated_at FROM availability_settings WHERE user_id = ?",
        [current_user.id]
    )
    if not result or not result.get("rows"):
        return {
            "user_id": current_user.id, "timezone": "UTC",
            "buffer_time": 15, "max_bookings_per_day": 5,
            "is_accepting_bookings": True,
        }
    rows = parse_rows(result)
    row = rows[0] if rows else {}
    return {
        "user_id": row.get("user_id"), "timezone": row.get("timezone", "UTC"),
        "buffer_time": row.get("buffer_time", 15),
        "max_bookings_per_day": row.get("max_bookings_per_day", 5),
        "is_accepting_bookings": bool(row.get("is_accepting_bookings", 1)),
        "updated_at": row.get("updated_at"),
    }


class AvailabilitySettings(BaseModel):
    timezone: Optional[str] = None
    buffer_time: Optional[int] = None
    max_bookings_per_day: Optional[int] = None
    is_accepting_bookings: Optional[bool] = None


@router.put("/settings")
def update_settings(body: AvailabilitySettings, current_user=Depends(get_current_user)):
    _ensure_tables()
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO availability_settings (user_id, timezone, buffer_time, max_bookings_per_day, is_accepting_bookings, updated_at) "
        "VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET "
        "timezone = COALESCE(excluded.timezone, timezone), "
        "buffer_time = COALESCE(excluded.buffer_time, buffer_time), "
        "max_bookings_per_day = COALESCE(excluded.max_bookings_per_day, max_bookings_per_day), "
        "is_accepting_bookings = COALESCE(excluded.is_accepting_bookings, is_accepting_bookings), "
        "updated_at = excluded.updated_at",
        [current_user.id, body.timezone or "UTC", body.buffer_time or 15,
         body.max_bookings_per_day or 5, 1 if body.is_accepting_bookings is not False else 0, now]
    )
    return {"message": "Settings updated"}


@router.get("/weekly-pattern")
def get_weekly_pattern(current_user=Depends(get_current_user)):
    _ensure_tables()
    result = execute_query(
        "SELECT day_of_week, start_time, end_time, is_available FROM availability_weekly_pattern WHERE user_id = ? ORDER BY id",
        [current_user.id]
    )
    pattern = {day: {"is_available": False, "slots": []} for day in DAYS}
    if result and result.get("rows"):
        rows = parse_rows(result)
        for row in rows:
            day = row.get("day_of_week")
            if day in pattern:
                pattern[day]["is_available"] = bool(row.get("is_available", 0))
                pattern[day]["slots"].append({"start": row.get("start_time"), "end": row.get("end_time")})
    return {"pattern": pattern}


class WeeklyPatternUpdate(BaseModel):
    pattern: dict


@router.put("/weekly-pattern")
def update_weekly_pattern(body: WeeklyPatternUpdate, current_user=Depends(get_current_user)):
    _ensure_tables()
    execute_query("DELETE FROM availability_weekly_pattern WHERE user_id = ?", [current_user.id])
    for day, config in body.pattern.items():
        if day not in DAYS:
            continue
        is_avail = 1 if config.get("is_available") else 0
        for slot in config.get("slots", []):
            execute_query(
                "INSERT INTO availability_weekly_pattern (user_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?)",
                [current_user.id, day, slot.get("start", "09:00"), slot.get("end", "17:00"), is_avail]
            )
    return {"message": "Weekly pattern updated"}


@router.get("/blocks")
def get_blocks(current_user=Depends(get_current_user)):
    _ensure_tables()
    result = execute_query(
        "SELECT id, user_id, start_datetime, end_datetime, reason, created_at FROM availability_blocks WHERE user_id = ? ORDER BY start_datetime",
        [current_user.id]
    )
    blocks = []
    if result and result.get("rows"):
        rows = parse_rows(result)
        for row in rows:
            blocks.append({"id": row.get("id"), "start": row.get("start_datetime"), "end": row.get("end_datetime"), "reason": row.get("reason")})
    return {"blocks": blocks}


class BlockCreate(BaseModel):
    start_datetime: str
    end_datetime: str
    reason: Optional[str] = None


@router.post("/blocks", status_code=201)
def add_block(body: BlockCreate, current_user=Depends(get_current_user)):
    _ensure_tables()
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO availability_blocks (user_id, start_datetime, end_datetime, reason, created_at) VALUES (?, ?, ?, ?, ?)",
        [current_user.id, body.start_datetime, body.end_datetime, body.reason, now]
    )
    return {"message": "Block added"}


@router.delete("/blocks/{block_id}", status_code=204)
def delete_block(block_id: int, current_user=Depends(get_current_user)):
    _ensure_tables()
    execute_query(
        "DELETE FROM availability_blocks WHERE id = ? AND user_id = ?", [block_id, current_user.id]
    )


@router.get("/bookings")
def get_bookings(
    status: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    """List bookings (contracts) for the current user."""
    where = "WHERE (c.client_id = ? OR c.freelancer_id = ?)"
    params = [current_user.id, current_user.id]
    if status:
        where += " AND c.status = ?"
        params.append(status)

    result = execute_query(
        f"""SELECT c.id, c.project_id, c.client_id, c.freelancer_id, c.amount,
                   c.status, c.created_at, c.updated_at,
                   p.title as project_title
            FROM contracts c
            LEFT JOIN projects p ON c.project_id = p.id
            {where}
            ORDER BY c.created_at DESC
            LIMIT 50""",
        params,
    )
    rows = parse_rows(result)
    return {"bookings": rows if rows else []}


@router.get("/sync-status")
def get_sync_status(current_user=Depends(get_current_user)):
    return {"synced": False, "provider": None, "last_sync": None}
