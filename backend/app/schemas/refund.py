# @AI-HINT: Pydantic schemas for Refund API validation and responses
from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime
from typing import Optional, List

class RefundBase(BaseModel):
    """Base refund schema with common fields"""
    payment_id: int = Field(..., description="Payment ID to refund")
    amount: float = Field(..., gt=0, description="Refund amount")
    reason: str = Field(..., min_length=10, max_length=500, description="Refund reason")

class RefundCreate(RefundBase):
    """Schema for creating a new refund request"""
    
    @field_validator('reason')
    @classmethod
    def validate_reason(cls, v):
        """Validate reason is detailed enough"""
        if len(v.strip()) < 10:
            raise ValueError("Refund reason must be at least 10 characters")
        return v.strip()

class RefundApprove(BaseModel):
    """Schema for approving a refund"""
    approval_notes: Optional[str] = Field(None, max_length=500, description="Approval notes")

class RefundReject(BaseModel):
    """Schema for rejecting a refund"""
    rejection_reason: str = Field(..., min_length=10, max_length=500, description="Rejection reason")

class RefundUpdate(BaseModel):
    """Schema for updating refund details"""
    reason: Optional[str] = Field(None, min_length=10, max_length=500)
    status: Optional[str] = None

class RefundRead(RefundBase):
    """Schema for reading a refund (response)"""
    id: int
    requested_by: int
    approved_by: Optional[int]
    status: str
    processed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RefundList(BaseModel):
    """Schema for paginated refund list"""
    refunds: List[RefundRead]
    total: int
    page: int
    page_size: int
