from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_active_user,
    get_password_hash,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RefreshTokenRequest, Token
from app.schemas.user import UserCreate, UserRead, UserUpdate


router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = get_password_hash(payload.password)
    user = User(
        email=payload.email,
        hashed_password=hashed_password,
        is_active=payload.is_active,
        name=payload.name,
        user_type=payload.user_type,
        bio=payload.bio,
        skills=payload.skills,
        hourly_rate=payload.hourly_rate,
        profile_image_url=payload.profile_image_url,
        location=payload.location,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=AuthResponse)
def login_user(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    custom_claims: Dict[str, Any] = {"user_id": user.id, "role": user.user_type or ""}
    access_token = create_access_token(subject=user.email, custom_claims=custom_claims)
    refresh_token = create_refresh_token(subject=user.email, custom_claims=custom_claims)

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserRead.from_orm(user),
    )


@router.post("/refresh", response_model=Token)
def refresh_token(request: RefreshTokenRequest):
    try:
        payload = decode_token(request.refresh_token)
    except Exception:  # noqa: B902 - FastAPI converts to HTTPException below
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    custom_claims = {k: v for k, v in payload.items() if k not in {"exp", "sub", "type", "iat", "nbf"}}
    access_token = create_access_token(subject=subject, custom_claims=custom_claims)
    refresh_token = create_refresh_token(subject=subject, custom_claims=custom_claims)
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.put("/me", response_model=UserRead)
def update_user_me(
    update_payload: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    update_data = update_payload.model_dump(exclude_unset=True, exclude_none=True)

    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

    for key, value in update_data.items():
        if key == "email":
            existing = db.query(User).filter(User.email == value, User.id != current_user.id).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)
    return current_user