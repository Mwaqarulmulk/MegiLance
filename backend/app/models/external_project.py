# @AI-HINT: Model for external/scraped freelance project listings from multiple sources
# These are aggregated from RemoteOK, Jobicy, and other free APIs to provide
# freelancers with real project opportunities even before the platform has organic listings.

from sqlalchemy import String, Integer, Float, DateTime, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from datetime import datetime, timezone
from typing import Optional


class ExternalProject(Base):
    """
    External project listings scraped from free APIs.
    Sources: RemoteOK, Jobicy, Arbeitnow, etc.
    """
    __tablename__ = "external_projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    
    # Source tracking
    source: Mapped[str] = mapped_column(String(50))  # remoteok, jobicy, arbeitnow
    source_id: Mapped[str] = mapped_column(String(255), unique=True)  # Unique ID from source
    source_url: Mapped[str] = mapped_column(Text)  # Original listing URL
    
    # Project details
    title: Mapped[str] = mapped_column(String(500))
    company: Mapped[str] = mapped_column(String(255))
    company_logo: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description: Mapped[str] = mapped_column(Text)
    description_plain: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Stripped HTML
    
    # Classification
    category: Mapped[str] = mapped_column(String(100), default="Other")
    tags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array of tags/skills
    project_type: Mapped[str] = mapped_column(String(50), default="remote")  # remote, hybrid, onsite
    experience_level: Mapped[str] = mapped_column(String(50), default="any")
    
    # Budget / Compensation
    budget_min: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    budget_max: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    budget_currency: Mapped[str] = mapped_column(String(10), default="USD")
    budget_period: Mapped[str] = mapped_column(String(20), default="fixed")  # fixed, monthly, hourly
    
    # Location
    location: Mapped[str] = mapped_column(String(255), default="Remote")
    geo: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Application
    apply_url: Mapped[str] = mapped_column(Text)
    
    # Trust & Quality
    trust_score: Mapped[float] = mapped_column(Float, default=0.5)  # 0.0 - 1.0
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False)  # Flagged as potential scam
    flag_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timestamps
    posted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    scraped_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Engagement tracking
    views_count: Mapped[int] = mapped_column(Integer, default=0)
    clicks_count: Mapped[int] = mapped_column(Integer, default=0)
    saves_count: Mapped[int] = mapped_column(Integer, default=0)
