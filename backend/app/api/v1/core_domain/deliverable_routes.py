"""Deliverables API routes for milestone file submission and approval."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/deliverables", tags=["Deliverables"])


class SubmitDeliverable(BaseModel):
    milestone_id: str
    contract_id: str
    title: str
    description: str = ""
    submission_notes: str = ""
    files: list[dict] = Field(default_factory=list, description="List of file objects with name, url, size, type")


class ReviewDeliverable(BaseModel):
    deliverable_id: str
    action: str = Field(..., description="approve, reject, or request_revision")
    reviewer_notes: str = ""
    rejection_reason: str = ""


class AddComment(BaseModel):
    deliverable_id: str
    comment: str


@router.post("/submit")
async def submit_deliverable(req: SubmitDeliverable):
    """Submit a deliverable for a milestone."""
    deliverable_id = str(uuid.uuid4())
    return {
        "deliverable_id": deliverable_id,
        "milestone_id": req.milestone_id,
        "contract_id": req.contract_id,
        "title": req.title,
        "status": "submitted",
        "files_count": len(req.files),
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "message": "Deliverable submitted for review.",
    }


@router.post("/review")
async def review_deliverable(req: ReviewDeliverable):
    """Review and approve/reject a deliverable."""
    if req.action not in ("approve", "reject", "request_revision"):
        raise HTTPException(status_code=400, detail="Action must be approve, reject, or request_revision")

    status_map = {
        "approve": "approved",
        "reject": "rejected",
        "request_revision": "revision_requested",
    }

    return {
        "deliverable_id": req.deliverable_id,
        "status": status_map[req.action],
        "reviewer_notes": req.reviewer_notes,
        "rejection_reason": req.rejection_reason if req.action == "reject" else None,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "message": f"Deliverable {status_map[req.action]}.",
    }


@router.post("/resubmit")
async def resubmit_deliverable(deliverable_id: str, submission_notes: str = "", files: list[dict] = []):
    """Resubmit a deliverable after revision."""
    return {
        "deliverable_id": deliverable_id,
        "status": "resubmitted",
        "revision_count": 1,
        "submission_notes": submission_notes,
        "files_count": len(files),
        "resubmitted_at": datetime.now(timezone.utc).isoformat(),
        "message": "Deliverable resubmitted for review.",
    }


@router.post("/comment")
async def add_comment(req: AddComment):
    """Add a comment to a deliverable."""
    return {
        "comment_id": str(uuid.uuid4()),
        "deliverable_id": req.deliverable_id,
        "comment": req.comment,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/milestone/{milestone_id}")
async def get_milestone_deliverables(milestone_id: str):
    """Get all deliverables for a milestone."""
    return {
        "milestone_id": milestone_id,
        "deliverables": [],
        "total_count": 0,
    }


@router.get("/{deliverable_id}")
async def get_deliverable(deliverable_id: str):
    """Get deliverable details with files and comments."""
    return {
        "deliverable_id": deliverable_id,
        "title": "",
        "status": "submitted",
        "files": [],
        "comments": [],
    }
