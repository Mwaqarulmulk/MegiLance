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


@router.get("/id/{user_id}")
def get_public_profile(user_id: int):
    """Get a freelancer's public profile by user ID"""
    result = execute_query(
        """SELECT id, name, user_type, role, bio, skills, hourly_rate,
                  profile_image_url, location, headline, experience_level,
                  years_of_experience, availability_status, availability_hours,
                  profile_slug, profile_visibility, profile_views, seller_level,
                  languages, industry_focus, tools_and_technologies,
                  linkedin_url, github_url, website_url, twitter_url,
                  dribbble_url, behance_url, stackoverflow_url,
                  video_intro_url, resume_url, created_at
           FROM users WHERE id = ? AND user_type = 'freelancer'""",
        [user_id]
    )

    if not result or not result.get("rows"):
        raise HTTPException(status_code=404, detail="Freelancer not found")

    rows = parse_rows(result)
    profile = rows[0]

    # Parse JSON fields
    for field in ("skills", "languages", "tools_and_technologies"):
        if isinstance(profile.get(field), str):
            try:
                profile[field] = json.loads(profile[field])
            except (json.JSONDecodeError, TypeError):
                profile[field] = []

    # Increment profile views
    execute_query("UPDATE users SET profile_views = profile_views + 1 WHERE id = ?", [user_id])
    profile["profile_views"] = (profile.get("profile_views", 0) or 0) + 1

    return profile


@router.get("/slug/{slug}")
def get_public_profile_by_slug(slug: str):
    """Get a freelancer's public profile by slug"""
    result = execute_query(
        """SELECT id, name, user_type, role, bio, skills, hourly_rate,
                  profile_image_url, location, headline, experience_level,
                  years_of_experience, availability_status, availability_hours,
                  profile_slug, profile_visibility, profile_views, seller_level,
                  languages, industry_focus, tools_and_technologies,
                  linkedin_url, github_url, website_url, twitter_url,
                  dribbble_url, behance_url, stackoverflow_url,
                  video_intro_url, resume_url, created_at
           FROM users WHERE profile_slug = ? AND user_type = 'freelancer'""",
        [slug]
    )

    if not result or not result.get("rows"):
        raise HTTPException(status_code=404, detail="Freelancer not found")

    rows = parse_rows(result)
    profile = rows[0]

    for field in ("skills", "languages", "tools_and_technologies"):
        if isinstance(profile.get(field), str):
            try:
                profile[field] = json.loads(profile[field])
            except (json.JSONDecodeError, TypeError):
                profile[field] = []

    return profile


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
