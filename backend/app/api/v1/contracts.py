from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json

from app.db.session import get_db
from app.models.contract import Contract
from app.models.project import Project
from app.models.proposal import Proposal
from app.models.user import User
from app.schemas.contract import ContractCreate, ContractRead, ContractUpdate
from app.core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ContractRead])
def list_contracts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can see contracts they are part of (either as client or freelancer)
    contracts = db.query(Contract).filter(
        (Contract.client_id == current_user.id) | (Contract.freelancer_id == current_user.id)
    ).offset(skip).limit(limit).all()
    return contracts

@router.get("/{contract_id}", response_model=ContractRead)
def get_contract(
    contract_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Check if user is part of this contract
    if contract.client_id != current_user.id and contract.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this contract")
    
    return contract

@router.post("/", response_model=ContractRead, status_code=status.HTTP_201_CREATED)
def create_contract(
    contract: ContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is a client
    if current_user.user_type != "Client":
        raise HTTPException(status_code=403, detail="Only clients can create contracts")
    
    # Check if project exists and belongs to this client
    project = db.query(Project).filter(Project.id == contract.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create contract for this project")
    
    # Check if freelancer exists
    freelancer = db.query(User).filter(User.id == contract.freelancer_id).first()
    if not freelancer:
        raise HTTPException(status_code=404, detail="Freelancer not found")
    if freelancer.user_type != "Freelancer":
        raise HTTPException(status_code=400, detail="User is not a freelancer")
    
    # Check if proposal exists and is accepted
    proposal = db.query(Proposal).filter(
        Proposal.project_id == contract.project_id,
        Proposal.freelancer_id == contract.freelancer_id
    ).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    if proposal.status != "accepted":
        raise HTTPException(status_code=400, detail="Proposal is not accepted")
    
    # Generate contract ID (in a real app, this would be a blockchain address)
    import uuid
    contract_id = str(uuid.uuid4())
    
    db_contract = Contract(
        id=contract_id,
        project_id=contract.project_id,
        freelancer_id=contract.freelancer_id,
        client_id=current_user.id,
        value=contract.value,
        status=contract.status,
        start_date=contract.start_date,
        end_date=contract.end_date,
        description=contract.description,
        milestones=json.dumps(contract.milestones),
        terms=json.dumps(contract.terms)
    )
    db.add(db_contract)
    
    # Update proposal status to contracted
    proposal.status = "contracted"
    db.commit()
    db.refresh(db_contract)
    return db_contract

@router.put("/{contract_id}", response_model=ContractRead)
def update_contract(
    contract_id: str,
    contract: ContractUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not db_contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Check if user is part of this contract
    if db_contract.client_id != current_user.id and db_contract.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this contract")
    
    update_data = contract.dict(exclude_unset=True)
    if "milestones" in update_data:
        update_data["milestones"] = json.dumps(update_data["milestones"])
    if "terms" in update_data:
        update_data["terms"] = json.dumps(update_data["terms"])
    
    for key, value in update_data.items():
        setattr(db_contract, key, value)
    
    db.commit()
    db.refresh(db_contract)
    return db_contract

@router.delete("/{contract_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contract(
    contract_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not db_contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Check if user is the client who created this contract
    if db_contract.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this contract")
    
    db.delete(db_contract)
    db.commit()
    return