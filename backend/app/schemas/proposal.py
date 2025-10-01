from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProposalBase(BaseModel):
    project_id: int
    cover_letter: str
    estimated_hours: int
    hourly_rate: float
    availability: str
    attachments: Optional[List[str]] = None
    status: Optional[str] = "submitted"

class ProposalCreate(ProposalBase):
    pass

class ProposalUpdate(ProposalBase):
    project_id: Optional[int] = None
    cover_letter: Optional[str] = None
    estimated_hours: Optional[int] = None
    hourly_rate: Optional[float] = None
    availability: Optional[str] = None
    attachments: Optional[List[str]] = None
    status: Optional[str] = None

class ProposalRead(ProposalBase):
    id: int
    freelancer_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True