# @AI-HINT: Social login router — OAuth with Google, GitHub, LinkedIn.
# Mounted under the `/social-auth` prefix (see app/api/routers.py). Thin HTTP layer
# that delegates all logic to app.services.social_login.SocialLoginService, which
# handles per-state redirect_uri persistence, smart login/register, role-based
# onboarding and persistent account linking. The frontend client lives in
# frontend/lib/api/auth.ts (socialAuthApi) and the callback page at
# frontend/app/(auth)/callback/page.tsx.
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.core.config import get_settings
from app.services.social_login import (
    SocialProvider,
    get_social_login_service,
)

router = APIRouter()


class SocialAuthStart(BaseModel):
    provider: str
    redirect_uri: Optional[str] = None
    portal_area: Optional[str] = None
    intent: Optional[str] = None  # "login" | "register" | "link"


class SocialAuthComplete(BaseModel):
    code: str
    state: str


class SocialSelectRole(BaseModel):
    role: str


class SyncProfileRequest(BaseModel):
    provider: str
    fields: Optional[List[str]] = None


def _parse_provider(provider: str) -> SocialProvider:
    try:
        return SocialProvider(provider.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")


def _allowed_redirect_origins() -> set[str]:
    """Origins (scheme://host[:port]) permitted as OAuth redirect targets.

    Built from configured FRONTEND_URL plus the known production + local hosts.
    Validating the origin (not the full URL) prevents open-redirect abuse while
    still allowing any callback path under our own domains.
    """
    settings = get_settings()
    origins = {
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://megilance.site",
        "https://www.megilance.site",
        "https://api.megilance.site",
    }
    frontend_url = getattr(settings, "FRONTEND_URL", None)
    if frontend_url:
        parsed = urlparse(frontend_url)
        if parsed.scheme and parsed.netloc:
            origins.add(f"{parsed.scheme}://{parsed.netloc}")
    return origins


def _validate_redirect_uri(redirect_uri: str) -> str:
    """Ensure redirect_uri points at one of our own origins. Returns it unchanged."""
    parsed = urlparse(redirect_uri)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid redirect_uri")
    origin = f"{parsed.scheme}://{parsed.netloc}"
    if origin not in _allowed_redirect_origins():
        raise HTTPException(
            status_code=400,
            detail="Invalid redirect_uri — must be an allowed MegiLance domain",
        )
    return redirect_uri


@router.get("/providers")
async def get_providers():
    """List configured social login providers (with live enabled flags)."""
    service = get_social_login_service()
    return {"providers": await service.get_available_providers()}


@router.post("/start")
async def start_social_auth(request: SocialAuthStart):
    """Begin an OAuth flow — returns the provider authorization URL to redirect to."""
    provider = _parse_provider(request.provider)

    # Default to the standard frontend callback if none supplied, then validate.
    redirect_uri = request.redirect_uri or "http://localhost:3000/api/auth/callback/" + provider.value
    redirect_uri = _validate_redirect_uri(redirect_uri)

    service = get_social_login_service()
    result = await service.start_oauth(
        provider=provider,
        redirect_uri=redirect_uri,
        portal_area=request.portal_area,
        intent=request.intent,
    )

    if not result.get("authorization_url"):
        # e.g. provider not configured — surface a clean 400 to the client.
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to start social login"))

    return result


@router.post("/complete")
async def complete_social_auth(request: SocialAuthComplete):
    """Complete an OAuth flow — exchange the code, then log in / register the user.

    Returns the service result dict ({success, action, access_token, refresh_token,
    user, is_new_user, needs_role_selection, ...}). On provider/state failure it
    returns {success: False, error} which the frontend callback page surfaces.
    """
    service = get_social_login_service()
    try:
        return await service.complete_oauth(code=request.code, state=request.state)
    except HTTPException:
        raise
    except Exception as e:  # pragma: no cover - defensive
        logger.error(f"social_auth_complete_error error={e}")
        raise HTTPException(status_code=500, detail="Social authentication failed. Please try again.")


@router.post("/select-role")
async def select_role(request: SocialSelectRole, current_user=Depends(get_current_user)):
    """Set a freshly-registered OAuth user's role and re-issue tokens with it."""
    service = get_social_login_service()
    result = await service.update_user_role(current_user.id, request.role.lower())
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to set role"))
    return result


@router.get("/linked-accounts")
async def get_linked_accounts(current_user=Depends(get_current_user)):
    service = get_social_login_service()
    accounts = await service.get_linked_accounts(current_user.id)
    return {"accounts": accounts}


@router.delete("/linked-accounts/{provider}")
async def unlink_account(provider: str, current_user=Depends(get_current_user)):
    service = get_social_login_service()
    result = await service.unlink_account(current_user.id, _parse_provider(provider))
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to unlink account"))
    return result


@router.post("/sync-profile")
async def sync_profile(request: SyncProfileRequest, current_user=Depends(get_current_user)):
    service = get_social_login_service()
    return await service.sync_profile_from_social(
        current_user.id, _parse_provider(request.provider), request.fields
    )
