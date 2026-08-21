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
    create_escrow,
    release_escrow_funds,
    refund_escrow_funds,
    get_escrow_core,
    get_freelancer_id_for_contract,
)

router = APIRouter()


class EscrowCreate(BaseModel):
    contract_id: int
    amount: float
    expires_at: Optional[str] = None
    notes: Optional[str] = None

class EscrowFund(BaseModel):
    contract_id: int
    amount: float
    notes: Optional[str] = None

class EscrowRelease(BaseModel):
    escrow_id: int
    amount: Optional[float] = None
    notes: Optional[str] = None


@router.get("")
def list_escrow(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT e.id, e.contract_id, e.client_id, e.amount, e.status, e.released_amount,
                  e.released_at, e.expires_at, e.created_at, e.updated_at,
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
def get_balance(current_user=Depends(get_current_user)):
    balance = get_user_balance(current_user.id)
    return {"user_id": current_user.id, "balance": balance}


@router.post("/create")
def create_new_escrow(request: EscrowCreate, current_user=Depends(get_current_user)):
    """Create a new escrow record and lock funds from client balance atomically."""
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    parties = get_contract_parties(request.contract_id)
    if not parties:
        raise HTTPException(status_code=404, detail="Contract not found")

    if parties["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can create escrow")

    balance = get_user_balance(current_user.id)
    if balance < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    try:
        escrow = create_escrow(
            contract_id=request.contract_id,
            client_id=current_user.id,
            amount=request.amount,
            expires_at=request.expires_at,
            notes=request.notes,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Escrow created and funds locked", "escrow": escrow}


@router.post("/fund")
def fund_escrow(request: EscrowFund, current_user=Depends(get_current_user)):
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
def get_escrow(escrow_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT e.id, e.contract_id, e.client_id, e.amount, e.status, e.released_amount, e.released_at, e.expires_at, e.created_at, e.updated_at FROM escrow e WHERE e.id = ? AND (e.client_id = ? OR EXISTS (SELECT 1 FROM contracts c WHERE c.id = e.contract_id AND c.freelancer_id = ?))",
        [escrow_id, current_user.id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Escrow not found")
    return rows[0]


@router.post("/{escrow_id}/release")
def release_escrow(escrow_id: int, request: EscrowRelease, current_user=Depends(get_current_user)):
    escrow_core = get_escrow_core(escrow_id)
    if not escrow_core:
        raise HTTPException(status_code=404, detail="Escrow not found")

    parties = get_contract_parties(escrow_core["contract_id"])
    if not parties:
        raise HTTPException(status_code=404, detail="Contract not found")

    if escrow_core["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can release escrow")

    if escrow_core["status"] not in ("funded", "active"):
        raise HTTPException(status_code=400, detail=f"Escrow cannot be released (status: {escrow_core['status']})")

    release_amount = request.amount or (escrow_core["amount"] - escrow_core["released_amount"])
    if release_amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid release amount")

    remaining = escrow_core["amount"] - escrow_core["released_amount"]
    if release_amount > remaining:
        raise HTTPException(status_code=400, detail="Release amount exceeds available escrow balance")

    freelancer_id = parties["freelancer_id"]
    if not freelancer_id:
        raise HTTPException(status_code=400, detail="No freelancer assigned to contract")

    try:
        release_escrow_funds(
            escrow_id=escrow_id,
            release_amount=release_amount,
            freelancer_id=freelancer_id,
            current_released=escrow_core["released_amount"],
            total_amount=escrow_core["amount"],
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Log wallet transactions (freelancer payout & platform fee)
    now = datetime.now(timezone.utc).isoformat()
    from app.core.config import get_settings
    fee_pct = float(getattr(get_settings(), "STRIPE_PLATFORM_FEE_PERCENT", 8.0)) / 100.0
    platform_fee = round(release_amount * fee_pct, 2)
    net_payout = round(release_amount - platform_fee, 2)

    execute_query(
        """INSERT INTO wallet_transactions (user_id, type, amount, currency, description, status, reference_id, created_at)
           VALUES (?, 'escrow_release', ?, 'USD', ?, 'completed', ?, ?)""",
        [freelancer_id, net_payout, f"Escrow #{escrow_id} released (Net of {fee_pct*100:.1f}% fee)", escrow_id, now],
    )
    if platform_fee > 0:
        execute_query(
            """INSERT INTO wallet_transactions (user_id, type, amount, currency, description, status, reference_id, created_at)
               VALUES (?, 'platform_fee', ?, 'USD', ?, 'completed', ?, ?)""",
            [current_user.id, platform_fee, f"Platform fee from Escrow #{escrow_id}", escrow_id, now],
        )

    # Growth Engine Hook: Qualify two-sided referral reward upon milestone escrow release ($50 to referrer)
    try:
        from app.services.referrals_service import qualify_referral_on_milestone
        qualify_referral_on_milestone(
            client_id=current_user.id,
            contract_id=escrow_core.get("contract_id"),
            milestone_id=escrow_id,
        )
    except Exception as e:
        logger.warning(f"Referral milestone qualification hook failed (non-critical): {e}")

    return {"message": "Escrow released successfully", "gross_amount": release_amount, "net_amount": net_payout, "platform_fee": platform_fee}


@router.post("/{escrow_id}/refund")
def refund_escrow(escrow_id: int, current_user=Depends(get_current_user)):
    escrow_core = get_escrow_core(escrow_id)
    if not escrow_core:
        raise HTTPException(status_code=404, detail="Escrow not found")

    if escrow_core["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the client can refund escrow")

    if escrow_core["status"] not in ("funded", "active"):
        raise HTTPException(status_code=400, detail=f"Escrow cannot be refunded (status: {escrow_core['status']})")

    refund_amount = escrow_core["amount"] - escrow_core["released_amount"]
    if refund_amount <= 0:
        raise HTTPException(status_code=400, detail="No amount to refund")

    try:
        refund_escrow_funds(
            escrow_id=escrow_id,
            refund_amount=refund_amount,
            client_id=current_user.id,
            current_released=escrow_core["released_amount"],
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Log the refund transaction
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        """INSERT INTO wallet_transactions (user_id, type, amount, currency, description, status, reference_id, created_at)
           VALUES (?, 'escrow_refund', ?, 'USD', ?, 'completed', ?, ?)""",
        [current_user.id, refund_amount, f"Escrow #{escrow_id} refunded", escrow_id, now],
    )

    return {"message": "Escrow refunded successfully", "amount": refund_amount}
