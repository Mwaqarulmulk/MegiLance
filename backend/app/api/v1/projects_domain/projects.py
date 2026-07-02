# @AI-HINT: Projects router — CRUD for projects, listing, details, status management
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel
from typing import Optional, List, Union
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, get_current_user_from_token
from app.db.turso_http import execute_query, parse_rows, parse_date
from app.services.db_utils import get_val as _get_val, safe_str as _safe_str

router = APIRouter()


class ProjectCreate(BaseModel):
    title: str
    description: str
    category: str
    budget_type: str = "fixed"
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    skills: Optional[Union[str, List[str]]] = None
    duration: Optional[str] = None
    estimated_duration: Optional[str] = None
    experience_level: Optional[str] = None
    status: Optional[str] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    budget_type: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    skills: Optional[Union[str, List[str]]] = None
    duration: Optional[str] = None
    experience_level: Optional[str] = None
    status: Optional[str] = None


def _project_from_row(row) -> dict:
    if isinstance(row, dict):
        return {
            "id": _safe_str(row.get("id")),
            "title": _safe_str(row.get("title")),
            "description": _safe_str(row.get("description")),
            "category": _safe_str(row.get("category")),
            "budget_type": _safe_str(row.get("budget_type")),
            "budget_min": float(row.get("budget_min") or 0),
            "budget_max": float(row.get("budget_max") or 0),
            "skills": _safe_str(row.get("skills")),
            "estimated_duration": _safe_str(row.get("estimated_duration")),
            "experience_level": _safe_str(row.get("experience_level")),
            "status": _safe_str(row.get("status")),
            "client_id": _safe_str(row.get("client_id")),
            "created_at": parse_date(row.get("created_at")),
            "updated_at": parse_date(row.get("updated_at")),
            "proposals_count": int(row.get("proposals_count") or 0),
            "client_name": _safe_str(row.get("client_name")),
        }
    return {
        "id": _safe_str(_get_val(row, 0)),
        "title": _safe_str(_get_val(row, 1)),
        "description": _safe_str(_get_val(row, 2)),
        "category": _safe_str(_get_val(row, 3)),
        "budget_type": _safe_str(_get_val(row, 4)),
        "budget_min": float(_get_val(row, 5) or 0),
        "budget_max": float(_get_val(row, 6) or 0),
        "skills": _safe_str(_get_val(row, 7)),
        "estimated_duration": _safe_str(_get_val(row, 8)),
        "experience_level": _safe_str(_get_val(row, 9)),
        "status": _safe_str(_get_val(row, 10)),
        "client_id": _safe_str(_get_val(row, 11)),
        "created_at": parse_date(_get_val(row, 12)),
        "updated_at": parse_date(_get_val(row, 13)),
        "proposals_count": int(_get_val(row, 14) or 0),
        "client_name": _safe_str(_get_val(row, 15)),
    }


@router.get("")
def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
):
    offset = (page - 1) * page_size
    where = "WHERE 1=1"
    params: list = []

    if status:
        where += " AND p.status = ?"
        params.append(status)
    else:
        where += " AND p.status = 'open'"

    if category:
        where += " AND p.category = ?"
        params.append(category)
    if search:
        where += " AND (p.title LIKE ? OR p.description LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    sql = f"""
        SELECT p.id, p.title, p.description, p.category, p.budget_type,
               p.budget_min, p.budget_max, p.skills, p.estimated_duration, p.experience_level,
               p.status, p.client_id, p.created_at, p.updated_at,
               (SELECT COUNT(*) FROM proposals pr WHERE pr.project_id = p.id) as proposals_count,
               u.name as client_name
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        {where}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    """
    params.extend([page_size, offset])

    result = execute_query(sql, params)
    rows = parse_rows(result)

    projects = [_project_from_row(r) for r in rows] if rows else []

    count_result = execute_query(
        f"SELECT COUNT(*) as total FROM projects p {where}",
        [p for p in params[:-2]],
    )
    total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0

    return {
        "items": projects,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/my-projects")
def my_projects(current_user=Depends(get_current_user)):
    result = execute_query(
        """SELECT p.id, p.title, p.description, p.category, p.budget_type,
                  p.budget_min, p.budget_max, p.skills, p.estimated_duration, p.experience_level,
                  p.status, p.client_id, p.created_at, p.updated_at,
                  (SELECT COUNT(*) FROM proposals pr WHERE pr.project_id = p.id) as proposals_count,
                  u.name as client_name
           FROM projects p
           LEFT JOIN users u ON p.client_id = u.id
           WHERE p.client_id = ?
           ORDER BY p.created_at DESC""",
        [current_user.id],
    )
    rows = parse_rows(result)
    projects = [_project_from_row(r) for r in rows] if rows else []
    return {"items": projects, "total": len(projects), "page": 1, "page_size": 20, "total_pages": 1}


@router.get("/{project_id}")
def get_project(project_id: str):
    result = execute_query(
        """SELECT p.id, p.title, p.description, p.category, p.budget_type,
                  p.budget_min, p.budget_max, p.skills, p.estimated_duration, p.experience_level,
                  p.status, p.client_id, p.created_at, p.updated_at,
                  (SELECT COUNT(*) FROM proposals pr WHERE pr.project_id = p.id) as proposals_count,
                  u.name as client_name
           FROM projects p
           LEFT JOIN users u ON p.client_id = u.id
           WHERE p.id = ?""",
        [project_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Project not found")
    return _project_from_row(rows[0])


@router.post("", status_code=201)
def create_project(request: ProjectCreate, current_user=Depends(get_current_user)):
    # RBAC: only clients (and admins) may post projects; freelancers submit proposals instead.
    role = (getattr(current_user, "role", "") or "").lower()
    if role not in ("client", "admin"):
        raise HTTPException(status_code=403, detail="Only clients can post projects. Switch to a client account to hire.")

    now = datetime.now(timezone.utc).isoformat()

    skills_str = request.skills
    if isinstance(skills_str, list):
        skills_str = ",".join(skills_str)

    result = execute_query(
        """INSERT INTO projects (title, description, category, budget_type, budget_min, budget_max,
                  skills, estimated_duration, experience_level, status, client_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?)""",
        [
            request.title, request.description, request.category, request.budget_type,
            request.budget_min or 0, request.budget_max or 0, skills_str or "",
            request.duration or request.estimated_duration or "", request.experience_level or "",
            current_user.id, now, now,
        ],
    )

    if result is None:
        raise HTTPException(status_code=500, detail="Failed to create project")

    id_result = execute_query(
        "SELECT id FROM projects WHERE client_id = ? AND title = ? ORDER BY id DESC LIMIT 1",
        [current_user.id, request.title],
    )
    project_id = None
    if id_result and id_result.get("rows"):
        raw = id_result["rows"][0][0]
        if isinstance(raw, dict):
            raw = raw.get("value")
        project_id = int(raw) if raw else None

    return {"message": "Project created successfully", "project_id": project_id, "title": request.title}


@router.put("/{project_id}")
def update_project(project_id: str, request: ProjectUpdate, current_user=Depends(get_current_user)):
    _ALLOWED_PROJECT_COLUMNS = frozenset({
        "title", "description", "category", "budget_type",
        "budget_min", "budget_max", "skills", "estimated_duration",
        "experience_level", "status",
    })
    result = execute_query(
        "SELECT id FROM projects WHERE id = ? AND client_id = ?",
        [project_id, current_user.id],
    )
    if not parse_rows(result):
        raise HTTPException(status_code=404, detail="Project not found or not yours")

    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Validate column names against allowlist
    for k in updates:
        if k not in _ALLOWED_PROJECT_COLUMNS:
            raise HTTPException(status_code=400, detail=f"Invalid field: {k}")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), project_id]

    execute_query(f"UPDATE projects SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Project updated successfully"}


@router.delete("/{project_id}")
def delete_project(project_id: str, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id FROM projects WHERE id = ? AND client_id = ?",
        [project_id, current_user.id],
    )
    if not parse_rows(result):
        raise HTTPException(status_code=404, detail="Project not found or not yours")

    execute_query("DELETE FROM projects WHERE id = ?", [project_id])
    return {"message": "Project deleted successfully"}


@router.post("/{project_id}/close")
def close_project(project_id: str, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id FROM projects WHERE id = ? AND client_id = ?",
        [project_id, current_user.id],
    )
    if not parse_rows(result):
        raise HTTPException(status_code=404, detail="Project not found or not yours")

    now = datetime.now(timezone.utc).isoformat()
    execute_query("UPDATE projects SET status = 'closed', updated_at = ? WHERE id = ?", [now, project_id])
    return {"message": "Project closed successfully"}
