from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json

from app.db.session import get_db
from app.models.proposal import Proposal
from app.models.project import Project
from app.models.user import User
from app.schemas.proposal import ProposalCreate, ProposalRead, ProposalUpdate
from app.core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ProposalRead])
def list_proposals(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Freelancers can see their own proposals, clients can see proposals for their projects
    if current_user.user_type == "Freelancer":
        proposals = db.query(Proposal).filter(Proposal.freelancer_id == current_user.id).offset(skip).limit(limit).all()
    else:
        # Get all projects for this client
        project_ids = db.query(Project.id).filter(Project.client_id == current_user.id).all()
        project_ids = [pid[0] for pid in project_ids]
        proposals = db.query(Proposal).filter(Proposal.project_id.in_(project_ids)).offset(skip).limit(limit).all()
    return proposals

@router.get("/{proposal_id}", response_model=ProposalRead)
def get_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Check if user is authorized to view this proposal
    if current_user.user_type == "Freelancer" and proposal.freelancer_id != current_user.id:
        # Check if user is the client for this project
        project = db.query(Project).filter(Project.id == proposal.project_id).first()
        if not project or project.client_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this proposal")
    
    return proposal

@router.post("/", response_model=ProposalRead, status_code=status.HTTP_201_CREATED)
def create_proposal(
    proposal: ProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is a freelancer
    if current_user.user_type != "Freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can submit proposals")
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == proposal.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if project is open
    if project.status != "open":
        raise HTTPException(status_code=400, detail="Project is not open for proposals")
    
    # Check if freelancer has already submitted a proposal for this project
    existing_proposal = db.query(Proposal).filter(
        Proposal.project_id == proposal.project_id,
        Proposal.freelancer_id == current_user.id
    ).first()
    if existing_proposal:
        raise HTTPException(status_code=400, detail="You have already submitted a proposal for this project")
    
    db_proposal = Proposal(
        project_id=proposal.project_id,
        freelancer_id=current_user.id,
        cover_letter=proposal.cover_letter,
        estimated_hours=proposal.estimated_hours,
        hourly_rate=proposal.hourly_rate,
        availability=proposal.availability,
        attachments=json.dumps(proposal.attachments) if proposal.attachments else None,
        status=proposal.status
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
    current_user: User = Depends(get_current_user)
):
    db_proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not db_proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Check if user is the owner of the proposal
    if db_proposal.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this proposal")
    
    # Check if proposal is still in submitted status
    if db_proposal.status != "submitted":
        raise HTTPException(status_code=400, detail="Cannot update proposal that is not in submitted status")
    
    update_data = proposal.dict(exclude_unset=True)
    if "attachments" in update_data:
        update_data["attachments"] = json.dumps(update_data["attachments"])
    
    for key, value in update_data.items():
        setattr(db_proposal, key, value)
    
    db.commit()
    db.refresh(db_proposal)
    return db_proposal

@router.delete("/{proposal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not db_proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Check if user is the owner of the proposal
    if db_proposal.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this proposal")
    
    # Check if proposal is still in submitted status
    if db_proposal.status != "submitted":
        raise HTTPException(status_code=400, detail="Cannot delete proposal that is not in submitted status")
    
    db.delete(db_proposal)
    db.commit()
    return