# @AI-HINT: Skill Assessments router — professional skill verification with timed sessions, scoring, and leaderboard
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

_TABLES_CREATED = False


def _ensure_tables():
    global _TABLES_CREATED
    if _TABLES_CREATED:
        return
    execute_query("""
        CREATE TABLE IF NOT EXISTS skill_assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            skill_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            difficulty TEXT DEFAULT 'intermediate',
            questions_json TEXT,
            passing_score INTEGER DEFAULT 70,
            time_limit_minutes INTEGER DEFAULT 30,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS assessment_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            assessment_id INTEGER NOT NULL,
            status TEXT DEFAULT 'in_progress',
            answers_json TEXT,
            score REAL,
            started_at TEXT,
            completed_at TEXT,
            created_at TEXT NOT NULL
        )
    """, [])
    _TABLES_CREATED = True


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class AssessmentCreate(BaseModel):
    skill_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    difficulty: Optional[str] = "intermediate"
    questions_json: Optional[str] = None
    passing_score: Optional[int] = 70
    time_limit_minutes: Optional[int] = 30


class AssessmentSubmit(BaseModel):
    answers_json: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_questions(questions_json: Optional[str]) -> list:
    if not questions_json:
        return []
    try:
        return json.loads(questions_json)
    except Exception:
        return []


def _calculate_score(questions: list, answers: dict) -> float:
    if not questions:
        return 0.0
    correct = 0
    for q in questions:
        q_id = str(q.get("id", ""))
        if q_id in answers and answers[q_id] == q.get("correct_answer"):
            correct += 1
    return round((correct / len(questions)) * 100, 2) if questions else 0.0


# ---------------------------------------------------------------------------
# GET /assessments — list available assessments
# ---------------------------------------------------------------------------

@router.get("")
def list_assessments(
    skill_id: Optional[int] = Query(None),
    difficulty: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    _ensure_tables()
    where = "WHERE is_active = 1"
    params: list = []
    if skill_id is not None:
        where += " AND skill_id = ?"
        params.append(skill_id)
    if difficulty:
        where += " AND difficulty = ?"
        params.append(difficulty)

    offset = (page - 1) * page_size
    result = execute_query(
        f"SELECT id, skill_id, title, description, difficulty, passing_score, "
        f"time_limit_minutes, is_active, created_at FROM skill_assessments "
        f"{where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params + [page_size, offset],
    )
    assessments = parse_rows(result) if result else []

    count_result = execute_query(
        f"SELECT COUNT(*) as total FROM skill_assessments {where}", params
    )
    total = 0
    if count_result:
        rows = parse_rows(count_result)
        if rows:
            total = rows[0].get("total", 0)

    return {"assessments": assessments, "total": total, "page": page, "page_size": page_size}


# ---------------------------------------------------------------------------
# GET /assessments/my — current user's completed assessments
# ---------------------------------------------------------------------------

@router.get("/my")
def my_assessments(
    current_user=Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    _ensure_tables()
    offset = (page - 1) * page_size
    result = execute_query(
        "SELECT s.id, s.assessment_id, s.status, s.score, s.started_at, s.completed_at, "
        "a.title, a.difficulty, a.skill_id "
        "FROM assessment_sessions s "
        "JOIN skill_assessments a ON s.assessment_id = a.id "
        "WHERE s.user_id = ? "
        "ORDER BY s.completed_at DESC LIMIT ? OFFSET ?",
        [current_user.id, page_size, offset],
    )
    sessions = parse_rows(result) if result else []

    count_result = execute_query(
        "SELECT COUNT(*) as total FROM assessment_sessions WHERE user_id = ?",
        [current_user.id],
    )
    total = 0
    if count_result:
        rows = parse_rows(count_result)
        if rows:
            total = rows[0].get("total", 0)

    return {"sessions": sessions, "total": total, "page": page, "page_size": page_size}


# ---------------------------------------------------------------------------
# GET /assessments/leaderboard — top scorers for a skill
# ---------------------------------------------------------------------------

@router.get("/leaderboard")
def leaderboard(
    skill_id: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=100),
):
    _ensure_tables()
    where = ""
    params: list = []
    if skill_id is not None:
        where = "AND a.skill_id = ?"
        params.append(skill_id)

    result = execute_query(
        f"SELECT u.id as user_id, u.name, u.profile_image_url, "
        f"MAX(s.score) as best_score, COUNT(s.id) as attempts, "
        f"a.skill_id, a.difficulty "
        f"FROM assessment_sessions s "
        f"JOIN skill_assessments a ON s.assessment_id = a.id "
        f"JOIN users u ON s.user_id = u.id "
        f"WHERE s.status = 'completed' AND s.score IS NOT NULL {where} "
        f"GROUP BY s.user_id "
        f"ORDER BY best_score DESC LIMIT ?",
        params + [limit],
    )
    leaderboard = parse_rows(result) if result else []
    for i, entry in enumerate(leaderboard):
        entry["position"] = i + 1

    return {"leaderboard": leaderboard, "skill_id": skill_id, "limit": limit}


# ---------------------------------------------------------------------------
# GET /assessments/{assessment_id} — get assessment details with questions
# ---------------------------------------------------------------------------

@router.get("/{assessment_id}")
def get_assessment(assessment_id: int):
    _ensure_tables()
    result = execute_query(
        "SELECT id, skill_id, title, description, difficulty, questions_json, "
        "passing_score, time_limit_minutes, is_active, created_at, updated_at "
        "FROM skill_assessments WHERE id = ?",
        [assessment_id],
    )
    rows = parse_rows(result) if result else []
    if not rows:
        raise HTTPException(status_code=404, detail="Assessment not found")

    assessment = rows[0]
    assessment["questions"] = _parse_questions(assessment.get("questions_json"))
    assessment.pop("questions_json", None)

    return assessment


# ---------------------------------------------------------------------------
# POST /assessments/{assessment_id}/start — start an assessment session
# ---------------------------------------------------------------------------

@router.post("/{assessment_id}/start")
def start_assessment(assessment_id: int, current_user=Depends(get_current_user)):
    _ensure_tables()

    # Verify assessment exists and is active
    result = execute_query(
        "SELECT id, is_active, time_limit_minutes FROM skill_assessments WHERE id = ?",
        [assessment_id],
    )
    rows = parse_rows(result) if result else []
    if not rows:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if not rows[0].get("is_active"):
        raise HTTPException(status_code=400, detail="Assessment is not active")

    # Check for an existing in-progress session
    active_result = execute_query(
        "SELECT id FROM assessment_sessions "
        "WHERE user_id = ? AND assessment_id = ? AND status = 'in_progress'",
        [current_user.id, assessment_id],
    )
    active_rows = parse_rows(active_result) if active_result else []
    if active_rows:
        raise HTTPException(status_code=400, detail="You already have an in-progress session for this assessment")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO assessment_sessions (user_id, assessment_id, status, started_at, created_at) "
        "VALUES (?, ?, 'in_progress', ?, ?)",
        [current_user.id, assessment_id, now, now],
    )

    # Fetch the inserted session id
    session_result = execute_query(
        "SELECT id FROM assessment_sessions WHERE user_id = ? AND assessment_id = ? "
        "AND status = 'in_progress' ORDER BY id DESC LIMIT 1",
        [current_user.id, assessment_id],
    )
    session_rows = parse_rows(session_result) if session_result else []
    session_id = session_rows[0]["id"] if session_rows else None

    return {
        "session_id": session_id,
        "assessment_id": assessment_id,
        "status": "in_progress",
        "started_at": now,
        "time_limit_minutes": rows[0].get("time_limit_minutes", 30),
    }


# ---------------------------------------------------------------------------
# POST /assessments/{assessment_id}/submit — submit answers and get score
# ---------------------------------------------------------------------------

@router.post("/{assessment_id}/submit")
def submit_assessment(
    assessment_id: int,
    body: AssessmentSubmit,
    current_user=Depends(get_current_user),
):
    _ensure_tables()

    # Verify assessment exists
    result = execute_query(
        "SELECT id, questions_json, passing_score FROM skill_assessments WHERE id = ?",
        [assessment_id],
    )
    rows = parse_rows(result) if result else []
    if not rows:
        raise HTTPException(status_code=404, detail="Assessment not found")

    assessment = rows[0]
    questions = _parse_questions(assessment.get("questions_json"))

    # Find in-progress session
    session_result = execute_query(
        "SELECT id FROM assessment_sessions "
        "WHERE user_id = ? AND assessment_id = ? AND status = 'in_progress'",
        [current_user.id, assessment_id],
    )
    session_rows = parse_rows(session_result) if session_result else []
    if not session_rows:
        raise HTTPException(status_code=400, detail="No in-progress session found for this assessment")

    session_id = session_rows[0]["id"]

    # Parse answers and calculate score
    try:
        answers = json.loads(body.answers_json)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid answers_json format")

    score = _calculate_score(questions, answers)
    passing_score = assessment.get("passing_score", 70)
    passed = score >= passing_score
    now = datetime.now(timezone.utc).isoformat()

    execute_query(
        "UPDATE assessment_sessions SET status = 'completed', answers_json = ?, "
        "score = ?, completed_at = ? WHERE id = ?",
        [body.answers_json, score, now, session_id],
    )

    return {
        "session_id": session_id,
        "assessment_id": assessment_id,
        "score": score,
        "passing_score": passing_score,
        "passed": passed,
        "completed_at": now,
    }


# ---------------------------------------------------------------------------
# GET /assessments/{assessment_id}/results — detailed results for a session
# ---------------------------------------------------------------------------

@router.get("/{assessment_id}/results")
def get_results(
    assessment_id: int,
    current_user=Depends(get_current_user),
):
    _ensure_tables()

    # Get latest completed session for this user & assessment
    session_result = execute_query(
        "SELECT id, status, answers_json, score, started_at, completed_at "
        "FROM assessment_sessions "
        "WHERE user_id = ? AND assessment_id = ? AND status = 'completed' "
        "ORDER BY completed_at DESC LIMIT 1",
        [current_user.id, assessment_id],
    )
    session_rows = parse_rows(session_result) if session_result else []
    if not session_rows:
        raise HTTPException(status_code=404, detail="No completed session found for this assessment")

    session = session_rows[0]

    # Get assessment details for question breakdown
    assess_result = execute_query(
        "SELECT questions_json, passing_score FROM skill_assessments WHERE id = ?",
        [assessment_id],
    )
    assess_rows = parse_rows(assess_result) if assess_result else []
    questions = _parse_questions(assess_rows[0].get("questions_json")) if assess_rows else []
    passing_score = assess_rows[0].get("passing_score", 70) if assess_rows else 70

    # Build per-question breakdown
    try:
        answers = json.loads(session.get("answers_json") or "{}")
    except Exception:
        answers = {}

    breakdown = []
    for q in questions:
        q_id = str(q.get("id", ""))
        user_answer = answers.get(q_id)
        correct_answer = q.get("correct_answer")
        breakdown.append({
            "question_id": q.get("id"),
            "question": q.get("question"),
            "options": q.get("options", []),
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "is_correct": user_answer == correct_answer,
        })

    return {
        "session_id": session["id"],
        "assessment_id": assessment_id,
        "score": session.get("score"),
        "passing_score": passing_score,
        "passed": (session.get("score") or 0) >= passing_score,
        "started_at": session.get("started_at"),
        "completed_at": session.get("completed_at"),
        "breakdown": breakdown,
    }


# ---------------------------------------------------------------------------
# POST /assessments — create a new assessment (admin only)
# ---------------------------------------------------------------------------

@router.post("", status_code=201)
def create_assessment(body: AssessmentCreate, current_user=Depends(require_admin)):
    _ensure_tables()
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO skill_assessments "
        "(skill_id, title, description, difficulty, questions_json, passing_score, "
        "time_limit_minutes, is_active, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)",
        [
            body.skill_id,
            body.title,
            body.description,
            body.difficulty or "intermediate",
            body.questions_json,
            body.passing_score or 70,
            body.time_limit_minutes or 30,
            now,
            now,
        ],
    )

    # Fetch the newly created assessment
    result = execute_query(
        "SELECT id, skill_id, title, description, difficulty, passing_score, "
        "time_limit_minutes, is_active, created_at FROM skill_assessments "
        "ORDER BY id DESC LIMIT 1",
    )
    rows = parse_rows(result) if result else []
    assessment = rows[0] if rows else {}

    return assessment
