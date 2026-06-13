# @AI-HINT: Security router — advanced security features (MFA, sessions, password change)
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from pydantic import BaseModel
from typing import Optional
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

router = APIRouter()


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class SessionRevoke(BaseModel):
    session_id: Optional[str] = None


@router.post("/change-password")
async def change_password(request: Request, body: PasswordChange, current_user=Depends(get_current_user)):
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    is_valid, errors = validate_password_strength(request.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=errors)

    hashed = get_password_hash(request.new_password)
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
async def list_sessions(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, token, created_at, expires_at, ip_address, user_agent FROM user_sessions WHERE user_id = ? ORDER BY created_at DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"sessions": rows if rows else []}


@router.post("/sessions/revoke")
async def revoke_session(request: SessionRevoke, current_user=Depends(get_current_user)):
    if request.session_id:
        execute_query("DELETE FROM user_sessions WHERE id = ? AND user_id = ?", [request.session_id, current_user.id])
    else:
        execute_query("DELETE FROM user_sessions WHERE user_id = ?", [current_user.id])
    return {"message": "Session(s) revoked"}


@router.get("/login-history")
async def login_history(
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
async def logout_all(request: Request, current_user=Depends(get_current_user)):
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
