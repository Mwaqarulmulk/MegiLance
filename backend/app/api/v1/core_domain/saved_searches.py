# @AI-HINT: Saved searches router — save, manage, and execute saved searches
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class SavedSearchCreate(BaseModel):
    name: str
    query: str
    filters: Optional[dict] = None
    category: Optional[str] = None
    alerts_enabled: bool = False
    alert_frequency: str = "daily"


class SavedSearchUpdate(BaseModel):
    name: Optional[str] = None
    query: Optional[str] = None
    filters: Optional[dict] = None
    category: Optional[str] = None
    alerts_enabled: Optional[bool] = None
    alert_frequency: Optional[str] = None


@router.get("/")
async def get_saved_searches(
    category: Optional[str] = None,
    alerts_only: bool = False,
    current_user=Depends(get_current_user),
):
    where = "WHERE user_id = ?"
    params = [current_user.id]

    if category:
        where += " AND category = ?"
        params.append(category)
    if alerts_only:
        where += " AND alerts_enabled = 1"

    result = execute_query(
        f"SELECT id, name, query, filters, category, alerts_enabled, alert_frequency, created_at, updated_at FROM saved_searches {where} ORDER BY created_at DESC",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.get("/{search_id}")
async def get_saved_search(search_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, name, query, filters, category, alerts_enabled, alert_frequency, created_at, updated_at FROM saved_searches WHERE id = ? AND user_id = ?",
        [search_id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Saved search not found")
    return rows[0]


@router.post("/")
async def create_saved_search(request: SavedSearchCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    import json
    result = execute_query(
        "INSERT INTO saved_searches (user_id, name, query, filters, category, alerts_enabled, alert_frequency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [current_user.id, request.name, request.query, json.dumps(request.filters or {}), request.category or "", 1 if request.alerts_enabled else 0, request.alert_frequency, now, now],
    )
    return {"message": "Saved search created", "search_id": result.get("last_insert_rowid")}


@router.put("/{search_id}")
async def update_saved_search(search_id: int, request: SavedSearchUpdate, current_user=Depends(get_current_user)):
    existing = execute_query("SELECT id FROM saved_searches WHERE id = ? AND user_id = ?", [search_id, current_user.id])
    if not parse_rows(existing):
        raise HTTPException(status_code=404, detail="Saved search not found")

    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    import json
    set_parts = []
    values = []
    for k, v in updates.items():
        if k == "filters":
            set_parts.append(f"{k} = ?")
            values.append(json.dumps(v))
        elif k == "alerts_enabled":
            set_parts.append(f"{k} = ?")
            values.append(1 if v else 0)
        else:
            set_parts.append(f"{k} = ?")
            values.append(v)

    set_parts.append("updated_at = ?")
    values.extend([datetime.now(timezone.utc).isoformat(), search_id])

    execute_query(f"UPDATE saved_searches SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Saved search updated"}


@router.delete("/{search_id}")
async def delete_saved_search(search_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM saved_searches WHERE id = ? AND user_id = ?", [search_id, current_user.id])
    return {"message": "Saved search deleted"}


@router.post("/{search_id}/execute")
async def execute_saved_search(search_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT query, filters FROM saved_searches WHERE id = ? AND user_id = ?",
        [search_id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Saved search not found")

    return {"message": "Search executed", "query": rows[0]["query"], "filters": rows[0].get("filters", {})}


@router.post("/{search_id}/alert")
async def toggle_alert(search_id: int, data: dict, current_user=Depends(get_current_user)):
    existing = execute_query("SELECT id FROM saved_searches WHERE id = ? AND user_id = ?", [search_id, current_user.id])
    if not parse_rows(existing):
        raise HTTPException(status_code=404, detail="Saved search not found")

    enable = data.get("enable", False)
    frequency = data.get("frequency", "daily")

    execute_query(
        "UPDATE saved_searches SET alerts_enabled = ?, alert_frequency = ?, updated_at = ? WHERE id = ?",
        [1 if enable else 0, frequency, datetime.now(timezone.utc).isoformat(), search_id],
    )
    return {"message": f"Alert {'enabled' if enable else 'disabled'}"}
