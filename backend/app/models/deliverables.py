"""Deliverables service for milestone file submission and approval."""

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Column, String, DateTime, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
import enum

from app.db.session import Base


class DeliverableStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    REVISION_REQUESTED = "revision_requested"
    RESUBMITTED = "resubmitted"


class MilestoneDeliverable(Base):
    __tablename__ = "milestone_deliverables"

    id = Column(String(36), primary_key=True)
    milestone_id = Column(String(36), ForeignKey("milestones.id"), nullable=False)
    contract_id = Column(String(36), ForeignKey("contracts.id"), nullable=False)
    submitted_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(30), default=DeliverableStatus.DRAFT.value)
    submission_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    revision_count = Column(Integer, default=0)
    max_revisions = Column(Integer, default=3)
    submitted_at = Column(DateTime, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    files = relationship("DeliverableFile", back_populates="deliverable")


class DeliverableFile(Base):
    __tablename__ = "deliverable_files"

    id = Column(String(36), primary_key=True)
    deliverable_id = Column(String(36), ForeignKey("milestone_deliverables.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)  # bytes
    file_type = Column(String(100), nullable=True)
    version = Column(Integer, default=1)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    deliverable = relationship("MilestoneDeliverable", back_populates="files")


class DeliverableComment(Base):
    __tablename__ = "deliverable_comments"

    id = Column(String(36), primary_key=True)
    deliverable_id = Column(String(36), ForeignKey("milestone_deliverables.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
