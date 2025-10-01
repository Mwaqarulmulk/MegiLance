from sqlalchemy import String, Integer, Float, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from datetime import datetime
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User
    from .project import Project

class Contract(Base):
    __tablename__ = "contracts"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)  # Blockchain contract address
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    freelancer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    client_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    value: Mapped[float] = mapped_column(Float)  # USDC value
    status: Mapped[str] = mapped_column(String(20), default="active")  # active, completed, disputed
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)
    description: Mapped[str] = mapped_column(Text)
    milestones: Mapped[str] = mapped_column(Text)  # JSON string of milestones
    terms: Mapped[str] = mapped_column(Text)  # JSON string of terms
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project: Mapped["Project"] = relationship("Project")
    freelancer: Mapped["User"] = relationship("User", foreign_keys=[freelancer_id])
    client: Mapped["User"] = relationship("User", foreign_keys=[client_id])