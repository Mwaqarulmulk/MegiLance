from sqlalchemy import String, Integer, Float, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from datetime import datetime
from typing import List, TYPE_CHECKING
import enum

if TYPE_CHECKING:
    from .user import User
    from .proposal import Proposal

class ProjectCategory(enum.Enum):
    """Project category enumeration"""
    WEB_DEVELOPMENT = "Web Development"
    MOBILE_DEVELOPMENT = "Mobile Development"
    DATA_SCIENCE = "Data Science & Analytics"
    DESIGN = "Design & Creative"
    WRITING = "Writing & Content"
    MARKETING = "Marketing & Sales"
    VIDEO_EDITING = "Video & Animation"
    OTHER = "Other"

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(100))
    budget_type: Mapped[str] = mapped_column(String(20))  # Fixed or Hourly
    budget_min: Mapped[float] = mapped_column(Float, nullable=True)
    budget_max: Mapped[float] = mapped_column(Float, nullable=True)
    experience_level: Mapped[str] = mapped_column(String(20))  # Entry, Intermediate, Expert
    estimated_duration: Mapped[str] = mapped_column(String(50))  # Less than 1 week, 1-4 weeks, etc.
    skills: Mapped[str] = mapped_column(Text)  # JSON string of skills
    client_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(20), default="open")  # open, in_progress, completed, cancelled
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    client: Mapped["User"] = relationship("User", foreign_keys=[client_id])
    proposals: Mapped[List["Proposal"]] = relationship("Proposal", back_populates="project")