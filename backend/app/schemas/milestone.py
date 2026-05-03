# @AI-HINT: Pydantic schemas for Milestone API - creation, submission, and approval models
"""Milestone schemas for MegiLance platform"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class MilestoneBase(BaseModel):
    """Base milestone schema"""
    title: str = Field(..., min_length=1, max_length=255)
    description: str
    amount: float = Field(..., gt=0)
    due_date: datetime
    deliverables: Optional[str] = None
    order_index: int = 0


class MilestoneCreate(MilestoneBase):
    """Schema for creating a milestone"""
    contract_id: int


class MilestoneUpdate(BaseModel):
    """Schema for updating a milestone"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    deliverables: Optional[str] = None
    feedback: Optional[str] = None


class Milestone(MilestoneBase):
    """Schema for milestone response"""
    id: int
    contract_id: int
    status: str
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    feedback: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MilestoneSubmit(BaseModel):
    """Schema for submitting a milestone"""
    deliverables: str = Field(..., min_length=1)


class MilestoneApprove(BaseModel):
    """Schema for approving/rejecting a milestone"""
    approved: bool
    feedback: Optional[str] = None
