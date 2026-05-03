# @AI-HINT: Pydantic schemas for Favorite API validation and responses
from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime
from typing import Literal

class FavoriteBase(BaseModel):
    """Base favorite schema with common fields"""
    target_type: Literal["project", "freelancer"] = Field(..., description="Type of item being favorited")
    target_id: int = Field(..., gt=0, description="ID of the item being favorited")

class FavoriteCreate(FavoriteBase):
    """Schema for creating a new favorite"""
    
    @field_validator('target_type')
    @classmethod
    def validate_target_type(cls, v):
        """Validate target type"""
        if v not in ["project", "freelancer"]:
            raise ValueError("target_type must be 'project' or 'freelancer'")
        return v

class FavoriteRead(FavoriteBase):
    """Schema for reading a favorite (response)"""
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class FavoriteDelete(BaseModel):
    """Schema for confirming favorite deletion"""
    message: str
    target_type: str
    target_id: int
