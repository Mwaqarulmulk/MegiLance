# @AI-HINT: Advanced Escrow Pro router — milestone-based escrow with Stripe integration
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

_TABLES_CREATED = False


def _ensure_table():
    global _TABLES_CREATED
    if _TABLES_CREATED:
        return
    execute_query("""
        CREATE TABLE IF NOT EXISTS escrow_pro (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contract_id INTEGER,
            client_id INTEGER NOT NULL,
            freelancer_id INTEGER,
            total_amount REAL NOT NULL,
            released_amount REAL DEFAULT 0,
            disputed_amount REAL DEFAULT 0,
            currency TEXT DEFAULT 'USD',
            status TEXT DEFAULT 'draft',
            stripe_payment_intent TEXT,
            stripe_transfer_group TEXT,
            description TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS escrow_milestones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            escrow_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            due_date TEXT,
            released_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])
    _TABLES_CREATED = True


def _get_escrow(escrow_id: int, user_id: int) -> dict:
    """Fetch escrow and verify user is client or freelancer."""
    result = execute_query(
        "SELECT id, contract_id, client_id, freelancer_id, total_amount, released_amount, "
        "disputed_amount, currency, status, stripe_payment_intent, stripe_transfer_group, "
        "description, created_at, updated_at FROM escrow_pro WHERE id = ?",
        [escrow_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Escrow not found")
    escrow = rows[0]
    if escrow["client_id"] != user_id and escrow.get("freelancer_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return escrow


def _get_milestones(escrow_id: int) -> list:
    result = execute_query(
        "SELECT id, escrow_id, title, description, amount, status, due_date, released_at, "
        "created_at, updated_at FROM escrow_milestones WHERE escrow_id = ? ORDER BY id",
        [escrow_id],
    )
    return parse_rows(result) or []


class MilestoneInput(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float
    due_date: Optional[str] = None


class EscrowCreate(BaseModel):
    contract_id: Optional[int] = None
    freelancer_id: Optional[int] = None
    total_amount: float
    currency: str = "USD"
    description: Optional[str] = None
    milestones: List[MilestoneInput] = []


class EscrowFund(BaseModel):
    payment_method_id: Optional[str] = None


class MilestoneRelease(BaseModel):
    notes: Optional[str] = None


class EscrowDispute(BaseModel):
    reason: str
    details: Optional[str] = None


class PartialRelease(BaseModel):
    milestone_id: int
    amount: float
    notes: Optional[str] = None


@router.post("/create", status_code=201)
def create_escrow(body: EscrowCreate, current_user=Depends(get_current_user)):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()

    if body.total_amount <= 0:
        raise HTTPException(status_code=400, detail="Total amount must be positive")

    if body.milestones:
        milestone_total = sum(m.amount for m in body.milestones)
        if abs(milestone_total - body.total_amount) > 0.01:
            raise HTTPException(
                status_code=400,
                detail=f"Milestone total ({milestone_total}) must equal escrow total ({body.total_amount})",
            )

    result = execute_query(
        """INSERT INTO escrow_pro (contract_id, client_id, freelancer_id, total_amount,
           released_amount, disputed_amount, currency, status, description, created_at, updated_at)
           VALUES (?, ?, ?, ?, 0, 0, ?, 'draft', ?, ?, ?)""",
        [
            body.contract_id,
            current_user.id,
            body.freelancer_id,
            body.total_amount,
            body.currency,
            body.description,
            now,
            now,
        ],
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create escrow")

    escrow_id = result.get("last_insert_rowid")

    for m in body.milestones:
        execute_query(
            """INSERT INTO escrow_milestones (escrow_id, title, description, amount, status,
               due_date, created_at, updated_at) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)""",
            [escrow_id, m.title, m.description, m.amount, m.due_date, now, now],
        )

    return {"message": "Escrow created", "escrow_id": escrow_id, "status": "draft"}


@router.get("/my")
def list_my_escrows(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    where = "WHERE (client_id = ? OR freelancer_id = ?)"
    params = [current_user.id, current_user.id]

    if status_filter:
        where += " AND status = ?"
        params.append(status_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT id, contract_id, client_id, freelancer_id, total_amount, released_amount,
                   disputed_amount, currency, status, description, created_at, updated_at
            FROM escrow_pro
            {where}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    escrows = rows if rows else []

    for e in escrows:
        e["milestones"] = _get_milestones(e["id"])

    return {"items": escrows, "total": len(escrows), "page": page}


@router.get("/{escrow_id}")
def get_escrow(escrow_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    escrow = _get_escrow(escrow_id, current_user.id)
    escrow["milestones"] = _get_milestones(escrow_id)
    return escrow


@router.post("/{escrow_id}/fund")
def fund_escrow(escrow_id: int, body: EscrowFund, current_user=Depends(get_current_user)):
    _ensure_table()
    escrow = _get_escrow(escrow_id, current_user.id)

    if escrow["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can fund the escrow")

    if escrow["status"] not in ("draft", "pending_funding"):
        raise HTTPException(status_code=400, detail=f"Cannot fund escrow in '{escrow['status']}' status")

    now = datetime.now(timezone.utc).isoformat()
    transfer_group = f"escrow_{escrow_id}_{int(datetime.now(timezone.utc).timestamp())}"

    execute_query(
        """UPDATE escrow_pro SET status = 'funded', stripe_transfer_group = ?,
           stripe_payment_intent = COALESCE(stripe_payment_intent, ?), updated_at = ?
           WHERE id = ?""",
        [transfer_group, body.payment_method_id, now, escrow_id],
    )

    execute_query(
        "UPDATE escrow_milestones SET status = 'active', updated_at = ? WHERE escrow_id = ? AND status = 'pending'",
        [now, escrow_id],
    )

    _log_transaction(escrow_id, "fund", escrow["total_amount"], escrow["currency"], current_user.id, "Escrow funded")

    return {"message": "Escrow funded", "status": "funded", "transfer_group": transfer_group}


@router.post("/{escrow_id}/milestones/{milestone_id}/release")
def release_milestone(
    escrow_id: int,
    milestone_id: int,
    body: MilestoneRelease,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    escrow = _get_escrow(escrow_id, current_user.id)

    if escrow["status"] != "funded":
        raise HTTPException(status_code=400, detail="Escrow must be funded before releasing milestones")

    if escrow["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can release milestone payments")

    result = execute_query(
        "SELECT id, escrow_id, title, amount, status FROM escrow_milestones WHERE id = ? AND escrow_id = ?",
        [milestone_id, escrow_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Milestone not found")

    milestone = rows[0]
    if milestone["status"] not in ("active", "in_progress", "submitted", "completed"):
        raise HTTPException(status_code=400, detail=f"Cannot release milestone in '{milestone['status']}' status")

    now = datetime.now(timezone.utc).isoformat()
    amount = milestone["amount"]

    execute_query(
        "UPDATE escrow_milestones SET status = 'released', released_at = ?, updated_at = ? WHERE id = ?",
        [now, now, milestone_id],
    )
    execute_query(
        "UPDATE escrow_pro SET released_amount = released_amount + ?, updated_at = ? WHERE id = ?",
        [amount, now, escrow_id],
    )

    _log_transaction(escrow_id, "milestone_release", amount, escrow["currency"], current_user.id,
                     f"Released: {milestone['title']}")

    updated_escrow = _get_escrow(escrow_id, current_user.id)
    remaining = updated_escrow["total_amount"] - updated_escrow["released_amount"]
    if remaining <= 0.01:
        execute_query(
            "UPDATE escrow_pro SET status = 'completed', updated_at = ? WHERE id = ?",
            [now, escrow_id],
        )

    return {
        "message": "Milestone payment released",
        "milestone_id": milestone_id,
        "amount": amount,
        "remaining": round(remaining, 2),
    }


@router.post("/{escrow_id}/dispute")
def dispute_escrow(escrow_id: int, body: EscrowDispute, current_user=Depends(get_current_user)):
    _ensure_table()
    escrow = _get_escrow(escrow_id, current_user.id)

    if escrow["status"] not in ("funded", "in_progress", "active"):
        raise HTTPException(status_code=400, detail="Cannot dispute escrow in current status")

    now = datetime.now(timezone.utc).isoformat()
    disputed_amount = escrow["total_amount"] - escrow["released_amount"]

    execute_query(
        "UPDATE escrow_pro SET status = 'disputed', disputed_amount = ?, updated_at = ? WHERE id = ?",
        [disputed_amount, now, escrow_id],
    )

    execute_query(
        "UPDATE escrow_milestones SET status = 'disputed', updated_at = ? WHERE escrow_id = ? AND status IN ('active', 'in_progress', 'submitted', 'completed')",
        [now, escrow_id],
    )

    _log_transaction(escrow_id, "dispute", disputed_amount, escrow["currency"], current_user.id,
                     f"Dispute: {body.reason}")

    return {"message": "Escrow disputed", "disputed_amount": disputed_amount, "reason": body.reason}


@router.post("/{escrow_id}/cancel")
def cancel_escrow(escrow_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    escrow = _get_escrow(escrow_id, current_user.id)

    if escrow["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can cancel the escrow")

    if escrow["status"] in ("completed", "cancelled", "refunded"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel escrow in '{escrow['status']}' status")

    now = datetime.now(timezone.utc).isoformat()
    refund_amount = escrow["total_amount"] - escrow["released_amount"]

    execute_query(
        "UPDATE escrow_pro SET status = 'cancelled', updated_at = ? WHERE id = ?",
        [now, escrow_id],
    )
    execute_query(
        "UPDATE escrow_milestones SET status = 'cancelled', updated_at = ? WHERE escrow_id = ? AND status NOT IN ('released', 'cancelled')",
        [now, escrow_id],
    )

    if refund_amount > 0:
        _log_transaction(escrow_id, "refund", refund_amount, escrow["currency"], current_user.id,
                         "Escrow cancelled — refund initiated")

    return {"message": "Escrow cancelled", "refund_amount": refund_amount}


@router.get("/{escrow_id}/transactions")
def get_escrow_transactions(escrow_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    _get_escrow(escrow_id, current_user.id)

    result = execute_query(
        "SELECT id, escrow_id, type, amount, currency, performed_by, notes, created_at "
        "FROM escrow_transactions WHERE escrow_id = ? ORDER BY created_at DESC",
        [escrow_id],
    )
    rows = parse_rows(result)
    return {"transactions": rows if rows else []}


@router.post("/{escrow_id}/partial-release")
def partial_release(escrow_id: int, body: PartialRelease, current_user=Depends(get_current_user)):
    _ensure_table()
    escrow = _get_escrow(escrow_id, current_user.id)

    if escrow["status"] != "funded":
        raise HTTPException(status_code=400, detail="Escrow must be funded before partial release")

    if escrow["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can release funds")

    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Release amount must be positive")

    available = escrow["total_amount"] - escrow["released_amount"]
    if body.amount > available + 0.01:
        raise HTTPException(status_code=400, detail=f"Insufficient available balance. Available: {available}")

    result = execute_query(
        "SELECT id, title, amount, status FROM escrow_milestones WHERE id = ? AND escrow_id = ?",
        [body.milestone_id, escrow_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Milestone not found")

    milestone = rows[0]
    if body.amount > milestone["amount"] + 0.01:
        raise HTTPException(status_code=400, detail="Release amount exceeds milestone amount")

    now = datetime.now(timezone.utc).isoformat()

    new_milestone_status = "released" if body.amount >= milestone["amount"] - 0.01 else "partially_released"
    execute_query(
        "UPDATE escrow_milestones SET status = ?, released_at = ?, updated_at = ? WHERE id = ?",
        [new_milestone_status, now, now, body.milestone_id],
    )
    execute_query(
        "UPDATE escrow_pro SET released_amount = released_amount + ?, updated_at = ? WHERE id = ?",
        [body.amount, now, escrow_id],
    )

    _log_transaction(escrow_id, "partial_release", body.amount, escrow["currency"], current_user.id,
                     body.notes or f"Partial release for: {milestone['title']}")

    updated_escrow = _get_escrow(escrow_id, current_user.id)
    remaining = updated_escrow["total_amount"] - updated_escrow["released_amount"]
    if remaining <= 0.01:
        execute_query(
            "UPDATE escrow_pro SET status = 'completed', updated_at = ? WHERE id = ?",
            [now, escrow_id],
        )

    return {
        "message": "Partial release processed",
        "milestone_id": body.milestone_id,
        "amount_released": body.amount,
        "remaining": round(remaining, 2),
    }


def _log_transaction(escrow_id: int, tx_type: str, amount: float, currency: str, user_id: int, notes: str):
    """Insert a row into escrow_transactions for audit trail."""
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        """CREATE TABLE IF NOT EXISTS escrow_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            escrow_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'USD',
            performed_by INTEGER,
            notes TEXT,
            created_at TEXT NOT NULL
        )""",
        [],
    )
    execute_query(
        "INSERT INTO escrow_transactions (escrow_id, type, amount, currency, performed_by, notes, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        [escrow_id, tx_type, amount, currency, user_id, notes, now],
    )
