from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True
    name: Optional[str] = None
    user_type: Optional[str] = None  # Freelancer, Client
    bio: Optional[str] = None
    skills: Optional[str] = None  # JSON string of skills
    hourly_rate: Optional[float] = None
    profile_image_url: Optional[str] = None
    location: Optional[str] = None
    joined_at: Optional[datetime] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    email: Optional[EmailStr] = None
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
    joined_at: datetime

    class Config:
        from_attributes = True