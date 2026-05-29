# @AI-HINT: Social login router — OAuth with Google, GitHub, LinkedIn
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging
import httpx
import secrets
import hashlib

logger = logging.getLogger(__name__)

from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_user_by_email,
    get_user_by_id,
    get_current_user,
)
from app.db.turso_http import execute_query, parse_rows
from app.core.config import get_settings

router = APIRouter()

# In-memory state store for CSRF protection (in production, use Redis)
_oauth_states: dict[str, dict] = {}
_STATE_TTL = 600  # 10 minutes


class SocialAuthStart(BaseModel):
    provider: str
    redirect_uri: Optional[str] = None

class SocialAuthComplete(BaseModel):
    code: str
    state: str

class SocialSelectRole(BaseModel):
    role: str


def _generate_oauth_state(provider: str) -> str:
    """Generate a cryptographically secure state parameter for CSRF protection."""
    state = secrets.token_urlsafe(32)
    _oauth_states[state] = {
        "provider": provider,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return state


def _validate_oauth_state(state: str) -> Optional[str]:
    """Validate and consume an OAuth state parameter. Returns provider name or None."""
    import time
    state_data = _oauth_states.pop(state, None)
    if not state_data:
        return None
    # Check TTL
    try:
        created = datetime.fromisoformat(state_data["created_at"])
        if (datetime.now(timezone.utc) - created).total_seconds() > _STATE_TTL:
            return None
    except (ValueError, KeyError):
        return None
    return state_data.get("provider")


@router.get("/providers")
async def get_providers():
    settings = get_settings()
    providers = []
    if settings.GOOGLE_CLIENT_ID:
        providers.append({"id": "google", "name": "Google", "enabled": True})
    if settings.GITHUB_CLIENT_ID:
        providers.append({"id": "github", "name": "GitHub", "enabled": True})
    if settings.LINKEDIN_CLIENT_ID:
        providers.append({"id": "linkedin", "name": "LinkedIn", "enabled": True})
    return {"providers": providers}


@router.post("/start")
async def start_social_auth(request: SocialAuthStart):
    settings = get_settings()
    provider = request.provider.lower()

    # Generate CSRF state
    state = _generate_oauth_state(provider)

    if provider == "google":
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=400, detail="Google OAuth not configured")
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth"
            f"?client_id={settings.GOOGLE_CLIENT_ID}"
            f"&redirect_uri={request.redirect_uri or 'http://localhost:3000/callback'}"
            f"&response_type=code&scope=email%20profile&state={state}"
        )
    elif provider == "github":
        if not settings.GITHUB_CLIENT_ID:
            raise HTTPException(status_code=400, detail="GitHub OAuth not configured")
        auth_url = (
            f"https://github.com/login/oauth/authorize"
            f"?client_id={settings.GITHUB_CLIENT_ID}"
            f"&redirect_uri={request.redirect_uri or 'http://localhost:3000/callback'}"
            f"&scope=user:email&state={state}"
        )
    elif provider == "linkedin":
        if not settings.LINKEDIN_CLIENT_ID:
            raise HTTPException(status_code=400, detail="LinkedIn OAuth not configured")
        auth_url = (
            f"https://www.linkedin.com/oauth/v2/authorization"
            f"?response_type=code&client_id={settings.LINKEDIN_CLIENT_ID}"
            f"&redirect_uri={request.redirect_uri or 'http://localhost:3000/callback'}"
            f"&state={state}&scope=openid%20profile%20email"
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    return {"auth_url": auth_url, "state": state}


@router.post("/complete")
async def complete_social_auth(request: SocialAuthComplete):
    settings = get_settings()

    # Validate CSRF state
    provider = _validate_oauth_state(request.state)
    if not provider:
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth state. Please try again.")

    redirect_uri = "http://localhost:3000/callback"
    email = None
    name = None

    try:
        if provider == "google":
            async with httpx.AsyncClient() as client:
                token_resp = await client.post("https://oauth2.googleapis.com/token", data={
                    "code": request.code, "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET, "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                })
                tokens = token_resp.json()
                if "error" in tokens:
                    raise HTTPException(status_code=400, detail=f"Google OAuth error: {tokens['error_description']}")
                user_resp = await client.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={"Authorization": f"Bearer {tokens.get('access_token')}"})
                user_data = user_resp.json()
                email = user_data.get("email")
                name = user_data.get("name")

        elif provider == "github":
            async with httpx.AsyncClient() as client:
                token_resp = await client.post("https://github.com/login/oauth/access_token", data={
                    "code": request.code, "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET, "redirect_uri": redirect_uri,
                }, headers={"Accept": "application/json"})
                tokens = token_resp.json()
                if "error" in tokens:
                    raise HTTPException(status_code=400, detail=f"GitHub OAuth error: {tokens['error_description']}")
                user_resp = await client.get("https://api.github.com/user", headers={"Authorization": f"Bearer {tokens.get('access_token')}"})
                user_data = user_resp.json()
                email_resp = await client.get("https://api.github.com/user/emails", headers={"Authorization": f"Bearer {tokens.get('access_token')}"})
                emails = email_resp.json()
                email = next((e["email"] for e in emails if e.get("primary")), emails[0]["email"] if emails else None)
                name = user_data.get("name") or user_data.get("login")

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"social_auth_error provider={provider} error={e}")
        raise HTTPException(status_code=500, detail="Social authentication failed. Please try again.")

    if not email:
        raise HTTPException(status_code=400, detail="Could not get email from provider")

    user = get_user_by_email(email)
    now = datetime.now(timezone.utc).isoformat()

    if not user:
        try:
            execute_query(
                "INSERT INTO users (email, hashed_password, is_active, is_verified, email_verified, name, user_type, role, bio, skills, hourly_rate, profile_image_url, location, profile_data, two_factor_enabled, account_balance, joined_at, created_at, updated_at) VALUES (?, '', 1, 0, 1, ?, 'client', 'client', '', '', 0, '', '', '{}', 0, 0, ?, ?, ?)",
                [email, name or email, now, now, now],
            )
            user = get_user_by_email(email)
        except Exception as e:
            logger.error(f"social_auth_user_create_error email={email} error={e}")
            raise HTTPException(status_code=500, detail="Failed to create user account")

    access_token = create_access_token(
        subject=user.email,
        custom_claims={"user_id": user.id, "role": user.role, "user_type": user.user_type, "name": user.name},
    )
    refresh_token = create_refresh_token(subject=user.email, custom_claims={"user_id": user.id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role, "user_type": user.user_type},
    }


@router.post("/select-role")
async def select_role(request: SocialSelectRole, current_user=Depends(get_current_user)):
    execute_query("UPDATE users SET user_type = ?, role = ? WHERE id = ?", [request.role, request.role, current_user.id])
    return {"message": "Role selected"}


@router.get("/linked-accounts")
async def get_linked_accounts(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT provider, provider_user_id, email, name, avatar_url, linked_at FROM user_verifications WHERE user_id = ? AND verification_type = 'oauth'",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"accounts": rows if rows else []}


@router.post("/sync-profile")
async def sync_profile(provider: str, current_user=Depends(get_current_user)):
    return {"message": f"Profile sync initiated for {provider}"}
