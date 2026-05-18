# @AI-HINT: Blog router — public blog posts and admin CMS via blog_service
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.schemas.blog import BlogPostCreate, BlogPostUpdate
from app.services.blog_service import BlogService, ensure_blog_table

router = APIRouter()


@router.get("")
@router.get("/")
async def list_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    is_published: Optional[bool] = None,
    is_news_trend: Optional[bool] = None,
):
    ensure_blog_table()
    return BlogService.get_posts(skip=skip, limit=limit, is_published=is_published, is_news_trend=is_news_trend)


@router.get("/{slug_or_id}")
async def get_post(slug_or_id: str):
    ensure_blog_table()
    # Try numeric ID first, then slug
    post = None
    if slug_or_id.isdigit():
        post = BlogService.get_post(int(slug_or_id))
    if not post:
        BlogService.increment_views(slug_or_id)
        post = BlogService.get_post_by_slug(slug_or_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("", status_code=201)
async def create_post(post: BlogPostCreate, current_user=Depends(require_admin)):
    ensure_blog_table()
    created = BlogService.create_post(post)
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create post")
    return created


@router.put("/{post_id}")
async def update_post(post_id: int, post: BlogPostUpdate, current_user=Depends(require_admin)):
    ensure_blog_table()
    updated = BlogService.update_post(post_id, post)
    if not updated:
        raise HTTPException(status_code=404, detail="Post not found")
    return updated


@router.delete("/{post_id}", status_code=204)
async def delete_post(post_id: int, current_user=Depends(require_admin)):
    ensure_blog_table()
    if not BlogService.delete_post(post_id):
        raise HTTPException(status_code=404, detail="Post not found")
