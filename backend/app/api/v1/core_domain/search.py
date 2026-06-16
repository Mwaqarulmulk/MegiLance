# @AI-HINT: Search API endpoints — freelancer search, project search, global search
from fastapi import APIRouter, Query
from typing import Optional
import logging
import json
logger = logging.getLogger(__name__)

from app.services.search_service import (
    search_freelancers_advanced,
    global_search_freelancers,
    autocomplete_freelancers,
)
from app.services.search_fts import SearchService
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def _search_projects(q: str, limit: int, offset: int = 0,
                     budget_min=None, budget_max=None, category=None):
    conditions = ["status = 'open'"]
    params: list = []
    if q:
        conditions.append("(title LIKE ? OR description LIKE ? OR skills LIKE ?)")
        like = f"%{q}%"
        params.extend([like, like, like])
    if budget_min is not None:
        conditions.append("budget_max >= ?"); params.append(budget_min)
    if budget_max is not None:
        conditions.append("budget_min <= ?"); params.append(budget_max)
    if category:
        conditions.append("category LIKE ?"); params.append(f"%{category}%")
    where = " AND ".join(conditions)
    total_rows = parse_rows(execute_query(f"SELECT COUNT(*) as c FROM projects WHERE {where}", params))
    total = total_rows[0]["c"] if total_rows else 0
    rows = parse_rows(execute_query(
        f"""SELECT id, title, description, category, budget_type, budget_min, budget_max,
                   skills, experience_level, status, created_at
            FROM projects WHERE {where} ORDER BY created_at DESC LIMIT ? OFFSET ?""",
        params + [limit, offset],
    )) or []
    for r in rows:
        if isinstance(r.get("skills"), str) and r["skills"]:
            r["skills"] = [s.strip() for s in r["skills"].split(",") if s.strip()]
    return {"items": rows, "total": total}


@router.get("/freelancers")
def search_freelancers(
    q: str = Query("", max_length=200),
    min_rate: Optional[float] = Query(None),
    max_rate: Optional[float] = Query(None),
    category: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    availability: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("newest"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
):
    """Search freelancers with advanced filters"""
    offset = (page - 1) * page_size

    # search_freelancers_advanced takes (where_clause, params, sort) where the last
    # two params are LIMIT and OFFSET. Build the query here.
    conditions = ["u.user_type = 'freelancer'", "u.is_active = 1"]
    params: list = []
    # Quality gate — keep the public directory to real, presentable freelancers.
    conditions.append("u.email NOT LIKE '%@example.com'")
    conditions.append("u.email NOT LIKE 'test_%'")
    conditions.append("(u.profile_visibility IS NULL OR u.profile_visibility = 'public')")
    if q:
        conditions.append("(u.name LIKE ? OR u.bio LIKE ? OR u.skills LIKE ?)")
        like = f"%{q}%"
        params.extend([like, like, like])
    if min_rate is not None:
        conditions.append("u.hourly_rate >= ?")
        params.append(min_rate)
    if max_rate is not None:
        conditions.append("u.hourly_rate <= ?")
        params.append(max_rate)
    if category:
        conditions.append("u.industry_focus LIKE ?")
        params.append(f"%{category}%")
    if experience_level:
        conditions.append("u.experience_level = ?")
        params.append(experience_level)
    if availability:
        conditions.append("u.availability_status = ?")
        params.append(availability)

    params.extend([page_size, offset])
    result = search_freelancers_advanced(
        " AND ".join(conditions), params, sort=sort_by or "newest"
    )

    items = result.get("items", [])
    for item in items:
        if isinstance(item.get("skills"), str):
            try:
                item["skills"] = json.loads(item["skills"])
            except (json.JSONDecodeError, TypeError):
                item["skills"] = []

    return {
        "items": items,
        "total": result.get("total", 0),
        "page": page,
        "page_size": page_size,
        "facets": result.get("facets", {}),
    }


@router.get("/global")
def global_search(
    q: str = Query(..., min_length=1, max_length=200),
    limit: int = Query(20, ge=1, le=50),
):
    """Global search across freelancers and projects"""
    result = global_search_freelancers(search_term=q, limit=limit)
    return result


@router.get("/autocomplete")
def search_autocomplete(
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(10, ge=1, le=20),
):
    """Autocomplete search suggestions"""
    items = autocomplete_freelancers(search_term=q, limit=limit)
    return {"items": items}


@router.get("/fts")
def fts_search(
    q: str = Query(..., min_length=1, max_length=200),
    type: str = Query("freelancer"),
    min_rate: Optional[float] = Query(None),
    max_rate: Optional[float] = Query(None),
    location: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
):
    """Full-text search using FTS5"""
    offset = (page - 1) * page_size

    if type == "freelancer":
        results = SearchService.search_freelancers(
            query=q,
            min_rate=min_rate,
            max_rate=max_rate,
            location=location,
            limit=page_size,
            offset=offset,
        )
        return {
            "items": results.get("items", []),
            "total": results.get("total", 0),
            "page": page,
        }

    return {"items": [], "total": 0, "page": page}


@router.get("")
def global_search_root(
    q: str = Query(..., min_length=1, max_length=200),
    limit: int = Query(20, ge=1, le=50),
):
    """Global search across freelancers and projects (used by the navbar/global search)."""
    freelancers = []
    try:
        fl = global_search_freelancers(search_term=q, limit=limit)
        freelancers = fl.get("items", []) if isinstance(fl, dict) else (fl or [])
    except Exception:
        freelancers = []
    projects = _search_projects(q, limit=limit).get("items", [])
    return {
        "query": q,
        "freelancers": freelancers,
        "projects": projects,
        "total": len(freelancers) + len(projects),
    }


@router.get("/projects")
def search_projects(
    q: str = Query("", max_length=200),
    budget_min: Optional[float] = Query(None),
    budget_max: Optional[float] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    limit: Optional[int] = Query(None, ge=1, le=50),
    offset: Optional[int] = Query(None, ge=0),
):
    """Search open projects with filters."""
    lim = limit or page_size
    off = offset if offset is not None else (page - 1) * page_size
    res = _search_projects(q, limit=lim, offset=off, budget_min=budget_min, budget_max=budget_max, category=category)
    return {"items": res["items"], "total": res["total"], "page": page, "page_size": lim}


@router.get("/suggestions")
def search_suggestions(
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(10, ge=1, le=20),
):
    """Search suggestions (freelancer-name/skill based)."""
    try:
        items = autocomplete_freelancers(search_term=q, limit=limit)
    except Exception:
        items = []
    return {"items": items, "suggestions": items}


@router.get("/trending")
def search_trending(
    type: str = Query("projects"),
    limit: int = Query(10, ge=1, le=30),
):
    """Trending projects or freelancers (most recent / active)."""
    if type == "freelancers":
        try:
            rows = parse_rows(execute_query(
                """SELECT id, name, bio, skills, hourly_rate, profile_image_url
                   FROM users WHERE user_type='freelancer' AND is_active=1
                   AND email NOT LIKE '%@example.com'
                   ORDER BY id DESC LIMIT ?""", [limit])) or []
            return {"type": type, "items": rows}
        except Exception:
            return {"type": type, "items": []}
    res = _search_projects("", limit=limit)
    return {"type": "projects", "items": res["items"]}
