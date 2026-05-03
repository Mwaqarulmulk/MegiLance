# @AI-HINT: Pydantic schemas for AI service API - matching, price estimation, fraud detection
"""AI Service Schemas"""
from typing import List, Optional
from pydantic import BaseModel, Field


class FreelancerMatchRequest(BaseModel):
    job_description: str = Field(..., min_length=10)
    required_skills: List[str]
    budget: float = Field(..., gt=0)


class PriceEstimateRequest(BaseModel):
    project_description: str = Field(..., min_length=10)
    category: str
    estimated_hours: Optional[int] = None
    complexity: str = Field(default="medium")


class ProposalGenerateRequest(BaseModel):
    job_title: str = Field(..., min_length=5)
    job_description: str = Field(..., min_length=10)


class FraudCheckRequest(BaseModel):
    user_id: str
    activity_type: str
    activity_data: dict
