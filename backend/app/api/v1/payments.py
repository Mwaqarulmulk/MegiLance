from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.payment import Payment
from app.models.contract import Contract
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentRead, PaymentUpdate
from app.core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=List[PaymentRead])
def list_payments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can see payments they are part of (either as sender or receiver)
    payments = db.query(Payment).filter(
        (Payment.from_user_id == current_user.id) | (Payment.to_user_id == current_user.id)
    ).offset(skip).limit(limit).all()
    return payments

@router.get("/{payment_id}", response_model=PaymentRead)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Check if user is part of this payment
    if payment.from_user_id != current_user.id and payment.to_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this payment")
    
    return payment

@router.post("/", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate contract if provided
    if payment.contract_id:
        contract = db.query(Contract).filter(Contract.id == payment.contract_id).first()
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        # Check if user is part of this contract
        if contract.client_id != current_user.id and contract.freelancer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to create payment for this contract")
    
    # Check if sender and receiver are different
    if payment.from_user_id == payment.to_user_id:
        raise HTTPException(status_code=400, detail="Sender and receiver cannot be the same")
    
    # Check if sender is the current user
    if payment.from_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to send payment from this account")
    
    # Check if receiver exists
    receiver = db.query(User).filter(User.id == payment.to_user_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    db_payment = Payment(
        contract_id=payment.contract_id,
        from_user_id=current_user.id,
        to_user_id=payment.to_user_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        transaction_hash=payment.transaction_hash,
        description=payment.description
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.put("/{payment_id}", response_model=PaymentRead)
def update_payment(
    payment_id: int,
    payment: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Only status and transaction_hash can be updated, and only by involved parties
    if db_payment.from_user_id != current_user.id and db_payment.to_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this payment")
    
    # Only allow updating status and transaction_hash
    if payment.status is not None:
        db_payment.status = payment.status
    if payment.transaction_hash is not None:
        db_payment.transaction_hash = payment.transaction_hash
    
    db.commit()
    db.refresh(db_payment)
    return db_payment