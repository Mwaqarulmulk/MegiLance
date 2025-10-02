"""
Dispute Management API

Handles:
- Dispute creation (contract parties only)
- Dispute listing with filters
- Admin assignment and resolution
- Status tracking
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models import User, Dispute, Contract, DisputeStatus, DisputeType
from app.schemas.dispute import (
    Dispute as DisputeSchema,
    DisputeCreate,
    DisputeUpdate,
    DisputeList
)
from app.api.v1.notifications import send_notification

router = APIRouter()


@router.post("/disputes", response_model=DisputeSchema, status_code=status.HTTP_201_CREATED)
async def create_dispute(
    dispute_data: DisputeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new dispute.
    
    Business rules:
    - Only contract parties can raise disputes
    - Contract must exist
    - Sends notifications to other party and admins
    """
    # Get contract
    contract = db.query(Contract).filter(Contract.id == dispute_data.contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    # Verify user is part of the contract
    if current_user.id not in [contract.client_id, contract.freelancer_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only contract parties can raise disputes"
        )
    
    # Create dispute
    dispute = Dispute(
        **dispute_data.model_dump(),
        raised_by_id=current_user.id,
        status=DisputeStatus.OPEN
    )
    
    db.add(dispute)
    db.commit()
    db.refresh(dispute)
    
    # Notify other party
    other_party_id = contract.freelancer_id if current_user.id == contract.client_id else contract.client_id
    send_notification(
        db=db,
        user_id=other_party_id,
        notification_type="dispute",
        title="New Dispute Raised",
        content=f"A dispute has been raised on contract #{contract.id}",
        data={"dispute_id": dispute.id, "contract_id": contract.id},
        priority="high",
        action_url=f"/disputes/{dispute.id}"
    )
    
    # Notify admins (get all admin users)
    admin_users = db.query(User).filter(User.user_type == "admin").all()
    for admin in admin_users:
        send_notification(
            db=db,
            user_id=admin.id,
            notification_type="admin_action",
            title="New Dispute Requires Attention",
            content=f"Dispute #{dispute.id} raised on contract #{contract.id}",
            data={"dispute_id": dispute.id, "contract_id": contract.id},
            priority="high",
            action_url=f"/admin/disputes/{dispute.id}"
        )
    
    return dispute


@router.get("/disputes", response_model=DisputeList)
async def list_disputes(
    contract_id: Optional[int] = Query(None, description="Filter by contract"),
    status: Optional[DisputeStatus] = Query(None, description="Filter by status"),
    dispute_type: Optional[DisputeType] = Query(None, description="Filter by type"),
    raised_by_me: bool = Query(False, description="Only disputes I raised"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List disputes with filtering.
    
    Regular users only see disputes they're involved in.
    Admins see all disputes.
    """
    query = db.query(Dispute)
    
    # Access control
    if current_user.user_type.value != "admin":
        # Get contracts user is involved in
        user_contracts = db.query(Contract).filter(
            or_(
                Contract.client_id == current_user.id,
                Contract.freelancer_id == current_user.id
            )
        ).all()
        contract_ids = [c.id for c in user_contracts]
        
        query = query.filter(Dispute.contract_id.in_(contract_ids))
    
    # Apply filters
    if contract_id is not None:
        query = query.filter(Dispute.contract_id == contract_id)
    
    if status is not None:
        query = query.filter(Dispute.status == status)
    
    if dispute_type is not None:
        query = query.filter(Dispute.dispute_type == dispute_type)
    
    if raised_by_me:
        query = query.filter(Dispute.raised_by_id == current_user.id)
    
    # Get total count
    total = query.count()
    
    # Order by most recent
    query = query.order_by(Dispute.created_at.desc())
    
    disputes = query.offset(skip).limit(limit).all()
    
    return DisputeList(
        total=total,
        disputes=disputes
    )


@router.get("/disputes/{dispute_id}", response_model=DisputeSchema)
async def get_dispute(
    dispute_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific dispute.
    
    Only viewable by contract parties and admins.
    """
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispute not found"
        )
    
    # Access control
    if current_user.user_type.value != "admin":
        contract = db.query(Contract).filter(Contract.id == dispute.contract_id).first()
        if current_user.id not in [contract.client_id, contract.freelancer_id]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this dispute"
            )
    
    return dispute


@router.patch("/disputes/{dispute_id}", response_model=DisputeSchema)
async def update_dispute(
    dispute_id: int,
    dispute_data: DisputeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a dispute.
    
    Regular users can only update description.
    Admins can assign and resolve disputes.
    """
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispute not found"
        )
    
    # Access control and determine allowed updates
    contract = db.query(Contract).filter(Contract.id == dispute.contract_id).first()
    
    if current_user.user_type.value == "admin":
        # Admins can update everything
        update_data = dispute_data.model_dump(exclude_unset=True)
        
        # Send notifications on status changes
        if "status" in update_data and update_data["status"] != dispute.status:
            # Notify contract parties
            for party_id in [contract.client_id, contract.freelancer_id]:
                send_notification(
                    db=db,
                    user_id=party_id,
                    notification_type="dispute",
                    title=f"Dispute Status Updated",
                    content=f"Dispute #{dispute.id} status changed to {update_data['status']}",
                    data={"dispute_id": dispute.id, "new_status": update_data["status"]},
                    priority="high",
                    action_url=f"/disputes/{dispute.id}"
                )
        
    elif current_user.id in [contract.client_id, contract.freelancer_id]:
        # Contract parties can only update description
        if set(dispute_data.model_dump(exclude_unset=True).keys()) - {"description"}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update the description"
            )
        update_data = {"description": dispute_data.description} if dispute_data.description else {}
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this dispute"
        )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(dispute, field, value)
    
    db.commit()
    db.refresh(dispute)
    
    return dispute


@router.post("/disputes/{dispute_id}/assign", response_model=DisputeSchema)
async def assign_dispute(
    dispute_id: int,
    admin_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Assign a dispute to an admin.
    
    Admin-only endpoint.
    """
    # Admin check
    if current_user.user_type.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can assign disputes"
        )
    
    # Get dispute
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispute not found"
        )
    
    # Verify admin user
    admin_user = db.query(User).filter(
        and_(User.id == admin_id, User.user_type == "admin")
    ).first()
    if not admin_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found"
        )
    
    # Assign
    dispute.assigned_to_id = admin_id
    dispute.status = DisputeStatus.IN_PROGRESS
    
    db.commit()
    db.refresh(dispute)
    
    # Notify assigned admin
    send_notification(
        db=db,
        user_id=admin_id,
        notification_type="admin_action",
        title="Dispute Assigned to You",
        content=f"You have been assigned dispute #{dispute.id}",
        data={"dispute_id": dispute.id},
        priority="high",
        action_url=f"/admin/disputes/{dispute.id}"
    )
    
    return dispute


@router.post("/disputes/{dispute_id}/resolve", response_model=DisputeSchema)
async def resolve_dispute(
    dispute_id: int,
    resolution: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Resolve a dispute.
    
    Admin-only endpoint.
    """
    # Admin check
    if current_user.user_type.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can resolve disputes"
        )
    
    # Get dispute
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispute not found"
        )
    
    # Resolve
    dispute.status = DisputeStatus.RESOLVED
    dispute.resolution = resolution
    
    db.commit()
    db.refresh(dispute)
    
    # Notify contract parties
    contract = db.query(Contract).filter(Contract.id == dispute.contract_id).first()
    for party_id in [contract.client_id, contract.freelancer_id]:
        send_notification(
            db=db,
            user_id=party_id,
            notification_type="dispute",
            title="Dispute Resolved",
            content=f"Dispute #{dispute.id} has been resolved",
            data={"dispute_id": dispute.id, "resolution": resolution},
            priority="high",
            action_url=f"/disputes/{dispute.id}"
        )
    
    return dispute
