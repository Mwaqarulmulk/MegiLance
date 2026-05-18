# @AI-HINT: Skills router — skill listing, assessments, user skills management
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class SkillCreate(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    icon_url: Optional[str] = None


class UserSkillAdd(BaseModel):
    name: str
    level: str = "intermediate"
    category: Optional[str] = None


class SkillAssessmentAnswer(BaseModel):
    question_id: int
    answer: str


class SkillAssessmentSubmission(BaseModel):
    skill_id: int
    level: str
    answers: list[SkillAssessmentAnswer]


@router.get("/")
async def list_skills(
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
):
    where = "WHERE is_active = 1"
    params: list = []

    if category:
        where += " AND category = ?"
        params.append(category)
    if search:
        where += " AND name LIKE ?"
        params.append(f"%{search}%")

    params.append(limit)
    result = execute_query(
        f"SELECT id, name, category, description, icon_url, is_active, sort_order, created_at, updated_at FROM skills {where} ORDER BY name ASC LIMIT ?",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.post("/")
async def create_skill(request: SkillCreate, current_user=Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO skills (name, category, description, icon_url, is_active, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, 1, 0, ?, ?)",
        [request.name, request.category or "", request.description or "", request.icon_url or "", now, now],
    )
    return {"message": "Skill created", "skill_id": result.get("last_insert_rowid")}


@router.get("/freelancers/match")
async def match_freelancers_by_skill(
    skill_slug: str = Query(...),
    industry_slug: Optional[str] = None,
    limit: int = Query(6, ge=1, le=50),
):
    skill_keyword = skill_slug.replace("-", " ").split()[0].lower()
    result = execute_query(
        """SELECT u.id, u.name, u.profile_image_url AS avatar,
                  u.hourly_rate AS rate, u.headline,
                  COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.reviewed_user_id = u.id), 0.0) AS rating,
                  COALESCE((SELECT COUNT(*) FROM contracts c WHERE c.freelancer_id = u.id AND c.status = 'completed'), 0) AS completedJobs
           FROM users u
           WHERE u.user_type = 'freelancer'
           AND u.is_active = 1
           AND (LOWER(COALESCE(u.skills, '')) LIKE ? OR LOWER(COALESCE(u.headline, '')) LIKE ?)
           ORDER BY rating DESC, completedJobs DESC
           LIMIT ?""",
        [f"%{skill_keyword}%", f"%{skill_keyword}%", limit],
    )
    rows = parse_rows(result)
    return [
        {
            "id": r.get("id"),
            "name": r.get("name", ""),
            "avatar": r.get("avatar"),
            "rate": float(r.get("rate") or 0),
            "headline": r.get("headline", ""),
            "rating": round(float(r.get("rating") or 0), 1),
            "completedJobs": int(r.get("completedJobs") or 0),
        }
        for r in (rows or [])
    ]


@router.get("/{skill_id}/questions")
async def get_skill_questions(skill_id: int, level: str = Query("intermediate")):
    questions = [
        {"id": 1, "skill_id": skill_id, "question": f"What is the primary use of this skill?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_answer": "Option A", "level": level},
        {"id": 2, "skill_id": skill_id, "question": f"Which of the following best describes this skill?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_answer": "Option B", "level": level},
        {"id": 3, "skill_id": skill_id, "question": f"How would you apply this skill in a project?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_answer": "Option C", "level": level},
    ]
    return {"questions": questions, "skill_id": skill_id, "level": level}


@router.post("/assessments")
async def submit_assessment(request: SkillAssessmentSubmission, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    total_questions = len(request.answers)
    correct_answers = 0

    for answer in request.answers:
        if answer.answer.startswith("Option"):
            correct_answers += 1

    score = (correct_answers / total_questions * 100) if total_questions > 0 else 0
    passed = score >= 70

    result = execute_query(
        "INSERT INTO skill_assessments (user_id, skill_id, level, score, passed, completed_at) VALUES (?, ?, ?, ?, ?, ?)",
        [current_user.id, request.skill_id, request.level, score, 1 if passed else 0, now],
    )

    if passed:
        execute_query(
            "INSERT OR REPLACE INTO user_skills (user_id, skill_id, level, verified, created_at) VALUES (?, ?, ?, 1, ?)",
            [current_user.id, request.skill_id, request.level, now],
        )

    return {"message": "Assessment completed", "score": score, "passed": passed, "assessment_id": result.get("last_insert_rowid")}


@router.get("/me/skills")
async def get_my_skills(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT us.id, us.skill_id, us.level, us.verified, s.name, s.category FROM user_skills us LEFT JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ? ORDER BY us.level DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.post("/me/skills")
async def add_my_skill(request: UserSkillAdd, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT OR REPLACE INTO user_skills (user_id, skill_id, level, verified, created_at) VALUES (?, (SELECT id FROM skills WHERE name = ?), ?, 0, ?)",
        [current_user.id, request.name, request.level, now],
    )
    return {"message": "Skill added"}


@router.delete("/me/skills/{skill_id}")
async def remove_my_skill(skill_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?", [current_user.id, skill_id])
    return {"message": "Skill removed"}
