# @AI-HINT: Pydantic schemas for Support Ticket API validation and responses
from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal

class SupportTicketBase(BaseModel):
    """Base support ticket schema with common fields"""
    subject: str = Field(..., min_length=5, max_length=200, description="Ticket subject")
    description: str = Field(..., min_length=20, max_length=2000, description="Detailed description")
    category: Literal["billing", "technical", "account", "other"] = Field("other", description="Ticket category")
    priority: Literal["low", "medium", "high", "urgent"] = Field("medium", description="Ticket priority")

class SupportTicketCreate(SupportTicketBase):
    """Schema for creating a new support ticket"""
    attachments: Optional[List[Dict[str, Any]]] = Field(None, description="Ticket attachments (JSON)")
    
    @field_validator('subject')
    @classmethod
    def validate_subject(cls, v):
        """Validate subject is not empty after stripping"""
        if not v.strip():
            raise ValueError("Subject cannot be empty")
        return v.strip()

class SupportTicketUpdate(BaseModel):
    """Schema for updating a support ticket"""
    subject: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=20, max_length=2000)
    category: Optional[Literal["billing", "technical", "account", "other"]] = None
    priority: Optional[Literal["low", "medium", "high", "urgent"]] = None
    status: Optional[Literal["open", "in_progress", "resolved", "closed"]] = None
    assigned_to: Optional[int] = None

class SupportTicketAssign(BaseModel):
    """Schema for assigning a ticket to a support agent"""
    assigned_to: int = Field(..., description="User ID of support agent")

class SupportTicketResolve(BaseModel):
    """Schema for resolving a ticket"""
    resolution: str = Field(..., min_length=10, max_length=1000, description="Resolution details")

class SupportTicketRead(SupportTicketBase):
    """Schema for reading a support ticket (response)"""
    id: int
    user_id: int
    status: str
    assigned_to: Optional[int]
    attachments: Optional[List[Dict[str, Any]]]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SupportTicketList(BaseModel):
    """Schema for paginated ticket list"""
    tickets: List[SupportTicketRead]
    total: int
    page: int
    page_size: int
