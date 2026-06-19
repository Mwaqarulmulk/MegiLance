# @AI-HINT: Knowledge base router — help articles and documentation
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


@router.get("/categories")
def get_categories():
    return {
        "categories": [
            {"id": 1, "name": "Getting Started", "slug": "getting-started", "article_count": 5},
            {"id": 2, "name": "Account & Billing", "slug": "account-billing", "article_count": 8},
            {"id": 3, "name": "Projects & Proposals", "slug": "projects-proposals", "article_count": 12},
            {"id": 4, "name": "Payments & Escrow", "slug": "payments-escrow", "article_count": 6},
            {"id": 5, "name": "Safety & Security", "slug": "safety-security", "article_count": 4},
        ]
    }


@router.get("/articles")
def get_articles(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
):
    where = "WHERE is_published = 1"
    params: list = []

    if category_id:
        where += " AND category_id = ?"
        params.append(category_id)
    if search:
        where += " AND (title LIKE ? OR content LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    result = execute_query(
        f"SELECT id, category_id, title, slug, excerpt, views, created_at, updated_at FROM knowledge_articles {where} ORDER BY created_at DESC",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.get("/articles/{article_id}")
def get_article(article_id: int):
    result = execute_query(
        "SELECT id, category_id, title, slug, content, excerpt, views, created_at, updated_at FROM knowledge_articles WHERE id = ? AND is_published = 1",
        [article_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Article not found")

    execute_query("UPDATE knowledge_articles SET views = views + 1 WHERE id = ?", [article_id])
    return rows[0]


@router.get("/search")
def search_articles(q: str = Query(..., min_length=1)):
    result = execute_query(
        "SELECT id, category_id, title, slug, excerpt, views FROM knowledge_articles WHERE is_published = 1 AND (title LIKE ? OR content LIKE ?) ORDER BY views DESC LIMIT 20",
        [f"%{q}%", f"%{q}%"],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.get("/popular")
def get_popular_articles():
    result = execute_query(
        "SELECT id, category_id, title, slug, excerpt, views FROM knowledge_articles WHERE is_published = 1 ORDER BY views DESC LIMIT 10",
        [],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.post("/articles/{article_id}/rate")
def rate_article(article_id: int, data: dict, current_user=Depends(get_current_user)):
    helpful = data.get("helpful", False)
    now = datetime.now(timezone.utc).isoformat()

    result = execute_query(
        "SELECT id FROM article_ratings WHERE article_id = ? AND user_id = ?",
        [article_id, current_user.id],
    )
    rows = parse_rows(result)

    if rows:
        execute_query("UPDATE article_ratings SET helpful = ?, updated_at = ? WHERE id = ?", [1 if helpful else 0, now, rows[0]["id"]])
    else:
        execute_query(
            "INSERT INTO article_ratings (article_id, user_id, helpful, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            [article_id, current_user.id, 1 if helpful else 0, now, now],
        )

    return {"message": "Rating submitted"}
