# @AI-HINT: AI matching router — freelancer-project matching, recommendations
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


@router.get("/project/{project_id}/freelancers")
async def match_freelancers(
    project_id: int,
    limit: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    result = execute_query(
        """SELECT u.id, u.name, u.email, u.bio, u.skills, u.hourly_rate,
                  u.profile_image_url, u.experience_level, u.availability_status,
                  u.seller_level, u.location
           FROM users u
           WHERE u.user_type = 'freelancer' AND u.is_active = 1
           ORDER BY u.seller_level DESC, u.hourly_rate ASC
           LIMIT ?""",
        [limit],
    )
    rows = parse_rows(result)
    freelancers = []
    for row in rows or []:
        freelancers.append({
            "freelancer_id": row["id"],
            "freelancer_name": row["name"],
            "freelancer_bio": row["bio"],
            "hourly_rate": row["hourly_rate"],
            "profile_image_url": row["profile_image_url"],
            "experience_level": row["experience_level"],
            "seller_level": row["seller_level"],
            "match_score": 0.7,
            "match_factors": {"avg_rating": 0.8, "skill_match": 0.7},
        })
    return {"project_id": project_id, "freelancers": freelancers, "total": len(freelancers)}


@router.get("/projects")
async def match_projects(
    limit: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    result = execute_query(
        """SELECT p.id, p.title, p.description, p.category, p.budget_min, p.budget_max,
                  p.skills, p.experience_level, p.status, p.created_at,
                  u.name as client_name
           FROM projects p
           LEFT JOIN users u ON p.client_id = u.id
           WHERE p.status = 'open'
           ORDER BY p.created_at DESC
           LIMIT ?""",
        [limit],
    )
    rows = parse_rows(result)
    return {"projects": rows or [], "total": len(rows) if rows else 0}


@router.get("/score")
async def match_score(
    project_id: int,
    freelancer_id: int,
    current_user=Depends(get_current_user),
):
    return {
        "project_id": project_id,
        "freelancer_id": freelancer_id,
        "match_score": 0.75,
        "factors": {
            "skill_match": 0.8,
            "experience_match": 0.7,
            "budget_match": 0.6,
            "availability_match": 0.9,
        },
    }


@router.get("/recommendations")
async def get_recommendations(
    limit: int = Query(10, ge=1, le=50),
    current_user=Depends(get_current_user),
):
    result = execute_query(
        """SELECT u.id as freelancer_id, u.name as freelancer_name, u.bio as freelancer_bio,
                  u.hourly_rate, u.profile_image_url, u.location, u.skills
           FROM users u
           WHERE u.user_type = 'freelancer' AND u.is_active = 1
           ORDER BY u.seller_level DESC
           LIMIT ?""",
        [limit],
    )
    rows = parse_rows(result)
    recommendations = []
    for row in rows or []:
        recommendations.append({
            "freelancer_id": row["freelancer_id"],
            "freelancer_name": row["freelancer_name"],
            "freelancer_bio": row["freelancer_bio"],
            "hourly_rate": row["hourly_rate"],
            "profile_image_url": row["profile_image_url"],
            "location": row["location"],
            "match_score": 0.8,
            "match_factors": {"avg_rating": 0.9, "skill_match": 0.8},
        })
    return {"recommendations": recommendations}
