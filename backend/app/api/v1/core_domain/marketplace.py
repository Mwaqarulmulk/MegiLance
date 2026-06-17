from fastapi import APIRouter, Query
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


@router.get("/marketplace/freelancers")
async def list_marketplace_freelancers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    q: Optional[str] = None,
    skill: Optional[str] = None,
    min_rate: Optional[float] = None,
    max_rate: Optional[float] = None,
    location: Optional[str] = None,
    experience_level: Optional[str] = None,
    availability_status: Optional[str] = None,
):
    query = q or search
    offset = (page - 1) * page_size
    where = "WHERE user_type = 'freelancer' AND is_active = 1"
    params: list = []

    if query:
        where += " AND (LOWER(name) LIKE ? OR LOWER(COALESCE(headline, '')) LIKE ? OR LOWER(COALESCE(bio, '')) LIKE ?)"
        params.extend([f"%{query.lower()}%", f"%{query.lower()}%", f"%{query.lower()}%"])
    if skill:
        where += " AND LOWER(COALESCE(skills, '')) LIKE ?"
        params.append(f"%{skill.lower()}%")
    if min_rate is not None:
        where += " AND COALESCE(hourly_rate, 0) >= ?"
        params.append(min_rate)
    if max_rate is not None:
        where += " AND COALESCE(hourly_rate, 0) <= ?"
        params.append(max_rate)
    if location:
        where += " AND LOWER(COALESCE(location, '')) LIKE ?"
        params.append(f"%{location.lower()}%")
    if experience_level:
        where += " AND LOWER(COALESCE(experience_level, '')) = ?"
        params.append(experience_level.lower())
    if availability_status:
        where += " AND LOWER(COALESCE(availability_status, '')) = ?"
        params.append(availability_status.lower())

    count_result = execute_query(
        f"SELECT COUNT(*) as total FROM users {where}", params
    )
    total = 0
    if count_result and count_result.get("rows"):
        total = (parse_rows(count_result) or [{}])[0].get("total", 0)

    params.extend([page_size, offset])
    result = execute_query(
        f"""SELECT id, name, profile_image_url AS avatar, headline,
                   hourly_rate, profile_slug, seller_level, availability_status,
                   experience_level, location, skills, bio, updated_at
            FROM users {where}
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "freelancers": rows if rows else [], "total": total, "page": page, "page_size": page_size}


@router.get("/marketplace/projects")
async def list_marketplace_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = "open",
):
    offset = (page - 1) * page_size
    where = "WHERE 1=1"
    params: list = []

    if status:
        where += " AND status = ?"
        params.append(status)

    params.extend([page_size, offset])
    result = execute_query(
        f"""SELECT id, title, description, budget_min, budget_max, status,
                   project_type, created_at, updated_at
            FROM projects {where}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "page": page, "page_size": page_size}


@router.get("/marketplace/stats")
async def get_marketplace_stats():
    freelancer_result = execute_query(
        "SELECT COUNT(*) as count FROM users WHERE user_type = 'freelancer' AND is_active = 1", []
    )
    client_result = execute_query(
        "SELECT COUNT(*) as count FROM users WHERE user_type = 'client' AND is_active = 1", []
    )
    project_result = execute_query(
        "SELECT COUNT(*) as count FROM projects WHERE status = 'open'", []
    )

    def _first(r: any) -> int:
        if r and r.get("rows"):
            rows = parse_rows(r)
            return int((rows or [{}])[0].get("count", 0))
        return 0

    return {
        "total_freelancers": _first(freelancer_result),
        "total_clients": _first(client_result),
        "open_projects": _first(project_result),
    }


@router.get("/marketplace/categories")
async def get_marketplace_categories():
    result = execute_query(
        "SELECT DISTINCT category, COUNT(*) as count FROM skills WHERE is_active = 1 GROUP BY category ORDER BY count DESC",
        [],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.get("/marketplace/trending/skills")
async def get_trending_skills(limit: int = Query(10, ge=1, le=50)):
    result = execute_query(
        """SELECT s.name, s.category, COUNT(us.skill_id) as usage_count
           FROM skills s
           LEFT JOIN user_skills us ON s.id = us.skill_id
           WHERE s.is_active = 1
           GROUP BY s.id, s.name, s.category
           ORDER BY usage_count DESC
           LIMIT ?""",
        [limit],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}
