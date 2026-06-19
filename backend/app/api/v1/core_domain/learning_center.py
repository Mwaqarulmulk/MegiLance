# @AI-HINT: Learning Center router — courses, modules, enrollments, certificates, learning paths
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def _ensure_table():
    execute_query("""
        CREATE TABLE IF NOT EXISTS learning_courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            skill_slug TEXT,
            difficulty TEXT DEFAULT 'beginner',
            duration_hours REAL DEFAULT 0,
            instructor TEXT,
            thumbnail_url TEXT,
            price REAL DEFAULT 0,
            currency TEXT DEFAULT 'USD',
            is_published INTEGER DEFAULT 1,
            enrollment_count INTEGER DEFAULT 0,
            avg_rating REAL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS learning_modules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            content_type TEXT DEFAULT 'text',
            content_json TEXT,
            order_index INTEGER DEFAULT 0,
            duration_minutes INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS learning_enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            status TEXT DEFAULT 'active',
            progress_percent REAL DEFAULT 0,
            modules_completed TEXT DEFAULT '[]',
            enrolled_at TEXT NOT NULL,
            completed_at TEXT,
            UNIQUE(user_id, course_id)
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS learning_certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            certificate_number TEXT NOT NULL,
            issued_at TEXT NOT NULL,
            UNIQUE(user_id, course_id)
        )
    """, [])


def _get_user_enrollment(user_id: int, course_id: int) -> Optional[dict]:
    result = execute_query(
        "SELECT * FROM learning_enrollments WHERE user_id = ? AND course_id = ?",
        [user_id, course_id],
    )
    rows = parse_rows(result)
    return rows[0] if rows else None


def _generate_certificate_number(user_id: int, course_id: int) -> str:
    now = datetime.now(timezone.utc)
    return f"MLC-{now.year}-{user_id:05d}-{course_id:04d}-{now.strftime('%m%d%H%M')}"


# ─── Courses ────────────────────────────────────────────────────────────────


class CourseEnrollBody(BaseModel):
    pass


class ProgressUpdateBody(BaseModel):
    progress_percent: Optional[float] = None
    module_id: Optional[int] = None


@router.get("/learning-center/courses")
def list_courses(
    category: Optional[str] = None,
    skill: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    _ensure_table()
    conditions = ["is_published = 1"]
    params: list = []
    if category:
        conditions.append("category = ?")
        params.append(category)
    if skill:
        conditions.append("skill_slug = ?")
        params.append(skill)
    if difficulty:
        conditions.append("difficulty = ?")
        params.append(difficulty)
    if search:
        conditions.append("(title LIKE ? OR description LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%"])
    where = f"WHERE {' AND '.join(conditions)}"
    offset = (page - 1) * page_size
    result = execute_query(
        f"SELECT id, title, description, category, skill_slug, difficulty, duration_hours, "
        f"instructor, thumbnail_url, price, currency, enrollment_count, avg_rating, created_at, updated_at "
        f"FROM learning_courses {where} ORDER BY enrollment_count DESC, created_at DESC LIMIT ? OFFSET ?",
        params + [page_size, offset],
    )
    courses = parse_rows(result) if result else []
    count_result = execute_query(
        f"SELECT COUNT(*) as total FROM learning_courses {where}", params
    )
    total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0
    return {"courses": courses, "total": total, "page": page, "page_size": page_size}


@router.get("/learning-center/courses/{course_id}")
def get_course(course_id: int):
    _ensure_table()
    result = execute_query(
        "SELECT id, title, description, category, skill_slug, difficulty, duration_hours, "
        "instructor, thumbnail_url, price, currency, enrollment_count, avg_rating, created_at, updated_at "
        "FROM learning_courses WHERE id = ? AND is_published = 1",
        [course_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Course not found")
    course = rows[0]
    modules_result = execute_query(
        "SELECT id, title, description, content_type, order_index, duration_minutes, created_at "
        "FROM learning_modules WHERE course_id = ? ORDER BY order_index ASC",
        [course_id],
    )
    course["modules"] = parse_rows(modules_result) if modules_result else []
    return course


@router.post("/learning-center/courses/{course_id}/enroll")
def enroll_in_course(course_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT id FROM learning_courses WHERE id = ? AND is_published = 1",
        [course_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = _get_user_enrollment(current_user.id, course_id)
    if existing:
        return {"message": "Already enrolled", "enrollment": existing}

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO learning_enrollments (user_id, course_id, status, progress_percent, modules_completed, enrolled_at) "
        "VALUES (?, ?, 'active', 0, '[]', ?)",
        [current_user.id, course_id, now],
    )
    execute_query(
        "UPDATE learning_courses SET enrollment_count = enrollment_count + 1 WHERE id = ?",
        [course_id],
    )
    return {"message": "Enrolled successfully"}


@router.get("/learning-center/my-courses")
def my_courses(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    _ensure_table()
    conditions = ["e.user_id = ?"]
    params: list = [current_user.id]
    if status:
        conditions.append("e.status = ?")
        params.append(status)
    where = f"WHERE {' AND '.join(conditions)}"
    offset = (page - 1) * page_size
    result = execute_query(
        f"SELECT e.id, e.course_id, e.status, e.progress_percent, e.modules_completed, "
        f"e.enrolled_at, e.completed_at, c.title, c.description, c.thumbnail_url, c.difficulty, c.duration_hours "
        f"FROM learning_enrollments e "
        f"JOIN learning_courses c ON e.course_id = c.id "
        f"{where} ORDER BY e.enrolled_at DESC LIMIT ? OFFSET ?",
        params + [page_size, offset],
    )
    enrollments = parse_rows(result) if result else []
    count_result = execute_query(
        f"SELECT COUNT(*) as total FROM learning_enrollments e {where}", params
    )
    total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0
    return {"enrollments": enrollments, "total": total, "page": page}


@router.post("/learning-center/courses/{course_id}/progress")
def update_progress(course_id: int, body: ProgressUpdateBody, current_user=Depends(get_current_user)):
    _ensure_table()
    enrollment = _get_user_enrollment(current_user.id, course_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled in this course")

    now = datetime.now(timezone.utc).isoformat()
    completed = json.loads(enrollment.get("modules_completed") or "[]")

    if body.module_id is not None:
        if body.module_id not in completed:
            completed.append(body.module_id)
        total_result = execute_query(
            "SELECT COUNT(*) as cnt FROM learning_modules WHERE course_id = ?", [course_id]
        )
        total_rows = parse_rows(total_result)
        total_modules = total_rows[0]["cnt"] if total_rows else 1
        progress = round((len(completed) / max(total_modules, 1)) * 100, 1)
    elif body.progress_percent is not None:
        progress = max(0.0, min(100.0, body.progress_percent))
    else:
        raise HTTPException(status_code=400, detail="Provide module_id or progress_percent")

    completed_at = now if progress >= 100 else None
    new_status = "completed" if progress >= 100 else "active"

    execute_query(
        "UPDATE learning_enrollments SET progress_percent = ?, modules_completed = ?, status = ?, "
        "completed_at = COALESCE(?, completed_at) WHERE id = ?",
        [progress, json.dumps(completed), new_status, completed_at, enrollment["id"]],
    )
    return {"progress_percent": progress, "status": new_status}


# ─── Modules ────────────────────────────────────────────────────────────────


@router.get("/learning-center/courses/{course_id}/modules")
def list_modules(course_id: int):
    _ensure_table()
    result = execute_query(
        "SELECT id, title, description, content_type, order_index, duration_minutes, created_at "
        "FROM learning_modules WHERE course_id = ? ORDER BY order_index ASC",
        [course_id],
    )
    modules = parse_rows(result) if result else []
    return {"modules": modules, "total": len(modules)}


@router.get("/learning-center/courses/{course_id}/modules/{module_id}")
def get_module(course_id: int, module_id: int):
    _ensure_table()
    result = execute_query(
        "SELECT id, course_id, title, description, content_type, content_json, order_index, duration_minutes, created_at "
        "FROM learning_modules WHERE id = ? AND course_id = ?",
        [module_id, course_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Module not found")
    module = rows[0]
    if module.get("content_json"):
        try:
            module["content"] = json.loads(module["content_json"])
        except (json.JSONDecodeError, TypeError):
            module["content"] = module["content_json"]
    else:
        module["content"] = None
    module.pop("content_json", None)
    return module


@router.post("/learning-center/courses/{course_id}/modules/{module_id}/complete")
def complete_module(course_id: int, module_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    mod_result = execute_query(
        "SELECT id FROM learning_modules WHERE id = ? AND course_id = ?",
        [module_id, course_id],
    )
    if not parse_rows(mod_result):
        raise HTTPException(status_code=404, detail="Module not found")

    enrollment = _get_user_enrollment(current_user.id, course_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled in this course")

    completed = json.loads(enrollment.get("modules_completed") or "[]")
    if module_id not in completed:
        completed.append(module_id)

    total_result = execute_query(
        "SELECT COUNT(*) as cnt FROM learning_modules WHERE course_id = ?", [course_id]
    )
    total_rows = parse_rows(total_result)
    total_modules = total_rows[0]["cnt"] if total_rows else 1
    progress = round((len(completed) / max(total_modules, 1)) * 100, 1)
    new_status = "completed" if progress >= 100 else "active"
    now = datetime.now(timezone.utc).isoformat()
    completed_at = now if progress >= 100 else None

    execute_query(
        "UPDATE learning_enrollments SET progress_percent = ?, modules_completed = ?, status = ?, "
        "completed_at = COALESCE(?, completed_at) WHERE id = ?",
        [progress, json.dumps(completed), new_status, completed_at, enrollment["id"]],
    )

    if progress >= 100:
        cert_result = execute_query(
            "SELECT id FROM learning_certificates WHERE user_id = ? AND course_id = ?",
            [current_user.id, course_id],
        )
        if not parse_rows(cert_result):
            cert_number = _generate_certificate_number(current_user.id, course_id)
            execute_query(
                "INSERT INTO learning_certificates (user_id, course_id, certificate_number, issued_at) "
                "VALUES (?, ?, ?, ?)",
                [current_user.id, course_id, cert_number, now],
            )

    return {
        "progress_percent": progress,
        "status": new_status,
        "module_completed": module_id,
        "certificate_issued": progress >= 100,
    }


# ─── Certificates ───────────────────────────────────────────────────────────


@router.get("/learning-center/certificates")
def list_certificates(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    _ensure_table()
    offset = (page - 1) * page_size
    result = execute_query(
        "SELECT cert.id, cert.certificate_number, cert.issued_at, "
        "c.id as course_id, c.title, c.category, c.difficulty, c.thumbnail_url, c.instructor "
        "FROM learning_certificates cert "
        "JOIN learning_courses c ON cert.course_id = c.id "
        "WHERE cert.user_id = ? ORDER BY cert.issued_at DESC LIMIT ? OFFSET ?",
        [current_user.id, page_size, offset],
    )
    certificates = parse_rows(result) if result else []
    count_result = execute_query(
        "SELECT COUNT(*) as total FROM learning_certificates WHERE user_id = ?",
        [current_user.id],
    )
    total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0
    return {"certificates": certificates, "total": total, "page": page}


@router.get("/learning-center/certificates/{certificate_id}")
def get_certificate(certificate_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT cert.id, cert.certificate_number, cert.issued_at, "
        "c.id as course_id, c.title, c.description, c.category, c.difficulty, c.duration_hours, c.instructor "
        "FROM learning_certificates cert "
        "JOIN learning_courses c ON cert.course_id = c.id "
        "WHERE cert.id = ? AND cert.user_id = ?",
        [certificate_id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Certificate not found")
    cert = rows[0]
    user_result = execute_query(
        "SELECT name, email FROM users WHERE id = ?", [current_user.id]
    )
    user_rows = parse_rows(user_result)
    if user_rows:
        cert["recipient_name"] = user_rows[0].get("name")
        cert["recipient_email"] = user_rows[0].get("email")
    return cert


# ─── Categories & Paths ─────────────────────────────────────────────────────


@router.get("/learning-center/categories")
def list_categories():
    _ensure_table()
    result = execute_query(
        "SELECT category, COUNT(*) as course_count, AVG(avg_rating) as avg_rating "
        "FROM learning_courses WHERE is_published = 1 AND category IS NOT NULL "
        "GROUP BY category ORDER BY course_count DESC",
        [],
    )
    rows = parse_rows(result) if result else []
    return {"categories": rows}


@router.get("/learning-center/paths")
def list_learning_paths():
    _ensure_table()
    result = execute_query(
        "SELECT id, title, description, category, skill_slug, difficulty, duration_hours, "
        "thumbnail_url, enrollment_count, avg_rating "
        "FROM learning_courses WHERE is_published = 1 "
        "ORDER BY category, difficulty DESC, order_index ASC",
        [],
    )
    courses = parse_rows(result) if result else []
    paths = {}
    for course in courses:
        cat = course.get("category") or "General"
        if cat not in paths:
            paths[cat] = {"category": cat, "title": f"{cat} Learning Path", "courses": [], "total_duration": 0}
        paths[cat]["courses"].append(course)
        paths[cat]["total_duration"] += course.get("duration_hours") or 0
    path_list = list(paths.values())
    for p in path_list:
        p["total_duration"] = round(p["total_duration"], 1)
        p["course_count"] = len(p["courses"])
    return {"paths": path_list, "total": len(path_list)}
