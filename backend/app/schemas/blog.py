# @AI-HINT: Pydantic schemas for Blog CMS API - create, update, and response models
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class BlogPostBase(BaseModel):
    title: str
    slug: str
    excerpt: str
    content: str
    image_url: Optional[str] = None
    author: str
    tags: List[str] = []
    is_published: bool = False
    is_news_trend: bool = False  # To distinguish between Blog and News Trend
    views: int = 0
    reading_time: int = 0  # In minutes

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    author: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None
    is_news_trend: Optional[bool] = None
    views: Optional[int] = None
    reading_time: Optional[int] = None

class BlogPostInDB(BlogPostBase):
    id: int
    created_at: datetime
    updated_at: datetime

class BlogPostResponse(BlogPostBase):
    id: int
    created_at: datetime
    updated_at: datetime
