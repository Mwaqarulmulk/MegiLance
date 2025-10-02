"""
Skills Management API

Handles:
- Skills catalog (public listing)
- User skill management
- Skill verification
- Admin skill CRUD
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models import User, Skill, UserSkill
from app.schemas.skill import (
    Skill as SkillSchema,
    SkillCreate,
    SkillUpdate,
    UserSkill as UserSkillSchema,
    UserSkillCreate,
    UserSkillUpdate
)

router = APIRouter()


# ============ Skills Catalog ============

@router.get("/skills", response_model=List[SkillSchema])
async def list_skills(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in name or description"),
    active_only: bool = Query(True, description="Only active skills"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    List all skills in the catalog.
    
    Public endpoint - no authentication required.
    """
    query = db.query(Skill)
    
    # Apply filters
    if active_only:
        query = query.filter(Skill.is_active == True)
    
    if category:
        query = query.filter(Skill.category == category)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            Skill.name.ilike(search_pattern) | 
            Skill.description.ilike(search_pattern)
        )
    
    # Order by category and sort order
    query = query.order_by(Skill.category.asc(), Skill.sort_order.asc(), Skill.name.asc())
    
    skills = query.offset(skip).limit(limit).all()
    return skills


@router.get("/skills/categories")
async def list_skill_categories(
    db: Session = Depends(get_db)
):
    """
    Get list of all skill categories.
    
    Public endpoint.
    """
    categories = db.query(Skill.category).filter(
        Skill.is_active == True
    ).distinct().all()
    
    return {"categories": [cat[0] for cat in categories if cat[0]]}


@router.get("/skills/{skill_id}", response_model=SkillSchema)
async def get_skill(
    skill_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific skill.
    
    Public endpoint.
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    return skill


@router.post("/skills", response_model=SkillSchema, status_code=status.HTTP_201_CREATED)
async def create_skill(
    skill_data: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new skill (admin only).
    """
    # Admin check
    if current_user.user_type.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create skills"
        )
    
    # Check for duplicate name
    existing_skill = db.query(Skill).filter(
        func.lower(Skill.name) == skill_data.name.lower()
    ).first()
    if existing_skill:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A skill with this name already exists"
        )
    
    # Create skill
    skill = Skill(**skill_data.model_dump())
    
    db.add(skill)
    db.commit()
    db.refresh(skill)
    
    return skill


@router.patch("/skills/{skill_id}", response_model=SkillSchema)
async def update_skill(
    skill_id: int,
    skill_data: SkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a skill (admin only).
    """
    # Admin check
    if current_user.user_type.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update skills"
        )
    
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    # Check for duplicate name if updating name
    update_data = skill_data.model_dump(exclude_unset=True)
    if "name" in update_data:
        existing_skill = db.query(Skill).filter(
            and_(
                func.lower(Skill.name) == update_data["name"].lower(),
                Skill.id != skill_id
            )
        ).first()
        if existing_skill:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A skill with this name already exists"
            )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(skill, field, value)
    
    db.commit()
    db.refresh(skill)
    
    return skill


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a skill (admin only).
    
    This is a soft delete - sets is_active to False.
    """
    # Admin check
    if current_user.user_type.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete skills"
        )
    
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    # Soft delete
    skill.is_active = False
    
    db.commit()


# ============ User Skills ============

@router.get("/user-skills", response_model=List[UserSkillSchema])
async def list_user_skills(
    user_id: Optional[int] = Query(None, description="Filter by user (defaults to current user)"),
    skill_category: Optional[str] = Query(None, description="Filter by skill category"),
    min_proficiency: Optional[int] = Query(None, ge=1, le=5, description="Minimum proficiency level"),
    verified_only: bool = Query(False, description="Only verified skills"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List user skills.
    
    By default shows current user's skills.
    Can view other users' skills by providing user_id.
    """
    target_user_id = user_id if user_id is not None else current_user.id
    
    query = db.query(UserSkill).filter(UserSkill.user_id == target_user_id)
    
    # Apply filters
    if skill_category:
        query = query.join(Skill).filter(Skill.category == skill_category)
    
    if min_proficiency is not None:
        query = query.filter(UserSkill.proficiency_level >= min_proficiency)
    
    if verified_only:
        query = query.filter(UserSkill.is_verified == True)
    
    # Order by proficiency level (descending)
    query = query.order_by(UserSkill.proficiency_level.desc())
    
    user_skills = query.all()
    return user_skills


@router.post("/user-skills", response_model=UserSkillSchema, status_code=status.HTTP_201_CREATED)
async def add_user_skill(
    user_skill_data: UserSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a skill to current user's profile.
    """
    # Verify skill exists
    skill = db.query(Skill).filter(
        and_(Skill.id == user_skill_data.skill_id, Skill.is_active == True)
    ).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found or inactive"
        )
    
    # Check if user already has this skill
    existing_user_skill = db.query(UserSkill).filter(
        and_(
            UserSkill.user_id == current_user.id,
            UserSkill.skill_id == user_skill_data.skill_id
        )
    ).first()
    if existing_user_skill:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have this skill in your profile"
        )
    
    # Create user skill
    user_skill = UserSkill(
        **user_skill_data.model_dump(),
        user_id=current_user.id,
        is_verified=False  # New skills are unverified by default
    )
    
    db.add(user_skill)
    db.commit()
    db.refresh(user_skill)
    
    return user_skill


@router.patch("/user-skills/{user_skill_id}", response_model=UserSkillSchema)
async def update_user_skill(
    user_skill_id: int,
    user_skill_data: UserSkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a user skill.
    
    Users can update their own skills.
    Admins can verify skills.
    """
    user_skill = db.query(UserSkill).filter(UserSkill.id == user_skill_id).first()
    if not user_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User skill not found"
        )
    
    # Permission check
    update_data = user_skill_data.model_dump(exclude_unset=True)
    
    if current_user.user_type.value == "admin":
        # Admins can update everything
        pass
    elif current_user.id == user_skill.user_id:
        # Users can update their own skills but not verification status
        if "is_verified" in update_data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot verify your own skills"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this skill"
        )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(user_skill, field, value)
    
    db.commit()
    db.refresh(user_skill)
    
    return user_skill


@router.delete("/user-skills/{user_skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_skill(
    user_skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a skill from user's profile.
    
    Users can only remove their own skills.
    """
    user_skill = db.query(UserSkill).filter(UserSkill.id == user_skill_id).first()
    if not user_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User skill not found"
        )
    
    # Permission check
    if current_user.id != user_skill.user_id and current_user.user_type.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this skill"
        )
    
    db.delete(user_skill)
    db.commit()
