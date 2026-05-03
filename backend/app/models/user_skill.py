# @AI-HINT: UserSkill association model linking users to skills with endorsement counts
"""User skills model for MegiLance platform"""
from sqlalchemy import Integer, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from datetime import datetime, timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User
    from .skill import Skill

class UserSkill(Base):
    """
    User skills association table with proficiency levels
    """
    __tablename__ = "user_skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"), index=True)
    proficiency_level: Mapped[int] = mapped_column(Integer, default=1)  # 1-5 scale
    years_of_experience: Mapped[int] = mapped_column(Integer, default=0, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verified_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    verified_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="user_skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="user_skills")
    verifier: Mapped["User"] = relationship("User", foreign_keys=[verified_by])
