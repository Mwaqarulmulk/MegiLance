# @AI-HINT: Time entry model for tracking freelancer work hours on contracts
"""
Time entry model for tracking freelancer work hours
"""
from sqlalchemy import String, Integer, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from .user import User
    from .contract import Contract


class TimeEntry(Base):
    """
    Time entries table for tracking work hours on contracts
    """
    __tablename__ = "time_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    contract_id: Mapped[int] = mapped_column(ForeignKey("contracts.id"), index=True)
    start_time: Mapped[datetime] = mapped_column(DateTime)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Calculated when stopped
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    billable: Mapped[bool] = mapped_column(Boolean, default=True)
    hourly_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Calculated: (duration/60) * hourly_rate
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True)  # draft, submitted, approved, rejected, invoiced
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    contract: Mapped["Contract"] = relationship("Contract", back_populates="time_entries")
