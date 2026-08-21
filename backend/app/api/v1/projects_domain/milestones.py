# @AI-HINT: Milestones router — milestone CRUD for contracts
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows
from app.services.escrow_service import release_escrow_funds
from app.services.notifications_service import send_notification

router = APIRouter()


def _notify_safely(user_id: int, notification_type: str, title: str, content: str,
                   action_url: str, data: dict) -> None:
    """Create an in-app notification without failing the completed business action."""
    try:
        send_notification(user_id, notification_type, title, content, data=data, action_url=action_url)
    except Exception as exc:
        logger.warning("Could not create %s notification for user %s: %s", notification_type, user_id, exc)


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
        "SELECT id, client_id, freelancer_id, status, amount FROM contracts WHERE id = ?",
        [contract_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Contract not found")
    contract = rows[0]
    contract["id"] = int(contract["id"])
    contract["client_id"] = int(contract["client_id"])
    contract["freelancer_id"] = int(contract["freelancer_id"])
    contract["amount"] = float(contract["amount"] or 0)
    if contract["client_id"] != user_id and contract["freelancer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return contract


@router.get("")
def list_milestones(contract_id: int = Query(...), current_user=Depends(get_current_user)):
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
def get_milestone(milestone_id: int, current_user=Depends(get_current_user)):
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
def create_milestone(request: MilestoneCreate, current_user=Depends(get_current_user)):
    contract = _verify_contract_access(request.contract_id, current_user.id)
    if contract["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can create milestones")
    if contract["status"] not in ("pending", "active"):
        raise HTTPException(status_code=400, detail="Milestones can only be added to pending or active contracts")
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Milestone amount must be positive")

    allocated_rows = parse_rows(execute_query(
        "SELECT COALESCE(SUM(amount), 0) AS allocated FROM milestones WHERE contract_id = ?",
        [request.contract_id],
    ))
    allocated = float(allocated_rows[0]["allocated"] or 0) if allocated_rows else 0
    if allocated + request.amount > float(contract["amount"] or 0):
        raise HTTPException(status_code=400, detail="Milestone totals cannot exceed the contract amount")

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
    milestone_id = result.get("last_insert_rowid")
    _notify_safely(
        contract["freelancer_id"], "milestone_created", "New milestone added",
        f'"{request.title}" was added to your contract.',
        f"/freelancer/contracts/{request.contract_id}",
        {"contract_id": request.contract_id, "milestone_id": milestone_id},
    )
    return {"message": "Milestone created", "milestone_id": milestone_id}


@router.patch("/{milestone_id}")
def update_milestone(milestone_id: int, request: MilestoneUpdate, current_user=Depends(get_current_user)):
    result = execute_query("SELECT contract_id, status FROM milestones WHERE id = ?", [milestone_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Milestone not found")

    contract = _verify_contract_access(rows[0]["contract_id"], current_user.id)
    if contract["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can edit milestones")

    if rows[0]["status"] not in ("pending", "rejected"):
        raise HTTPException(status_code=400, detail="Only pending or rejected milestones can be edited")

    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    if "amount" in updates:
        if float(updates["amount"]) <= 0:
            raise HTTPException(status_code=400, detail="Milestone amount must be positive")
        allocated_rows = parse_rows(execute_query(
            "SELECT COALESCE(SUM(amount), 0) AS allocated FROM milestones WHERE contract_id = ? AND id != ?",
            [rows[0]["contract_id"], milestone_id],
        ))
        allocated = float(allocated_rows[0]["allocated"] or 0) if allocated_rows else 0
        if allocated + float(updates["amount"]) > float(contract["amount"] or 0):
            raise HTTPException(status_code=400, detail="Milestone totals cannot exceed the contract amount")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), milestone_id]

    execute_query(f"UPDATE milestones SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Milestone updated"}


@router.delete("/{milestone_id}")
def delete_milestone(milestone_id: int, current_user=Depends(get_current_user)):
    result = execute_query("SELECT contract_id, status FROM milestones WHERE id = ?", [milestone_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Milestone not found")

    contract = _verify_contract_access(rows[0]["contract_id"], current_user.id)
    if contract["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can delete milestones")
    if rows[0]["status"] != "pending":
        raise HTTPException(status_code=400, detail="Only pending milestones can be deleted")
    execute_query("DELETE FROM milestones WHERE id = ?", [milestone_id])
    return {"message": "Milestone deleted"}


@router.post("/{milestone_id}/submit")
def submit_milestone(milestone_id: int, request: MilestoneSubmit, current_user=Depends(get_current_user)):
    result = execute_query("SELECT contract_id, status FROM milestones WHERE id = ?", [milestone_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Milestone not found")

    contract = _verify_contract_access(rows[0]["contract_id"], current_user.id)
    if contract["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the assigned freelancer can submit milestones")

    if rows[0]["status"] not in ("pending", "in_progress", "rejected"):
        raise HTTPException(status_code=400, detail=f"Cannot submit milestone in '{rows[0]['status']}' status")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE milestones SET status = 'submitted', deliverables = ?, submission_notes = ?, submitted_at = ?, updated_at = ? WHERE id = ?",
        [request.deliverables or "", request.submission_notes or "", now, now, milestone_id],
    )
    _notify_safely(
        contract["client_id"], "milestone_submitted", "Milestone ready for review",
        "Your freelancer submitted a milestone for approval.",
        f"/client/contracts/{rows[0]['contract_id']}",
        {"contract_id": rows[0]["contract_id"], "milestone_id": milestone_id},
    )
    return {"message": "Milestone submitted for review"}


@router.post("/{milestone_id}/approve")
def approve_milestone(milestone_id: int, request: MilestoneApprove, current_user=Depends(get_current_user)):
    result = execute_query("SELECT contract_id, status, amount FROM milestones WHERE id = ?", [milestone_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Milestone not found")

    contract = _verify_contract_access(rows[0]["contract_id"], current_user.id)

    # Only client can approve
    if contract["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can approve milestones")
    # Client can approve submitted milestones or release pending upfront advance milestones
    if rows[0]["status"] not in ("submitted", "pending", "in_progress"):
        raise HTTPException(status_code=400, detail=f"Cannot approve milestone in '{rows[0]['status']}' status")

    milestone_amount = float(rows[0]["amount"] or 0)
    contract_id = int(rows[0]["contract_id"])
    escrow_rows = parse_rows(execute_query(
        "SELECT id, amount, released_amount, status FROM escrow WHERE contract_id = ? ORDER BY id DESC LIMIT 1",
        [contract_id],
    ))
    
    # Auto-fund if pending and client has balance
    if escrow_rows and escrow_rows[0].get("status") == "pending":
        from app.services.escrow_service import get_user_balance, fund_pending_escrow
        escrow_amt = float(escrow_rows[0]["amount"] or 0)
        if get_user_balance(current_user.id) >= escrow_amt:
            fund_pending_escrow(contract_id, current_user.id, escrow_amt, "Auto-funded on milestone release")
            escrow_rows = parse_rows(execute_query(
                "SELECT id, amount, released_amount, status FROM escrow WHERE contract_id = ? ORDER BY id DESC LIMIT 1",
                [contract_id],
            ))

    if not escrow_rows or escrow_rows[0].get("status") not in ('funded', 'active'):
        raise HTTPException(status_code=400, detail="Fund the contract escrow before approving this milestone")

    escrow = escrow_rows[0]
    remaining = float(escrow["amount"] or 0) - float(escrow["released_amount"] or 0)
    if milestone_amount <= 0 or milestone_amount > (remaining + 0.01):
        raise HTTPException(status_code=400, detail="Milestone amount exceeds the available escrow balance")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE milestones SET status = 'approving', updated_at = ? WHERE id = ?",
        [now, milestone_id],
    )
    try:
        release_escrow_funds(
            escrow_id=int(escrow["id"]),
            release_amount=milestone_amount,
            freelancer_id=int(contract["freelancer_id"]),
            current_released=float(escrow["released_amount"] or 0),
            total_amount=float(escrow["amount"] or 0),
        )
    except ValueError as exc:
        execute_query(
            "UPDATE milestones SET status = ?, updated_at = ? WHERE id = ?",
            [rows[0]["status"], datetime.now(timezone.utc).isoformat(), milestone_id],
        )
        raise HTTPException(status_code=400, detail=str(exc))

    execute_query(
        "UPDATE milestones SET status = 'approved', approval_notes = ?, approved_at = ?, updated_at = ? WHERE id = ?",
        [request.approval_notes or "", now, now, milestone_id],
    )
    try:
        execute_query(
            """INSERT INTO wallet_transactions
               (user_id, type, amount, currency, description, status, reference_id, created_at)
               VALUES (?, 'milestone_payment', ?, 'USD', ?, 'completed', ?, ?)""",
            [contract["freelancer_id"], milestone_amount, f"Milestone #{milestone_id} approved", milestone_id, now],
        )
    except Exception as exc:
        logger.warning("Milestone %s paid but wallet history logging failed: %s", milestone_id, exc)

    # Check if all milestones for the contract are now approved/completed
    all_ms = parse_rows(execute_query(
        "SELECT id, status FROM milestones WHERE contract_id = ?",
        [contract_id],
    ))
    if all_ms and all(m.get("status") in ("approved", "paid") for m in all_ms):
        execute_query(
            "UPDATE contracts SET status = 'completed', updated_at = ? WHERE id = ?",
            [now, contract_id],
        )
        execute_query(
            "UPDATE projects SET status = 'completed', updated_at = ? WHERE id = (SELECT project_id FROM contracts WHERE id = ?)",
            [now, contract_id],
        )
        logger.info(f"Contract {contract_id} marked as completed after all milestones approved")

    _notify_safely(
        contract["freelancer_id"], "milestone_approved", "Milestone approved and paid",
        f"Your milestone was approved and ${milestone_amount:.2f} was released.",
        f"/freelancer/contracts/{contract_id}",
        {"contract_id": contract_id, "milestone_id": milestone_id, "amount": milestone_amount},
    )

    # Growth Engine Hook: Qualify two-sided referral reward upon milestone release ($50 to referrer)
    try:
        from app.services.referrals_service import qualify_referral_on_milestone
        qualify_referral_on_milestone(
            client_id=current_user.id,
            contract_id=contract_id,
            milestone_id=milestone_id,
        )
    except Exception as exc:
        logger.warning(f"Referral qualification hook on milestone #{milestone_id} failed (non-critical): {exc}")

    return {"message": "Milestone approved and payment released", "released_amount": milestone_amount}


@router.post("/{milestone_id}/reject")
def reject_milestone(milestone_id: int, request: MilestoneReject, current_user=Depends(get_current_user)):
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
    _notify_safely(
        contract["freelancer_id"], "milestone_rejected", "Milestone changes requested",
        request.rejection_notes or "The client requested changes to your milestone.",
        f"/freelancer/contracts/{rows[0]['contract_id']}",
        {"contract_id": rows[0]["contract_id"], "milestone_id": milestone_id},
    )
    return {"message": "Milestone rejected"}
