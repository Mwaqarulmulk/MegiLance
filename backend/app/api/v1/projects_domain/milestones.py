# @AI-HINT: Milestones router — milestone CRUD for contracts
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class MilestoneCreate(BaseModel):
    contract_id: int
    title: str
    description: Optional[str] = None
    amount: float
    due_date: Optional[str] = None

class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    due_date: Optional[str] = None
    status: Optional[str] = None


@router.get("/")
async def list_milestones(contract_id: int = Query(...), current_user=Depends(get_current_user)):
    result = execute_query(
        """SELECT m.id, m.contract_id, m.title, m.description, m.amount, m.status,
                  m.due_date, m.deliverables, m.submission_notes, m.approval_notes,
                  m.rejection_notes, m.created_at, m.updated_at
           FROM milestones m
           WHERE m.contract_id = ?
           ORDER BY m.due_date ASC""",
        [contract_id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.get("/{milestone_id}")
async def get_milestone(milestone_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, contract_id, title, description, amount, status, due_date, deliverables, submission_notes, approval_notes, rejection_notes, created_at, updated_at FROM milestones WHERE id = ?",
        [milestone_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return rows[0]


@router.post("/")
async def create_milestone(request: MilestoneCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO milestones (contract_id, title, description, amount, status, due_date, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)""",
        [request.contract_id, request.title, request.description or "", request.amount, request.due_date, now, now],
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create milestone")
    return {"message": "Milestone created", "milestone_id": result.get("last_insert_rowid")}


@router.patch("/{milestone_id}")
async def update_milestone(milestone_id: int, request: MilestoneUpdate, current_user=Depends(get_current_user)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), milestone_id]

    execute_query(f"UPDATE milestones SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Milestone updated"}


@router.delete("/{milestone_id}")
async def delete_milestone(milestone_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM milestones WHERE id = ?", [milestone_id])
    return {"message": "Milestone deleted"}


@router.post("/{milestone_id}/submit")
async def submit_milestone(milestone_id: int, request: dict, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE milestones SET status = 'submitted', deliverables = ?, submission_notes = ?, updated_at = ? WHERE id = ?",
        [request.get("deliverables", ""), request.get("submission_notes", ""), now, milestone_id],
    )
    return {"message": "Milestone submitted for review"}


@router.post("/{milestone_id}/approve")
async def approve_milestone(milestone_id: int, request: dict, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE milestones SET status = 'approved', approval_notes = ?, updated_at = ? WHERE id = ?",
        [request.get("approval_notes", ""), now, milestone_id],
    )
    return {"message": "Milestone approved"}


@router.post("/{milestone_id}/reject")
async def reject_milestone(milestone_id: int, request: dict, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE milestones SET status = 'rejected', rejection_notes = ?, updated_at = ? WHERE id = ?",
        [request.get("rejection_notes", ""), now, milestone_id],
    )
    return {"message": "Milestone rejected"}
