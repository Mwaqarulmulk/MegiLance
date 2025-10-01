from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    description: str
    category: str
    budget_type: str
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    experience_level: str
    estimated_duration: str
    skills: List[str]
    status: Optional[str] = "open"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    budget_type: Optional[str] = None
    experience_level: Optional[str] = None
    estimated_duration: Optional[str] = None
    skills: Optional[List[str]] = None
    status: Optional[str] = None

class ProjectRead(ProjectBase):
    id: int
    client_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True