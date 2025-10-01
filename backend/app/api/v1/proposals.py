from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.db.session import get_db
from app.models.proposal import Proposal
from app.models.project import Project
from app.models.user import User
from app.schemas.proposal import ProposalCreate, ProposalRead, ProposalUpdate
from app.core.security import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[ProposalRead])
def list_proposals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    project_id: Optional[int] = Query(None, description="Filter by project ID"),
    status: Optional[str] = Query(None, description="Filter by proposal status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Freelancers can see their own proposals, clients can see proposals for their projects
    if current_user.user_type == "Freelancer":
        query = db.query(Proposal).filter(Proposal.freelancer_id == current_user.id)
    else:
        # Get all projects for this client
        project_ids = db.query(Project.id).filter(Project.client_id == current_user.id).all()
        project_ids = [pid[0] for pid in project_ids]
        query = db.query(Proposal).filter(Proposal.project_id.in_(project_ids))
    
    # Apply additional filters
    if project_id:
        query = query.filter(Proposal.project_id == project_id)
    if status:
        query = query.filter(Proposal.status == status)
    
    proposals = query.offset(skip).limit(limit).all()
    return proposals

@router.get("/{proposal_id}", response_model=ProposalRead)
def get_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")
    
    # Check if user is authorized to view this proposal
    is_proposal_owner = proposal.freelancer_id == current_user.id
    
    # Check if user is the client for this project
    project = db.query(Project).filter(Project.id == proposal.project_id).first()
    is_project_owner = project and project.client_id == current_user.id
    
    if not is_proposal_owner and not is_project_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this proposal"
        )
    
    return proposal

@router.post("/", response_model=ProposalRead, status_code=status.HTTP_201_CREATED)
def create_proposal(
    proposal: ProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if user is a freelancer
    if current_user.user_type != "Freelancer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only freelancers can submit proposals"
        )
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == proposal.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    # Check if project is open
    if project.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is not open for proposals"
        )
    
    # Check if freelancer has already submitted a proposal for this project
    existing_proposal = db.query(Proposal).filter(
        Proposal.project_id == proposal.project_id,
        Proposal.freelancer_id == current_user.id
    ).first()
    if existing_proposal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a proposal for this project"
        )
    
    db_proposal = Proposal(
        project_id=proposal.project_id,
        freelancer_id=current_user.id,
        cover_letter=proposal.cover_letter,
        estimated_hours=proposal.estimated_hours,
        hourly_rate=proposal.hourly_rate,
        availability=proposal.availability,
        attachments=proposal.attachments,
        status="submitted"
    )
    db.add(db_proposal)
    db.commit()
    db.refresh(db_proposal)
    return db_proposal

@router.put("/{proposal_id}", response_model=ProposalRead)
def update_proposal(
    proposal_id: int,
    proposal: ProposalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not db_proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")
    
    # Check if user is the owner of the proposal
    if db_proposal.freelancer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this proposal"
        )
    
    # Check if proposal is still in submitted status
    if db_proposal.status != "submitted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update proposal that is not in submitted status"
        )
    
    update_data = proposal.model_dump(exclude_unset=True, exclude_none=True)
    
    for key, value in update_data.items():
        setattr(db_proposal, key, value)
    
    db.commit()
    db.refresh(db_proposal)
    return db_proposal

@router.delete("/{proposal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not db_proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")
    
    # Check if user is the owner of the proposal
    if db_proposal.freelancer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this proposal"
        )
    
    # Check if proposal is still in submitted status
    if db_proposal.status != "submitted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete proposal that is not in submitted status"
        )
    
    db.delete(db_proposal)
    db.commit()
    return


@router.post("/{proposal_id}/accept", response_model=ProposalRead)
def accept_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Client accepts a proposal for their project"""
    db_proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not db_proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")
    
    # Check if user is the project owner
    project = db.query(Project).filter(Project.id == db_proposal.project_id).first()
    if not project or project.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner can accept proposals"
        )
    
    # Check if proposal is in submitted status
    if db_proposal.status != "submitted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Proposal is not in submitted status"
        )
    
    # Accept the proposal
    db_proposal.status = "accepted"
    
    # Update project status to in_progress
    project.status = "in_progress"
    
    # Reject all other proposals for this project
    db.query(Proposal).filter(
        Proposal.project_id == db_proposal.project_id,
        Proposal.id != proposal_id,
        Proposal.status == "submitted"
    ).update({"status": "rejected"})
    
    db.commit()
    db.refresh(db_proposal)
    return db_proposal


@router.post("/{proposal_id}/reject", response_model=ProposalRead)
def reject_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Client rejects a proposal for their project"""
    db_proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not db_proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")
    
    # Check if user is the project owner
    project = db.query(Project).filter(Project.id == db_proposal.project_id).first()
    if not project or project.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner can reject proposals"
        )
    
    # Check if proposal is in submitted status
    if db_proposal.status != "submitted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Proposal is not in submitted status"
        )
    
    db_proposal.status = "rejected"
    db.commit()
    db.refresh(db_proposal)
    return db_proposal