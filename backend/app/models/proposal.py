from sqlalchemy import String, Integer, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from datetime import datetime
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User
    from .project import Project

class Proposal(Base):
    __tablename__ = "proposals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    freelancer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    cover_letter: Mapped[str] = mapped_column(Text)
    estimated_hours: Mapped[int] = mapped_column(Integer)
    hourly_rate: Mapped[float] = mapped_column(Float)
    availability: Mapped[str] = mapped_column(String(20))  # immediate, 1-2_weeks, 1_month, flexible
    attachments: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string of attachment URLs
    status: Mapped[str] = mapped_column(String(20), default="submitted")  # submitted, accepted, rejected, withdrawn
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="proposals")
    freelancer: Mapped["User"] = relationship("User", foreign_keys=[freelancer_id])