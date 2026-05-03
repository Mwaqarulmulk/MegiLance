# @AI-HINT: Pydantic schemas for Scope Change API - modification request and approval models
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum

class ScopeChangeStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class ScopeChangeBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10)
    reason: Optional[str] = None
    new_amount: Optional[float] = Field(None, gt=0)
    new_deadline: Optional[datetime] = None

class ScopeChangeCreate(ScopeChangeBase):
    contract_id: int

class ScopeChangeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    reason: Optional[str] = None
    new_amount: Optional[float] = Field(None, gt=0)
    new_deadline: Optional[datetime] = None

class ScopeChangeResponse(ScopeChangeBase):
    id: int
    contract_id: int
    requested_by: int
    status: ScopeChangeStatus
    old_amount: Optional[float] = None
    old_deadline: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
