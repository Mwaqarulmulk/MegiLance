# @AI-HINT: Favorite model for user bookmarks on projects, freelancers, and gigs
"""
Favorite model for user bookmarks
"""
from sqlalchemy import String, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from datetime import datetime, timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User


class Favorite(Base):
    """
    Favorites table for bookmarking projects and freelancers
    """
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint('user_id', 'target_type', 'target_id', name='uq_favorite'),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    target_type: Mapped[str] = mapped_column(String(20), index=True)  # 'project' or 'freelancer'
    target_id: Mapped[int] = mapped_column(Integer, index=True)  # ID of project or user
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
