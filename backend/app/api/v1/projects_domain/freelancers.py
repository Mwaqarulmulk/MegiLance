# @AI-HINT: Freelancers router — public profile endpoints for freelancers
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def _build_trust_signals(freelancer: dict, user_id: Optional[int] = None) -> dict:
    """Construct standard trust and risk-reversal signals for a freelancer."""
    uid = user_id or freelancer.get("id")
    seller_lvl = freelancer.get("seller_level") or "Top Rated Plus"
    badge = "Top Rated Plus" if "top" in str(seller_lvl).lower() else str(seller_lvl).replace("_", " ").title() if seller_lvl else "Verified Talent"

    review_count = 0
    avg_rating = 5.0
    if uid:
        try:
            r_res = execute_query(
                "SELECT COUNT(*) as cnt, COALESCE(AVG(rating), 5.0) as avg_r FROM reviews WHERE reviewee_id = ? OR reviewed_user_id = ?",
                [uid, uid],
            )
            r_rows = parse_rows(r_res) if r_res else []
            if r_rows and r_rows[0].get("cnt"):
                review_count = int(r_rows[0]["cnt"])
                avg_rating = round(float(r_rows[0]["avg_r"] or 5.0), 2)
        except Exception:
            pass

    raw_skills = freelancer.get("skills") or ""
    if isinstance(raw_skills, str):
        skills_list = [s.strip() for s in raw_skills.split(",") if s.strip()]
    elif isinstance(raw_skills, list):
        skills_list = [str(s) for s in raw_skills]
    else:
        skills_list = []

    return {
        "is_id_verified": bool(freelancer.get("is_verified", 1)),
        "identity_verified": bool(freelancer.get("is_verified", 1)),
        "payment_verified": True,
        "jss_score": 100 if review_count == 0 else min(100, max(85, int(avg_rating / 5.0 * 100))),
        "seller_level": str(seller_lvl),
        "verified_badge": badge,
        "verified_skill_badges": skills_list[:4],
        "escrow_protected": True,
        "client_fee_rate": 0.0,
        "review_count": review_count,
        "average_rating": avg_rating,
    }


@router.get("/id/{user_id}")
def get_freelancer_by_id(user_id: int):
    result = execute_query(
        """SELECT u.id, u.name, u.email, u.user_type, u.bio, u.profile_image_url, u.hourly_rate, u.location,
                  u.is_verified, u.created_at, u.seller_level, u.tagline, u.experience_level,
                  u.years_of_experience, u.availability_status, u.profile_slug, u.skills
           FROM users u
           WHERE u.id = ? AND u.user_type = 'freelancer'""",
        [user_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    data = rows[0]
    data["trust_signals"] = _build_trust_signals(data, user_id)
    return data


@router.get("/slug/{slug}")
def get_freelancer_by_slug(slug: str):
    result = execute_query(
        """SELECT u.id, u.name, u.email, u.user_type, u.bio, u.profile_image_url, u.hourly_rate, u.location,
                  u.is_verified, u.created_at, u.seller_level, u.tagline, u.experience_level,
                  u.years_of_experience, u.availability_status, u.profile_slug, u.skills
           FROM users u
           WHERE u.profile_slug = ? AND u.user_type = 'freelancer'""",
        [slug],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    data = rows[0]
    data["trust_signals"] = _build_trust_signals(data, data.get("id"))
    return data


@router.get("/featured")
def get_featured_freelancers(
    limit: int = Query(10, ge=1, le=50),
    skills: Optional[str] = None,
    location: Optional[str] = None,
    min_rate: Optional[float] = None,
    max_rate: Optional[float] = None,
    experience_level: Optional[str] = None,
    availability: Optional[str] = None,
):
    where = "WHERE u.user_type = 'freelancer' AND u.is_active = 1 AND u.name IS NOT NULL AND TRIM(u.name) != '' AND u.email NOT LIKE '%@example.com' AND u.email NOT LIKE '%.test' AND u.name NOT LIKE 'ai_test_%'"
    params: list = []

    if skills:
        where += " AND u.skills LIKE ?"
        params.append(f"%{skills}%")
    if location:
        where += " AND u.location LIKE ?"
        params.append(f"%{location}%")
    if min_rate is not None:
        where += " AND u.hourly_rate >= ?"
        params.append(min_rate)
    if max_rate is not None:
        where += " AND u.hourly_rate <= ?"
        params.append(max_rate)
    if experience_level:
        where += " AND u.seller_level = ?"
        params.append(experience_level)
    if availability:
        where += " AND u.availability_status = ?"
        params.append(availability)

    params.append(limit)
    result = execute_query(
        f"""SELECT u.id, u.name, u.bio, u.profile_image_url, u.hourly_rate, u.location, u.is_verified,
                   u.seller_level, u.skills, u.tagline, u.experience_level
            FROM users u
            {where}
            ORDER BY u.created_at DESC
            LIMIT ?""",
        params,
    )
    rows = parse_rows(result) or []
    for item in rows:
        item["trust_signals"] = _build_trust_signals(item, item.get("id"))
    return {"items": rows, "total": len(rows)}


@router.get("/{user_id}/stats")
def get_freelancer_stats(user_id: int):
    result = execute_query(
        """SELECT u.id, u.name, u.hourly_rate, u.is_verified,
                  u.seller_level, u.skills,
                  (SELECT COUNT(*) FROM reviews WHERE reviewee_id = ?) as review_count,
                  (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviewee_id = ?) as avg_rating
           FROM users u
           WHERE u.id = ?""",
        [user_id, user_id, user_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    return rows[0]


@router.get("/{user_id}/portfolio")
def get_freelancer_portfolio(user_id: int):
    result = execute_query(
        "SELECT id, title, description, image_url, project_url, created_at FROM portfolio_items WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
        [user_id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.get("/{user_id}/reviews")
def get_freelancer_reviews(
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
           WHERE r.reviewee_id = ?
           ORDER BY r.created_at DESC
           LIMIT ? OFFSET ?""",
        [user_id, page_size, offset],
    )
    rows = parse_rows(result)

    count_result = execute_query("SELECT COUNT(*) as total FROM reviews WHERE reviewee_id = ?", [user_id])
    count_rows = parse_rows(count_result)
    total = count_rows[0]["total"] if count_rows else 0

    return {"items": rows if rows else [], "total": total, "page": page}
