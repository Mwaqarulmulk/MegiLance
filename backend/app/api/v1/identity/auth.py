# @AI-HINT: Auth router — login, register, logout, 2FA, password reset, email verification
from fastapi import APIRouter, Depends, HTTPException, status, Request
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
from app.services.email_service import send_email

router = APIRouter()


# === Pydantic Models ===

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    user_type: str = "client"
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
    code: str

class TwoFactorSetup(BaseModel):
    password: str

class EmailVerifyRequest(BaseModel):
    token: str


# === Login ===

@router.post("/login")
async def login(request: LoginRequest):
    user = authenticate_user(request.email, request.password)
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
async def register(request: RegisterRequest):
    if check_email_exists(request.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    is_valid, errors = validate_password_strength(request.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors,
        )

    hashed_password = get_password_hash(request.password)
    now = datetime.now(timezone.utc).isoformat()

    profile_data = {
        "user_type": request.user_type,
        "headline": "",
        "experience_level": "",
        "languages": "",
        "timezone": "",
        "availability_status": "available",
    }

    result = insert_user(
        email=request.email,
        hashed_password=hashed_password,
        is_active=True,
        name=request.name,
        user_type=request.user_type,
        bio=request.bio,
        skills=request.skills,
        hourly_rate=request.hourly_rate,
        profile_image_url=request.profile_image_url,
        location=request.location,
        profile_data_json=str(profile_data),
        now=now,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        )

    user = auth_get_user_by_email(request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User created but failed to retrieve",
        )

    access_token = create_access_token(
        subject=user["email"],
        custom_claims={
            "user_id": user["id"],
            "role": user.get("role", request.user_type),
            "user_type": request.user_type,
            "name": request.name,
        },
    )
    refresh_token = create_refresh_token(
        subject=user["email"],
        custom_claims={"user_id": user["id"]},
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user.get("role", request.user_type),
            "user_type": request.user_type,
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

    allowed_fields = {
        "name", "bio", "headline", "tagline", "skills", "hourly_rate",
        "location", "experience_level", "years_of_experience", "languages",
        "timezone", "availability_status", "availability_hours",
        "preferred_project_size", "industry_focus", "tools_and_technologies",
        "linkedin_url", "github_url", "website_url", "twitter_url",
        "dribbble_url", "behance_url", "stackoverflow_url", "phone_number",
        "video_intro_url", "resume_url", "profile_visibility", "profile_slug",
        "company_name", "industry", "company_size", "website", "phone",
        "education", "certifications", "work_history", "achievements",
        "portfolio_projects", "testimonials_enabled", "profile_image_url",
    }

    update_data = {k: v for k, v in body.items() if k in allowed_fields and v is not None}

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
async def logout(request: Request, current_user=Depends(get_current_user)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if token:
        try:
            payload = decode_token(token)
            exp = payload.get("exp")
            if exp:
                expiry = datetime.fromtimestamp(exp, tz=timezone.utc)
                add_token_to_blacklist(token, expiry)
        except Exception:
            pass

    return {"message": "Logged out successfully"}


# === Refresh Token ===

@router.post("/refresh")
async def refresh_token(request: Request):
    body = await request.json()
    token = body.get("refresh_token")

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
async def forgot_password(request: PasswordResetRequest):
    user = get_user_for_password_reset(request.email)
    if not user:
        return {"message": "If the email exists, a reset link has been sent"}

    reset_token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc).isoformat()

    update_user_fields(user["id"], {
        "profile_data": str({
            "reset_token": reset_token,
            "reset_token_expires": (datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0) + __import__('datetime').timedelta(hours=24)).isoformat(),
        })
    })

    try:
        send_email(
            to_email=request.email,
            subject="Password Reset — MegiLance",
            template_name="password_reset",
            context={
                "name": user.get("name", "User"),
                "reset_url": f"https://megilance.com/reset-password?token={reset_token}",
            },
        )
    except Exception as e:
        logger.error(f"Failed to send password reset email: {e}")

    return {"message": "If the email exists, a reset link has been sent"}


# === Reset Password ===

@router.post("/reset-password")
async def reset_password(request: PasswordResetConfirm):
    from app.db.turso_http import execute_query as eq, parse_rows as pr

    result = eq(
        "SELECT id, email, name, profile_data FROM users WHERE profile_data LIKE ?",
        [f"%{request.token}%"],
    )
    rows = pr(result)
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user = rows[0]
    is_valid, errors = validate_password_strength(request.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors,
        )

    hashed = get_password_hash(request.new_password)
    update_user_fields(user["id"], {"hashed_password": hashed})

    return {"message": "Password reset successfully"}


# === Verify Email ===

@router.post("/verify-email")
async def verify_email(request: EmailVerifyRequest):
    from app.db.turso_http import execute_query as eq, parse_rows as pr

    result = eq(
        "SELECT id FROM users WHERE profile_data LIKE ?",
        [f"%{request.token}%"],
    )
    rows = pr(result)
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    update_user_fields(rows[0]["id"], {"email_verified": 1})

    return {"message": "Email verified successfully"}


# === Resend Verification ===

@router.post("/resend-verification")
async def resend_verification(request: Request):
    body = await request.json()
    email = body.get("email")

    user = auth_get_user_by_email(email)
    if not user:
        return {"message": "If the email exists, a verification link has been sent"}

    if user.get("email_verified"):
        return {"message": "Email already verified"}

    verification_token = secrets.token_urlsafe(32)
    update_user_fields(user["id"], {
        "profile_data": str({
            "verification_token": verification_token,
        })
    })

    try:
        send_email(
            to_email=email,
            subject="Verify Your Email — MegiLance",
            template_name="email_verification",
            context={
                "name": user.get("name", "User"),
                "verify_url": f"https://megilance.com/verify-email?token={verification_token}",
            },
        )
    except Exception as e:
        logger.error(f"Failed to send verification email: {e}")

    return {"message": "If the email exists, a verification link has been sent"}


# === 2FA Setup ===

@router.post("/2fa/setup")
async def setup_2fa(request: TwoFactorSetup, current_user=Depends(get_current_user)):
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )

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
        "backup_codes": backup_codes,
    }


# === 2FA Enable ===

@router.post("/2fa/enable")
async def enable_2fa(request: TwoFactorVerify, current_user=Depends(get_current_user)):
    secret = current_user.profile_data
    if isinstance(secret, str):
        import json
        try:
            secret = json.loads(secret)
        except Exception:
            secret = {}

    two_factor_secret = None
    if isinstance(secret, dict):
        two_factor_secret = secret.get("two_factor_secret")

    if not two_factor_secret:
        result = eq("SELECT two_factor_secret FROM users WHERE id = ?", [current_user.id])
        rows = pr(result)
        if rows:
            two_factor_secret = rows[0].get("two_factor_secret")

    if not two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA not initialized. Call /2fa/setup first.",
        )

    totp = pyotp.TOTP(two_factor_secret)
    if not totp.verify(request.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 2FA code",
        )

    update_user_fields(current_user.id, {"two_factor_enabled": 1})

    return {"message": "2FA enabled successfully"}


# === 2FA Verify ===

@router.post("/2fa/verify")
async def verify_2fa(request: TwoFactorVerify, current_user=Depends(get_current_user)):
    from app.db.turso_http import execute_query as eq, parse_rows as pr

    result = eq("SELECT two_factor_secret, two_factor_backup_codes FROM users WHERE id = ?", [current_user.id])
    rows = pr(result)
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user_row = rows[0]
    secret = user_row.get("two_factor_secret")

    totp = pyotp.TOTP(secret)
    if totp.verify(request.code):
        return {"valid": True, "message": "2FA code verified"}

    backup_codes = user_row.get("two_factor_backup_codes", "[]")
    if isinstance(backup_codes, str):
        import json
        try:
            backup_codes = json.loads(backup_codes)
        except Exception:
            backup_codes = []

    if request.code in backup_codes:
        backup_codes.remove(request.code)
        update_backup_codes(current_user.id, str(backup_codes))
        return {"valid": True, "message": "Backup code used"}

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid 2FA code",
    )


# === 2FA Disable ===

@router.post("/2fa/disable")
async def disable_2fa(request: TwoFactorVerify, current_user=Depends(get_current_user)):
    from app.db.turso_http import execute_query as eq, parse_rows as pr

    result = eq("SELECT two_factor_secret FROM users WHERE id = ?", [current_user.id])
    rows = pr(result)
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    secret = rows[0].get("two_factor_secret")
    totp = pyotp.TOTP(secret)

    if not totp.verify(request.code):
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
