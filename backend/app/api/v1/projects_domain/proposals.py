# @AI-HINT: Proposals router — submit, list, accept/reject proposals
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows, parse_date
from app.services.db_utils import get_val as _get_val, safe_str as _safe_str
from app.services.proposals_service import (
    list_proposals,
    get_proposal_with_joins,
    get_proposal_raw,
    has_submitted_proposal,
    project_exists,
    get_project_status,
    get_project_client_id,
    create_proposal,
    create_draft_proposal,
    get_draft_proposals,
)

router = APIRouter()


class ProposalCreate(BaseModel):
    project_id: int
    cover_letter: str
    bid_amount: Optional[float] = None
    estimated_hours: Optional[float] = None
    hourly_rate: Optional[float] = None
    availability: Optional[str] = None
    attachments: Optional[str] = None
    is_draft: bool = False

class ProposalUpdate(BaseModel):
    cover_letter: Optional[str] = None
    bid_amount: Optional[float] = None
    estimated_hours: Optional[float] = None
    hourly_rate: Optional[float] = None
    availability: Optional[str] = None
    attachments: Optional[str] = None


@router.get("/")
async def list_my_proposals(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    proposals = list_proposals(
        user_id=current_user.id,
        user_type=current_user.user_type,
        status_filter=status_filter,
        limit=page_size,
        skip=(page - 1) * page_size,
    )
    return {"items": proposals, "total": len(proposals), "page": page}


@router.get("/{proposal_id}")
async def get_proposal(proposal_id: int, current_user=Depends(get_current_user)):
    proposal = get_proposal_with_joins(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal["freelancer_id"] != current_user.id:
        client_id = get_project_client_id(proposal["project_id"])
        if client_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return proposal


@router.post("/")
async def create_proposal_endpoint(request: ProposalCreate, current_user=Depends(get_current_user)):
    if not project_exists(request.project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    project_status = get_project_status(request.project_id)
    if project_status != "open":
        raise HTTPException(status_code=400, detail="Project is not accepting proposals")

    if not request.is_draft and has_submitted_proposal(request.project_id, current_user.id):
        raise HTTPException(status_code=409, detail="You already submitted a proposal for this project")

    proposal_data = request.model_dump()

    if request.is_draft:
        proposal = create_draft_proposal(current_user.id, proposal_data)
    else:
        proposal = create_proposal(current_user.id, proposal_data)

    if not proposal:
        raise HTTPException(status_code=500, detail="Failed to create proposal")

    return {"message": "Proposal created successfully", "proposal": proposal}


@router.put("/{proposal_id}")
async def update_proposal(proposal_id: int, request: ProposalUpdate, current_user=Depends(get_current_user)):
    proposal = get_proposal_raw(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if proposal["status"] != "draft":
        raise HTTPException(status_code=400, detail="Cannot update submitted proposal")

    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), proposal_id]

    execute_query(f"UPDATE proposals SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Proposal updated successfully"}


@router.delete("/{proposal_id}")
async def delete_proposal(proposal_id: int, current_user=Depends(get_current_user)):
    proposal = get_proposal_raw(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    execute_query("DELETE FROM proposals WHERE id = ?", [proposal_id])
    return {"message": "Proposal deleted successfully"}


@router.post("/{proposal_id}/submit")
async def submit_proposal(proposal_id: int, current_user=Depends(get_current_user)):
    proposal = get_proposal_raw(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if proposal["status"] != "draft":
        raise HTTPException(status_code=400, detail="Proposal already submitted")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE proposals SET status = 'submitted', is_draft = 0, updated_at = ? WHERE id = ?",
        [now, proposal_id],
    )
    return {"message": "Proposal submitted successfully"}


@router.post("/{proposal_id}/accept")
async def accept_proposal(proposal_id: int, current_user=Depends(get_current_user)):
    proposal = get_proposal_with_joins(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    client_id = get_project_client_id(proposal["project_id"])
    if client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project owner can accept proposals")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE proposals SET status = 'accepted', updated_at = ? WHERE id = ?",
        [now, proposal_id],
    )
    execute_query(
        "UPDATE proposals SET status = 'rejected', updated_at = ? WHERE project_id = ? AND id != ? AND status = 'submitted'",
        [now, proposal["project_id"], proposal_id],
    )

    return {"message": "Proposal accepted successfully", "proposal_id": proposal_id}


@router.post("/{proposal_id}/reject")
async def reject_proposal(proposal_id: int, current_user=Depends(get_current_user)):
    proposal = get_proposal_with_joins(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    client_id = get_project_client_id(proposal["project_id"])
    if client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project owner can reject proposals")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE proposals SET status = 'rejected', updated_at = ? WHERE id = ?",
        [now, proposal_id],
    )
    return {"message": "Proposal rejected successfully"}


@router.get("/drafts")
async def get_draft_proposals(
    project_id: Optional[int] = Query(None),
    current_user=Depends(get_current_user),
):
    drafts = get_draft_proposals(current_user.id, project_id)
    return {"items": drafts, "total": len(drafts)}


@router.get("/project/{project_id}")
async def get_proposals_by_project(project_id: int, current_user=Depends(get_current_user)):
    proposals = list_proposals(
        user_id=current_user.id,
        user_type=current_user.user_type,
        project_id=project_id,
    )
    return {"items": proposals, "total": len(proposals)}


@router.post("/draft")
async def save_draft_proposal(request: ProposalCreate, current_user=Depends(get_current_user)):
    if not project_exists(request.project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    proposal_data = request.model_dump()
    proposal_data["is_draft"] = True

    proposal = create_draft_proposal(current_user.id, proposal_data)
    if not proposal:
        raise HTTPException(status_code=500, detail="Failed to save draft")

    return {"message": "Draft saved successfully", "proposal": proposal}


@router.post("/{proposal_id}/withdraw")
async def withdraw_proposal(proposal_id: int, current_user=Depends(get_current_user)):
    proposal = get_proposal_raw(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE proposals SET status = 'withdrawn', updated_at = ? WHERE id = ?",
        [now, proposal_id],
    )
    return {"message": "Proposal withdrawn successfully"}
