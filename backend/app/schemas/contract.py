# @AI-HINT: Pydantic schemas for Contract API - create, update, and response models
from datetime import datetime
from typing import Optional
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

class ContractType(str, Enum):
    FIXED = "fixed"
    HOURLY = "hourly"
    RETAINER = "retainer"

class ContractBase(BaseModel):
    amount: float = Field(gt=0, description="Contract amount / Budget cap")
    currency: str = Field("USD", description="Currency code (e.g. USD, EUR)")
    contract_type: ContractType = Field(ContractType.FIXED, description="Type of contract")
    hourly_rate: Optional[float] = Field(None, description="Hourly rate for hourly contracts")
    retainer_amount: Optional[float] = Field(None, description="Recurring amount for retainers")
    retainer_frequency: Optional[str] = Field(None, description="Frequency for retainers (weekly, monthly)")
    
    description: Optional[str] = Field(None, description="Contract description")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    milestones: Optional[str] = Field(None, description="JSON string of milestones")
    terms: Optional[str] = Field(None, description="JSON string of contract terms")


class ContractCreate(BaseModel):
    project_id: int
    freelancer_id: int
    client_id: int
    amount: float = Field(gt=0)
    currency: str = "USD"
    contract_type: ContractType = ContractType.FIXED
    hourly_rate: Optional[float] = None
    retainer_amount: Optional[float] = None
    retainer_frequency: Optional[str] = None
    
    description: Optional[str] = Field(None, min_length=10)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    milestones: Optional[str] = None
    terms: Optional[str] = None


class ContractUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    hourly_rate: Optional[float] = None
    retainer_amount: Optional[float] = None
    retainer_frequency: Optional[str] = None
    
    description: Optional[str] = Field(None, min_length=10)
    status: Optional[str] = None
    milestones: Optional[str] = None
    terms: Optional[str] = None
    end_date: Optional[datetime] = None


class ContractRead(ContractBase):
    id: int
    project_id: int
    freelancer_id: int
    client_id: int
    status: str
    contract_amount: Optional[float] = None  # Legacy alias for amount — prefer 'amount'
    platform_fee: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    job_title: Optional[str] = None
    client_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
