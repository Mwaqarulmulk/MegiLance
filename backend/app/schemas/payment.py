# @AI-HINT: Pydantic schemas for Payment API - transaction, payout, and balance models
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PaymentBase(BaseModel):
    contract_id: Optional[int] = Field(
        default=None, description="Related contract identifier"
    )
    amount: float = Field(gt=0, description="Payment amount")
    currency: str = "USD"
    status: Optional[str] = "pending"
    blockchain_tx_hash: Optional[str] = None
    description: Optional[str] = None


class PaymentCreate(BaseModel):
    contract_id: Optional[int] = Field(
        default=None, description="Optional contract reference"
    )
    to_user_id: Optional[int] = Field(
        default=None, description="Recipient user ID when no contract is provided"
    )
    amount: float = Field(gt=0, description="Payment amount")
    currency: str = "USD"
    payment_type: Optional[str] = Field(
        default="milestone",
        description="Payment type: milestone, full, hourly, escrow, refund, bonus",
    )
    payment_method: Optional[str] = Field(
        default="stripe",
        description="Payment method: stripe, crypto, bank_transfer, paypal",
    )
    description: Optional[str] = None


class PaymentUpdate(BaseModel):
    status: Optional[str] = Field(default=None, description="New payment status")
    blockchain_tx_hash: Optional[str] = Field(
        default=None, description="Blockchain transaction hash"
    )
    description: Optional[str] = Field(default=None, description="Updated description")


class PaymentRead(PaymentBase):
    id: int
    contract_id: Optional[int]
    from_user_id: Optional[int] = None
    to_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
