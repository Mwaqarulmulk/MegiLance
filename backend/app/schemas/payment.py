from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PaymentBase(BaseModel):
    contract_id: Optional[str] = Field(default=None, description="Related contract identifier")
    amount: float
    currency: str = "USDC"
    status: Optional[str] = "pending"
    transaction_hash: Optional[str] = None
    description: Optional[str] = None


class PaymentCreate(BaseModel):
    contract_id: Optional[str] = Field(default=None, description="Optional contract reference")
    to_user_id: Optional[int] = Field(default=None, description="Recipient user ID when no contract is provided")
    amount: float
    currency: str = "USDC"
    description: Optional[str] = None


class PaymentUpdate(BaseModel):
    status: Optional[str] = Field(default=None, description="New payment status")
    transaction_hash: Optional[str] = Field(default=None, description="Blockchain transaction hash")
    description: Optional[str] = Field(default=None, description="Updated description")


class PaymentRead(PaymentBase):
    id: int
    contract_id: Optional[str]
    from_user_id: int
    to_user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True