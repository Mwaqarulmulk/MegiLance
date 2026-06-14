# @AI-HINT: AI services data access layer with enriched queries, skill parsing, and rating/completion data
"""
AI Services Data Access v2.0 - Enriched queries with rating data,
completion metrics, skill normalization, and market intelligence.
"""
import json
import logging
from typing import List, Optional, Any

from app.db.turso_http import execute_query, to_str, to_int, to_float, extract_value

logger = logging.getLogger("megilance")


def _parse_skills(raw: Any) -> List[str]:
    """Robustly parse a skills field from DB (JSON string, list, or CSV)."""
    if not raw:
        return []
    if isinstance(raw, list):
        return [str(s).strip() for s in raw if s]
    if isinstance(raw, str):
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return [str(s).strip() for s in parsed if s]
        except (json.JSONDecodeError, TypeError, ValueError):
            pass
        return [s.strip() for s in raw.split(",") if s.strip()]
    return []


def get_project_with_skills(project_id: int) -> Optional[dict]:
    """Get project details including skills for matching. Returns None if not found."""
    result = execute_query(
        "SELECT id, title, skills_required, category, budget_min, budget_max, experience_level FROM projects WHERE id = ?",
        [project_id]
    )
    if not result or not result.get("rows"):
        return None

    row = result["rows"][0]
    skills_str = to_str(row[2]) or ""
    required_skills = _parse_skills(skills_str)

    return {
        "id": extract_value(row[0]),
        "title": to_str(row[1]),
        "skills_str": skills_str,
        "required_skills": required_skills,
        "category": to_str(row[3]),
        "budget_min": extract_value(row[4]) if len(row) > 4 else None,
        "budget_max": extract_value(row[5]) if len(row) > 5 else None,
        "experience_level": to_str(row[6]) if len(row) > 6 else None,
    }


def get_active_freelancers(limit: int) -> List[dict]:
    """Get active freelancers with ratings and completion data for matching."""
    result = execute_query(
        """SELECT u.id, u.name, u.email, u.skills, u.hourly_rate,
                  COALESCE(rv.avg_rating, 0) AS rating,
                  u.profile_image_url, u.bio,
                  COALESCE(cc.completed, 0) AS completed_projects,
                  u.location
           FROM users u
           LEFT JOIN (
               SELECT reviewee_id, AVG(rating) AS avg_rating
               FROM reviews GROUP BY reviewee_id
           ) rv ON u.id = rv.reviewee_id
           LEFT JOIN (
               SELECT freelancer_id, COUNT(*) AS completed
               FROM contracts WHERE status = 'completed'
               GROUP BY freelancer_id
           ) cc ON u.id = cc.freelancer_id
           WHERE u.user_type = 'Freelancer' AND u.is_active = 1
           ORDER BY COALESCE(rv.avg_rating, 0) * COALESCE(cc.completed, 0) DESC
           LIMIT ?""",
        [limit]
    )

    freelancers = []
    if not result or not result.get("rows"):
        return freelancers

    for row in result["rows"]:
        freelancer_id = extract_value(row[0])
        skills_str = to_str(row[3]) or ""
        freelancer_skills = _parse_skills(skills_str)

        rating = to_float(row[5]) or 0.0

        freelancers.append({
            "freelancer_id": freelancer_id,
            "name": to_str(row[1]),
            "email": to_str(row[2]),
            "skills": freelancer_skills,
            "hourly_rate": extract_value(row[4]),
            "rating": round(rating, 2),
            "profile_image": to_str(row[6]),
            "bio": (to_str(row[7]) or "")[:300],
            "completed_projects": extract_value(row[8]) or 0,
            "location": to_str(row[9]) if len(row) > 9 else None,
        })

    return freelancers


def get_category_avg_budget(category_value: str) -> float:
    """Get average budget for a project category."""
    result = execute_query(
        """SELECT AVG((budget_min + budget_max) / 2) as avg_budget, COUNT(*) as project_count
           FROM projects
           WHERE category = ? AND status IN ('completed', 'in_progress')""",
        [category_value]
    )

    avg_budget = 500
    if result and result.get("rows"):
        row = result["rows"][0]
        avg_budget = to_float(row[0]) or 500
    return avg_budget


def get_skills_avg_hourly_rate(skills_pattern: str) -> float:
    """Get average hourly rate for freelancers with matching skills."""
    result = execute_query(
        """SELECT AVG(hourly_rate) as avg_rate
           FROM users
           WHERE user_type = 'Freelancer'
           AND hourly_rate IS NOT NULL
           AND skills LIKE ?""",
        [f"%{skills_pattern}%"]
    )

    avg_hourly = 35
    if result and result.get("rows"):
        row = result["rows"][0]
        avg_hourly = to_float(row[0]) or 35
    return avg_hourly


def get_freelancer_for_rate_estimation(freelancer_id: int) -> Optional[dict]:
    """Get freelancer details for rate estimation. Returns None if not found."""
    result = execute_query(
        """SELECT id, name, skills, hourly_rate, NULL as rating, NULL as completed_projects,
                  NULL as years_experience
           FROM users
           WHERE id = ? AND user_type = 'Freelancer'""",
        [freelancer_id]
    )

    if not result or not result.get("rows"):
        return None

    row = result["rows"][0]
    return {
        "id": extract_value(row[0]),
        "full_name": to_str(row[1]),
        "skills": to_str(row[2]),
        "current_rate": extract_value(row[3]),
        "rating": extract_value(row[4]) or 0,
        "completed_projects": extract_value(row[5]) or 0,
        "years_experience": extract_value(row[6]) or 0,
    }


def get_user_for_fraud_check(user_id: int) -> Optional[dict]:
    """Get user data for fraud analysis. Returns None if not found."""
    result = execute_query(
        """SELECT id, email, name, created_at, is_active, is_verified,
                  user_type, bio
           FROM users WHERE id = ?""",
        [user_id]
    )

    if not result or not result.get("rows"):
        return None

    row = result["rows"][0]
    return {
        "id": extract_value(row[0]),
        "email": to_str(row[1]) or "",
        "full_name": to_str(row[2]) or "",
        "created_at": to_str(row[3]),
        "is_active": extract_value(row[4]) or False,
        "is_verified": extract_value(row[5]) or False,
        "user_type": to_str(row[6]),
        "bio": to_str(row[7]) or "",
    }


def get_urgent_ticket_count(user_id: int) -> int:
    """Get count of urgent support tickets for a user."""
    result = execute_query(
        "SELECT COUNT(*) FROM support_tickets WHERE user_id = ? AND priority = 'urgent'",
        [user_id]
    )
    if result and result.get("rows"):
        return extract_value(result["rows"][0][0]) or 0
    return 0


def get_project_for_fraud_check(project_id: int) -> Optional[dict]:
    """Get project data for fraud analysis. Returns None if not found."""
    result = execute_query(
        """SELECT id, title, description, budget, client_id
           FROM projects WHERE id = ?""",
        [project_id]
    )

    if not result or not result.get("rows"):
        return None

    row = result["rows"][0]
    return {
        "id": extract_value(row[0]),
        "title": to_str(row[1]) or "",
        "description": to_str(row[2]) or "",
        "budget": extract_value(row[3]) or 0,
        "client_id": extract_value(row[4]),
    }


def get_proposal_for_fraud_check(proposal_id: int) -> Optional[dict]:
    """Get proposal data for fraud analysis. Returns None if not found."""
    result = execute_query(
        """SELECT id, cover_letter, bid_amount, freelancer_id
           FROM proposals WHERE id = ?""",
        [proposal_id]
    )

    if not result or not result.get("rows"):
        return None

    row = result["rows"][0]
    return {
        "id": extract_value(row[0]),
        "cover_letter": to_str(row[1]) or "",
        "bid_amount": extract_value(row[2]) or 0,
        "freelancer_id": extract_value(row[3]),
    }


def get_user_profile_for_suggestions(user_id: int) -> Optional[dict]:
    """Get user profile data for optimization suggestions. Returns None if not found."""
    result = execute_query(
        """SELECT id, name, bio, skills, hourly_rate, NULL as portfolio_url,
                  profile_image_url, NULL as completed_projects, NULL as rating, NULL as years_experience
           FROM users WHERE id = ?""",
        [user_id]
    )

    if not result or not result.get("rows"):
        return None

    row = result["rows"][0]
    return {
        "id": extract_value(row[0]),
        "full_name": to_str(row[1]),
        "bio": to_str(row[2]) or "",
        "skills_str": to_str(row[3]) or "",
        "hourly_rate": extract_value(row[4]),
        "portfolio_url": to_str(row[5]),
        "profile_image": to_str(row[6]),
        "completed_projects": extract_value(row[7]) or 0,
        "rating": extract_value(row[8]) or 0,
        "years_experience": extract_value(row[9]) or 0,
    }


def get_user_skills_and_rate(user_id: int) -> Optional[dict]:
    """Get user skills and hourly rate with completion data. Returns None if not found."""
    result = execute_query(
        """SELECT u.skills, u.hourly_rate, u.location,
                  COALESCE(rv.avg_rating, 0) AS avg_rating,
                  COALESCE(cc.completed, 0) AS completed_projects
           FROM users u
           LEFT JOIN (
               SELECT reviewee_id, AVG(rating) AS avg_rating
               FROM reviews GROUP BY reviewee_id
           ) rv ON u.id = rv.reviewee_id
           LEFT JOIN (
               SELECT freelancer_id, COUNT(*) AS completed
               FROM contracts WHERE status = 'completed'
               GROUP BY freelancer_id
           ) cc ON u.id = cc.freelancer_id
           WHERE u.id = ?""",
        [user_id]
    )

    if not result or not result.get("rows"):
        return None

    row = result["rows"][0]
    skills_str = to_str(row[0]) or ""
    hourly_rate = extract_value(row[1]) or 0
    user_skills = _parse_skills(skills_str)

    return {
        "skills": user_skills,
        "hourly_rate": hourly_rate,
        "location": to_str(row[2]) if len(row) > 2 else None,
        "avg_rating": round(to_float(row[3]) or 0, 2) if len(row) > 3 else 0,
        "completed_projects": (extract_value(row[4]) or 0) if len(row) > 4 else 0,
    }


def get_open_projects(limit: int) -> List[dict]:
    """Get open projects with proposal counts for job recommendations."""
    result = execute_query(
        """SELECT p.id, p.title, p.description, p.skills_required,
                  p.budget_min, p.budget_max, p.category,
                  p.experience_level, p.created_at,
                  COALESCE(pc.proposal_count, 0) AS proposal_count
           FROM projects p
           LEFT JOIN (
               SELECT project_id, COUNT(*) AS proposal_count
               FROM proposals WHERE status != 'withdrawn'
               GROUP BY project_id
           ) pc ON p.id = pc.project_id
           WHERE p.status = 'open'
           ORDER BY p.created_at DESC
           LIMIT ?""",
        [limit]
    )

    projects = []
    if not result or not result.get("rows"):
        return projects

    for row in result["rows"]:
        project_id = extract_value(row[0])
        proj_skills_str = to_str(row[3]) or ""
        proj_skills = _parse_skills(proj_skills_str)

        budget_min = extract_value(row[4]) or 0
        budget_max = extract_value(row[5]) or 0

        projects.append({
            "project_id": project_id,
            "title": to_str(row[1]),
            "description": (to_str(row[2]) or "")[:400],
            "skills": proj_skills,
            "budget_min": budget_min,
            "budget_max": budget_max,
            "category": to_str(row[6]),
            "experience_level": to_str(row[7]) if len(row) > 7 else None,
            "created_at": to_str(row[8]) if len(row) > 8 else None,
            "proposal_count": (extract_value(row[9]) or 0) if len(row) > 9 else 0,
        })

    return projects
