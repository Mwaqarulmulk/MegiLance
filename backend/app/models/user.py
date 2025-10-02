from sqlalchemy import String, Boolean, Integer, Float, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from datetime import datetime
import enum

class UserType(enum.Enum):
    """User type enumeration"""
    FREELANCER = "freelancer"
    CLIENT = "client"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    name: Mapped[str] = mapped_column(String(255), nullable=True)
    user_type: Mapped[str] = mapped_column(String(20), nullable=True)  # Freelancer, Client
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    skills: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string of skills
    hourly_rate: Mapped[float] = mapped_column(Float, nullable=True)
    profile_image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    location: Mapped[str] = mapped_column(String(100), nullable=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)