# @AI-HINT: Comments router — comment system for projects, gigs, profiles
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class CommentCreate(BaseModel):
    entity_type: str
    entity_id: int
    content: str
    parent_id: Optional[int] = None

class CommentUpdate(BaseModel):
    content: str


@router.get("")
def list_comments(
    entity_type: str = Query(...),
    entity_id: int = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT c.id, c.entity_type, c.entity_id, c.user_id, c.content, c.parent_id,
                  c.created_at, c.updated_at,
                  u.name as author_name, u.profile_image_url as author_avatar
           FROM comments c
           LEFT JOIN users u ON c.user_id = u.id
           WHERE c.entity_type = ? AND c.entity_id = ? AND c.parent_id IS NULL
           ORDER BY c.created_at DESC
           LIMIT ? OFFSET ?""",
        [entity_type, entity_id, page_size, offset],
    )
    rows = parse_rows(result)

    for row in rows:
        replies = execute_query(
            """SELECT c.id, c.user_id, c.content, c.parent_id, c.created_at,
                      u.name as author_name, u.profile_image_url as author_avatar
               FROM comments c LEFT JOIN users u ON c.user_id = u.id
               WHERE c.parent_id = ? ORDER BY c.created_at ASC""",
            [row["id"]],
        )
        row["replies"] = parse_rows(replies) or []

    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.post("")
def create_comment(request: CommentCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO comments (entity_type, entity_id, user_id, content, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [request.entity_type, request.entity_id, current_user.id, request.content, request.parent_id, now, now],
    )
    return {"message": "Comment created", "comment_id": result.get("last_insert_rowid")}


@router.put("/{comment_id}")
def update_comment(comment_id: int, request: CommentUpdate, current_user=Depends(get_current_user)):
    execute_query(
        "UPDATE comments SET content = ?, updated_at = ? WHERE id = ? AND user_id = ?",
        [request.content, datetime.now(timezone.utc).isoformat(), comment_id, current_user.id],
    )
    return {"message": "Comment updated"}


@router.delete("/{comment_id}")
def delete_comment(comment_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM comments WHERE id = ? AND user_id = ?", [comment_id, current_user.id])
    return {"message": "Comment deleted"}
