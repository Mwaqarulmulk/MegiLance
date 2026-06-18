# @AI-HINT: Auth router — login, register, logout, 2FA, password reset, email verification
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone
import logging
import secrets
import pyotp

logger = logging.getLogger(__name__)

from app.core.security import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
    get_current_user,
    get_current_user_from_token,
    get_current_user_optional,
    validate_password_strength,
    add_token_to_blacklist,
    get_user_by_email,
    get_user_by_id,
)
from app.services.auth_service import (
    check_email_exists,
    insert_user,
    get_user_by_email as auth_get_user_by_email,
    update_user_fields,
    get_user_by_id as auth_get_user_by_id,
    get_user_for_password_reset,
    update_backup_codes,
    check_email_available,
)
from app.core.config import get_settings
from app.services.email_service import email_service
from app.db.turso_http import execute_query as eq, parse_rows as pr
from app.core.rate_limit import auth_rate_limit, password_reset_rate_limit, email_rate_limit

router = APIRouter()


# === Pydantic Models ===

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "client"
    user_type: Optional[str] = None
    bio: str = ""
    skills: str = ""
    hourly_rate: float = 0
    profile_image_url: str = ""
    location: str = ""

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class TwoFactorVerify(BaseModel):
    token: str
    temp_token: Optional[str] = None
    is_backup_code: bool = False

class TwoFactorSetup(BaseModel):
    password: Optional[str] = None

class EmailVerifyRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ChangeEmailRequest(BaseModel):
    new_email: str
    password: str


# === Login ===

@router.post("/login")
@auth_rate_limit()
async def login(request: Request, body: LoginRequest, response: Response):
    user = authenticate_user(body.email, body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(
        subject=user.email,
        custom_claims={
            "user_id": user.id,
            "role": user.role,
            "user_type": user.user_type,
            "name": user.name,
        },
    )
    refresh_token = create_refresh_token(
        subject=user.email,
        custom_claims={"user_id": user.id},
    )

    # Set auth_token and refresh_token as httpOnly cookies
    _settings = get_settings()
    response.set_cookie(
        key="auth_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=_settings.environment == "production",
        max_age=3600,  # 1 hour
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=_settings.environment == "production",
        max_age=60 * 60 * 24 * 30,  # 30 days
        path="/",
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "user_type": user.user_type,
            "two_factor_enabled": user.two_factor_enabled,
        },
    }


# === Register ===

@router.post("/register")
@auth_rate_limit()
async def register(request: Request, body: RegisterRequest, response: Response):
    if check_email_exists(body.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    is_valid, errors = validate_password_strength(body.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors,
        )

    hashed_password = get_password_hash(body.password)
    now = datetime.now(timezone.utc).isoformat()
    user_type = body.user_type or body.role

    profile_data = {
        "user_type": user_type,
        "headline": "",
        "experience_level": "",
        "languages": "",
        "timezone": "",
        "availability_status": "available",
    }

    result = insert_user(
        email=body.email,
        hashed_password=hashed_password,
        is_active=True,
        name=body.name,
        user_type=user_type,
        bio=body.bio,
        skills=body.skills,
        hourly_rate=body.hourly_rate,
        profile_image_url=body.profile_image_url,
        location=body.location,
        profile_data_json=str(profile_data),
        now=now,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        )

    user = auth_get_user_by_email(body.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User created but failed to retrieve",
        )

    access_token = create_access_token(
        subject=user["email"],
        custom_claims={
            "user_id": user["id"],
            "role": user.get("role", user_type),
            "user_type": user_type,
            "name": body.name,
        },
    )
    refresh_token = create_refresh_token(
        subject=user["email"],
        custom_claims={"user_id": user["id"]},
    )

    # Set auth_token and refresh_token as httpOnly cookies
    _settings = get_settings()
    response.set_cookie(
        key="auth_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=_settings.environment == "production",
        max_age=3600,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=_settings.environment == "production",
        max_age=60 * 60 * 24 * 30,  # 30 days
        path="/",
    )

    # Generate verification token and send verification email
    try:
        verification_token = secrets.token_urlsafe(32)
        update_user_fields(user["id"], {
            "email_verification_token": verification_token,
        })
        email_service.send_verification_email(
            to_email=body.email,
            user_name=body.name,
            verification_token=verification_token,
        )
    except Exception as e:
        logger.warning(f"Failed to send verification email during registration: {e}")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user.get("role", user_type),
            "user_type": user_type,
            "two_factor_enabled": False,
            "email_verified": False,
        },
    }


# === Get Current User ===

@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    user_data = auth_get_user_by_id(current_user.id)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "id": user_data.get("id"),
        "email": user_data.get("email"),
        "name": user_data.get("name"),
        "full_name": user_data.get("name"),
        "user_type": user_data.get("user_type"),
        "role": user_data.get("role"),
        "bio": user_data.get("bio", ""),
        "skills": user_data.get("skills", ""),
        "hourly_rate": user_data.get("hourly_rate", 0),
        "profile_image_url": user_data.get("profile_image_url", ""),
        "cover_image_url": user_data.get("cover_image_url", ""),
        "location": user_data.get("location", ""),
        "headline": user_data.get("headline", ""),
        "tagline": user_data.get("tagline", ""),
        "experience_level": user_data.get("experience_level", ""),
        "years_of_experience": user_data.get("years_of_experience", ""),
        "languages": user_data.get("languages", ""),
        "timezone": user_data.get("timezone", ""),
        "availability_status": user_data.get("availability_status", "available"),
        "availability_hours": user_data.get("availability_hours", ""),
        "preferred_project_size": user_data.get("preferred_project_size", ""),
        "industry_focus": user_data.get("industry_focus", ""),
        "tools_and_technologies": user_data.get("tools_and_technologies", ""),
        "linkedin_url": user_data.get("linkedin_url", ""),
        "github_url": user_data.get("github_url", ""),
        "website_url": user_data.get("website_url", ""),
        "twitter_url": user_data.get("twitter_url", ""),
        "dribbble_url": user_data.get("dribbble_url", ""),
        "behance_url": user_data.get("behance_url", ""),
        "stackoverflow_url": user_data.get("stackoverflow_url", ""),
        "phone_number": user_data.get("phone_number", ""),
        "video_intro_url": user_data.get("video_intro_url", ""),
        "resume_url": user_data.get("resume_url", ""),
        "profile_slug": user_data.get("profile_slug", ""),
        "profile_visibility": user_data.get("profile_visibility", "public"),
        "profile_views": user_data.get("profile_views", 0),
        "seller_level": user_data.get("seller_level", "new_seller"),
        "company_name": user_data.get("company_name", ""),
        "industry": user_data.get("industry", ""),
        "company_size": user_data.get("company_size", ""),
        "website": user_data.get("website_url", ""),
        "phone": user_data.get("phone_number", ""),
        "two_factor_enabled": bool(user_data.get("two_factor_enabled", 0)),
        "email_verified": bool(user_data.get("email_verified", 0)),
        "is_active": bool(user_data.get("is_active", 0)),
        "account_balance": user_data.get("account_balance", 0.0),
        "joined_at": user_data.get("joined_at", ""),
        "education": user_data.get("education", []),
        "certifications": user_data.get("certifications", []),
        "work_history": user_data.get("work_history", []),
        "achievements": user_data.get("achievements", []),
        "portfolio_projects": user_data.get("portfolio_projects", []),
        "testimonials_enabled": user_data.get("testimonials_enabled", True),
    }


# === Update Current User ===

@router.put("/me")
async def update_me(
    request: Request,
    current_user=Depends(get_current_user),
):
    body = await request.json()

    # The profile editor sends `full_name`; the column is `name`.
    if body.get("full_name") and not body.get("name"):
        body["name"] = body["full_name"]

    allowed_fields = {
        "name", "bio", "headline", "tagline", "skills", "hourly_rate",
        "location", "experience_level", "years_of_experience", "languages",
        "timezone", "availability_status", "availability_hours",
        "preferred_project_size", "industry_focus", "tools_and_technologies",
        "linkedin_url", "github_url", "website_url", "twitter_url",
        "dribbble_url", "behance_url", "stackoverflow_url", "phone_number",
        "video_intro_url", "resume_url", "profile_visibility", "profile_slug",
        "education", "certifications", "work_history", "achievements",
        "contact_preferences", "testimonials_enabled", "profile_image_url",
        "cover_image_url",
    }
    if "cover_image_url" in body:
        try:
            from app.services.auth_service import _ensure_cover_column
            _ensure_cover_column()
        except Exception:
            pass
    # NOTE: `portfolio_projects` is intentionally excluded — there is no such
    # column on `users` (portfolio lives in the portfolio_items table). Including
    # it previously made update_user_fields reject the entire request with a 400,
    # which silently broke every profile save.

    update_data = {k: v for k, v in body.items() if k in allowed_fields and v is not None}

    # Keep tag-style fields in the platform's legacy comma-separated format so
    # existing readers (freelancer search, AI matching) keep working; structured
    # fields are JSON-encoded downstream in update_user_fields.
    _comma_fields = ("skills", "languages", "industry_focus", "tools_and_technologies")
    for f in _comma_fields:
        if isinstance(update_data.get(f), list):
            update_data[f] = ", ".join(str(x).strip() for x in update_data[f] if str(x).strip())

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields to update",
        )

    try:
        update_user_fields(current_user.id, update_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    updated = auth_get_user_by_id(current_user.id)
    return {
        "id": updated.get("id"),
        "email": updated.get("email"),
        "name": updated.get("name"),
        "profile_slug": updated.get("profile_slug", ""),
        "message": "Profile updated successfully",
    }


# === Logout ===

@router.post("/logout")
async def logout(request: Request, response: Response, current_user=Depends(get_current_user)):
    # Blacklist the token
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        token = request.cookies.get("auth_token", "")
    if token:
        try:
            payload = decode_token(token)
            exp = payload.get("exp")
            if exp:
                expiry = datetime.fromtimestamp(exp, tz=timezone.utc)
                add_token_to_blacklist(token, expiry)
        except Exception:
            pass

    # Clear auth cookies (httpOnly + JS-accessible)
    response.delete_cookie(key="auth_token", path="/", httponly=True, samesite="lax")
    response.delete_cookie(key="refresh_token", path="/", httponly=True, samesite="lax")
    # Also clear JS-accessible copies
    response.delete_cookie(key="auth_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")

    return {"message": "Logged out successfully"}


# === Refresh Token ===

@router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    try:
        body = await request.json()
    except Exception:
        body = {}

    token = body.get("refresh_token")

    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]

    if not token:
        cookie_token = request.cookies.get("refresh_token")
        if cookie_token:
            token = cookie_token

    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token required",
        )

    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )

        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        user = get_user_by_email(email)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )

        new_access = create_access_token(
            subject=email,
            custom_claims={
                "user_id": user.id,
                "role": user.role,
                "user_type": user.user_type,
                "name": user.name,
            },
        )
        new_refresh = create_refresh_token(
            subject=email,
            custom_claims={"user_id": user.id},
        )

        # Rotate both cookies
        _settings = get_settings()
        response.set_cookie(
            key="auth_token",
            value=new_access,
            httponly=True,
            samesite="lax",
            secure=_settings.environment == "production",
            max_age=3600,
            path="/",
        )
        response.set_cookie(
            key="refresh_token",
            value=new_refresh,
            httponly=True,
            samesite="lax",
            secure=_settings.environment == "production",
            max_age=60 * 60 * 24 * 30,
            path="/",
        )

        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
            "token_type": "bearer",
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )


# === Forgot Password ===

@router.post("/forgot-password")
@password_reset_rate_limit()
async def forgot_password(request: Request, body: PasswordResetRequest):
    user = get_user_for_password_reset(body.email)
    if not user:
        return {"message": "If the email exists, a reset link has been sent"}

    reset_token = secrets.token_urlsafe(32)
    from datetime import timedelta
    expires = datetime.now(timezone.utc) + timedelta(hours=1)

    update_user_fields(user["id"], {
        "password_reset_token": reset_token,
        "password_reset_expires": expires.isoformat(),
    })

    try:
        email_service.send_password_reset_email(
            to_email=body.email,
            user_name=user.get("name", "User"),
            reset_token=reset_token,
        )
    except Exception as e:
        logger.error(f"Failed to send password reset email: {e}")

    return {"message": "If the email exists, a reset link has been sent"}


# === Reset Password ===

@router.post("/reset-password")
@password_reset_rate_limit()
async def reset_password(request: Request, body: PasswordResetConfirm):
    if not body.token or len(body.token) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    result = eq(
        "SELECT id, email, name, password_reset_expires FROM users WHERE password_reset_token = ?",
        [body.token],
    )
    rows = pr(result)

    user = None
    for row in rows:
        expires_str = row.get("password_reset_expires")
        if expires_str:
            try:
                from datetime import datetime as _dt, timezone as _tz
                expires = _dt.fromisoformat(expires_str) if isinstance(expires_str, str) else expires_str
                if _dt.now(_tz.utc) > expires:
                    continue
            except Exception:
                pass
        user = row
        break

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    is_valid, errors = validate_password_strength(body.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors,
        )

    hashed = get_password_hash(body.new_password)
    update_user_fields(user["id"], {
        "hashed_password": hashed,
        "password_reset_token": "",
        "password_reset_expires": "",
    })

    logger.info(f"Password reset completed for user {user['id']}")
    return {"message": "Password reset successfully"}


# === Verify Email ===

@router.post("/verify-email")
async def verify_email(request: EmailVerifyRequest):
    from app.db.turso_http import execute_query as eq, parse_rows as pr

    result = eq(
        "SELECT id FROM users WHERE email_verification_token = ?",
        [request.token],
    )
    rows = pr(result)

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    matched_user_id = rows[0]["id"]
    update_user_fields(matched_user_id, {
        "email_verified": 1,
        "email_verification_token": "",
    })

    return {"message": "Email verified successfully"}


# === Resend Verification ===

@router.post("/resend-verification")
@email_rate_limit()
async def resend_verification(
    request: Request,
    body: Optional[ResendVerificationRequest] = None,
    current_user=Depends(get_current_user_optional),
):
    email = body.email if body and body.email else None

    if not email and current_user:
        email = current_user.email

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email required in request body or user must be authenticated",
        )

    user = auth_get_user_by_email(email)
    if not user:
        return {"message": "If the email exists, a verification link has been sent"}

    if user.get("email_verified"):
        return {"message": "Email already verified"}

    verification_token = secrets.token_urlsafe(32)
    update_user_fields(user["id"], {
        "email_verification_token": verification_token,
    })

    try:
        email_service.send_verification_email(
            to_email=email,
            user_name=user.get("name", "User"),
            verification_token=verification_token,
        )
    except Exception as e:
        logger.error(f"Failed to send verification email: {e}")

    return {"message": "If the email exists, a verification link has been sent"}


# === 2FA Setup ===

@router.post("/2fa/setup")
async def setup_2fa(request: TwoFactorSetup = None, current_user=Depends(get_current_user)):
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(current_user.email, issuer_name="MegiLance")

    update_user_fields(current_user.id, {
        "two_factor_secret": secret,
        "two_factor_enabled": 0,
    })

    backup_codes = [secrets.token_hex(4) for _ in range(10)]
    update_backup_codes(current_user.id, str(backup_codes))

    return {
        "secret": secret,
        "uri": provisioning_uri,
        "qr_uri": provisioning_uri,
        "qr_code_url": provisioning_uri,
        "backup_codes": backup_codes,
    }


# === 2FA Enable ===

@router.post("/2fa/enable")
async def enable_2fa(request: TwoFactorVerify, current_user=Depends(get_current_user)):
    from app.db.turso_http import execute_query as eq2, parse_rows as pr2

    result = eq2("SELECT two_factor_secret FROM users WHERE id = ?", [current_user.id])
    rows = pr2(result)
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    two_factor_secret = rows[0].get("two_factor_secret")
    if not two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA not initialized. Call /2fa/setup first.",
        )

    totp = pyotp.TOTP(two_factor_secret)
    if not totp.verify(request.token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 2FA code",
        )

    update_user_fields(current_user.id, {"two_factor_enabled": 1})

    return {
        "message": "2FA enabled successfully",
        "secret": two_factor_secret,
        "qr_code_url": "",
        "backup_codes": [],
    }


# === 2FA Verify ===

@router.post("/2fa/verify")
async def verify_2fa(request: TwoFactorVerify, current_user=Depends(get_current_user)):
    result = eq("SELECT two_factor_secret, two_factor_backup_codes FROM users WHERE id = ?", [current_user.id])
    rows = pr(result)
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user_row = rows[0]
    secret = user_row.get("two_factor_secret")

    totp = pyotp.TOTP(secret)
    if totp.verify(request.token):
        return {"valid": True, "message": "2FA code verified"}

    if request.is_backup_code:
        backup_codes = user_row.get("two_factor_backup_codes", "[]")
        if isinstance(backup_codes, str):
            import json
            try:
                backup_codes = json.loads(backup_codes)
            except Exception:
                backup_codes = []

        if request.token in backup_codes:
            backup_codes.remove(request.token)
            update_backup_codes(current_user.id, str(backup_codes))
            return {"valid": True, "message": "Backup code used"}

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid 2FA code",
    )


# === 2FA Disable ===

@router.post("/2fa/disable")
async def disable_2fa(request: TwoFactorVerify, current_user=Depends(get_current_user)):
    result = eq("SELECT two_factor_secret FROM users WHERE id = ?", [current_user.id])
    rows = pr(result)
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    secret = rows[0].get("two_factor_secret")
    totp = pyotp.TOTP(secret)

    if not totp.verify(request.token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 2FA code",
        )

    update_user_fields(current_user.id, {
        "two_factor_enabled": 0,
        "two_factor_secret": "",
    })

    return {"message": "2FA disabled successfully"}


# === 2FA Status ===

@router.get("/2fa/status")
async def get_2fa_status(current_user=Depends(get_current_user)):
    return {
        "enabled": bool(current_user.two_factor_enabled),
        "user_id": current_user.id,
    }


# === Change Password (while logged in) ===

@router.post("/change-password")
async def change_password(body: ChangePasswordRequest, current_user=Depends(get_current_user)):
    user = get_user_by_id(current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    strength = validate_password_strength(body.new_password)
    if not strength.get("valid"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=strength.get("message", "Password does not meet requirements"),
        )

    new_hash = get_password_hash(body.new_password)
    update_user_fields(current_user.id, {"hashed_password": new_hash})
    logger.info(f"password_changed user={current_user.id}")
    return {"message": "Password changed successfully"}


# === Change Email (while logged in) ===

@router.post("/change-email")
async def change_email(body: ChangeEmailRequest, current_user=Depends(get_current_user)):
    user = get_user_by_id(current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect",
        )

    new_email = body.new_email.lower().strip()
    if not new_email or "@" not in new_email:
        raise HTTPException(status_code=400, detail="Invalid email address")

    existing = get_user_by_email(new_email)
    if existing and existing.id != current_user.id:
        raise HTTPException(status_code=409, detail="Email already in use")

    verification_token = secrets.token_urlsafe(32)
    from datetime import timedelta
    expires = datetime.now(timezone.utc) + timedelta(hours=24)

    update_user_fields(current_user.id, {
        "pending_email": new_email,
        "email_change_token": verification_token,
        "email_change_expires": expires.isoformat(),
    })

    try:
        email_service.send_email_change_verification(
            to_email=new_email,
            user_name=current_user.name or "User",
            verification_token=verification_token,
        )
    except Exception as e:
        logger.warning(f"Failed to send email change verification: {e}")

    logger.info(f"email_change_requested user={current_user.id} new_email={new_email}")
    return {"message": "Verification email sent. Please check your new inbox to confirm the change."}
