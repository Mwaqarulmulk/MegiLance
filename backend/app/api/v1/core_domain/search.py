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

router = APIRouter()


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

    result = search_freelancers_advanced(
        query=q,
        min_rate=min_rate,
        max_rate=max_rate,
        category=category,
        experience_level=experience_level,
        availability=availability,
        sort_by=sort_by,
        limit=page_size,
        offset=offset,
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
    result = global_search_freelancers(query=q, limit=limit)
    return result


@router.get("/autocomplete")
def search_autocomplete(
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(10, ge=1, le=20),
):
    """Autocomplete search suggestions"""
    items = autocomplete_freelancers(query=q, limit=limit)
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
