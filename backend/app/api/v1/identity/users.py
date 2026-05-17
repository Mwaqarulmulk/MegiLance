# @AI-HINT: User API endpoints — freelancer directory, user profiles, user management
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
import logging
import json
logger = logging.getLogger(__name__)

from app.core.security import get_current_user_from_token
from app.services.search_service import (
    search_freelancers_advanced,
    get_trending_freelancers,
    global_search_freelancers,
    autocomplete_freelancers,
)
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def get_current_user(token_data=Depends(get_current_user_from_token)):
    return token_data


@router.get("/freelancers")
def list_freelancers(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    search: Optional[str] = Query(None),
    min_rate: Optional[float] = Query(None),
    max_rate: Optional[float] = Query(None),
    category: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    availability: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    current_user=Depends(get_current_user)
):
    """List/search freelancers with filtering and pagination"""
    offset = (page - 1) * page_size

    result = search_freelancers_advanced(
        query=search or "",
        min_rate=min_rate,
        max_rate=max_rate,
        category=category,
        experience_level=experience_level,
        availability=availability,
        sort_by=sort_by or "newest",
        limit=page_size,
        offset=offset,
    )

    items = result.get("items", [])
    # Parse JSON fields
    for item in items:
        if isinstance(item.get("skills"), str):
            try:
                item["skills"] = json.loads(item["skills"])
            except (json.JSONDecodeError, TypeError):
                item["skills"] = []
        if isinstance(item.get("languages"), str):
            try:
                item["languages"] = json.loads(item["languages"])
            except (json.JSONDecodeError, TypeError):
                item["languages"] = []

    return {
        "items": items,
        "total": result.get("total", 0),
        "page": page,
        "page_size": page_size,
        "facets": result.get("facets", {}),
    }


@router.get("/trending")
def trending_freelancers(
    limit: int = Query(10, ge=1, le=50),
    current_user=Depends(get_current_user)
):
    """Get trending freelancers (high rating + many reviews + completions)"""
    items = get_trending_freelancers(limit=limit)
    for item in items:
        if isinstance(item.get("skills"), str):
            try:
                item["skills"] = json.loads(item["skills"])
            except (json.JSONDecodeError, TypeError):
                item["skills"] = []
    return {"items": items}


@router.get("/autocomplete")
def autocomplete_freelancers_endpoint(
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(10, ge=1, le=20),
    current_user=Depends(get_current_user)
):
    """Autocomplete freelancer names for search suggestions"""
    items = autocomplete_freelancers(query=q, limit=limit)
    return {"items": items}


@router.get("/{user_id}")
def get_user_profile(
    user_id: int,
    current_user=Depends(get_current_user)
):
    """Get a user's profile by ID"""
    result = execute_query(
        """SELECT id, name, email, user_type, role, bio, skills, hourly_rate,
                  profile_image_url, location, headline, experience_level,
                  years_of_experience, availability_status, availability_hours,
                  profile_slug, profile_visibility, profile_views, seller_level,
                  languages, industry_focus, tools_and_technologies,
                  linkedin_url, github_url, website_url, twitter_url,
                  dribbble_url, behance_url, stackoverflow_url,
                  video_intro_url, resume_url, created_at
           FROM users WHERE id = ?""",
        [user_id]
    )

    if not result or not result.get("rows"):
        raise HTTPException(status_code=404, detail="User not found")

    rows = parse_rows(result)
    user = rows[0]

    # Parse JSON fields
    for field in ("skills", "languages", "tools_and_technologies"):
        if isinstance(user.get(field), str):
            try:
                user[field] = json.loads(user[field])
            except (json.JSONDecodeError, TypeError):
                user[field] = []

    return user


@router.get("/me")
def get_current_user_profile(
    current_user=Depends(get_current_user)
):
    """Get the current user's profile"""
    user_id = current_user.get("user_id")
    result = execute_query(
        """SELECT id, name, email, user_type, role, bio, skills, hourly_rate,
                  profile_image_url, location, headline, experience_level,
                  years_of_experience, availability_status, availability_hours,
                  profile_slug, profile_visibility, profile_views, seller_level,
                  languages, industry_focus, tools_and_technologies,
                  linkedin_url, github_url, website_url, twitter_url,
                  dribbble_url, behance_url, stackoverflow_url,
                  video_intro_url, resume_url, created_at
           FROM users WHERE id = ?""",
        [user_id]
    )

    if not result or not result.get("rows"):
        raise HTTPException(status_code=404, detail="User not found")

    rows = parse_rows(result)
    user = rows[0]

    for field in ("skills", "languages", "tools_and_technologies"):
        if isinstance(user.get(field), str):
            try:
                user[field] = json.loads(user[field])
            except (json.JSONDecodeError, TypeError):
                user[field] = []

    return user
