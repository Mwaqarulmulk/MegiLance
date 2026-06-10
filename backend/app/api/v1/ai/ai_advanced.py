# @AI-HINT: AI Advanced router — portfolio analysis, trend analysis, market insights
from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import datetime, timezone, timedelta
import logging
import json

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def _freelancer_portfolio_analysis(user_id: int) -> dict:
    """Analyze a freelancer's portfolio strength and completeness."""
    result = execute_query(
        """SELECT id, name, user_type, created_at, bio, hourly_rate,
                  skills, certifications, profile_completeness
           FROM users WHERE id = ?""",
        [user_id],
    )
    rows = parse_rows(result)
    if not rows:
        return {"error": "User not found"}

    user = rows[0]
    score = 0
    breakdown = {}

    # Profile completeness (0-25 points)
    completeness = user.get("profile_completeness", 0) or 0
    profile_score = min(completeness / 100 * 25, 25)
    breakdown["profile_completeness"] = round(profile_score, 1)

    # Bio quality (0-15 points)
    bio = user.get("bio", "") or ""
    if len(bio) > 500:
        bio_score = 15
    elif len(bio) > 200:
        bio_score = 10
    elif len(bio) > 50:
        bio_score = 5
    else:
        bio_score = 0
    breakdown["bio_quality"] = bio_score

    # Skills count (0-15 points)
    skills = []
    try:
        skills = json.loads(user.get("skills", "[]") or "[]")
    except (json.JSONDecodeError, TypeError):
        pass
    skill_score = min(len(skills) * 3, 15)
    breakdown["skills"] = skill_score

    # Certifications (0-10 points)
    certs = []
    try:
        certs = json.loads(user.get("certifications", "[]") or "[]")
    except (json.JSONDecodeError, TypeError):
        pass
    cert_score = min(len(certs) * 5, 10)
    breakdown["certifications"] = cert_score

    # Projects completed (0-20 points)
    result = execute_query(
        """SELECT COUNT(*) as cnt FROM contracts
           WHERE freelancer_id = ? AND status = 'completed'""",
        [user_id],
    )
    project_rows = parse_rows(result)
    projects_completed = project_rows[0]["cnt"] if project_rows else 0
    project_score = min(projects_completed * 4, 20)
    breakdown["projects_completed"] = project_score

    # Average rating (0-15 points)
    result = execute_query(
        """SELECT AVG(rating) as avg_rating, COUNT(*) as cnt
           FROM reviews WHERE reviewee_id = ?""",
        [user_id],
    )
    rating_rows = parse_rows(result)
    avg_rating = rating_rows[0]["avg_rating"] if rating_rows and rating_rows[0]["avg_rating"] else 0
    review_count = rating_rows[0]["cnt"] if rating_rows else 0
    rating_score = 0
    if review_count > 0:
        rating_score = min((avg_rating / 5) * 15, 15)
    breakdown["rating"] = round(rating_score, 1)

    total_score = sum(breakdown.values())

    # Determine grade
    if total_score >= 80:
        grade = "A+"
    elif total_score >= 70:
        grade = "A"
    elif total_score >= 60:
        grade = "B+"
    elif total_score >= 50:
        grade = "B"
    elif total_score >= 40:
        grade = "C"
    else:
        grade = "D"

    return {
        "user_id": user_id,
        "total_score": round(total_score, 1),
        "grade": grade,
        "breakdown": breakdown,
        "metrics": {
            "projects_completed": projects_completed,
            "avg_rating": round(avg_rating, 2) if avg_rating else None,
            "review_count": review_count,
            "skill_count": len(skills),
            "certification_count": len(certs),
        },
    }


def _market_trends() -> dict:
    """Analyze marketplace trends from real data."""
    # Top skills by demand (proposals count)
    result = execute_query(
        """SELECT skills, COUNT(*) as proposal_count
           FROM proposals p
           JOIN users u ON p.freelancer_id = u.id
           WHERE p.created_at > datetime('now', '-30 days')
           GROUP BY skills
           ORDER BY proposal_count DESC
           LIMIT 10""",
        [],
    )
    rows = parse_rows(result) or []
    skill_demand = []
    for row in rows:
        try:
            skills = json.loads(row["skills"]) if row["skills"] else []
            for s in skills:
                skill_demand.append({"skill": s, "proposals": row["proposal_count"]})
        except (json.JSONDecodeError, TypeError):
            pass

    # Aggregate skill demand
    skill_agg = {}
    for item in skill_demand:
        s = item["skill"]
        skill_agg[s] = skill_agg.get(s, 0) + item["proposals"]
    top_skills = sorted(skill_agg.items(), key=lambda x: x[1], reverse=True)[:10]

    # Average project budget trend
    result = execute_query(
        """SELECT
              AVG(CASE WHEN created_at > datetime('now', '-7 days') THEN budget END) as avg_week,
              AVG(CASE WHEN created_at BETWEEN datetime('now', '-30 days') AND datetime('now', '-7 days') THEN budget END) as avg_month
           FROM projects WHERE status = 'open'""",
        [],
    )
    budget_rows = parse_rows(result)
    avg_budget_week = budget_rows[0]["avg_week"] if budget_rows and budget_rows[0]["avg_week"] else 0
    avg_budget_month = budget_rows[0]["avg_month"] if budget_rows and budget_rows[0]["avg_month"] else 0

    # Project volume trend
    result = execute_query(
        """SELECT COUNT(*) as cnt FROM projects
           WHERE created_at > datetime('now', '-7 days')""",
        [],
    )
    week_count = parse_rows(result)[0]["cnt"] if parse_rows(result) else 0

    result = execute_query(
        """SELECT COUNT(*) as cnt FROM projects
           WHERE created_at BETWEEN datetime('now', '-30 days') AND datetime('now', '-7 days')""",
        [],
    )
    month_count = parse_rows(result)[0]["cnt"] if parse_rows(result) else 0

    return {
        "top_skills": [{"skill": s, "demand": d} for s, d in top_skills],
        "budget_trend": {
            "this_week_avg": round(avg_budget_week, 2) if avg_budget_week else None,
            "this_month_avg": round(avg_budget_month, 2) if avg_budget_month else None,
        },
        "project_volume": {
            "this_week": week_count,
            "last_30_days": month_count,
        },
    }


@router.get("/portfolio/{user_id}")
async def portfolio_analysis(user_id: int, current_user=Depends(get_current_user)):
    """Analyze a freelancer's portfolio strength."""
    return _freelancer_portfolio_analysis(user_id)


@router.get("/portfolio")
async def my_portfolio_analysis(current_user=Depends(get_current_user)):
    """Analyze the current user's portfolio."""
    return _freelancer_portfolio_analysis(current_user.id)


@router.get("/trends")
async def market_trends(current_user=Depends(get_current_user)):
    """Get marketplace trend analysis."""
    return _market_trends()


@router.get("/market-insights")
async def market_insights(current_user=Depends(get_current_user)):
    """Get comprehensive market insights combining trends and supply/demand."""
    trends = _market_trends()

    # Supply analysis: active freelancers
    result = execute_query(
        """SELECT COUNT(*) as cnt FROM users
           WHERE user_type = 'freelancer' AND is_active = 1""",
        [],
    )
    active_freelancers = parse_rows(result)[0]["cnt"] if parse_rows(result) else 0

    # Active projects
    result = execute_query(
        """SELECT COUNT(*) as cnt FROM projects WHERE status = 'open'""",
        [],
    )
    open_projects = parse_rows(result)[0]["cnt"] if parse_rows(result) else 0

    return {
        **trends,
        "supply": {
            "active_freelancers": active_freelancers,
            "open_projects": open_projects,
            "supply_demand_ratio": round(active_freelancers / max(open_projects, 1), 2),
        },
    }


@router.get("/recommendations/{user_id}")
async def skill_recommendations(user_id: int, current_user=Depends(get_current_user)):
    """Recommend skills to learn based on market demand vs user's current skills."""
    # Get user's current skills
    result = execute_query(
        "SELECT skills FROM users WHERE id = ?", [user_id]
    )
    rows = parse_rows(result)
    if not rows:
        return {"error": "User not found"}

    user_skills = set()
    try:
        user_skills = set(json.loads(rows[0].get("skills", "[]") or "[]"))
    except (json.JSONDecodeError, TypeError):
        pass

    # Get top demanded skills from recent proposals
    result = execute_query(
        """SELECT skills, COUNT(*) as cnt FROM proposals p
           JOIN users u ON p.freelancer_id = u.id
           WHERE p.created_at > datetime('now', '-30 days')
           GROUP BY skills ORDER BY cnt DESC LIMIT 20""",
        [],
    )
    rows = parse_rows(result) or []
    demand_count = {}
    for row in rows:
        try:
            for s in json.loads(row["skills"] or "[]"):
                demand_count[s] = demand_count.get(s, 0) + row["cnt"]
        except (json.JSONDecodeError, TypeError):
            pass

    # Recommend skills user doesn't have
    recommended = []
    for skill, count in sorted(demand_count.items(), key=lambda x: x[1], reverse=True):
        if skill not in user_skills:
            recommended.append({"skill": skill, "market_demand": count})

    return {
        "user_id": user_id,
        "current_skills": list(user_skills),
        "recommended_skills": recommended[:10],
    }
