# @AI-HINT: Referrals router — referral program management
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging
import secrets

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

_referral_code_column_checked = False


def _ensure_referral_code_column() -> None:
    """Self-heal: ensure users.referral_code exists.

    The column isn't in the base migrations, so on existing databases the
    referral reads/writes would fail. Adding it idempotently (ALTER errors if it
    already exists) keeps the feature working without a manual migration run.
    """
    global _referral_code_column_checked
    if _referral_code_column_checked:
        return
    try:
        execute_query("ALTER TABLE users ADD COLUMN referral_code TEXT", [])
    except Exception:
        # Column already exists (or DB rejected duplicate) — that's the success case.
        pass
    finally:
        _referral_code_column_checked = True


class ReferralInvite(BaseModel):
    email: str
    message: Optional[str] = None


class BulkInvite(BaseModel):
    emails: list[str]


@router.get("/me")
async def get_my_referral_data(current_user=Depends(get_current_user)):
    try:
        _ensure_referral_code_column()
        code_result = execute_query(
            "SELECT referral_code FROM users WHERE id = ?",
            [current_user.id],
        )
        code_rows = parse_rows(code_result)
        code = code_rows[0].get("referral_code") if code_rows else None

        if not code:
            code = f"REF-{current_user.id}-{secrets.token_hex(4).upper()}"
            execute_query("UPDATE users SET referral_code = ? WHERE id = ?", [code, current_user.id])

        stats_result = execute_query(
            "SELECT COUNT(*) as total, "
            "COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed, "
            "COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending "
            "FROM referrals WHERE referrer_id = ?",
            [current_user.id],
        )
        stats_rows = parse_rows(stats_result)
        stats = stats_rows[0] if stats_rows else {"total": 0, "completed": 0, "pending": 0}

        total_earned_result = execute_query(
            "SELECT COALESCE(SUM(reward_amount), 0) as total_earned "
            "FROM referrals WHERE referrer_id = ? AND status = 'completed'",
            [current_user.id],
        )
        earned_rows = parse_rows(total_earned_result)
        total_earned = earned_rows[0]["total_earned"] if earned_rows else 0

        recent_result = execute_query(
            "SELECT r.id, r.referred_email, r.status, r.reward_amount, r.created_at, "
            "u.name as referred_name "
            "FROM referrals r "
            "LEFT JOIN users u ON r.referred_user_id = u.id "
            "WHERE r.referrer_id = ? ORDER BY r.created_at DESC LIMIT 5",
            [current_user.id],
        )
        recent = parse_rows(recent_result) or []

        return {
            "referral_code": code,
            "referral_url": f"https://megilance.site/signup?ref={code}",
            "stats": {
                "total_referrals": stats["total"],
                "completed": stats["completed"],
                "pending": stats["pending"],
            },
            "total_earned": float(total_earned),
            "recent_referrals": recent,
        }
    except Exception as e:
        logger.error(f"Error fetching referral data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch referral data")


@router.get("/campaigns")
async def get_campaigns(
    active_only: bool = Query(True),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user=Depends(get_current_user),
):
    offset = (page - 1) * page_size
    where = "WHERE 1=1"
    params: list = []
    if active_only:
        where += " AND is_active = 1"
    params.extend([page_size, offset])

    try:
        result = execute_query(
            f"SELECT id, name, description, bonus_amount, bonus_type, start_date, end_date, "
            f"is_active, max_referrals, created_at "
            f"FROM referral_campaigns {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
            params,
        )
        campaigns = parse_rows(result)

        count_params = params[:-2]
        count_result = execute_query(
            f"SELECT COUNT(*) as total FROM referral_campaigns {where}",
            count_params,
        )
        total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0

        return {"campaigns": campaigns if campaigns else [], "total": total, "page": page}
    except Exception as e:
        logger.warning(f"referral_campaigns table not available: {e}")
        return {"campaigns": [], "total": 0, "page": page}


@router.post("/invite")
async def invite_referral(
    request: ReferralInvite,
    current_user=Depends(get_current_user),
):
    now = datetime.now(timezone.utc).isoformat()
    try:
        _ensure_referral_code_column()
        code_result = execute_query(
            "SELECT referral_code FROM users WHERE id = ?",
            [current_user.id],
        )
        code_rows = parse_rows(code_result)
        code = code_rows[0]["referral_code"] if code_rows else f"REF-{current_user.id}"

        existing = execute_query(
            "SELECT id FROM referrals WHERE referrer_id = ? AND referred_email = ?",
            [current_user.id, request.email.lower().strip()],
        )
        existing_rows = parse_rows(existing)
        if existing_rows:
            raise HTTPException(status_code=400, detail="This email has already been invited")

        result = execute_query(
            "INSERT INTO referrals (referrer_id, referred_email, referral_code, status, reward_amount, created_at) "
            "VALUES (?, ?, ?, 'pending', 0, ?)",
            [current_user.id, request.email.lower().strip(), code, now],
        )
        referral_id = result.get("last_insert_rowid") if result else None

        return {
            "message": "Invitation sent successfully",
            "referral_id": referral_id,
            "email": request.email,
            "referral_code": code,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending invite: {e}")
        raise HTTPException(status_code=500, detail="Failed to send invitation")


@router.get("/milestones")
async def get_milestones(current_user=Depends(get_current_user)):
    try:
        milestones_result = execute_query(
            "SELECT id, name, description, target_count, reward_amount, icon "
            "FROM referral_milestones ORDER BY target_count ASC",
            [],
        )
        milestones = parse_rows(milestones_result) or []

        count_result = execute_query(
            "SELECT COUNT(*) as total FROM referrals WHERE referrer_id = ? AND status = 'completed'",
            [current_user.id],
        )
        count_rows = parse_rows(count_result)
        completed_count = count_rows[0]["total"] if count_rows else 0

        achieved_result = execute_query(
            "SELECT milestone_id FROM referral_milestone_achievements WHERE user_id = ?",
            [current_user.id],
        )
        achieved_rows = parse_rows(achieved_result) or []
        achieved_ids = {r["milestone_id"] for r in achieved_rows}

        for m in milestones:
            m["current_count"] = completed_count
            m["achieved"] = m["id"] in achieved_ids or completed_count >= m.get("target_count", 0)
            if not m["achieved"] and completed_count < m.get("target_count", 0):
                m["remaining"] = m["target_count"] - completed_count

        return {
            "milestones": milestones,
            "completed_referrals": completed_count,
        }
    except Exception as e:
        logger.warning(f"referral_milestones table not available: {e}")
        return {"milestones": [], "completed_referrals": 0}


@router.get("/history")
async def get_referral_history(
    status_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    where = "WHERE referrer_id = ?"
    params: list = [current_user.id]

    if status_filter:
        where += " AND status = ?"
        params.append(status_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    try:
        result = execute_query(
            f"SELECT r.id, r.referred_email, r.status, r.reward_amount, r.created_at, r.completed_at, "
            f"u.name as referred_name, u.profile_image_url as referred_avatar "
            f"FROM referrals r "
            f"LEFT JOIN users u ON r.referred_user_id = u.id "
            f"{where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?",
            params,
        )
        items = parse_rows(result)

        count_params = params[:-2]
        count_result = execute_query(
            f"SELECT COUNT(*) as total FROM referrals {where}",
            count_params,
        )
        total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0

        return {"items": items if items else [], "total": total, "page": page}
    except Exception as e:
        logger.error(f"Error fetching referral history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch referral history")


@router.get("/stats")
async def get_referral_stats(current_user=Depends(get_current_user)):
    try:
        result = execute_query(
            "SELECT COUNT(*) as total, "
            "COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed, "
            "COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending, "
            "COALESCE(SUM(CASE WHEN status = 'completed' THEN reward_amount ELSE 0 END), 0) as total_earned "
            "FROM referrals WHERE referrer_id = ?",
            [current_user.id],
        )
        rows = parse_rows(result)
        stats = rows[0] if rows else {"total": 0, "completed": 0, "pending": 0, "total_earned": 0}

        period_result = execute_query(
            "SELECT COUNT(*) as count FROM referrals "
            "WHERE referrer_id = ? AND status = 'completed' AND completed_at >= date('now', '-30 days')",
            [current_user.id],
        )
        period_rows = parse_rows(period_result)
        month_count = period_rows[0]["count"] if period_rows else 0

        return {
            "total_referrals": stats["total"],
            "completed_referrals": stats["completed"],
            "pending": stats["pending"],
            "total_earned": float(stats["total_earned"]),
            "this_month": month_count,
        }
    except Exception as e:
        logger.error(f"Error fetching referral stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch referral stats")


@router.get("/leaderboard")
async def get_referral_leaderboard(
    period: str = Query("monthly", regex="^(monthly|all_time)$"),
    limit: int = Query(10, ge=1, le=50),
):
    try:
        if period == "monthly":
            where = "AND r.completed_at >= date('now', '-30 days')"
        else:
            where = ""

        result = execute_query(
            f"SELECT u.id, u.name, u.profile_image_url, COUNT(r.id) as referral_count, "
            f"COALESCE(SUM(r.reward_amount), 0) as total_earned "
            f"FROM referrals r "
            f"JOIN users u ON r.referrer_id = u.id "
            f"WHERE r.status = 'completed' {where} "
            f"GROUP BY r.referrer_id "
            f"ORDER BY referral_count DESC "
            f"LIMIT ?",
            [limit],
        )
        items = parse_rows(result) or []

        for i, item in enumerate(items):
            item["position"] = i + 1

        return {"items": items, "period": period}
    except Exception as e:
        logger.error(f"Error fetching referral leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch leaderboard")
