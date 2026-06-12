# @AI-HINT: Rate Cards router — freelancer pricing structures and rate management
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


def _ensure_table():
    execute_query("""
        CREATE TABLE IF NOT EXISTS rate_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            hourly_rate REAL,
            fixed_rate REAL,
            currency TEXT DEFAULT 'USD',
            service_type TEXT DEFAULT 'general',
            description TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])


@router.get("")
async def list_rate_cards(current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT id, user_id, name, hourly_rate, fixed_rate, currency, service_type, description, is_active, created_at, updated_at "
        "FROM rate_cards WHERE user_id = ? ORDER BY created_at DESC",
        [current_user.id]
    )
    return parse_rows(result) if result else []


@router.get("/my-cards")
async def get_my_cards(current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT id, user_id, name, hourly_rate, fixed_rate, currency, service_type, description, is_active, created_at, updated_at "
        "FROM rate_cards WHERE user_id = ? AND is_active = 1 ORDER BY name",
        [current_user.id]
    )
    return parse_rows(result) if result else []


@router.get("/calculate")
async def calculate_rate(
    hours: float = Query(1.0, ge=0.1),
    card_id: int = Query(...),
    current_user=Depends(get_current_user),
):
    _ensure_table()
    result = execute_query(
        "SELECT hourly_rate, fixed_rate, currency FROM rate_cards WHERE id = ? AND user_id = ?",
        [card_id, current_user.id]
    )
    if not result or not result.get("rows"):
        raise HTTPException(status_code=404, detail="Rate card not found")
    row = result["rows"][0]
    hourly = float(row[0] or 0)
    fixed = float(row[1] or 0)
    currency = row[2] or "USD"
    return {
        "hours": hours,
        "hourly_rate": hourly,
        "fixed_rate": fixed,
        "calculated_total": round(hourly * hours, 2),
        "currency": currency,
    }


@router.get("/{card_id}")
async def get_rate_card(card_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT id, user_id, name, hourly_rate, fixed_rate, currency, service_type, description, is_active, created_at, updated_at "
        "FROM rate_cards WHERE id = ? AND user_id = ?",
        [card_id, current_user.id]
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Rate card not found")
    return rows[0]


class RateCardCreate(BaseModel):
    name: str
    hourly_rate: Optional[float] = None
    fixed_rate: Optional[float] = None
    currency: str = "USD"
    service_type: str = "general"
    description: Optional[str] = None


@router.post("", status_code=201)
async def create_rate_card(body: RateCardCreate, current_user=Depends(get_current_user)):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO rate_cards (user_id, name, hourly_rate, fixed_rate, currency, service_type, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [current_user.id, body.name, body.hourly_rate, body.fixed_rate, body.currency,
         body.service_type, body.description, now, now]
    )
    return {"message": "Rate card created"}


class RateCardUpdate(BaseModel):
    name: Optional[str] = None
    hourly_rate: Optional[float] = None
    fixed_rate: Optional[float] = None
    currency: Optional[str] = None
    service_type: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


@router.put("/{card_id}")
async def update_rate_card(card_id: int, body: RateCardUpdate, current_user=Depends(get_current_user)):
    _ensure_table()
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        return {"message": "No changes"}
    now = datetime.now(timezone.utc).isoformat()
    parts = []
    params = []
    for k, v in updates.items():
        parts.append(f"{k} = ?")
        params.append(1 if isinstance(v, bool) and v else (0 if isinstance(v, bool) else v))
    parts.append("updated_at = ?")
    params.extend([now, card_id, current_user.id])
    execute_query(
        f"UPDATE rate_cards SET {', '.join(parts)} WHERE id = ? AND user_id = ?", params
    )
    return {"message": "Rate card updated"}


@router.delete("/{card_id}", status_code=204)
async def delete_rate_card(card_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    execute_query(
        "DELETE FROM rate_cards WHERE id = ? AND user_id = ?", [card_id, current_user.id]
    )
