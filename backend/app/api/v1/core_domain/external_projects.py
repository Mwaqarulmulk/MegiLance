# @AI-HINT: External projects router — aggregated projects from external sources
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


@router.get("/")
async def list_external_projects(
    query: Optional[str] = None,
    category: Optional[str] = None,
    source: Optional[str] = None,
    project_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    min_budget: Optional[float] = None,
    tags: Optional[str] = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user=Depends(get_current_user),
):
    where = "WHERE 1=1"
    params: list = []

    if query:
        where += " AND (title LIKE ? OR description LIKE ?)"
        params.extend([f"%{query}%", f"%{query}%"])
    if category:
        where += " AND category = ?"
        params.append(category)
    if source:
        where += " AND source = ?"
        params.append(source)
    if project_type:
        where += " AND project_type = ?"
        params.append(project_type)
    if experience_level:
        where += " AND experience_level = ?"
        params.append(experience_level)
    if min_budget is not None:
        where += " AND budget >= ?"
        params.append(min_budget)
    if tags:
        where += " AND tags LIKE ?"
        params.append(f"%{tags}%")

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"SELECT id, title, description, category, source, project_type, experience_level, budget, tags, apply_url, created_at FROM external_projects {where} ORDER BY {sort_by} {sort_order} LIMIT ? OFFSET ?",
        params,
    )
    rows = parse_rows(result)

    count_result = execute_query(f"SELECT COUNT(*) as total FROM external_projects {where}", [p for p in params[:-2]])
    total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0

    sources_result = execute_query("SELECT DISTINCT source FROM external_projects", [])
    sources = [r["source"] for r in parse_rows(sources_result) or []]

    last_scraped_result = execute_query("SELECT MAX(created_at) as last_scraped FROM external_projects", [])
    last_scraped_rows = parse_rows(last_scraped_result)
    last_scraped = last_scraped_rows[0]["last_scraped"] if last_scraped_rows else None

    return {
        "projects": rows if rows else [],
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_more": total > page * page_size,
        "sources": sources,
        "last_scraped": last_scraped,
    }


@router.get("/{project_id}")
async def get_external_project(project_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, title, description, category, source, project_type, experience_level, budget, tags, apply_url, created_at FROM external_projects WHERE id = ?",
        [project_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Project not found")
    return rows[0]


@router.post("/{project_id}/click")
async def track_click(project_id: int, current_user=Depends(get_current_user)):
    result = execute_query("SELECT apply_url FROM external_projects WHERE id = ?", [project_id])
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Project not found")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO external_project_clicks (project_id, user_id, clicked_at) VALUES (?, ?, ?)",
        [project_id, current_user.id, now],
    )

    return {"apply_url": rows[0]["apply_url"], "tracked": True}


@router.get("/categories")
async def get_categories():
    result = execute_query(
        "SELECT category, COUNT(*) as count FROM external_projects GROUP BY category ORDER BY count DESC",
        [],
    )
    rows = parse_rows(result)
    return {"categories": rows if rows else []}


@router.get("/stats")
async def get_stats():
    total_result = execute_query("SELECT COUNT(*) as total FROM external_projects", [])
    total_rows = parse_rows(total_result)
    total = total_rows[0]["total"] if total_rows else 0

    source_result = execute_query("SELECT source, COUNT(*) as count FROM external_projects GROUP BY source", [])
    source_rows = parse_rows(source_result)
    by_source = {r["source"]: r["count"] for r in source_rows} if source_rows else {}

    last_scraped_result = execute_query("SELECT MAX(created_at) as last_scraped FROM external_projects", [])
    last_scraped_rows = parse_rows(last_scraped_result)
    last_scraped = last_scraped_rows[0]["last_scraped"] if last_scraped_rows else None

    return {"total": total, "by_source": by_source, "last_scraped": last_scraped}


@router.post("/scrape")
async def trigger_scrape(current_user=Depends(require_admin)):
    return {"message": "Scrape triggered", "scraped": 0}


@router.post("/{project_id}/flag")
async def flag_project(project_id: int, reason: str = Query(...), current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO external_project_flags (project_id, user_id, reason, created_at) VALUES (?, ?, ?, ?)",
        [project_id, current_user.id, reason, now],
    )
    return {"message": "Project flagged"}
