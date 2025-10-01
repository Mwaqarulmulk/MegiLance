from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProposalBase(BaseModel):
    cover_letter: str = Field(min_length=50, description="Cover letter explaining proposal")
    estimated_hours: int = Field(gt=0, description="Estimated hours to complete project")
    hourly_rate: float = Field(gt=0, description="Hourly rate for this proposal")
    availability: str = Field(description="immediate, 1-2_weeks, 1_month, flexible")
    attachments: Optional[str] = None


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
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True