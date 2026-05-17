# @AI-HINT: Disputes router — file, list, resolve disputes
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows, parse_date

router = APIRouter()


class DisputeCreate(BaseModel):
    contract_id: int
    dispute_type: str = "other"
    title: str
    description: str

class DisputeUpdate(BaseModel):
    status: Optional[str] = None
    resolution: Optional[str] = None
    admin_notes: Optional[str] = None


@router.get("/")
async def list_disputes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    where = "WHERE d.claimant_id = ? OR d.respondent_id = ?"
    params = [current_user.id, current_user.id]

    if status_filter:
        where += " AND d.status = ?"
        params.append(status_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT d.id, d.contract_id, d.claimant_id, d.respondent_id, d.dispute_type,
                   d.title, d.description, d.status, d.resolution, d.admin_notes,
                   d.created_at, d.updated_at,
                   c.project_id, pr.title as project_title
            FROM disputes d
            LEFT JOIN contracts c ON d.contract_id = c.id
            LEFT JOIN projects pr ON c.project_id = pr.id
            {where}
            ORDER BY d.created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.get("/{dispute_id}")
async def get_dispute(dispute_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        """SELECT d.id, d.contract_id, d.claimant_id, d.respondent_id, d.dispute_type,
                  d.title, d.description, d.status, d.resolution, d.admin_notes,
                  d.created_at, d.updated_at
           FROM disputes d
           WHERE d.id = ? AND (d.claimant_id = ? OR d.respondent_id = ?)""",
        [dispute_id, current_user.id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Dispute not found")
    return rows[0]


@router.post("/")
async def create_dispute(request: DisputeCreate, current_user=Depends(get_current_user)):
    contract_result = execute_query(
        "SELECT id, client_id, freelancer_id FROM contracts WHERE id = ?",
        [request.contract_id],
    )
    contract_rows = parse_rows(contract_result)
    if not contract_rows:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = contract_rows[0]
    if contract["client_id"] != current_user.id and contract["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only contract parties can file disputes")

    respondent_id = contract["freelancer_id"] if contract["client_id"] == current_user.id else contract["client_id"]

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO disputes (contract_id, claimant_id, respondent_id, dispute_type, title,
                  description, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?)""",
        [
            request.contract_id, current_user.id, respondent_id,
            request.dispute_type, request.title, request.description,
            now, now,
        ],
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to create dispute")

    return {"message": "Dispute filed successfully", "dispute_id": result.get("last_insert_rowid")}


@router.put("/{dispute_id}")
async def update_dispute(dispute_id: int, request: DisputeUpdate, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, status FROM disputes WHERE id = ?",
        [dispute_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Dispute not found")

    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), dispute_id]

    execute_query(f"UPDATE disputes SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Dispute updated successfully"}


@router.post("/{dispute_id}/assign")
async def assign_dispute(dispute_id: int, data: dict, current_user=Depends(get_current_user)):
    admin_id = data.get("admin_id")
    if not admin_id:
        raise HTTPException(status_code=400, detail="admin_id is required")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE disputes SET assigned_to = ?, status = 'under_review', updated_at = ? WHERE id = ?",
        [admin_id, now, dispute_id],
    )
    return {"message": "Dispute assigned to admin"}


@router.post("/{dispute_id}/resolve")
async def resolve_dispute(dispute_id: int, data: dict, current_user=Depends(get_current_user)):
    resolution = data.get("resolution", "")
    contract_status = data.get("contract_status")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE disputes SET status = 'resolved', resolution = ?, updated_at = ? WHERE id = ?",
        [resolution, now, dispute_id],
    )

    if contract_status:
        execute_query(
            "UPDATE contracts SET status = ? WHERE id = (SELECT contract_id FROM disputes WHERE id = ?)",
            [contract_status, dispute_id],
        )

    return {"message": "Dispute resolved"}


@router.post("/{dispute_id}/evidence")
async def upload_evidence(dispute_id: int, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO dispute_evidence (dispute_id, user_id, evidence_url, created_at) VALUES (?, ?, ?, ?)",
        [dispute_id, current_user.id, "/uploads/evidence/evidence_file", now],
    )
    return {"message": "Evidence uploaded", "evidence_id": result.get("last_insert_rowid")}
