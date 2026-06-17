# @AI-HINT: Category model for project and gig categorization with hierarchical structure
"""
Category model for project categorization
"""
from sqlalchemy import String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional, List

if TYPE_CHECKING:
    from .category import Category


class Category(Base):
    """
    Categories table for organizing projects and gigs hierarchically
    """
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("categories.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)  # Featured on homepage
    project_count: Mapped[int] = mapped_column(Integer, default=0)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Self-referential relationship for hierarchy
    parent: Mapped[Optional["Category"]] = relationship("Category", remote_side=[id], back_populates="children")
    children: Mapped[List["Category"]] = relationship("Category", back_populates="parent")
