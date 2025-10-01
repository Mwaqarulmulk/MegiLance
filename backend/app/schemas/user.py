from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    is_active: bool = True
    name: Optional[str] = None
    user_type: Optional[str] = Field(default=None, description="Freelancer, Client, Admin")
    bio: Optional[str] = None
    skills: Optional[str] = None  # JSON string of skills
    hourly_rate: Optional[float] = None
    profile_image_url: Optional[str] = None
    location: Optional[str] = None


class UserCreate(UserBase):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=6)
    is_active: Optional[bool] = None
    name: Optional[str] = None
    user_type: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    hourly_rate: Optional[float] = None
    profile_image_url: Optional[str] = None
    location: Optional[str] = None


class UserRead(UserBase):
    id: int
    email: EmailStr
    joined_at: datetime

    class Config:
        from_attributes = True