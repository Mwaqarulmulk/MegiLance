# @AI-HINT: Referrals router — referral program management
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging
import secrets

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class ReferralInvite(BaseModel):
    email: str
    message: Optional[str] = None


class BulkInvite(BaseModel):
    emails: list[str]


@router.get("/my-code")
async def get_referral_code(current_user=Depends(get_current_user)):
    result = execute_query("SELECT referral_code FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(result)
    code = rows[0].get("referral_code") if rows else None

    if not code:
        code = f"REF-{current_user.id}-{secrets.token_hex(4).upper()}"
        execute_query("UPDATE users SET referral_code = ? WHERE id = ?", [code, current_user.id])

    return {"referral_code": code, "referral_url": f"https://megilance.site/signup?ref={code}"}


@router.post("/generate-code")
async def generate_referral_code(current_user=Depends(get_current_user)):
    code = f"REF-{current_user.id}-{secrets.token_hex(4).upper()}"
    execute_query("UPDATE users SET referral_code = ? WHERE id = ?", [code, current_user.id])
    return {"referral_code": code, "referral_url": f"https://megilance.site/signup?ref={code}"}


@router.get("/validate/{code}")
async def validate_referral_code(code: str):
    result = execute_query("SELECT id, name, email FROM users WHERE referral_code = ?", [code])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    return {"valid": True, "referrer_name": rows[0]["name"], "referrer_email": rows[0]["email"]}


@router.post("/apply/{code}")
async def apply_referral_code(code: str, current_user=Depends(get_current_user)):
    result = execute_query("SELECT id FROM users WHERE referral_code = ?", [code])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Invalid referral code")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO referrals (referrer_id, referred_id, status, created_at) VALUES (?, ?, 'pending', ?)",
        [rows[0]["id"], current_user.id, now],
    )
    return {"message": "Referral code applied"}


@router.get("/my-referrals")
async def get_my_referrals(
    status_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1),
    current_user=Depends(get_current_user),
):
    where = "WHERE referrer_id = ?"
    params = [current_user.id]

    if status_filter:
        where += " AND status = ?"
        params.append(status_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"SELECT id, email, status, bonus_amount, created_at FROM referrals {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


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


@router.get("/rewards")
async def get_rewards(status_filter: Optional[str] = None, current_user=Depends(get_current_user)):
    where = "WHERE referrer_id = ? AND bonus_amount > 0"
    params = [current_user.id]

    if status_filter:
        where += " AND status = ?"
        params.append(status_filter)

    result = execute_query(
        f"SELECT id, bonus_amount, status, created_at FROM referrals {where} ORDER BY created_at DESC",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.post("/withdraw-rewards")
async def withdraw_rewards(data: dict, current_user=Depends(get_current_user)):
    amount = data.get("amount", 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    balance = execute_query("SELECT account_balance FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(balance)
    current_balance = rows[0]["account_balance"] if rows else 0

    if amount > current_balance:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    now = datetime.now(timezone.utc).isoformat()
    execute_query("UPDATE users SET account_balance = account_balance - ? WHERE id = ?", [amount, current_user.id])
    return {"message": "Rewards withdrawn", "amount": amount}


@router.get("/leaderboard")
async def get_leaderboard(period: str = Query("monthly"), limit: int = Query(10, ge=1, le=50)):
    result = execute_query(
        f"""SELECT u.id, u.name, u.profile_image_url, COUNT(r.id) as referral_count
            FROM referrals r
            JOIN users u ON r.referrer_id = u.id
            GROUP BY r.referrer_id
            ORDER BY referral_count DESC
            LIMIT ?""",
        [limit],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "period": period}


@router.get("/campaigns")
async def get_campaigns(current_user=Depends(get_current_user)):
    return {
        "campaigns": [
            {"id": 1, "name": "Spring Referral", "bonus": 10, "active": True},
            {"id": 2, "name": "Summer Boost", "bonus": 15, "active": False},
        ]
    }


@router.post("/invite/email")
async def invite_email(request: ReferralInvite, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO referrals (referrer_id, email, message, status, created_at) VALUES (?, ?, ?, 'pending', ?)",
        [current_user.id, request.email, request.message or "", now],
    )
    return {"message": "Invitation sent", "referral_id": result.get("last_insert_rowid")}


@router.post("/invite/bulk")
async def bulk_invite(request: BulkInvite, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    count = 0
    for email in request.emails:
        execute_query(
            "INSERT INTO referrals (referrer_id, email, status, created_at) VALUES (?, ?, 'pending', ?)",
            [current_user.id, email, now],
        )
        count += 1
    return {"message": f"{count} invitations sent"}


@router.get("/share-links")
async def get_share_links(current_user=Depends(get_current_user)):
    code_result = execute_query("SELECT referral_code FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(code_result)
    code = rows[0].get("referral_code") if rows else f"REF-{current_user.id}"

    return {
        "links": [
            {"platform": "twitter", "url": f"https://twitter.com/intent/tweet?text=Join me on MegiLance!&url=https://megilance.site/signup?ref={code}"},
            {"platform": "facebook", "url": f"https://www.facebook.com/sharer/sharer.php?u=https://megilance.site/signup?ref={code}"},
            {"platform": "linkedin", "url": f"https://www.linkedin.com/sharing/share-offsite/?url=https://megilance.site/signup?ref={code}"},
        ]
    }


@router.get("/milestones")
async def get_milestones(current_user=Depends(get_current_user)):
    return {
        "milestones": [
            {"id": 1, "name": "First Referral", "target": 1, "reward": 5, "achieved": False},
            {"id": 2, "name": "Five Referrals", "target": 5, "reward": 25, "achieved": False},
            {"id": 3, "name": "Ten Referrals", "target": 10, "reward": 50, "achieved": False},
        ]
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
