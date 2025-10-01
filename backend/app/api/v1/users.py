from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead
from app.core.security import get_password_hash


router = APIRouter()


@router.get("/", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
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
