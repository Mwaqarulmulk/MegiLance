# @AI-HINT: Verification router — KYC/identity verification workflow
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
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


class PhoneCodeRequest(BaseModel):
    phone_number: str


class PhoneVerifyRequest(BaseModel):
    phone_number: str
    verification_code: str


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


@router.get("/documents")
async def get_documents(
    document_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    where = "WHERE user_id = ?"
    params = [current_user.id]

    if document_type:
        where += " AND document_type = ?"
        params.append(document_type)
    if status_filter:
        where += " AND status = ?"
        params.append(status_filter)

    result = execute_query(
        f"SELECT id, document_type, document_url, status, submitted_at, reviewed_at, reviewer_notes FROM user_verifications {where} ORDER BY submitted_at DESC",
        params,
    )
    rows = parse_rows(result)
    return {"documents": rows if rows else []}


@router.post("/upload-document")
async def upload_document(
    document_type: str = Query(...),
    id_number: Optional[str] = Query(None),
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """Upload a verification document and save it to disk."""
    import os
    import uuid

    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"File type '{file.content_type}' not allowed. Use JPEG, PNG, WebP, or PDF.")

    # Validate file size (10MB max)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

    # Create upload directory
    upload_dir = os.path.join("uploads", "verification", str(current_user.id))
    os.makedirs(upload_dir, exist_ok=True)

    # Save file with unique name
    ext = os.path.splitext(file.filename or "document")[1] or ".bin"
    filename = f"doc_{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    file_url = f"/uploads/verification/{current_user.id}/{filename}"
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO user_verifications (user_id, verification_type, document_type, document_url, id_number, status, submitted_at) VALUES (?, 'identity', ?, ?, ?, 'pending', ?)",
        [current_user.id, document_type, file_url, id_number or "", now],
    )
    return {"message": "Document uploaded", "verification_id": result.get("last_insert_rowid"), "file_url": file_url}


@router.post("/upload-selfie")
async def upload_selfie(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """Upload a selfie for identity verification."""
    import os
    import uuid

    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"File type '{file.content_type}' not allowed. Use JPEG, PNG, or WebP.")

    # Validate file size (5MB max for selfies)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    # Create upload directory
    upload_dir = os.path.join("uploads", "verification", str(current_user.id))
    os.makedirs(upload_dir, exist_ok=True)

    # Save file with unique name
    ext = os.path.splitext(file.filename or "selfie")[1] or ".jpg"
    filename = f"selfie_{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    file_url = f"/uploads/verification/{current_user.id}/{filename}"
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO user_verifications (user_id, verification_type, document_type, document_url, status, submitted_at) VALUES (?, 'identity', 'selfie', ?, 'pending', ?)",
        [current_user.id, file_url, now],
    )
    return {"message": "Selfie uploaded", "verification_id": result.get("last_insert_rowid"), "file_url": file_url}


@router.get("/tiers")
async def get_tiers(current_user=Depends(get_current_user)):
    return {
        "tiers": [
            {"name": "basic", "label": "Basic", "requirements": ["Email verified"], "benefits": ["Access to basic projects"]},
            {"name": "verified", "label": "Verified", "requirements": ["ID verification", "Phone verification"], "benefits": ["Access to all projects", "Higher visibility"]},
            {"name": "premium", "label": "Premium", "requirements": ["ID verification", "Phone verification", "Background check"], "benefits": ["Premium badge", "Priority support", "Lower fees"]},
        ]
    }


@router.get("/supported-documents")
async def get_supported_documents(current_user=Depends(get_current_user)):
    return {
        "documents": [
            {"type": "passport", "label": "Passport", "required_fields": ["id_number"]},
            {"type": "national_id", "label": "National ID", "required_fields": ["id_number"]},
            {"type": "drivers_license", "label": "Driver's License", "required_fields": ["id_number"]},
            {"type": "utility_bill", "label": "Utility Bill", "required_fields": []},
        ]
    }


@router.post("/phone/send-code")
async def send_phone_code(request: PhoneCodeRequest, current_user=Depends(get_current_user)):
    """Send a phone verification code via SMS (or email fallback)."""
    import random
    import hashlib
    from app.core.config import get_settings

    settings = get_settings()
    code = str(random.randint(100000, 999999))
    now = datetime.now(timezone.utc).isoformat()

    # Store the code in DB
    result = execute_query(
        "INSERT INTO phone_verifications (user_id, phone_number, verification_code, expires_at, status, created_at) VALUES (?, ?, ?, datetime('now', '+10 minutes'), 'pending', ?)",
        [current_user.id, request.phone_number, code, now],
    )

    # Try to send SMS via configured provider
    sms_sent = False
    try:
        # Try Twilio if configured
        if getattr(settings, "TWILIO_ACCOUNT_SID", None) and getattr(settings, "TWILIO_AUTH_TOKEN", None) and getattr(settings, "TWILIO_PHONE_NUMBER", None):
            from twilio.rest import Client as TwilioClient
            twilio_client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            twilio_client.messages.create(
                body=f"Your MegiLance verification code is: {code}. It expires in 10 minutes.",
                from_=settings.TWILIO_PHONE_NUMBER,
                to=request.phone_number,
            )
            sms_sent = True
            logger.info(f"phone_code_sent user={current_user.id} method=twilio")
        # Try AWS SNS if configured
        elif getattr(settings, "sns_topic_arn", None):
            import boto3
            sns = boto3.client("sns", region_name=getattr(settings, "ses_region", "us-east-1"))
            sns.publish(
                PhoneNumber=request.phone_number,
                Message=f"Your MegiLance verification code is: {code}. It expires in 10 minutes.",
            )
            sms_sent = True
            logger.info(f"phone_code_sent user={current_user.id} method=sns")
    except Exception as e:
        logger.warning(f"phone_code_send_failed user={current_user.id} error={e}")

    if not sms_sent:
        # Fallback: log the code for development (never expose in production response)
        logger.info(f"phone_code_dev_only user={current_user.id} phone={request.phone_number} code={code}")
        return {
            "message": "Verification code generated (SMS not configured — check server logs for dev code)",
            "expires_in": 600,
            "dev_mode": True,
        }

    return {"message": "Verification code sent via SMS", "expires_in": 600}


@router.post("/phone/verify")
async def verify_phone_code(request: PhoneVerifyRequest, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id FROM phone_verifications WHERE user_id = ? AND phone_number = ? AND verification_code = ? AND status = 'pending' AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1",
        [current_user.id, request.phone_number, request.verification_code],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    execute_query("UPDATE phone_verifications SET status = 'verified' WHERE id = ?", [rows[0]["id"]])
    execute_query("UPDATE users SET phone_verified = 1, phone_number = ? WHERE id = ?", [request.phone_number, current_user.id])
    return {"message": "Phone verified successfully"}


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
