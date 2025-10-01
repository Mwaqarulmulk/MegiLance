"""Payment tracking endpoints for USDC transactions."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db.session import get_db
from app.models.contract import Contract
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentRead, PaymentUpdate


router = APIRouter()


@router.get("/", response_model=List[PaymentRead])
def list_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    contract_id: Optional[str] = Query(None, description="Filter by contract"),
    status: Optional[str] = Query(None, description="Filter by payment status"),
    direction: Optional[str] = Query(None, description="incoming or outgoing"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List payments for the authenticated user with optional filters."""

    query = db.query(Payment)

    # Restrict payments to user unless admin
    if current_user.user_type != "Admin":
        if direction == "incoming":
            query = query.filter(Payment.to_user_id == current_user.id)
        elif direction == "outgoing":
            query = query.filter(Payment.from_user_id == current_user.id)
        else:
            query = query.filter(
                or_(
                    Payment.from_user_id == current_user.id,
                    Payment.to_user_id == current_user.id
                )
            )

    if contract_id:
        query = query.filter(Payment.contract_id == contract_id)
    if status:
        query = query.filter(Payment.status == status)

    payments = query.offset(skip).limit(limit).all()
    return payments


@router.get("/{payment_id}", response_model=PaymentRead)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve payment details."""

    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    if current_user.user_type != "Admin":
        if payment.from_user_id != current_user.id and payment.to_user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this payment")

    return payment


@router.post("/", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new payment. Only clients can initiate payments."""

    if current_user.user_type != "Client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only clients can create payments")

    # Validate contract ownership when contract_id provided
    if payment_data.contract_id:
        contract = db.query(Contract).filter(Contract.id == payment_data.contract_id).first()
        if not contract:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")
        if contract.client_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this contract")
        to_user_id = contract.freelancer_id
    else:
        to_user_id = payment_data.to_user_id

    if to_user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot send payment to yourself")

    payment = Payment(
        contract_id=payment_data.contract_id,
        from_user_id=current_user.id,
        to_user_id=to_user_id,
        amount=payment_data.amount,
        currency=payment_data.currency,
        status="pending",
        description=payment_data.description or "Payment initiated"
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    # TODO: Integrate Circle API for USDC transfer
    # TODO: Persist blockchain transaction hash once confirmed

    return payment


@router.patch("/{payment_id}", response_model=PaymentRead)
def update_payment(
    payment_id: int,
    payment_update: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update payment status or transaction details."""

    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    if current_user.user_type != "Admin":
        if payment.from_user_id != current_user.id and payment.to_user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this payment")

    update_data = payment_update.model_dump(exclude_unset=True, exclude_none=True)

    # Prevent role escalation by limiting mutable fields
    allowed_fields = {"status", "transaction_hash", "description"}
    for field, value in update_data.items():
        if field in allowed_fields:
            setattr(payment, field, value)

    db.commit()
    db.refresh(payment)
    return payment


@router.post("/{payment_id}/confirm", response_model=PaymentRead)
def confirm_payment(
    payment_id: int,
    transaction_hash: str = Query(..., description="Blockchain transaction hash"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Confirm a payment by attaching a blockchain transaction hash."""

    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    if current_user.user_type != "Admin" and payment.from_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to confirm this payment")

    if payment.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Payment already {payment.status}")

    payment.transaction_hash = transaction_hash
    payment.status = "completed"

    # TODO: Verify transaction on blockchain
    # TODO: Notify recipient of completed payment

    db.commit()
    db.refresh(payment)
    return payment


@router.post("/{payment_id}/refund", response_model=PaymentRead)
def refund_payment(
    payment_id: int,
    reason: str = Query(..., description="Refund reason"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Refund a completed payment. Admin only."""

    if current_user.user_type != "Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can issue refunds")

    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    if payment.status != "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only completed payments can be refunded")

    payment.status = "refunded"
    payment.description = f"{payment.description or ''} | Refund: {reason}".strip()

    # TODO: Initiate blockchain refund transaction
    # TODO: Notify both parties of refund status

    db.commit()
    db.refresh(payment)
    return payment


@router.get("/contract/{contract_id}/total", response_model=dict)
def get_contract_payment_total(
    contract_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Return aggregated payment totals for a contract."""

    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")

    if current_user.user_type != "Admin":
        if contract.client_id != current_user.id and contract.freelancer_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this contract")

    payments = db.query(Payment).filter(Payment.contract_id == contract_id).all()

    total_paid = sum(p.amount for p in payments if p.status == "completed")
    total_pending = sum(p.amount for p in payments if p.status == "pending")
    total_refunded = sum(p.amount for p in payments if p.status == "refunded")

    return {
        "contract_id": contract_id,
        "total_paid": total_paid,
        "total_pending": total_pending,
        "total_refunded": total_refunded,
        "payment_count": len(payments),
        "currency": payments[0].currency if payments else "USDC"
    }