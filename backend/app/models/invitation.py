# @AI-HINT: Invitation model for AI-matched project invitations
from sqlalchemy import String, Integer, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User
    from .project import Project


class Invitation(Base):
    """AI-matched project invitations sent to freelancers."""
    __tablename__ = "invitations"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    freelancer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    fit_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ai_reasoning: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)  # pending/accepted/rejected/expired
    freelancer_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    client_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    proposed_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    responded_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project")
    freelancer: Mapped["User"] = relationship("User", foreign_keys=[freelancer_id])
    client: Mapped["User"] = relationship("User", foreign_keys=[client_id])
