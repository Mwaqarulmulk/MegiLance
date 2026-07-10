# @AI-HINT: Gig Revision model for tracking revision requests and deliveries within an order
"""Gig Revision model for tracking revisions."""

from sqlalchemy import String, Integer, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User
    from .gig_order import GigOrder


class GigRevision(Base):
    """
    Gig revision model for tracking revision requests and deliveries.
    Each revision request creates a new entry for full tracking.
    """
    __tablename__ = "gig_revisions"

    id: Mapped[int] = mapped_column(primary_key=True)
    
    # References
    order_id: Mapped[int] = mapped_column(ForeignKey("gig_orders.id"), index=True)
    requested_by: Mapped[int] = mapped_column(ForeignKey("users.id"))  # Buyer
    
    # Revision Details
    revision_number: Mapped[int] = mapped_column(Integer)  # 1, 2, 3, etc.
    request_description: Mapped[str] = mapped_column(Text)  # What the buyer wants changed
    request_files: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array of reference files
    
    # Delivery
    delivery_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    delivery_files: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array of delivered files
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Status
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, in_progress, delivered, accepted
    
    # Was this an extra (paid) revision?
    is_extra: Mapped[bool] = mapped_column(Boolean, default=False)
    extra_cost: Mapped[float] = mapped_column(default=0.0)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    order: Mapped["GigOrder"] = relationship("GigOrder", back_populates="revisions")
    requester: Mapped["User"] = relationship("User", foreign_keys=[requested_by])

    def __repr__(self):
        return f"<GigRevision #{self.revision_number} for Order {self.order_id}>"
