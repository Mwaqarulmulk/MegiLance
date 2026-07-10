# @AI-HINT: Gig Delivery model for tracking order deliveries (can have multiple before acceptance)
"""Gig Delivery model for tracking order deliveries."""

from sqlalchemy import String, Integer, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User
    from .gig_order import GigOrder


class GigDelivery(Base):
    """
    Gig delivery model for tracking each delivery attempt.
    Orders can have multiple deliveries before final acceptance.
    """
    __tablename__ = "gig_deliveries"

    id: Mapped[int] = mapped_column(primary_key=True)
    
    # References
    order_id: Mapped[int] = mapped_column(ForeignKey("gig_orders.id"), index=True)
    delivered_by: Mapped[int] = mapped_column(ForeignKey("users.id"))  # Seller
    
    # Delivery Details
    delivery_number: Mapped[int] = mapped_column(Integer)  # 1, 2, 3, etc.
    message: Mapped[str] = mapped_column(Text)  # Seller's delivery message
    files: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array of file URLs
    source_files: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Source files if included
    
    # Status
    status: Mapped[str] = mapped_column(String(20), default="delivered")  # delivered, accepted, revision_requested
    
    # Response
    buyer_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    responded_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Was this the final accepted delivery?
    is_final: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    order: Mapped["GigOrder"] = relationship("GigOrder", back_populates="deliveries")
    seller: Mapped["User"] = relationship("User", foreign_keys=[delivered_by])

    def __repr__(self):
        return f"<GigDelivery #{self.delivery_number} for Order {self.order_id}>"
