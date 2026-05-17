# @AI-HINT: Social login router — OAuth with Google, GitHub, LinkedIn
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging
import httpx

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


class SocialAuthStart(BaseModel):
    provider: str
    redirect_uri: Optional[str] = None

class SocialAuthComplete(BaseModel):
    code: str
    state: str

class SocialSelectRole(BaseModel):
    role: str


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

    if provider == "google":
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=400, detail="Google OAuth not configured")
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth"
            f"?client_id={settings.GOOGLE_CLIENT_ID}"
            f"&redirect_uri={request.redirect_uri or 'http://localhost:3000/callback'}"
            f"&response_type=code&scope=email%20profile&state={provider}"
        )
    elif provider == "github":
        if not settings.GITHUB_CLIENT_ID:
            raise HTTPException(status_code=400, detail="GitHub OAuth not configured")
        auth_url = (
            f"https://github.com/login/oauth/authorize"
            f"?client_id={settings.GITHUB_CLIENT_ID}"
            f"&redirect_uri={request.redirect_uri or 'http://localhost:3000/callback'}"
            f"&scope=user:email&state={provider}"
        )
    elif provider == "linkedin":
        if not settings.LINKEDIN_CLIENT_ID:
            raise HTTPException(status_code=400, detail="LinkedIn OAuth not configured")
        auth_url = (
            f"https://www.linkedin.com/oauth/v2/authorization"
            f"?response_type=code&client_id={settings.LINKEDIN_CLIENT_ID}"
            f"&redirect_uri={request.redirect_uri or 'http://localhost:3000/callback'}"
            f"&state={provider}&scope=openid%20profile%20email"
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    return {"auth_url": auth_url}


@router.post("/complete")
async def complete_social_auth(request: SocialAuthComplete):
    settings = get_settings()
    provider = request.state.lower()
    redirect_uri = "http://localhost:3000/callback"

    if provider == "google":
        async with httpx.AsyncClient() as client:
            token_resp = await client.post("https://oauth2.googleapis.com/token", data={
                "code": request.code, "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET, "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            })
            tokens = token_resp.json()
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
            user_resp = await client.get("https://api.github.com/user", headers={"Authorization": f"Bearer {tokens.get('access_token')}"})
            user_data = user_resp.json()
            email_resp = await client.get("https://api.github.com/user/emails", headers={"Authorization": f"Bearer {tokens.get('access_token')}"})
            emails = email_resp.json()
            email = next((e["email"] for e in emails if e.get("primary")), emails[0]["email"] if emails else None)
            name = user_data.get("name") or user_data.get("login")

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    if not email:
        raise HTTPException(status_code=400, detail="Could not get email from provider")

    user = get_user_by_email(email)
    now = datetime.now(timezone.utc).isoformat()

    if not user:
        execute_query(
            "INSERT INTO users (email, hashed_password, is_active, is_verified, email_verified, name, user_type, role, bio, skills, hourly_rate, profile_image_url, location, profile_data, two_factor_enabled, account_balance, joined_at, created_at, updated_at) VALUES (?, '', 1, 0, 1, ?, 'client', 'client', '', '', 0, '', '', '{}', 0, 0, ?, ?, ?)",
            [email, name or email, now, now, now],
        )
        user = get_user_by_email(email)

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
