# @AI-HINT: Pydantic schemas for Dispute API - creation, update, and response models
"""Dispute schemas for MegiLance platform"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Any, Optional
from datetime import datetime


class DisputeBase(BaseModel):
    """Base dispute schema"""
    dispute_type: str
    description: str = Field(..., min_length=10)
    evidence: Optional[Any] = None


class DisputeCreate(DisputeBase):
    """Schema for creating a dispute"""
    contract_id: int
    title: Optional[str] = None


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
    raised_by: Optional[int] = None
    raised_by_id: Optional[int] = None
    status: str
    assigned_to: Optional[int] = None
    assigned_to_id: Optional[int] = None
    title: Optional[str] = None
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
