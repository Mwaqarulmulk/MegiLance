"""E-Signature service for contract and agreement signing."""

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Column, String, DateTime, Text, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
import hashlib
import json
import secrets
import enum

from app.db.session import Base


class SignatureStatus(str, enum.Enum):
    PENDING = "pending"
    SIGNED = "signed"
    DECLINED = "declined"
    EXPIRED = "expired"


class SignatureRequest(Base):
    __tablename__ = "signature_requests"

    id = Column(String(36), primary_key=True)
    document_type = Column(String(50), nullable=False)  # contract, proposal, agreement, nda
    document_id = Column(String(36), nullable=False)
    status = Column(String(20), default=SignatureStatus.PENDING.value)
    requester_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    signatures = relationship("DocumentSignature", back_populates="request")


class DocumentSignature(Base):
    __tablename__ = "document_signatures"

    id = Column(String(36), primary_key=True)
    request_id = Column(String(36), ForeignKey("signature_requests.id"), nullable=False)
    signer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    signer_name = Column(String(255), nullable=False)
    signer_email = Column(String(255), nullable=False)
    signature_image = Column(Text, nullable=False)  # base64 data URL
    signature_hash = Column(String(64), nullable=False)  # SHA-256 of signature data
    signed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ip_address = Column(String(45), nullable=True)
    status = Column(String(20), default=SignatureStatus.PENDING.value)
    declined_reason = Column(Text, nullable=True)

    # Relationships
    request = relationship("SignatureRequest", back_populates="signatures")


def compute_signature_hash(signature_data: str) -> str:
    """Compute SHA-256 hash of signature data for integrity verification."""
    return hashlib.sha256(signature_data.encode('utf-8')).hexdigest()


def generate_signature_token() -> str:
    """Generate a unique token for signature verification."""
    return secrets.token_urlsafe(32)


def verify_signature_integrity(signature: DocumentSignature) -> bool:
    """Verify that a signature hasn't been tampered with."""
    computed_hash = compute_signature_hash(signature.signature_image)
    return computed_hash == signature.signature_hash


def get_signature_audit_trail(request: SignatureRequest) -> list[dict]:
    """Generate a complete audit trail for a signature request."""
    trail = []
    trail.append({
        "event": "request_created",
        "timestamp": request.created_at.isoformat() if request.created_at else None,
        "user_id": request.requester_id,
        "document_type": request.document_type,
        "document_id": request.document_id,
    })

    for sig in request.signatures:
        trail.append({
            "event": f"signature_{sig.status}",
            "timestamp": sig.signed_at.isoformat() if sig.signed_at else None,
            "signer_id": sig.signer_id,
            "signer_name": sig.signer_name,
            "signer_email": sig.signer_email,
            "signature_hash": sig.signature_hash,
            "ip_address": sig.ip_address,
            "integrity_valid": verify_signature_integrity(sig),
        })

    if request.completed_at:
        trail.append({
            "event": "request_completed",
            "timestamp": request.completed_at.isoformat(),
            "total_signatures": len([s for s in request.signatures if s.status == SignatureStatus.SIGNED.value]),
        })

    return trail
