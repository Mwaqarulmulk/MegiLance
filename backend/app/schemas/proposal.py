# @AI-HINT: Pydantic schemas for Proposal API - bid creation, update, and response models
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProposalBase(BaseModel):
    cover_letter: str = Field(min_length=50, description="Cover letter explaining proposal")
    estimated_hours: int = Field(gt=0, description="Estimated hours to complete project")
    hourly_rate: float = Field(gt=0, description="Hourly rate for this proposal")
    availability: str = Field(description="immediate, 1-2_weeks, 1_month, flexible")
    attachments: Optional[str] = None
    bid_amount: Optional[float] = Field(None, gt=0, description="Total bid amount (optional, calculated from hours * rate if not provided)")


class ProposalCreate(ProposalBase):
    project_id: int


class ProposalUpdate(BaseModel):
    cover_letter: Optional[str] = Field(None, min_length=50)
    estimated_hours: Optional[int] = Field(None, gt=0)
    hourly_rate: Optional[float] = Field(None, gt=0)
    availability: Optional[str] = None
    attachments: Optional[str] = None
    status: Optional[str] = None


class ProposalRead(ProposalBase):
    id: int
    project_id: int
    freelancer_id: int
    status: str
    bid_amount: Optional[float] = 0.0
    is_draft: bool = False
    created_at: datetime
    updated_at: datetime
    job_title: Optional[str] = None
    client_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
