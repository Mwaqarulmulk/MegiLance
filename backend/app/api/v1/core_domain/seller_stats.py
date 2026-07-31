# @AI-HINT: Seller Stats router — JSS score, level tiers, benefits, earnings, progress tracking
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

LEVEL_ORDER = ["new_seller", "bronze", "silver", "gold", "platinum"]
LEVEL_COMMISSIONS = {"new_seller": 0, "bronze": 0, "silver": 0, "gold": 0, "platinum": 0} # 0% Launch Offer for 2026
LEVEL_REQUIREMENTS = {
    "bronze":   {"orders": 5,   "earnings": 100,   "rating": 4.0, "months": 1},
    "silver":   {"orders": 20,  "earnings": 500,   "rating": 4.3, "months": 3},
    "gold":     {"orders": 50,  "earnings": 2000,  "rating": 4.6, "months": 6},
    "platinum": {"orders": 100, "earnings": 10000, "rating": 4.8, "months": 12},
}


def _compute_level(completed_orders: int, total_earnings: float, avg_rating: float, member_months: int) -> str:
    for level in ["platinum", "gold", "silver", "bronze"]:
        req = LEVEL_REQUIREMENTS[level]
        if (completed_orders >= req["orders"] and total_earnings >= req["earnings"]
                and avg_rating >= req["rating"] and member_months >= req["months"]):
            return level
    return "new_seller"


def _compute_jss(completed: int, cancelled: int, avg_rating: float) -> float:
    total = completed + cancelled
    if total == 0:
        return 0.0
    completion_rate = completed / total
    rating_score = (avg_rating / 5.0) if avg_rating > 0 else 0.5
    jss = round((completion_rate * 0.6 + rating_score * 0.4) * 100, 1)
    return min(jss, 100.0)


def _compute_progress(level: str, completed_orders: int, total_earnings: float,
                       avg_rating: float, member_months: int) -> dict:
    current_idx = LEVEL_ORDER.index(level)
    if current_idx >= len(LEVEL_ORDER) - 1:
        return {
            "current_level": level,
            "next_level": None,
            "progress": 100,
            "requirements": {}
        }
    next_level = LEVEL_ORDER[current_idx + 1]
    req = LEVEL_REQUIREMENTS[next_level]

    orders_pct = min(completed_orders / req["orders"] * 100, 100)
    earnings_pct = min(total_earnings / req["earnings"] * 100, 100)
    rating_pct = min(avg_rating / req["rating"] * 100, 100) if avg_rating > 0 else 0
    months_pct = min(member_months / req["months"] * 100, 100)
    overall = round((orders_pct + earnings_pct + rating_pct + months_pct) / 4, 1)

    return {
        "current_level": level,
        "next_level": next_level,
        "progress": overall,
        "requirements": {
            "orders": {"current": completed_orders, "required": req["orders"], "pct": round(orders_pct, 1)},
            "earnings": {"current": round(total_earnings, 2), "required": req["earnings"], "pct": round(earnings_pct, 1)},
            "rating": {"current": avg_rating, "required": req["rating"], "pct": round(rating_pct, 1)},
            "months": {"current": member_months, "required": req["months"], "pct": round(months_pct, 1)},
        }
    }


def _build_stats(uid: int) -> dict:
    now = datetime.now(timezone.utc)

    # Completed and cancelled contract counts
    contracts_result = execute_query("""
        SELECT
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
            SUM(CASE WHEN status IN ('active','in_progress') THEN 1 ELSE 0 END) AS active
        FROM contracts WHERE freelancer_id = ?
    """, [uid])

    completed_orders = 0
    cancelled_orders = 0
    active_contracts = 0
    _rows = parse_rows(contracts_result)
    if _rows:
        row = _rows[0]
        completed_orders = int(row.get("completed") or 0)
        cancelled_orders = int(row.get("cancelled") or 0)
        active_contracts = int(row.get("active") or 0)

    # Total earnings and earnings this month
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    earnings_result = execute_query("""
        SELECT
            SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) AS total,
            SUM(CASE WHEN p.status = 'completed' AND p.created_at >= ? THEN p.amount ELSE 0 END) AS this_month
        FROM payments p
        JOIN contracts c ON p.contract_id = c.id
        WHERE c.freelancer_id = ?
    """, [month_start, uid])

    total_earnings = 0.0
    earnings_this_month = 0.0
    _rows = parse_rows(earnings_result)
    if _rows:
        row = _rows[0]
        total_earnings = float(row.get("total") or 0)
        earnings_this_month = float(row.get("this_month") or 0)

    # Average rating
    reviews_result = execute_query("""
        SELECT AVG(CAST(rating AS FLOAT)) AS avg_rating, COUNT(*) AS review_count
        FROM reviews
        WHERE reviewee_id = ?
    """, [uid])

    avg_rating = 0.0
    review_count = 0
    _rows = parse_rows(reviews_result)
    if _rows:
        row = _rows[0]
        avg_rating = round(float(row.get("avg_rating") or 0), 2)
        review_count = int(row.get("review_count") or 0)

    # Member months
    user_result = execute_query("SELECT created_at FROM users WHERE id = ?", [uid])
    member_months = 0
    _rows = parse_rows(user_result)
    if _rows:
        created_at_str = _rows[0].get("created_at")
        if created_at_str:
            try:
                created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
                delta = now - created_at
                member_months = delta.days // 30
            except Exception:
                member_months = 0

    level = _compute_level(completed_orders, total_earnings, avg_rating, member_months)
    jss_score = _compute_jss(completed_orders, cancelled_orders, avg_rating)
    level_progress = _compute_progress(level, completed_orders, total_earnings, avg_rating, member_months)
    commission_rate = LEVEL_COMMISSIONS[level]

    return {
        "user_id": uid,
        "level": level,
        "jss_score": jss_score,
        "completed_contracts": completed_orders,
        "cancelled_contracts": cancelled_orders,
        "active_contracts": active_contracts,
        "total_earnings": round(total_earnings, 2),
        "earnings_this_month": round(earnings_this_month, 2),
        "avg_rating": avg_rating,
        "review_count": review_count,
        "member_months": member_months,
        "benefits": {
            "commission_rate": commission_rate,
            "priority_support": level in ("gold", "platinum"),
            "featured_listing": level == "platinum",
        },
        "level_progress": level_progress,
    }


@router.get("/me")
async def get_my_seller_stats(current_user=Depends(get_current_user)):
    try:
        return _build_stats(current_user.id)
    except Exception as e:
        logger.error(f"Failed to get seller stats for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve seller stats")


@router.get("/{user_id}")
async def get_seller_stats_by_id(user_id: int, current_user=Depends(get_current_user)):
    if current_user.id != user_id and getattr(current_user, "role", "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    try:
        return _build_stats(user_id)
    except Exception as e:
        logger.error(f"Failed to get seller stats for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve seller stats")
