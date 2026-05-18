# @AI-HINT: Gamification router — badges, achievements, leaderboard, points
from fastapi import APIRouter, Depends, Query
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query

router = APIRouter()

BADGE_CATALOG = [
    {"id": "first_job", "name": "First Job", "description": "Completed first contract", "icon": "briefcase", "points": 50},
    {"id": "five_star", "name": "5-Star Freelancer", "description": "Maintained 5.0 average rating", "icon": "star", "points": 100},
    {"id": "fast_delivery", "name": "Fast Delivery", "description": "Delivered 5 projects before deadline", "icon": "zap", "points": 75},
    {"id": "top_earner", "name": "Top Earner", "description": "Earned over $1,000 on the platform", "icon": "trending-up", "points": 150},
    {"id": "verified", "name": "Verified Pro", "description": "Completed identity verification", "icon": "shield-check", "points": 25},
    {"id": "power_seller", "name": "Power Seller", "description": "Completed 25+ contracts", "icon": "award", "points": 200},
]

ACHIEVEMENT_CATALOG = [
    {"id": "newcomer", "name": "Welcome Aboard", "description": "Joined MegiLance", "xp": 10},
    {"id": "profile_complete", "name": "Profile Complete", "description": "Filled out complete profile", "xp": 20},
    {"id": "first_proposal", "name": "First Step", "description": "Submitted first proposal", "xp": 15},
    {"id": "first_contract", "name": "Deal Maker", "description": "Signed first contract", "xp": 30},
    {"id": "first_review", "name": "Reputation Builder", "description": "Received first review", "xp": 25},
]


def _get_user_points(user_id: int) -> int:
    try:
        result = execute_query(
            "SELECT COUNT(*) FROM contracts WHERE freelancer_id = ? AND status = 'completed'",
            [user_id]
        )
        if result and result.get("rows"):
            return int(result["rows"][0][0] or 0) * 100
    except Exception:
        pass
    return 0


@router.get("/gamification/badges")
async def list_badges():
    return {"badges": BADGE_CATALOG}


@router.get("/gamification/achievements")
async def list_achievements():
    return {"achievements": ACHIEVEMENT_CATALOG}


@router.get("/gamification/my-rank")
async def get_my_rank(current_user=Depends(get_current_user)):
    points = _get_user_points(current_user.id)
    if points < 100:
        rank, title = "newcomer", "Newcomer"
    elif points < 500:
        rank, title = "rising_star", "Rising Star"
    elif points < 1500:
        rank, title = "pro", "Pro Freelancer"
    else:
        rank, title = "expert", "Expert"

    return {
        "user_id": current_user.id,
        "points": points,
        "rank": rank,
        "rank_title": title,
        "badges_earned": [],
        "achievements_unlocked": ["newcomer"],
        "level": min(max(1, points // 100), 50),
    }


@router.get("/gamification/leaderboard")
async def get_leaderboard(limit: int = Query(20, ge=1, le=100)):
    return {"leaderboard": [], "total_participants": 0}
