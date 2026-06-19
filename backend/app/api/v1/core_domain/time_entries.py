# @AI-HINT: Time entries router — time tracking for hourly contracts
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class TimeEntryCreate(BaseModel):
    contract_id: int
    date: str
    hours: float
    description: Optional[str] = None
    hourly_rate: Optional[float] = None

class TimeEntryUpdate(BaseModel):
    hours: Optional[float] = None
    description: Optional[str] = None
    status: Optional[str] = None


@router.get("")
def list_time_entries(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    contract_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    where = "WHERE t.freelancer_id = ?"
    params = [current_user.id]

    if contract_id:
        where += " AND t.contract_id = ?"
        params.append(contract_id)
    if start_date:
        where += " AND t.date >= ?"
        params.append(start_date)
    if end_date:
        where += " AND t.date <= ?"
        params.append(end_date)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT t.id, t.contract_id, t.freelancer_id, t.date, t.hours, t.description,
                   t.hourly_rate, t.status, t.created_at, t.updated_at,
                   pr.title as project_title
            FROM time_entries t
            LEFT JOIN contracts c ON t.contract_id = c.id
            LEFT JOIN projects pr ON c.project_id = pr.id
            {where}
            ORDER BY t.date DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.post("")
def create_time_entry(request: TimeEntryCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO time_entries (contract_id, freelancer_id, date, hours, description, hourly_rate, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)",
        [request.contract_id, current_user.id, request.date, request.hours, request.description or "", request.hourly_rate, now, now],
    )
    return {"message": "Time entry created", "entry_id": result.get("last_insert_rowid")}


@router.put("/{entry_id}")
def update_time_entry(entry_id: int, request: TimeEntryUpdate, current_user=Depends(get_current_user)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), entry_id]

    execute_query(f"UPDATE time_entries SET {', '.join(set_parts)} WHERE id = ? AND freelancer_id = ?", values + [current_user.id])
    return {"message": "Time entry updated"}


@router.delete("/{entry_id}")
def delete_time_entry(entry_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM time_entries WHERE id = ? AND freelancer_id = ?", [entry_id, current_user.id])
    return {"message": "Time entry deleted"}


@router.post("/{entry_id}/approve")
def approve_time_entry(entry_id: int, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE time_entries SET status = 'approved', updated_at = ? WHERE id = ?",
        [now, entry_id],
    )
    return {"message": "Time entry approved"}


@router.get("/summary")
def get_time_summary(
    contract_id: Optional[int] = None,
    current_user=Depends(get_current_user),
):
    where = "WHERE freelancer_id = ?"
    params = [current_user.id]
    if contract_id:
        where += " AND contract_id = ?"
        params.append(contract_id)

    result = execute_query(
        f"SELECT SUM(hours) as total_hours, SUM(hours * hourly_rate) as total_amount, COUNT(*) as entry_count FROM time_entries {where} AND status = 'approved'",
        params,
    )
    rows = parse_rows(result)
    return rows[0] if rows else {"total_hours": 0, "total_amount": 0, "entry_count": 0}


class TimeEntryStart(BaseModel):
    contract_id: int
    description: str
    billable: bool = True
    hourly_rate: Optional[float] = None


@router.post("/start")
def start_time_entry(request: TimeEntryStart, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    result = execute_query(
        "INSERT INTO time_entries (contract_id, freelancer_id, date, hours, description, hourly_rate, status, started_at, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?, 'running', ?, ?, ?)",
        [request.contract_id, current_user.id, now.strftime("%Y-%m-%d"), request.description, request.hourly_rate, now.isoformat(), now.isoformat(), now.isoformat()],
    )
    return {"message": "Timer started", "entry_id": result.get("last_insert_rowid"), "started_at": now.isoformat()}


@router.post("/{entry_id}/stop")
def stop_time_entry(entry_id: int, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    result = execute_query(
        "SELECT started_at, hourly_rate FROM time_entries WHERE id = ? AND freelancer_id = ?",
        [entry_id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Time entry not found")

    started_at = datetime.fromisoformat(rows[0]["started_at"]) if rows[0].get("started_at") else now
    hours = (now - started_at).total_seconds() / 3600
    hourly_rate = rows[0].get("hourly_rate") or 0

    execute_query(
        "UPDATE time_entries SET hours = ?, status = 'pending', stopped_at = ?, updated_at = ? WHERE id = ?",
        [round(hours, 2), now.isoformat(), now.isoformat(), entry_id],
    )
    return {"message": "Timer stopped", "hours": round(hours, 2), "amount": round(hours * hourly_rate, 2)}


@router.post("/{entry_id}/reject")
def reject_time_entry(entry_id: int, data: dict, current_user=Depends(get_current_user)):
    reason = data.get("reason", "")
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE time_entries SET status = 'rejected', rejection_reason = ?, updated_at = ? WHERE id = ?",
        [reason, now, entry_id],
    )
    return {"message": "Time entry rejected"}
