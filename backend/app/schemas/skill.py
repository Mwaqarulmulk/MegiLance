# @AI-HINT: Pydantic schemas for Skill API - skill creation, update, and user-skill association models
"""Skill schemas for MegiLance platform"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class SkillBase(BaseModel):
    """Base skill schema"""
    name: str = Field(..., min_length=1, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class SkillCreate(SkillBase):
    """Schema for creating a skill"""
    pass


class SkillUpdate(BaseModel):
    """Schema for updating a skill"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class Skill(SkillBase):
    """Schema for skill response"""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserSkillBase(BaseModel):
    """Base user skill schema"""
    skill_id: int
    proficiency_level: int = Field(1, ge=1, le=5)
    years_experience: int = Field(0, ge=0)


class UserSkillCreate(UserSkillBase):
    """Schema for adding a skill to user"""
    pass


class UserSkillUpdate(BaseModel):
    """Schema for updating user skill"""
    proficiency_level: Optional[int] = Field(None, ge=1, le=5)
    years_experience: Optional[int] = Field(None, ge=0)
    is_verified: Optional[bool] = None


class UserSkill(UserSkillBase):
    """Schema for user skill response"""
    id: int
    user_id: int
    is_verified: bool
    verified_at: Optional[datetime] = None
    verified_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    skill: Optional[Skill] = None

    model_config = ConfigDict(from_attributes=True)
