# @AI-HINT: Pydantic schemas for Dispute API - creation, update, and response models
"""Dispute schemas for MegiLance platform"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class DisputeBase(BaseModel):
    """Base dispute schema"""
    dispute_type: str
    description: str = Field(..., min_length=10)
    evidence: Optional[str] = None


class DisputeCreate(DisputeBase):
    """Schema for creating a dispute"""
    contract_id: int


class DisputeUpdate(BaseModel):
    """Schema for updating a dispute"""
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    resolution: Optional[str] = None
    resolution_amount: Optional[float] = None


class Dispute(DisputeBase):
    """Schema for dispute response"""
    id: int
    contract_id: int
    raised_by: int
    status: str
    assigned_to: Optional[int] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    resolution: Optional[str] = None
    resolution_amount: Optional[float] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DisputeList(BaseModel):
    """Schema for paginated dispute list"""
    total: int
    disputes: list[Dispute]
