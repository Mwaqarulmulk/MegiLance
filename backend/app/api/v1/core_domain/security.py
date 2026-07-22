# @AI-HINT: Security router — advanced security features (MFA, sessions, password change)
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from pydantic import BaseModel
from typing import Any, Dict, Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import (
    get_current_user,
    get_password_hash,
    verify_password,
    validate_password_strength,
    decode_token,
    add_token_to_blacklist,
    invalidate_user_cache,
)
from app.db.turso_http import execute_query, parse_rows
from app.services.advanced_security import (
    MFASetupRequest,
    MFAVerifyRequest,
    get_security_service,
)

router = APIRouter()


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class SessionRevoke(BaseModel):
    session_id: Optional[str] = None


class RiskAssessmentRequest(BaseModel):
    event_type: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    recipient_id: Optional[int] = None


@router.post("/mfa/setup")
async def setup_mfa(body: MFASetupRequest, current_user=Depends(get_current_user)):
    """Start setup for a supported MFA method."""
    known_methods = {"totp", "sms", "email", "webauthn", "hardware_key"}
    if body.method not in known_methods:
        raise HTTPException(status_code=400, detail="Unsupported MFA method")
    if body.method != "totp":
        raise HTTPException(
            status_code=501,
            detail="This MFA method is not available. Use an authenticator app.",
        )

    contact = body.phone_number if body.method == "sms" else body.email
    return await get_security_service().setup_mfa(current_user.id, body.method, contact)


@router.post("/mfa/verify")
async def verify_mfa(body: MFAVerifyRequest, current_user=Depends(get_current_user)):
    """Verify the pending MFA method before treating it as usable."""
    result = await get_security_service().verify_mfa(
        current_user.id,
        body.method,
        body.code,
        body.device_info,
    )
    if not result.get("verified"):
        raise HTTPException(status_code=400, detail=result.get("error", "Verification failed"))
    return result


@router.get("/mfa/methods")
def list_mfa_methods(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, method, contact, is_active, created_at FROM mfa_methods WHERE user_id = ? ORDER BY created_at DESC",
        [current_user.id],
    )
    return {"methods": parse_rows(result) or []}


@router.delete("/mfa/disable")
def disable_mfa(current_user=Depends(get_current_user)):
    execute_query("DELETE FROM mfa_backup_codes WHERE user_id = ?", [current_user.id])
    execute_query("DELETE FROM mfa_methods WHERE user_id = ?", [current_user.id])
    execute_query(
        "UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?",
        [current_user.id],
    )
    return {"message": "MFA disabled successfully"}


@router.post("/risk-assessment")
async def assess_risk(
    request: Request,
    body: RiskAssessmentRequest,
    current_user=Depends(get_current_user),
):
    """Assess authentication or payment risk using available request signals."""
    ip_address = body.ip_address or (request.client.host if request.client else "unknown")
    user_agent = body.user_agent or request.headers.get("user-agent", "unknown")
    assessment = await get_security_service().assess_login_risk(
        current_user.id,
        ip_address,
        user_agent,
        body.location,
    )
    result = assessment.model_dump()
    if body.event_type == "payment" and body.amount and body.amount >= 10000:
        result["risk_score"] = min(100.0, result["risk_score"] + 30.0)
        result["factors"].append({
            "factor": "high_value_payment",
            "weight": 30.0,
            "description": "High-value payment requires additional verification",
        })
        if result["risk_score"] >= 60:
            result.update({
                "risk_level": "high",
                "recommended_action": "mfa_required",
                "require_additional_auth": True,
            })
    return result


@router.delete("/sessions/{session_id}")
async def revoke_session_by_id(session_id: int, current_user=Depends(get_current_user)):
    existing = parse_rows(execute_query(
        "SELECT id FROM user_sessions WHERE id = ? AND user_id = ?",
        [session_id, current_user.id],
    ))
    if not existing:
        raise HTTPException(status_code=404, detail="Session not found")
    return await get_security_service().revoke_session(current_user.id, session_id)


@router.get("/security-events")
def list_security_events(
    severity: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
):
    conditions = ["user_id = ?"]
    params: list[Any] = [current_user.id]
    if severity:
        conditions.append("severity = ?")
        params.append(severity)
    if event_type:
        conditions.append("event_type = ?")
        params.append(event_type)
    result = execute_query(
        "SELECT id, event_type, severity, description, ip_address, user_agent, metadata, created_at "
        f"FROM security_events WHERE {' AND '.join(conditions)} ORDER BY created_at DESC LIMIT 100",
        params,
    )
    return {"events": parse_rows(result) or []}


@router.post("/change-password")
def change_password(request: Request, body: PasswordChange, current_user=Depends(get_current_user)):
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    is_valid, errors = validate_password_strength(body.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=errors)

    hashed = get_password_hash(body.new_password)
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE users SET hashed_password = ?, last_password_changed = ?, updated_at = ? WHERE id = ?",
        [hashed, now, now, current_user.id],
    )

    # Invalidate the current access token
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if token:
        try:
            payload = decode_token(token)
            exp = payload.get("exp")
            if exp:
                expiry = datetime.fromtimestamp(exp, tz=timezone.utc)
                add_token_to_blacklist(token, expiry, reason="password_change")
        except Exception:
            pass

    # Invalidate ALL refresh tokens for this user by deleting sessions
    execute_query("DELETE FROM user_sessions WHERE user_id = ?", [current_user.id])

    # Clear user cache so fresh data is fetched
    invalidate_user_cache(current_user.email)

    logger.info(f"Password changed for user {current_user.id}, all tokens invalidated")
    return {"message": "Password changed successfully. Please login again."}


@router.get("/sessions")
def list_sessions(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, created_at, expires_at, ip_address, user_agent, is_active, last_accessed "
        "FROM user_sessions WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"sessions": rows if rows else []}


@router.post("/sessions/revoke")
def revoke_session(request: SessionRevoke, current_user=Depends(get_current_user)):
    if request.session_id:
        execute_query("DELETE FROM user_sessions WHERE id = ? AND user_id = ?", [request.session_id, current_user.id])
    else:
        execute_query("DELETE FROM user_sessions WHERE user_id = ?", [current_user.id])
    return {"message": "Session(s) revoked"}


@router.get("/login-history")
def login_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    offset = (page - 1) * page_size
    result = execute_query(
        "SELECT id, ip_address, user_agent, success, created_at FROM audit_logs WHERE user_id = ? AND action = 'login' ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [current_user.id, page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.post("/logout-all")
def logout_all(request: Request, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM user_sessions WHERE user_id = ?", [current_user.id])

    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if token:
        try:
            payload = decode_token(token)
            exp = payload.get("exp")
            if exp:
                add_token_to_blacklist(token, datetime.fromtimestamp(exp, tz=timezone.utc))
        except Exception:
            pass

    return {"message": "Logged out from all devices"}
