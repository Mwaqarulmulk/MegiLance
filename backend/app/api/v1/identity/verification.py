# @AI-HINT: Verification router — KYC/identity verification workflow
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class VerificationSubmit(BaseModel):
    document_type: str
    document_url: str
    id_number: Optional[str] = None

class VerificationReview(BaseModel):
    status: str
    notes: Optional[str] = None


@router.get("/status")
async def get_verification_status(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, user_id, verification_type, status, document_type, document_url, submitted_at, reviewed_at, reviewer_notes FROM user_verifications WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1",
        [current_user.id],
    )
    rows = parse_rows(result)
    if rows:
        return rows[0]
    return {"status": "not_started", "message": "No verification submitted"}


@router.post("/submit")
async def submit_verification(request: VerificationSubmit, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO user_verifications (user_id, verification_type, document_type, document_url, id_number, status, submitted_at) VALUES (?, 'identity', ?, ?, ?, 'pending', ?)",
        [current_user.id, request.document_type, request.document_url, request.id_number or "", now],
    )
    return {"message": "Verification documents submitted", "verification_id": result.get("last_insert_rowid")}


@router.get("/pending")
async def list_pending_verifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(require_admin),
):
    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT v.id, v.user_id, v.verification_type, v.document_type, v.document_url, v.status, v.submitted_at,
                  u.name as user_name, u.email as user_email
           FROM user_verifications v
           LEFT JOIN users u ON v.user_id = u.id
           WHERE v.status = 'pending'
           ORDER BY v.submitted_at ASC
           LIMIT ? OFFSET ?""",
        [page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.put("/{verification_id}/review")
async def review_verification(verification_id: int, request: VerificationReview, current_user=Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE user_verifications SET status = ?, reviewer_notes = ?, reviewed_at = ? WHERE id = ?",
        [request.status, request.notes or "", now, verification_id],
    )

    if request.status == "approved":
        execute_query("UPDATE users SET is_verified = 1 WHERE id = (SELECT user_id FROM user_verifications WHERE id = ?)", [verification_id])

    return {"message": f"Verification {request.status}"}


@router.get("/history")
async def get_verification_history(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, verification_type, document_type, status, submitted_at, reviewed_at, reviewer_notes FROM user_verifications WHERE user_id = ? ORDER BY submitted_at DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"history": rows if rows else []}
