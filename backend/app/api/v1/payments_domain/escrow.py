# @AI-HINT: Escrow router — fund, release, refund escrow
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows, parse_date
from app.services.escrow_service import (
    get_contract_parties,
    get_user_balance,
    update_user_balance,
    fund_pending_escrow,
)

router = APIRouter()


class EscrowFund(BaseModel):
    contract_id: int
    amount: float
    notes: Optional[str] = None

class EscrowRelease(BaseModel):
    escrow_id: int
    amount: Optional[float] = None
    notes: Optional[str] = None


@router.get("/")
async def list_escrow(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT e.id, e.contract_id, e.client_id, e.amount, e.released_amount,
                  e.status, e.expires_at, e.notes, e.created_at, e.updated_at,
                  c.project_id, pr.title as project_title
           FROM escrow e
           LEFT JOIN contracts c ON e.contract_id = c.id
           LEFT JOIN projects pr ON c.project_id = pr.id
           WHERE e.client_id = ? OR c.freelancer_id = ?
           ORDER BY e.created_at DESC
           LIMIT ? OFFSET ?""",
        [current_user.id, current_user.id, page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.get("/balance")
async def get_balance(current_user=Depends(get_current_user)):
    balance = get_user_balance(current_user.id)
    return {"user_id": current_user.id, "balance": balance}


@router.post("/fund")
async def fund_escrow(request: EscrowFund, current_user=Depends(get_current_user)):
    parties = get_contract_parties(request.contract_id)
    if not parties:
        raise HTTPException(status_code=404, detail="Contract not found")

    if parties["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can fund escrow")

    balance = get_user_balance(current_user.id)
    if balance < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    escrow = fund_pending_escrow(request.contract_id, current_user.id, request.amount, request.notes)
    if not escrow:
        raise HTTPException(status_code=500, detail="Failed to fund escrow")

    return {"message": "Escrow funded successfully", "escrow": escrow}


@router.get("/{escrow_id}")
async def get_escrow(escrow_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT e.id, e.contract_id, e.client_id, e.amount, e.released_amount, e.status, e.expires_at, e.notes, e.created_at, e.updated_at FROM escrow e WHERE e.id = ? AND (e.client_id = ? OR EXISTS (SELECT 1 FROM contracts c WHERE c.id = e.contract_id AND c.freelancer_id = ?))",
        [escrow_id, current_user.id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Escrow not found")
    return rows[0]


@router.post("/{escrow_id}/release")
async def release_escrow(escrow_id: int, request: EscrowRelease, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, contract_id, client_id, amount, released_amount, status FROM escrow WHERE id = ?",
        [escrow_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Escrow not found")

    escrow = rows[0]
    parties = get_contract_parties(escrow["contract_id"])
    if not parties:
        raise HTTPException(status_code=404, detail="Contract not found")

    if escrow["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can release escrow")

    if escrow["status"] != "funded":
        raise HTTPException(status_code=400, detail="Escrow is not funded")

    release_amount = request.amount or (escrow["amount"] - escrow["released_amount"])
    if release_amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid release amount")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE escrow SET released_amount = released_amount + ?, status = 'released', notes = ?, updated_at = ? WHERE id = ?",
        [release_amount, request.notes or "", now, escrow_id],
    )

    freelancer_balance = get_user_balance(parties["freelancer_id"])
    update_user_balance(parties["freelancer_id"], freelancer_balance + release_amount)

    return {"message": "Escrow released successfully", "amount": release_amount}


@router.post("/{escrow_id}/refund")
async def refund_escrow(escrow_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, contract_id, client_id, amount, released_amount, status FROM escrow WHERE id = ?",
        [escrow_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Escrow not found")

    escrow = rows[0]
    if escrow["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can refund escrow")

    if escrow["status"] != "funded":
        raise HTTPException(status_code=400, detail="Escrow is not funded")

    refund_amount = escrow["amount"] - escrow["released_amount"]
    if refund_amount <= 0:
        raise HTTPException(status_code=400, detail="No amount to refund")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE escrow SET status = 'refunded', updated_at = ? WHERE id = ?",
        [now, escrow_id],
    )

    client_balance = get_user_balance(current_user.id)
    update_user_balance(current_user.id, client_balance + refund_amount)

    return {"message": "Escrow refunded successfully", "amount": refund_amount}
