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
):
    """List/search freelancers with filtering and pagination"""
    offset = (page - 1) * page_size

    # Build WHERE clause and params for the search service
    conditions = ["u.user_type = 'freelancer'", "u.is_active = 1"]
    params: list = []

    # Quality gate: hide automated test/junk accounts and incomplete profiles so the public
    # directory only shows real, presentable freelancers. (See seed_marketplace.py for demo data.)
    conditions.append("u.email NOT LIKE '%@example.com'")
    conditions.append("u.email NOT LIKE 'test_%'")
    conditions.append("(u.profile_visibility IS NULL OR u.profile_visibility = 'public')")
    conditions.append(
        "(u.hourly_rate > 0 "
        "OR (u.skills IS NOT NULL AND u.skills NOT IN ('', '[]', 'null')) "
        "OR (u.bio IS NOT NULL AND TRIM(u.bio) != ''))"
    )

    if search:
        conditions.append("(u.name LIKE ? OR u.bio LIKE ? OR u.skills LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    if min_rate is not None:
        conditions.append("u.hourly_rate >= ?")
        params.append(min_rate)
    if max_rate is not None:
        conditions.append("u.hourly_rate <= ?")
        params.append(max_rate)
    if category:
        conditions.append("u.industry_focus LIKE ?")
        params.append(f"%{category}%")
    if experience_level:
        conditions.append("u.experience_level = ?")
        params.append(experience_level)
    if availability:
        conditions.append("u.availability_status = ?")
        params.append(availability)

    where_clause = " AND ".join(conditions)

    # Append LIMIT and OFFSET to params (search service expects them at end)
    sort_key = sort_by or "relevance"
    params.extend([page_size, offset])

    result = search_freelancers_advanced(
        where_clause=where_clause,
        params=params,
        sort=sort_key,
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
        "total": result.get("total_count", 0),
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


@router.post("/onboarding-complete")
async def complete_onboarding(data: dict, current_user=Depends(get_current_user)):
    """Save onboarding wizard data for a new freelancer."""
    user_id = current_user.get("user_id") or current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    title = data.get("title", "")
    bio = data.get("bio", "")
    skills = data.get("skills", [])
    experience_level = data.get("experience_level", "")
    hourly_rate = data.get("hourly_rate", 0)

    updates = {"updated_at": now}
    if title:
        updates["headline"] = title
    if bio:
        updates["bio"] = bio
    if skills:
        updates["skills"] = json.dumps(skills) if isinstance(skills, list) else skills
    if experience_level:
        updates["experience_level"] = experience_level
    if hourly_rate:
        updates["hourly_rate"] = hourly_rate

    updates["onboarding_completed"] = 1

    set_parts = [f"{k} = ?" for k in updates]
    values = list(updates.values()) + [user_id]

    execute_query(
        f"UPDATE users SET {', '.join(set_parts)} WHERE id = ?",
        values,
    )

    return {"message": "Onboarding completed successfully"}
