from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PaymentBase(BaseModel):
    contract_id: Optional[str] = None
    from_user_id: int
    to_user_id: int
    amount: float
    currency: Optional[str] = "USDC"
    status: Optional[str] = "pending"
    transaction_hash: Optional[str] = None
    description: str

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(PaymentBase):
    contract_id: Optional[str] = None
    from_user_id: Optional[int] = None
    to_user_id: Optional[int] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    transaction_hash: Optional[str] = None
    description: Optional[str] = None

class PaymentRead(PaymentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True