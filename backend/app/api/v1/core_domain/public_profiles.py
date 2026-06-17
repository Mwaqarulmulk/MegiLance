# @AI-HINT: Public profile API endpoints — freelancer public profiles, stats, portfolio, reviews
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
import logging
import json
logger = logging.getLogger(__name__)

from app.db.turso_http import execute_query, parse_rows
from app.services import portfolio_service
from app.services.reviews_service import get_reviews_for_user

router = APIRouter()


@router.get("/")
def list_freelancers(
    limit: int = Query(48, ge=1, le=100),
    page: int = Query(1, ge=1),
    q: Optional[str] = None,
    skill: Optional[str] = None,
):
    """Public freelancer directory listing — no auth required."""
    offset = (page - 1) * limit
    where = "WHERE user_type = 'freelancer' AND is_active = 1"
    params: list = []

    if q:
        sq = f"%{q.lower()}%"
        where += " AND (LOWER(COALESCE(name,'')) LIKE ? OR LOWER(COALESCE(headline,'')) LIKE ? OR LOWER(COALESCE(skills,'')) LIKE ?)"
        params.extend([sq, sq, sq])
    if skill:
        where += " AND LOWER(COALESCE(skills,'')) LIKE ?"
        params.append(f"%{skill.lower()}%")

    count_res = execute_query(f"SELECT COUNT(*) as total FROM users {where}", params)
    total = (parse_rows(count_res) or [{}])[0].get("total", 0) if count_res and count_res.get("rows") else 0

    params.extend([limit, offset])
    result = execute_query(
        f"""SELECT id, name, profile_image_url, headline, hourly_rate,
                   location, skills, seller_level, availability_status, is_verified
            FROM users {where}
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result) or []
    return {"freelancers": rows, "total": total, "page": page}


# Tag-style fields stored as comma strings (legacy) or JSON; normalized to arrays.
_TAG_FIELDS = ("skills", "languages", "industry_focus", "tools_and_technologies")
# Structured fields stored as JSON strings; normalized to lists of objects.
_STRUCT_FIELDS = ("education", "certifications", "work_history", "achievements")


def _normalize_public_profile(profile: dict) -> dict:
    """Turn raw DB strings into clean arrays so the public profile renders fully.

    Tag fields may be comma-separated (legacy) or JSON; structured fields are JSON.
    """
    for field in _TAG_FIELDS:
        v = profile.get(field)
        if isinstance(v, str):
            s = v.strip()
            if s.startswith("["):
                try:
                    profile[field] = json.loads(s)
                    continue
                except (json.JSONDecodeError, TypeError):
                    pass
            profile[field] = [p.strip() for p in s.split(",") if p.strip()] if s else []
        elif v is None:
            profile[field] = []

    for field in _STRUCT_FIELDS:
        v = profile.get(field)
        if isinstance(v, str) and v.strip().startswith(("[", "{")):
            try:
                profile[field] = json.loads(v)
            except (json.JSONDecodeError, TypeError):
                profile[field] = []
        elif not isinstance(v, (list, dict)):
            profile[field] = []
    return profile


@router.get("/id/{user_id}")
def get_public_profile(user_id: int):
    """Get a freelancer's public profile by user ID"""
    result = execute_query(
        """SELECT id, name, user_type, role, bio, skills, hourly_rate,
                  profile_image_url, location, headline, tagline, experience_level,
                  years_of_experience, availability_status, availability_hours,
                  profile_slug, profile_visibility, profile_views, seller_level,
                  languages, industry_focus, tools_and_technologies,
                  education, certifications, work_history, achievements,
                  linkedin_url, github_url, website_url, twitter_url,
                  dribbble_url, behance_url, stackoverflow_url,
                  video_intro_url, resume_url, created_at
           FROM users WHERE id = ? AND user_type = 'freelancer'""",
        [user_id]
    )

    if not result or not result.get("rows"):
        raise HTTPException(status_code=404, detail="Freelancer not found")

    profile = _normalize_public_profile(parse_rows(result)[0])

    # Increment profile views
    execute_query("UPDATE users SET profile_views = profile_views + 1 WHERE id = ?", [user_id])
    profile["profile_views"] = (profile.get("profile_views", 0) or 0) + 1

    return profile


@router.get("/slug/{slug}")
def get_public_profile_by_slug(slug: str):
    """Get a freelancer's public profile by slug"""
    result = execute_query(
        """SELECT id, name, user_type, role, bio, skills, hourly_rate,
                  profile_image_url, location, headline, tagline, experience_level,
                  years_of_experience, availability_status, availability_hours,
                  profile_slug, profile_visibility, profile_views, seller_level,
                  languages, industry_focus, tools_and_technologies,
                  education, certifications, work_history, achievements,
                  linkedin_url, github_url, website_url, twitter_url,
                  dribbble_url, behance_url, stackoverflow_url,
                  video_intro_url, resume_url, created_at
           FROM users WHERE profile_slug = ? AND user_type = 'freelancer'""",
        [slug]
    )

    if not result or not result.get("rows"):
        raise HTTPException(status_code=404, detail="Freelancer not found")

    return _normalize_public_profile(parse_rows(result)[0])


@router.get("/{user_id}/stats")
def get_freelancer_stats(user_id: int):
    """Get freelancer statistics (jobs, reviews, rating, earnings)"""
    # Check user exists and is freelancer
    user_result = execute_query(
        "SELECT id, user_type FROM users WHERE id = ?",
        [user_id]
    )
    if not user_result or not user_result.get("rows"):
        raise HTTPException(status_code=404, detail="User not found")

    rows = parse_rows(user_result)
    if rows[0].get("user_type") != "freelancer":
        raise HTTPException(status_code=404, detail="Not a freelancer")

    # Get contract stats
    contract_result = execute_query(
        """SELECT COUNT(*) as total_contracts,
                  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_contracts,
                  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_contracts
           FROM contracts WHERE freelancer_id = ?""",
        [user_id]
    )

    # Get review stats
    review_result = execute_query(
        """SELECT COUNT(*) as total_reviews,
                  AVG(rating) as avg_rating
           FROM reviews WHERE reviewed_user_id = ?""",
        [user_id]
    )

    # Get portfolio stats
    portfolio_result = execute_query(
        "SELECT COUNT(*) as portfolio_count FROM portfolio_items WHERE freelancer_id = ?",
        [user_id]
    )

    contracts = parse_rows(contract_result)[0] if contract_result and contract_result.get("rows") else {}
    reviews = parse_rows(review_result)[0] if review_result and review_result.get("rows") else {}
    portfolio = parse_rows(portfolio_result)[0] if portfolio_result and portfolio_result.get("rows") else {}

    return {
        "total_contracts": contracts.get("total_contracts", 0),
        "completed_contracts": contracts.get("completed_contracts", 0),
        "active_contracts": contracts.get("active_contracts", 0),
        "total_reviews": reviews.get("total_reviews", 0),
        "avg_rating": round(float(reviews.get("avg_rating", 0)), 1),
        "portfolio_count": portfolio.get("portfolio_count", 0),
    }


@router.get("/{user_id}/portfolio")
def get_freelancer_portfolio(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50)
):
    """Get a freelancer's public portfolio items"""
    offset = (page - 1) * page_size
    items = portfolio_service.list_public_portfolio(user_id, offset, page_size)
    return {"items": items, "total": len(items), "page": page}


@router.get("/{user_id}/reviews")
def get_freelancer_reviews(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50)
):
    """Get reviews for a freelancer"""
    offset = (page - 1) * page_size
    reviews = get_reviews_for_user(user_id, offset, page_size)
    return {"items": reviews, "total": len(reviews), "page": page}
