# @AI-HINT: Freelancers router — public profile endpoints for freelancers
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


@router.get("/id/{user_id}")
async def get_freelancer_by_id(user_id: int):
    result = execute_query(
        """SELECT u.id, u.name, u.email, u.user_type, u.bio, u.profile_image_url, u.hourly_rate, u.location,
                  u.country, u.city, u.is_verified, u.created_at,
                  p.total_jobs, p.success_rate, p.total_earnings, p.seller_level
           FROM users u
           LEFT JOIN profiles p ON u.id = p.user_id
           WHERE u.id = ? AND u.user_type = 'freelancer'""",
        [user_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    return rows[0]


@router.get("/slug/{slug}")
async def get_freelancer_by_slug(slug: str):
    result = execute_query(
        """SELECT u.id, u.name, u.email, u.user_type, u.bio, u.profile_image_url, u.hourly_rate, u.location,
                  u.country, u.city, u.is_verified, u.created_at,
                  p.total_jobs, p.success_rate, p.total_earnings, p.seller_level
           FROM users u
           LEFT JOIN profiles p ON u.id = p.user_id
           WHERE u.name = ? AND u.user_type = 'freelancer'""",
        [slug.replace("-", " ")],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    return rows[0]


@router.get("/featured")
async def get_featured_freelancers(
    limit: int = Query(10, ge=1, le=50),
    skills: Optional[str] = None,
    location: Optional[str] = None,
    min_rate: Optional[float] = None,
    max_rate: Optional[float] = None,
    experience_level: Optional[str] = None,
    availability: Optional[str] = None,
):
    where = "WHERE u.user_type = 'freelancer' AND u.is_active = 1"
    params: list = []

    if skills:
        where += " AND p.skills LIKE ?"
        params.append(f"%{skills}%")
    if location:
        where += " AND (u.location LIKE ? OR u.country LIKE ?)"
        params.extend([f"%{location}%", f"%{location}%"])
    if min_rate is not None:
        where += " AND u.hourly_rate >= ?"
        params.append(min_rate)
    if max_rate is not None:
        where += " AND u.hourly_rate <= ?"
        params.append(max_rate)
    if experience_level:
        where += " AND p.seller_level = ?"
        params.append(experience_level)
    if availability:
        where += " AND p.availability = ?"
        params.append(availability)

    params.append(limit)
    result = execute_query(
        f"""SELECT u.id, u.name, u.bio, u.profile_image_url, u.hourly_rate, u.location, u.country, u.is_verified,
                   p.total_jobs, p.success_rate, p.seller_level, p.skills
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            {where}
            ORDER BY p.success_rate DESC, p.total_jobs DESC
            LIMIT ?""",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.get("/{user_id}/stats")
async def get_freelancer_stats(user_id: int):
    result = execute_query(
        """SELECT u.id, u.name, u.hourly_rate, u.is_verified,
                  p.total_jobs, p.success_rate, p.total_earnings, p.seller_level,
                  (SELECT COUNT(*) FROM reviews WHERE freelancer_id = ?) as review_count,
                  (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE freelancer_id = ?) as avg_rating
           FROM users u
           LEFT JOIN profiles p ON u.id = p.user_id
           WHERE u.id = ?""",
        [user_id, user_id, user_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    return rows[0]


@router.get("/{user_id}/portfolio")
async def get_freelancer_portfolio(user_id: int):
    result = execute_query(
        "SELECT id, title, description, image_url, project_url, category, skills, created_at FROM portfolio_items WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
        [user_id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.get("/{user_id}/reviews")
async def get_freelancer_reviews(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT r.id, r.rating, r.comment, r.created_at,
                  u.name as reviewer_name, u.profile_image_url as reviewer_avatar
           FROM reviews r
           LEFT JOIN users u ON r.reviewer_id = u.id
           WHERE r.freelancer_id = ?
           ORDER BY r.created_at DESC
           LIMIT ? OFFSET ?""",
        [user_id, page_size, offset],
    )
    rows = parse_rows(result)

    count_result = execute_query("SELECT COUNT(*) as total FROM reviews WHERE freelancer_id = ?", [user_id])
    total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0

    return {"items": rows if rows else [], "total": total, "page": page}
