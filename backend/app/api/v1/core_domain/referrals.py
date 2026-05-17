# @AI-HINT: Referrals router — referral program management
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging
import secrets

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class ReferralInvite(BaseModel):
    email: str
    message: Optional[str] = None


@router.get("/my-code")
async def get_referral_code(current_user=Depends(get_current_user)):
    result = execute_query("SELECT referral_code FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(result)
    code = rows[0].get("referral_code") if rows else None

    if not code:
        code = f"REF-{current_user.id}-{secrets.token_hex(4).upper()}"
        execute_query("UPDATE users SET referral_code = ? WHERE id = ?", [code, current_user.id])

    return {"referral_code": code, "referral_url": f"https://megilance.site/signup?ref={code}"}


@router.get("/stats")
async def get_referral_stats(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed FROM referrals WHERE referrer_id = ?",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {
        "total_referrals": rows[0]["total"] if rows else 0,
        "completed_referrals": rows[0]["completed"] if rows else 0,
        "pending": (rows[0]["total"] if rows else 0) - (rows[0]["completed"] if rows else 0),
    }


@router.post("/invite")
async def invite_referral(request: ReferralInvite, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO referrals (referrer_id, email, status, created_at) VALUES (?, ?, 'pending', ?)",
        [current_user.id, request.email, now],
    )
    return {"message": "Invitation sent", "referral_id": result.get("last_insert_rowid")}


@router.get("/history")
async def get_referral_history(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, email, status, bonus_amount, created_at FROM referrals WHERE referrer_id = ? ORDER BY created_at DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}
