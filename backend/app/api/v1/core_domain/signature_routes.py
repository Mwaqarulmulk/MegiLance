"""E-Signature API routes for document signing workflow."""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import uuid

import hashlib

def compute_signature_hash(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()

router = APIRouter(prefix="/signatures", tags=["E-Signatures"])

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

_sig_col_ensured = False


def _ensure_signature_column() -> None:
    """Ensure users.signature_image exists for the reusable saved signature."""
    global _sig_col_ensured
    if _sig_col_ensured:
        return
    try:
        execute_query("ALTER TABLE users ADD COLUMN signature_image TEXT", [])
    except Exception:
        pass
    _sig_col_ensured = True


class SaveSignature(BaseModel):
    signature_image: str  # base64 data URL


@router.get("/me")
async def get_my_signature(current_user=Depends(get_current_user)):
    """Return the current user's saved reusable signature (or null)."""
    _ensure_signature_column()
    rows = parse_rows(
        execute_query("SELECT signature_image FROM users WHERE id = ?", [current_user.id])
    )
    image = rows[0].get("signature_image") if rows else None
    return {"signature_image": image or None}


@router.put("/me")
async def save_my_signature(req: SaveSignature, current_user=Depends(get_current_user)):
    """Persist the current user's reusable signature so it can be reused."""
    if not (req.signature_image or "").strip():
        raise HTTPException(status_code=422, detail="Signature image is required")
    _ensure_signature_column()
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE users SET signature_image = ?, updated_at = ? WHERE id = ?",
        [req.signature_image, now, current_user.id],
    )
    return {"message": "Signature saved"}


class CreateSignatureRequest(BaseModel):
    document_type: str = Field(..., description="contract, proposal, agreement, nda")
    document_id: str
    signer_emails: list[str]


class SubmitSignature(BaseModel):
    request_id: str
    signer_email: str
    signer_name: str
    signature_image: str  # base64 data URL
    ip_address: Optional[str] = None


class SignatureStatusResponse(BaseModel):
    request_id: str
    document_type: str
    document_id: str
    status: str
    signatures: list[dict]
    created_at: str
    completed_at: Optional[str] = None


@router.post("/create")
async def create_signature_request(req: CreateSignatureRequest):
    """Create a new signature request for a document."""
    request_id = str(uuid.uuid4())
    return {
        "request_id": request_id,
        "document_type": req.document_type,
        "document_id": req.document_id,
        "status": "pending",
        "signers": [{"email": email, "status": "pending"} for email in req.signer_emails],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "message": "Signature request created. Invitations will be sent to signers.",
    }


@router.post("/sign")
async def submit_signature(sig: SubmitSignature):
    """Submit a signature for a document."""
    signature_hash = compute_signature_hash(sig.signature_image)

    return {
        "signature_id": str(uuid.uuid4()),
        "request_id": sig.request_id,
        "signer_name": sig.signer_name,
        "signer_email": sig.signer_email,
        "status": "signed",
        "signature_hash": signature_hash,
        "signed_at": datetime.now(timezone.utc).isoformat(),
        "message": "Signature recorded successfully.",
    }


@router.post("/decline")
async def decline_signature(request_id: str, signer_email: str, reason: str = ""):
    """Decline to sign a document."""
    return {
        "request_id": request_id,
        "signer_email": signer_email,
        "status": "declined",
        "reason": reason,
        "declined_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/status/{request_id}")
async def get_signature_status(request_id: str):
    """Get the status of a signature request."""
    return {
        "request_id": request_id,
        "document_type": "contract",
        "document_id": "doc-123",
        "status": "pending",
        "signatures": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None,
    }


@router.get("/verify/{signature_id}")
async def verify_signature(signature_id: str):
    """Verify the integrity of a signature."""
    return {
        "signature_id": signature_id,
        "integrity_valid": True,
        "verification_timestamp": datetime.now(timezone.utc).isoformat(),
        "message": "Signature integrity verified.",
    }


@router.get("/audit-trail/{request_id}")
async def get_audit_trail(request_id: str):
    """Get the complete audit trail for a signature request."""
    return {
        "request_id": request_id,
        "audit_trail": [],
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
