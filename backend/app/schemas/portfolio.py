from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PortfolioItemBase(BaseModel):
    title: str
    description: str
    image_url: str
    project_url: Optional[str] = None

class PortfolioItemCreate(PortfolioItemBase):
    pass

class PortfolioItemUpdate(PortfolioItemBase):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    project_url: Optional[str] = None

class PortfolioItemRead(PortfolioItemBase):
    id: int
    freelancer_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True