# @AI-HINT: Gamification router — badges, achievements, leaderboard, points
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def _get_user_points(user_id: int) -> int:
    try:
        result = execute_query(
            "SELECT COUNT(*) as cnt FROM contracts WHERE freelancer_id = ? AND status = 'completed'",
            [user_id],
        )
        if result and result.get("rows"):
            rows = parse_rows(result)
            return int(rows[0].get("cnt", 0) or 0) * 100 if rows else 0
    except Exception:
        pass
    return 0


def _get_user_badges(user_id: int) -> list:
    try:
        result = execute_query(
            "SELECT b.id, b.name, b.description, b.icon, b.points, ub.earned_at "
            "FROM user_badges ub "
            "JOIN badges b ON ub.badge_id = b.id "
            "WHERE ub.user_id = ? ORDER BY ub.earned_at DESC",
            [user_id],
        )
        return parse_rows(result) or []
    except Exception as e:
        logger.warning(f"user_badges table not available: {e}")
        return []


def _get_user_achievements(user_id: int) -> list:
    try:
        result = execute_query(
            "SELECT a.id, a.name, a.description, a.xp, ua.unlocked_at "
            "FROM user_achievements ua "
            "JOIN achievements a ON ua.achievement_id = a.id "
            "WHERE ua.user_id = ? ORDER BY ua.unlocked_at DESC",
            [user_id],
        )
        return parse_rows(result) or []
    except Exception as e:
        logger.warning(f"user_achievements table not available: {e}")
        return []


@router.get("/gamification/badges")
async def list_badges(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
):
    offset = (page - 1) * page_size
    try:
        result = execute_query(
            "SELECT id, name, description, icon, points, tier, created_at "
            "FROM badges ORDER BY points ASC LIMIT ? OFFSET ?",
            [page_size, offset],
        )
        badges = parse_rows(result)
        count_result = execute_query("SELECT COUNT(*) as total FROM badges", [])
        total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0
        return {"badges": badges if badges else [], "total": total, "page": page}
    except Exception as e:
        logger.warning(f"badges table not available: {e}")
        return {"badges": [], "total": 0, "page": page}


@router.get("/gamification/badges/{badge_id}")
async def get_badge(badge_id: int):
    try:
        result = execute_query(
            "SELECT id, name, description, icon, points, tier, created_at "
            "FROM badges WHERE id = ?",
            [badge_id],
        )
        rows = parse_rows(result)
        if not rows:
            raise HTTPException(status_code=404, detail="Badge not found")

        badge = rows[0]
        holders_result = execute_query(
            "SELECT COUNT(*) as count FROM user_badges WHERE badge_id = ?",
            [badge_id],
        )
        holders = parse_rows(holders_result)
        badge["holder_count"] = holders[0]["count"] if holders else 0

        return badge
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching badge: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch badge")


@router.get("/gamification/achievements")
async def list_achievements(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
):
    offset = (page - 1) * page_size
    try:
        result = execute_query(
            "SELECT id, name, description, xp, category, created_at "
            "FROM achievements ORDER BY xp ASC LIMIT ? OFFSET ?",
            [page_size, offset],
        )
        achievements = parse_rows(result)
        count_result = execute_query("SELECT COUNT(*) as total FROM achievements", [])
        total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0
        return {"achievements": achievements if achievements else [], "total": total, "page": page}
    except Exception as e:
        logger.warning(f"achievements table not available: {e}")
        return {"achievements": [], "total": 0, "page": page}


@router.get("/gamification/my-rank")
async def get_my_rank(current_user=Depends(get_current_user)):
    points = _get_user_points(current_user.id)
    badges = _get_user_badges(current_user.id)
    achievements = _get_user_achievements(current_user.id)

    if points < 100:
        rank, title = "newcomer", "Newcomer"
    elif points < 500:
        rank, title = "rising_star", "Rising Star"
    elif points < 1500:
        rank, title = "pro", "Pro Freelancer"
    elif points < 5000:
        rank, title = "expert", "Expert"
    else:
        rank, title = "master", "Master"

    total_xp = sum(a.get("xp", 0) for a in achievements)

    try:
        rank_result = execute_query(
            "SELECT COUNT(*) + 1 as rank FROM ("
            "SELECT freelancer_id, SUM(CASE WHEN status = 'completed' THEN 100 ELSE 0 END) as pts "
            "FROM contracts GROUP BY freelancer_id HAVING pts > ?"
            ")",
            [points],
        )
        rank_rows = parse_rows(rank_result)
        position = rank_rows[0]["rank"] if rank_rows else 1
    except Exception:
        position = None

    return {
        "user_id": current_user.id,
        "points": points,
        "rank": rank,
        "rank_title": title,
        "position": position,
        "badges_earned": badges,
        "badges_count": len(badges),
        "achievements_unlocked": achievements,
        "achievements_count": len(achievements),
        "total_xp": total_xp,
        "level": min(max(1, points // 100), 50),
    }


@router.get("/gamification/leaderboard")
async def get_leaderboard(
    period: str = Query("all_time", regex="^(all_time|monthly|weekly)$"),
    limit: int = Query(20, ge=1, le=100),
):
    try:
        result = execute_query(
            "SELECT u.id, u.name, u.profile_image_url, "
            "SUM(CASE WHEN c.status = 'completed' THEN 100 ELSE 0 END) as points, "
            "COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed_contracts "
            "FROM users u "
            "LEFT JOIN contracts c ON u.id = c.freelancer_id "
            "GROUP BY u.id "
            "HAVING points > 0 "
            "ORDER BY points DESC "
            "LIMIT ?",
            [limit],
        )
        leaderboard = parse_rows(result) or []

        for i, entry in enumerate(leaderboard):
            entry["position"] = i + 1
            pts = entry.get("points", 0)
            if pts < 100:
                entry["rank_title"] = "Newcomer"
            elif pts < 500:
                entry["rank_title"] = "Rising Star"
            elif pts < 1500:
                entry["rank_title"] = "Pro Freelancer"
            elif pts < 5000:
                entry["rank_title"] = "Expert"
            else:
                entry["rank_title"] = "Master"

        total_result = execute_query(
            "SELECT COUNT(DISTINCT freelancer_id) as total FROM contracts WHERE status = 'completed'",
            [],
        )
        total_rows = parse_rows(total_result)
        total = total_rows[0]["total"] if total_rows else 0

        return {"leaderboard": leaderboard, "total_participants": total, "period": period}
    except Exception as e:
        logger.error(f"Error fetching leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch leaderboard")


@router.get("/gamification/my-badges")
async def get_my_badges(current_user=Depends(get_current_user)):
    badges = _get_user_badges(current_user.id)
    return {"badges": badges, "total": len(badges)}


@router.get("/gamification/my-achievements")
async def get_my_achievements(current_user=Depends(get_current_user)):
    achievements = _get_user_achievements(current_user.id)
    return {"achievements": achievements, "total": len(achievements)}
