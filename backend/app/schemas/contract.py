from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class ContractBase(BaseModel):
    project_id: int
    freelancer_id: int
    client_id: int
    value: float
    status: Optional[str] = "active"
    start_date: datetime
    end_date: datetime
    description: str
    milestones: List[Dict]
    terms: Dict

class ContractCreate(ContractBase):
    pass

class ContractUpdate(ContractBase):
    project_id: Optional[int] = None
    freelancer_id: Optional[int] = None
    client_id: Optional[int] = None
    value: Optional[float] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    milestones: Optional[List[Dict]] = None
    terms: Optional[Dict] = None

class ContractRead(ContractBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True