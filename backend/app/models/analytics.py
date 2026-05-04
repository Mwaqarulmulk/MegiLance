# @AI-HINT: Analytics event model for tracking platform usage metrics and user behavior
from sqlalchemy import String, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from datetime import datetime, timezone

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_type: Mapped[str] = mapped_column(String(50))
    user_id: Mapped[int] = mapped_column(Integer, nullable=True)
    session_id: Mapped[str] = mapped_column(String(255), nullable=True)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=True)
    entity_id: Mapped[int] = mapped_column(Integer, nullable=True)
    event_data: Mapped[str] = mapped_column(Text, nullable=True) # JSON
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
