# @AI-HINT: Pydantic schemas for Client API - job creation validation
"""Client schemas for MegiLance platform"""
from pydantic import BaseModel, Field
from typing import List, Optional


class ClientJobCreate(BaseModel):
    """Schema for creating a client job posting"""
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=5000)
    category: str = Field(..., min_length=1, max_length=100)
    budgetType: str = Field("Fixed", max_length=20)
    budget: float = Field(0, ge=0)
    timeline: Optional[str] = Field(None, max_length=100)
    skills: List[str] = Field(default_factory=list)
