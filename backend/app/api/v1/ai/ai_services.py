# @AI-HINT: AI services router — general AI features, rate estimation, skill analysis
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class RateEstimateRequest(BaseModel):
    skills: List[str]
    experience_level: Optional[str] = None
    location: Optional[str] = None


@router.post("/estimate-rate")
async def estimate_rate(request: RateEstimateRequest, current_user=Depends(get_current_user)):
    skill_count = len(request.skills)
    base_rate = 15 + (skill_count * 5)

    if request.experience_level == "expert":
        base_rate *= 1.5
    elif request.experience_level == "intermediate":
        base_rate *= 1.2

    return {
        "estimated_rate": base_rate,
        "range": {"min": base_rate * 0.8, "max": base_rate * 1.2},
        "factors": {
            "skills": request.skills,
            "experience": request.experience_level,
            "location": request.location,
        },
        "message": "Rate estimate based on skills and experience level",
    }


@router.get("/skills/analysis")
async def analyze_skills(
    skills: str = Query(..., description="Comma-separated skills"),
    current_user=Depends(get_current_user),
):
    skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    analysis = []
    for skill in skill_list:
        analysis.append({
            "skill": skill,
            "demand": "high" if skill.lower() in ["react", "python", "node.js", "typescript", "aws"] else "medium",
            "avg_rate": 50 if skill.lower() in ["react", "python", "node.js"] else 35,
        })
    return {"skills": analysis}


@router.get("/project/estimate")
async def estimate_project(
    title: str = Query(...),
    description: str = Query(...),
    category: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    word_count = len(description.split())
    base_estimate = max(500, word_count * 10)

    return {
        "estimated_budget": base_estimate,
        "estimated_duration_days": max(7, word_count // 10),
        "confidence": 0.7,
        "factors": {"word_count": word_count, "category": category},
    }
