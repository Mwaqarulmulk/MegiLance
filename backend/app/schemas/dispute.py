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


class DisputeUpdate(BaseModel):
    """Schema for updating a dispute"""
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    resolution: Optional[str] = None
    resolution_amount: Optional[float] = None


class Dispute(BaseModel):
    """Schema for dispute response — matches the disputes table columns"""
    id: int
    contract_id: int
    raised_by: int
    dispute_type: str
    description: str
    evidence: Optional[str] = None
    status: str
    assigned_to: Optional[int] = None
    resolution: Optional[str] = None
    resolution_amount: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DisputeList(BaseModel):
    """Schema for paginated dispute list"""
    total: int
    disputes: list[Dispute]
