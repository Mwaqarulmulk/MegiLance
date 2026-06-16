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

class MilestoneSubmit(BaseModel):
    deliverables: Optional[str] = None
    submission_notes: Optional[str] = None

class MilestoneApprove(BaseModel):
    approval_notes: Optional[str] = None

class MilestoneReject(BaseModel):
    rejection_notes: Optional[str] = None


def _verify_contract_access(contract_id: int, user_id: int) -> dict:
    """Verify user has access to the contract and return contract info."""
    result = execute_query(
        "SELECT id, client_id, freelancer_id FROM contracts WHERE id = ?",
        [contract_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Contract not found")
    contract = rows[0]
    if contract["client_id"] != user_id and contract["freelancer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return contract


@router.get("")
async def list_milestones(contract_id: int = Query(...), current_user=Depends(get_current_user)):
    _verify_contract_access(contract_id, current_user.id)
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

    _verify_contract_access(rows[0]["contract_id"], current_user.id)
    return rows[0]


@router.post("")
async def create_milestone(request: MilestoneCreate, current_user=Depends(get_current_user)):
    _verify_contract_access(request.contract_id, current_user.id)

    now = datetime.now(timezone.utc).isoformat()

    max_result = execute_query(
        "SELECT COALESCE(MAX(order_index), -1) + 1 FROM milestones WHERE contract_id = ?",
        [request.contract_id],
    )
    order_index = 0
    if max_result and max_result.get("rows"):
        rows = parse_rows(max_result)
        raw_val = rows[0].get("order_index", 0) if rows else 0
        order_index = int(raw_val) if raw_val is not None else 0

    result = execute_query(
        """INSERT INTO milestones (contract_id, title, description, amount, status, due_date, order_index, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)""",
        [request.contract_id, request.title, request.description or "", request.amount, request.due_date, order_index, now, now],
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create milestone")
    return {"message": "Milestone created", "milestone_id": result.get("last_insert_rowid")}


@router.patch("/{milestone_id}")
async def update_milestone(milestone_id: int, request: MilestoneUpdate, current_user=Depends(get_current_user)):
    result = execute_query("SELECT contract_id FROM milestones WHERE id = ?", [milestone_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Milestone not found")

    _verify_contract_access(rows[0]["contract_id"], current_user.id)

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
    result = execute_query("SELECT contract_id FROM milestones WHERE id = ?", [milestone_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Milestone not found")

    _verify_contract_access(rows[0]["contract_id"], current_user.id)
    execute_query("DELETE FROM milestones WHERE id = ?", [milestone_id])
    return {"message": "Milestone deleted"}


@router.post("/{milestone_id}/submit")
async def submit_milestone(milestone_id: int, request: MilestoneSubmit, current_user=Depends(get_current_user)):
    result = execute_query("SELECT contract_id, status FROM milestones WHERE id = ?", [milestone_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Milestone not found")

    _verify_contract_access(rows[0]["contract_id"], current_user.id)

    if rows[0]["status"] not in ("pending", "in_progress", "rejected"):
        raise HTTPException(status_code=400, detail=f"Cannot submit milestone in '{rows[0]['status']}' status")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE milestones SET status = 'submitted', deliverables = ?, submission_notes = ?, submitted_at = ?, updated_at = ? WHERE id = ?",
        [request.deliverables or "", request.submission_notes or "", now, now, milestone_id],
    )
    return {"message": "Milestone submitted for review"}


@router.post("/{milestone_id}/approve")
async def approve_milestone(milestone_id: int, request: MilestoneApprove, current_user=Depends(get_current_user)):
    result = execute_query("SELECT contract_id, status FROM milestones WHERE id = ?", [milestone_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Milestone not found")

    contract = _verify_contract_access(rows[0]["contract_id"], current_user.id)

    # Only client can approve
    if contract["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can approve milestones")

    if rows[0]["status"] != "submitted":
        raise HTTPException(status_code=400, detail=f"Cannot approve milestone in '{rows[0]['status']}' status")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE milestones SET status = 'approved', approval_notes = ?, approved_at = ?, updated_at = ? WHERE id = ?",
        [request.approval_notes or "", now, now, milestone_id],
    )
    return {"message": "Milestone approved"}


@router.post("/{milestone_id}/reject")
async def reject_milestone(milestone_id: int, request: MilestoneReject, current_user=Depends(get_current_user)):
    result = execute_query("SELECT contract_id, status FROM milestones WHERE id = ?", [milestone_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Milestone not found")

    contract = _verify_contract_access(rows[0]["contract_id"], current_user.id)

    # Only client can reject
    if contract["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can reject milestones")

    if rows[0]["status"] != "submitted":
        raise HTTPException(status_code=400, detail=f"Cannot reject milestone in '{rows[0]['status']}' status")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE milestones SET status = 'rejected', rejection_notes = ?, updated_at = ? WHERE id = ?",
        [request.rejection_notes or "", now, milestone_id],
    )
    return {"message": "Milestone rejected"}
