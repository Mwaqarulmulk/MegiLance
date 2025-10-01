from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ContractBase(BaseModel):
    value: float = Field(gt=0, description="Contract value in USDC")
    description: str = Field(min_length=10)
    start_date: datetime
    end_date: datetime
    milestones: Optional[str] = Field(None, description="JSON string of milestones")
    terms: Optional[str] = Field(None, description="JSON string of contract terms")


class ContractCreate(BaseModel):
    project_id: int
    freelancer_id: int
    value: float = Field(gt=0)
    description: str = Field(min_length=10)
    start_date: datetime
    end_date: datetime
    milestones: Optional[str] = None
    terms: Optional[str] = None


class ContractUpdate(BaseModel):
    value: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, min_length=10)
    status: Optional[str] = None
    milestones: Optional[str] = None
    terms: Optional[str] = None
    end_date: Optional[datetime] = None


class ContractRead(ContractBase):
    id: str
    project_id: int
    freelancer_id: int
    client_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True