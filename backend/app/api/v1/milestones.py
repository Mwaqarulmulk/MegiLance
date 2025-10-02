"""
Milestone Management API

Handles:
- Milestone CRUD for contracts
- Freelancer submission workflow
- Client approval workflow
- Payment integration on approval
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models import User, Milestone, Contract, Payment, MilestoneStatus, PaymentType, PaymentStatus
from app.schemas.milestone import (
    Milestone as MilestoneSchema,
    MilestoneCreate,
    MilestoneUpdate,
    MilestoneSubmit,
    MilestoneApprove
)
from app.api.v1.notifications import send_notification

router = APIRouter()


@router.post("/milestones", response_model=MilestoneSchema, status_code=status.HTTP_201_CREATED)
async def create_milestone(
    milestone_data: MilestoneCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new milestone for a contract.
    
    Only the contract client can create milestones.
    """
    # Get contract
    contract = db.query(Contract).filter(Contract.id == milestone_data.contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    # Verify user is the client
    if current_user.id != contract.client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the contract client can create milestones"
        )
    
    # Create milestone
    milestone = Milestone(
        **milestone_data.model_dump(),
        status=MilestoneStatus.PENDING
    )
    
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    
    # Notify freelancer
    send_notification(
        db=db,
        user_id=contract.freelancer_id,
        notification_type="milestone",
        title="New Milestone Created",
        content=f"A new milestone has been created for contract #{contract.id}",
        data={"milestone_id": milestone.id, "contract_id": contract.id},
        priority="medium",
        action_url=f"/contracts/{contract.id}/milestones"
    )
    
    return milestone


@router.get("/milestones", response_model=List[MilestoneSchema])
async def list_milestones(
    contract_id: int = Query(..., description="Contract ID (required)"),
    status: Optional[MilestoneStatus] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List milestones for a contract.
    
    Only contract parties can view milestones.
    """
    # Get contract
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    # Access control
    if current_user.id not in [contract.client_id, contract.freelancer_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view these milestones"
        )
    
    query = db.query(Milestone).filter(Milestone.contract_id == contract_id)
    
    # Apply filters
    if status is not None:
        query = query.filter(Milestone.status == status)
    
    # Order by due date
    query = query.order_by(Milestone.due_date.asc())
    
    milestones = query.offset(skip).limit(limit).all()
    return milestones


@router.get("/milestones/{milestone_id}", response_model=MilestoneSchema)
async def get_milestone(
    milestone_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific milestone.
    
    Only contract parties can view.
    """
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    # Access control
    contract = db.query(Contract).filter(Contract.id == milestone.contract_id).first()
    if current_user.id not in [contract.client_id, contract.freelancer_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this milestone"
        )
    
    return milestone


@router.patch("/milestones/{milestone_id}", response_model=MilestoneSchema)
async def update_milestone(
    milestone_id: int,
    milestone_data: MilestoneUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a milestone.
    
    Only the client can update milestones that aren't submitted yet.
    """
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    # Get contract
    contract = db.query(Contract).filter(Contract.id == milestone.contract_id).first()
    
    # Verify user is the client
    if current_user.id != contract.client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the contract client can update milestones"
        )
    
    # Can't update if already submitted or completed
    if milestone.status in [MilestoneStatus.SUBMITTED, MilestoneStatus.APPROVED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update submitted or approved milestones"
        )
    
    # Apply updates
    update_data = milestone_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(milestone, field, value)
    
    db.commit()
    db.refresh(milestone)
    
    return milestone


@router.post("/milestones/{milestone_id}/submit", response_model=MilestoneSchema)
async def submit_milestone(
    milestone_id: int,
    submission_data: MilestoneSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a milestone for approval (freelancer action).
    
    Changes status to SUBMITTED and adds deliverables.
    """
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    # Get contract
    contract = db.query(Contract).filter(Contract.id == milestone.contract_id).first()
    
    # Verify user is the freelancer
    if current_user.id != contract.freelancer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the freelancer can submit milestones"
        )
    
    # Verify milestone is in pending status
    if milestone.status != MilestoneStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Milestone is {milestone.status.value}, cannot submit"
        )
    
    # Update milestone
    milestone.status = MilestoneStatus.SUBMITTED
    milestone.deliverables = submission_data.deliverables
    milestone.submission_notes = submission_data.submission_notes
    milestone.submitted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(milestone)
    
    # Notify client
    send_notification(
        db=db,
        user_id=contract.client_id,
        notification_type="milestone",
        title="Milestone Submitted for Review",
        content=f"Milestone #{milestone.id} has been submitted for your review",
        data={"milestone_id": milestone.id, "contract_id": contract.id},
        priority="high",
        action_url=f"/milestones/{milestone.id}"
    )
    
    return milestone


@router.post("/milestones/{milestone_id}/approve", response_model=MilestoneSchema)
async def approve_milestone(
    milestone_id: int,
    approval_data: MilestoneApprove,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Approve a milestone (client action).
    
    Changes status to APPROVED and triggers payment.
    """
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    # Get contract
    contract = db.query(Contract).filter(Contract.id == milestone.contract_id).first()
    
    # Verify user is the client
    if current_user.id != contract.client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the contract client can approve milestones"
        )
    
    # Verify milestone is submitted
    if milestone.status != MilestoneStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Milestone is {milestone.status.value}, must be submitted to approve"
        )
    
    # Update milestone
    milestone.status = MilestoneStatus.APPROVED
    milestone.approval_notes = approval_data.approval_notes
    milestone.approved_at = datetime.utcnow()
    
    # Create payment record
    platform_fee_percentage = 0.10  # 10% platform fee
    platform_fee = milestone.amount * platform_fee_percentage
    freelancer_amount = milestone.amount - platform_fee
    
    payment = Payment(
        contract_id=contract.id,
        milestone_id=milestone.id,
        client_id=contract.client_id,
        freelancer_id=contract.freelancer_id,
        amount=milestone.amount,
        platform_fee=platform_fee,
        freelancer_amount=freelancer_amount,
        payment_type=PaymentType.MILESTONE,
        payment_method="escrow",  # Default payment method
        status=PaymentStatus.PENDING,
        description=f"Payment for milestone: {milestone.title}"
    )
    
    db.add(payment)
    db.commit()
    db.refresh(milestone)
    db.refresh(payment)
    
    # Notify freelancer
    send_notification(
        db=db,
        user_id=contract.freelancer_id,
        notification_type="payment",
        title="Milestone Approved - Payment Processing",
        content=f"Milestone #{milestone.id} approved. Payment of ${freelancer_amount:.2f} is being processed.",
        data={
            "milestone_id": milestone.id,
            "payment_id": payment.id,
            "amount": float(freelancer_amount)
        },
        priority="high",
        action_url=f"/payments/{payment.id}"
    )
    
    return milestone


@router.post("/milestones/{milestone_id}/reject", response_model=MilestoneSchema)
async def reject_milestone(
    milestone_id: int,
    rejection_notes: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reject a milestone submission (client action).
    
    Returns milestone to PENDING status with feedback.
    """
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    # Get contract
    contract = db.query(Contract).filter(Contract.id == milestone.contract_id).first()
    
    # Verify user is the client
    if current_user.id != contract.client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the contract client can reject milestones"
        )
    
    # Verify milestone is submitted
    if milestone.status != MilestoneStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Milestone is {milestone.status.value}, must be submitted to reject"
        )
    
    # Update milestone
    milestone.status = MilestoneStatus.PENDING
    milestone.approval_notes = rejection_notes
    milestone.submitted_at = None  # Clear submission timestamp
    
    db.commit()
    db.refresh(milestone)
    
    # Notify freelancer
    send_notification(
        db=db,
        user_id=contract.freelancer_id,
        notification_type="milestone",
        title="Milestone Needs Revision",
        content=f"Milestone #{milestone.id} needs revision. Check feedback from client.",
        data={"milestone_id": milestone.id, "contract_id": contract.id},
        priority="high",
        action_url=f"/milestones/{milestone.id}"
    )
    
    return milestone


@router.delete("/milestones/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_milestone(
    milestone_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a milestone.
    
    Only client can delete, and only if not yet submitted.
    """
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    # Get contract
    contract = db.query(Contract).filter(Contract.id == milestone.contract_id).first()
    
    # Verify user is the client
    if current_user.id != contract.client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the contract client can delete milestones"
        )
    
    # Can't delete if submitted or approved
    if milestone.status in [MilestoneStatus.SUBMITTED, MilestoneStatus.APPROVED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete submitted or approved milestones"
        )
    
    db.delete(milestone)
    db.commit()
