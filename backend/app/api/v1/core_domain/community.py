# @AI-HINT: Community router — community hubs, posts, announcements
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class PostCreate(BaseModel):
    title: str
    content: str
    hub_id: Optional[str] = "general"
    post_type: Optional[str] = "discussion"


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


@router.get("/hubs")
def list_hubs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
):
    offset = (page - 1) * page_size
    try:
        result = execute_query(
            "SELECT id, name, description, icon, member_count, post_count, created_at "
            "FROM community_hubs ORDER BY member_count DESC LIMIT ? OFFSET ?",
            [page_size, offset],
        )
        hubs = parse_rows(result)
        count_result = execute_query("SELECT COUNT(*) as total FROM community_hubs", [])
        total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0
        return {"hubs": hubs if hubs else [], "total": total, "page": page}
    except Exception as e:
        logger.warning(f"community_hubs table not available: {e}")
        return {"hubs": [], "total": 0, "page": page}


@router.get("/hubs/{hub_id}")
def get_hub(hub_id: str):
    try:
        result = execute_query(
            "SELECT id, name, description, icon, member_count, post_count, created_at "
            "FROM community_hubs WHERE id = ?",
            [hub_id],
        )
        rows = parse_rows(result)
        if not rows:
            raise HTTPException(status_code=404, detail="Hub not found")
        return rows[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching hub: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch hub")


@router.get("/posts")
def list_posts(
    hub_id: Optional[str] = None,
    post_type: Optional[str] = None,
    author_id: Optional[int] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at", pattern="^(created_at|likes_count|comments_count)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user=Depends(get_current_user),
):
    where = "WHERE 1=1"
    params: list = []

    if hub_id:
        where += " AND p.hub_id = ?"
        params.append(hub_id)
    if post_type:
        where += " AND p.post_type = ?"
        params.append(post_type)
    if author_id:
        where += " AND p.author_id = ?"
        params.append(author_id)
    if search:
        where += " AND (p.title LIKE ? OR p.content LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    allowed_sorts = {"created_at", "likes_count", "comments_count"}
    sort_col = sort_by if sort_by in allowed_sorts else "created_at"
    direction = "DESC" if sort_order == "desc" else "ASC"
    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    try:
        result = execute_query(
            f"SELECT p.id, p.title, p.content, p.hub_id, p.post_type, p.author_id, "
            f"p.likes_count, p.comments_count, p.is_pinned, p.created_at, "
            f"u.name as author_name, u.profile_image_url as author_avatar "
            f"FROM community_posts p "
            f"LEFT JOIN users u ON p.author_id = u.id "
            f"{where} "
            f"ORDER BY p.is_pinned DESC, p.{sort_col} {direction} "
            f"LIMIT ? OFFSET ?",
            params,
        )
        posts = parse_rows(result)

        count_params = params[:-2]
        count_result = execute_query(
            f"SELECT COUNT(*) as total FROM community_posts p {where}",
            count_params,
        )
        total = parse_rows(count_result)[0]["total"] if parse_rows(count_result) else 0

        return {"posts": posts if posts else [], "total": total, "page": page, "page_size": page_size}
    except Exception as e:
        logger.error(f"Error listing posts: {e}")
        raise HTTPException(status_code=500, detail="Failed to list posts")


@router.post("/posts")
def create_post(
    post: PostCreate,
    current_user=Depends(get_current_user),
):
    now = datetime.now(timezone.utc).isoformat()
    try:
        result = execute_query(
            "INSERT INTO community_posts (title, content, hub_id, post_type, author_id, likes_count, comments_count, is_pinned, created_at) "
            "VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?)",
            [post.title, post.content, post.hub_id, post.post_type, current_user.id, now],
        )
        post_id = result.get("last_insert_rowid") if result else None

        if post_id:
            execute_query(
                "UPDATE community_hubs SET post_count = post_count + 1 WHERE id = ?",
                [post.hub_id],
            )

        return {
            "id": post_id,
            "title": post.title,
            "content": post.content,
            "hub_id": post.hub_id,
            "post_type": post.post_type,
            "author_id": current_user.id,
            "created_at": now,
        }
    except Exception as e:
        logger.error(f"Error creating post: {e}")
        raise HTTPException(status_code=500, detail="Failed to create post")


@router.get("/posts/{post_id}")
def get_post(post_id: int, current_user=Depends(get_current_user)):
    try:
        result = execute_query(
            "SELECT p.id, p.title, p.content, p.hub_id, p.post_type, p.author_id, "
            "p.likes_count, p.comments_count, p.is_pinned, p.created_at, "
            "u.name as author_name, u.profile_image_url as author_avatar "
            "FROM community_posts p "
            "LEFT JOIN users u ON p.author_id = u.id "
            "WHERE p.id = ?",
            [post_id],
        )
        rows = parse_rows(result)
        if not rows:
            raise HTTPException(status_code=404, detail="Post not found")

        post_data = rows[0]

        execute_query(
            "UPDATE community_posts SET views_count = COALESCE(views_count, 0) + 1 WHERE id = ?",
            [post_id],
        )

        comments_result = execute_query(
            "SELECT c.id, c.content, c.author_id, c.created_at, "
            "u.name as author_name, u.profile_image_url as author_avatar "
            "FROM community_post_comments c "
            "LEFT JOIN users u ON c.author_id = u.id "
            "WHERE c.post_id = ? ORDER BY c.created_at ASC",
            [post_id],
        )
        post_data["comments"] = parse_rows(comments_result) or []

        liked_result = execute_query(
            "SELECT COUNT(*) as cnt FROM community_post_likes WHERE post_id = ? AND user_id = ?",
            [post_id, current_user.id],
        )
        liked_rows = parse_rows(liked_result)
        post_data["is_liked"] = (liked_rows[0]["cnt"] > 0) if liked_rows else False

        return post_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching post: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch post")


@router.post("/posts/{post_id}/like")
def like_post(post_id: int, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    try:
        existing = execute_query(
            "SELECT id FROM community_post_likes WHERE post_id = ? AND user_id = ?",
            [post_id, current_user.id],
        )
        existing_rows = parse_rows(existing)

        if existing_rows:
            execute_query(
                "DELETE FROM community_post_likes WHERE post_id = ? AND user_id = ?",
                [post_id, current_user.id],
            )
            execute_query(
                "UPDATE community_posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?",
                [post_id],
            )
            return {"liked": False, "likes_count": None}

        execute_query(
            "INSERT INTO community_post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)",
            [post_id, current_user.id, now],
        )
        execute_query(
            "UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?",
            [post_id],
        )

        count_result = execute_query(
            "SELECT likes_count FROM community_posts WHERE id = ?",
            [post_id],
        )
        count_rows = parse_rows(count_result)
        new_count = count_rows[0]["likes_count"] if count_rows else None

        return {"liked": True, "likes_count": new_count}
    except Exception as e:
        logger.error(f"Error toggling like: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle like")


@router.get("/stats")
def get_community_stats():
    try:
        hubs_result = execute_query("SELECT COUNT(*) as total FROM community_hubs", [])
        hubs = parse_rows(hubs_result)
        total_hubs = hubs[0]["total"] if hubs else 0

        posts_result = execute_query("SELECT COUNT(*) as total FROM community_posts", [])
        posts = parse_rows(posts_result)
        total_posts = posts[0]["total"] if posts else 0

        discussions_result = execute_query(
            "SELECT COUNT(*) as total FROM community_posts WHERE post_type = 'discussion'", []
        )
        discussions = parse_rows(discussions_result)
        total_discussions = discussions[0]["total"] if discussions else 0

        members_result = execute_query("SELECT COUNT(DISTINCT author_id) as total FROM community_posts", [])
        members = parse_rows(members_result)
        unique_members = members[0]["total"] if members else 0

        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        active_today_result = execute_query(
            "SELECT COUNT(DISTINCT author_id) as total FROM community_posts WHERE DATE(created_at) = ?",
            [today],
        )
        active_today = parse_rows(active_today_result)
        active_count = active_today[0]["total"] if active_today else 0

        return {
            "total_hubs": total_hubs,
            "total_posts": total_posts,
            "total_discussions": total_discussions,
            "unique_members": unique_members,
            "active_today": active_count,
        }
    except Exception as e:
        logger.error(f"Error fetching community stats: {e}")
        return {"total_hubs": 0, "total_posts": 0, "total_discussions": 0, "unique_members": 0, "active_today": 0}
