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
    items = autocomplete_freelancers(search_term=q, limit=limit)
    return {"items": items}


_cover_col_ensured = False


def _ensure_cover_column() -> None:
    """Make sure users.cover_image_url exists before it is selected/updated.
    Idempotent and safe to call repeatedly (ALTER fails harmlessly if present)."""
    global _cover_col_ensured
    if _cover_col_ensured:
        return
    try:
        execute_query("ALTER TABLE users ADD COLUMN cover_image_url TEXT", [])
    except Exception:
        pass  # column already exists
    _cover_col_ensured = True


@router.get("/me")
def get_current_user_profile(
    current_user=Depends(get_current_user)
):
    """Get the current user's profile"""
    user_id = current_user.get("user_id")
    _ensure_cover_column()
    result = execute_query(
        """SELECT id, name, email, user_type, role, bio, skills, hourly_rate,
                  profile_image_url, cover_image_url, location, headline, experience_level,
                  years_of_experience, availability_status, availability_hours,
                  profile_slug, profile_visibility, profile_views, seller_level,
                  languages, industry_focus, tools_and_technologies,
                  linkedin_url, github_url, website_url, twitter_url,
                  dribbble_url, behance_url, stackoverflow_url,
                  video_intro_url, resume_url, tagline, phone_number, timezone,
                  preferred_project_size, education, certifications, work_history,
                  achievements, contact_preferences, created_at, onboarding_completed
           FROM users WHERE id = ?""",
        [user_id]
    )

    if not result or not result.get("rows"):
        raise HTTPException(status_code=404, detail="User not found")

    rows = parse_rows(result)
    user = rows[0]

    for field in ("skills", "languages", "tools_and_technologies", "industry_focus"):
        val = user.get(field)
        if isinstance(val, str):
            try:
                user[field] = json.loads(val)
            except (json.JSONDecodeError, TypeError):
                # Stored as a comma-separated string (search uses LIKE on these),
                # so fall back to splitting instead of dropping to an empty list.
                user[field] = [s.strip() for s in val.split(",") if s.strip()]

    for field in _JSON_PROFILE_FIELDS:
        val = user.get(field)
        if isinstance(val, str):
            try:
                user[field] = json.loads(val)
            except (json.JSONDecodeError, TypeError):
                user[field] = [] if field != "contact_preferences" else {}

    user["profile_completed"] = bool(user.get("onboarding_completed", 0))
    return user


# Columns a user is allowed to edit on their OWN profile. Sensitive columns
# (email, role, hashed_password, account_balance, verification flags, …) are
# intentionally excluded so they can never be set through this endpoint.
_EDITABLE_PROFILE_FIELDS = {
    "name", "bio", "skills", "hourly_rate", "profile_image_url", "cover_image_url", "location",
    "headline", "tagline", "experience_level", "years_of_experience", "languages",
    "availability_status", "availability_hours", "industry_focus",
    "tools_and_technologies", "linkedin_url", "github_url", "website_url",
    "twitter_url", "dribbble_url", "behance_url", "stackoverflow_url",
    "video_intro_url", "resume_url", "phone_number", "timezone",
    "preferred_project_size", "certifications", "education", "work_history",
    "achievements", "profile_visibility", "profile_slug", "contact_preferences",
    "profile_completed", "onboarding_completed",
}
# Stored as comma-separated strings so LIKE-based search keeps matching.
_CSV_PROFILE_FIELDS = {"skills", "languages", "tools_and_technologies", "industry_focus"}
# Stored as JSON blobs.
_JSON_PROFILE_FIELDS = {"education", "work_history", "certifications", "achievements", "contact_preferences"}


@router.put("/me")
@router.patch("/me")
def update_current_user_profile(data: dict, current_user=Depends(get_current_user)):
    """Update the signed-in user's own profile. Whitelisted fields only."""
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    updates = {}
    for key, value in (data or {}).items():
        if key not in _EDITABLE_PROFILE_FIELDS:
            continue
        if key in _CSV_PROFILE_FIELDS and isinstance(value, list):
            value = ", ".join(str(v).strip() for v in value if str(v).strip())
        elif key in _JSON_PROFILE_FIELDS and not isinstance(value, (str, type(None))):
            value = json.dumps(value)
        updates[key] = value

    if "profile_completed" in data:
        updates["onboarding_completed"] = 1 if data["profile_completed"] else 0
    elif "onboarding_completed" in data:
        updates["onboarding_completed"] = 1 if data["onboarding_completed"] else 0

    if not updates:
        raise HTTPException(status_code=400, detail="No valid profile fields to update")

    if "cover_image_url" in updates:
        _ensure_cover_column()

    from datetime import datetime, timezone
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    set_parts = [f"{k} = ?" for k in updates]
    values = list(updates.values()) + [user_id]
    execute_query(f"UPDATE users SET {', '.join(set_parts)} WHERE id = ?", values)

    return get_current_user_profile(current_user)


@router.post("/onboarding-complete")
def complete_onboarding(data: dict, current_user=Depends(get_current_user)):
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
        # Store as a comma-separated string so the LIKE-based freelancer search
        # keeps matching (consistent with PUT /me and the rest of the codebase).
        updates["skills"] = ", ".join(str(s).strip() for s in skills if str(s).strip()) if isinstance(skills, list) else skills
    if experience_level:
        updates["experience_level"] = experience_level
    if hourly_rate:
        updates["hourly_rate"] = hourly_rate

    updates["onboarding_completed"] = 1

    set_parts = [f"{k} = ?" for k in updates]
    values = list(updates.values()) + [user_id]

    result = execute_query(
        f"UPDATE users SET {', '.join(set_parts)} WHERE id = ?",
        values,
    )
    if result is None:
        # Don't report success if the write failed (previously this returned
        # "completed" even when the UPDATE silently errored, losing all data).
        raise HTTPException(status_code=500, detail="Failed to save onboarding data")

    return {"message": "Onboarding completed successfully"}


@router.get("/me/notification-preferences")
def get_user_notification_preferences(current_user=Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    # Get settings from database
    result = execute_query(
        "SELECT settings_json FROM user_notification_settings WHERE user_id = ?",
        [user_id]
    )
    rows = parse_rows(result)
    if rows and rows[0].get("settings_json"):
        try:
            return json.loads(rows[0]["settings_json"])
        except Exception:
            pass
    
    # Return default preferences matching the structure expected by frontend
    return {
        "preferences": {
            "projectUpdates": { "email": True, "push": True, "sms": False, "inApp": True },
            "proposals": { "email": True, "push": True, "sms": True, "inApp": True },
            "messages": { "email": True, "push": True, "sms": False, "inApp": True },
            "payments": { "email": True, "push": True, "sms": True, "inApp": True },
            "reviews": { "email": True, "push": False, "sms": False, "inApp": True },
            "marketing": { "email": False, "push": False, "sms": False, "inApp": False },
        },
        "digest": {
            "frequency": "realtime",
            "quietHoursStart": "22:00",
            "quietHoursEnd": "08:00",
        }
    }


@router.put("/me/notification-preferences")
def update_user_notification_preferences(data: dict, current_user=Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    # Ensure table exists
    execute_query("""
        CREATE TABLE IF NOT EXISTS user_notification_settings (
            user_id INTEGER PRIMARY KEY,
            settings_json TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])
    
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    settings_json = json.dumps(data)
    
    # Check if exists
    result = execute_query(
        "SELECT user_id FROM user_notification_settings WHERE user_id = ?",
        [user_id]
    )
    if parse_rows(result):
        execute_query(
            "UPDATE user_notification_settings SET settings_json = ?, updated_at = ? WHERE user_id = ?",
            [settings_json, now, user_id]
        )
    else:
        execute_query(
            "INSERT INTO user_notification_settings (user_id, settings_json, updated_at) VALUES (?, ?, ?)",
            [user_id, settings_json, now]
        )
    return {"message": "Notification preferences updated successfully"}


# NOTE: This catch-all `/{user_id}` route MUST stay declared AFTER every static
# path (/me, /freelancers, /trending, …). FastAPI matches in declaration order,
# so if it came first, "me" would be parsed as user_id (int) and GET /users/me
# would fail with 422.
@router.get("/{user_id}")
def get_user_profile(
    user_id: int,
    current_user=Depends(get_current_user)
):
    """Get a user's profile by ID"""
    result = execute_query(
        """SELECT id, name, email, user_type, role, bio, skills, hourly_rate,
                  profile_image_url, location, headline, tagline, experience_level,
                  years_of_experience, availability_status, availability_hours,
                  profile_slug, profile_visibility, profile_views, seller_level,
                  languages, industry_focus, tools_and_technologies,
                  education, certifications, work_history, achievements,
                  linkedin_url, github_url, website_url, twitter_url,
                  dribbble_url, behance_url, stackoverflow_url,
                  video_intro_url, resume_url, created_at
           FROM users WHERE id = ?""",
        [user_id]
    )

    if not result or not result.get("rows"):
        raise HTTPException(status_code=404, detail="User not found")

    user = parse_rows(result)[0]

    # Tag fields may be comma-separated (legacy) or JSON — normalize to arrays.
    for field in ("skills", "languages", "industry_focus", "tools_and_technologies"):
        v = user.get(field)
        if isinstance(v, str):
            s = v.strip()
            if s.startswith("["):
                try:
                    user[field] = json.loads(s)
                    continue
                except (json.JSONDecodeError, TypeError):
                    pass
            user[field] = [p.strip() for p in s.split(",") if p.strip()] if s else []
        elif v is None:
            user[field] = []

    # Structured fields are stored as JSON strings — parse to lists of objects.
    for field in ("education", "certifications", "work_history", "achievements"):
        v = user.get(field)
        if isinstance(v, str) and v.strip().startswith(("[", "{")):
            try:
                user[field] = json.loads(v)
            except (json.JSONDecodeError, TypeError):
                user[field] = []
        elif not isinstance(v, (list, dict)):
            user[field] = []

    return user
