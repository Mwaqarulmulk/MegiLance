# @AI-HINT: AI matching router — freelancer-project matching using the real MatchingEngine
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows
from app.services.matching_engine import get_matching_service

router = APIRouter()


@router.get("/project/{project_id}/freelancers")
async def match_freelancers(
    project_id: int,
    limit: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    """Get AI-ranked freelancers for a specific project."""
    engine = get_matching_service()
    recommendations = engine.get_recommended_freelancers(
        project_id=project_id,
        limit=limit,
        min_score=0.2,
        diversity=True,
    )
    return {
        "project_id": project_id,
        "freelancers": recommendations,
        "total": len(recommendations),
    }


@router.get("/projects")
async def match_projects(
    limit: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    """Get AI-recommended projects for the current freelancer."""
    engine = get_matching_service()
    recommendations = engine.get_recommended_projects(
        freelancer_id=current_user.id,
        limit=limit,
        min_score=0.2,
    )
    return {"projects": recommendations, "total": len(recommendations)}


@router.get("/score")
async def match_score(
    project_id: int,
    freelancer_id: int,
    current_user=Depends(get_current_user),
):
    """Calculate detailed match score between a project and freelancer."""
    # Fetch project and freelancer data
    project_result = execute_query(
        "SELECT * FROM projects WHERE id = ?", [project_id]
    )
    projects = parse_rows(project_result)
    if not projects:
        raise HTTPException(status_code=404, detail="Project not found")

    freelancer_result = execute_query(
        "SELECT * FROM users WHERE id = ? AND user_type = 'freelancer'",
        [freelancer_id],
    )
    freelancers = parse_rows(freelancer_result)
    if not freelancers:
        raise HTTPException(status_code=404, detail="Freelancer not found")

    engine = get_matching_service()
    match_result = engine.calculate_match_score(projects[0], freelancers[0])

    return {
        "project_id": project_id,
        "freelancer_id": freelancer_id,
        "match_score": match_result["score"],
        "match_quality": match_result["quality"],
        "factors": match_result["factors"],
        "skill_details": match_result["skill_details"],
    }


@router.get("/recommendations")
async def get_recommendations(
    limit: int = Query(10, ge=1, le=50),
    current_user=Depends(get_current_user),
):
    """Get personalized freelancer recommendations for the current user (client)."""
    engine = get_matching_service()

    # For clients: find their most recent open project and recommend freelancers for it
    result = execute_query(
        """SELECT id FROM projects
           WHERE client_id = ? AND status = 'open'
           ORDER BY created_at DESC LIMIT 1""",
        [current_user.id],
    )
    projects = parse_rows(result)

    if projects:
        project_id = projects[0]["id"]
        recommendations = engine.get_recommended_freelancers(
            project_id=project_id,
            limit=limit,
            min_score=0.2,
            diversity=True,
        )
    else:
        # No open projects — return top-rated freelancers as general recommendations
        result = execute_query(
            """SELECT u.id, u.name, u.bio, u.hourly_rate, u.profile_image_url,
                      u.location, u.skills, u.seller_level
               FROM users u
               WHERE u.user_type = 'freelancer' AND u.is_active = 1
               ORDER BY u.seller_level DESC, u.hourly_rate ASC
               LIMIT ?""",
            [limit],
        )
        rows = parse_rows(result) or []
        recommendations = []
        for row in rows:
            recommendations.append({
                "freelancer_id": row["id"],
                "freelancer_name": row["name"],
                "freelancer_bio": (row.get("bio") or "")[:300],
                "hourly_rate": row.get("hourly_rate"),
                "location": row.get("location"),
                "profile_image_url": row.get("profile_image_url"),
                "match_score": 0.7,
                "match_quality": "good",
                "match_factors": {},
                "skill_details": {},
            })

    return {"recommendations": recommendations, "total": len(recommendations)}


class TrackClickRequest(BaseModel):
    project_id: int


@router.post("/track-click")
async def track_click(body: TrackClickRequest, current_user=Depends(get_current_user)):
    """Record that a freelancer clicked a matched project (best-effort analytics signal)."""
    try:
        from datetime import datetime, timezone
        execute_query(
            """CREATE TABLE IF NOT EXISTS match_clicks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                freelancer_id INTEGER, project_id INTEGER, created_at TEXT
            )""", []
        )
        execute_query(
            "INSERT INTO match_clicks (freelancer_id, project_id, created_at) VALUES (?, ?, ?)",
            [current_user.id, body.project_id, datetime.now(timezone.utc).isoformat()],
        )
    except Exception as e:
        logger.warning(f"track_click failed (non-critical): {e}")
    return {"ok": True}
