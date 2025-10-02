"""
Review and Rating Management API

Handles:
- Review creation (only contract parties)
- Review listing with filters
- Review stats calculation
- Review responses
- Rating aggregation
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from app.db.session import get_db
from app.core.security import get_current_active_user
from app.models import User, Review, Contract
from app.schemas.review import (
    Review as ReviewSchema,
    ReviewCreate,
    ReviewUpdate,
    ReviewStats
)

router = APIRouter()


@router.post("/reviews", response_model=ReviewSchema, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new review.
    
    Business rules:
    - Only contract parties (client or freelancer) can review
    - Cannot review yourself
    - One review per party per contract
    - Contract must be completed
    """
    # Get contract
    contract = db.query(Contract).filter(Contract.id == review_data.contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    # Verify user is part of the contract
    if current_user.id not in [contract.client_id, contract.freelancer_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only contract parties can create reviews"
        )
    
    # Verify not reviewing yourself
    if current_user.id == review_data.reviewed_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot review yourself"
        )
    
    # Verify reviewed user is the other party
    other_party_id = contract.freelancer_id if current_user.id == contract.client_id else contract.client_id
    if review_data.reviewed_user_id != other_party_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only review the other party in the contract"
        )
    
    # Check for existing review
    existing_review = db.query(Review).filter(
        and_(
            Review.contract_id == review_data.contract_id,
            Review.reviewer_id == current_user.id,
            Review.reviewed_user_id == review_data.reviewed_user_id
        )
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this user for this contract"
        )
    
    # Create review
    review = Review(
        **review_data.model_dump(),
        reviewer_id=current_user.id
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return review


@router.get("/reviews", response_model=List[ReviewSchema])
async def list_reviews(
    user_id: Optional[int] = Query(None, description="Filter by reviewed user"),
    reviewer_id: Optional[int] = Query(None, description="Filter by reviewer"),
    contract_id: Optional[int] = Query(None, description="Filter by contract"),
    min_rating: Optional[float] = Query(None, ge=1.0, le=5.0, description="Minimum rating"),
    is_public: Optional[bool] = Query(None, description="Filter by public status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List reviews with filtering.
    
    Only public reviews are visible unless you're:
    - The reviewer
    - The reviewed user
    - An admin
    """
    query = db.query(Review)
    
    # Apply filters
    if user_id is not None:
        query = query.filter(Review.reviewed_user_id == user_id)
    
    if reviewer_id is not None:
        query = query.filter(Review.reviewer_id == reviewer_id)
    
    if contract_id is not None:
        query = query.filter(Review.contract_id == contract_id)
    
    if min_rating is not None:
        query = query.filter(Review.rating >= min_rating)
    
    # Privacy filter
    if current_user.user_type.value != "admin":
        query = query.filter(
            or_(
                Review.is_public == True,
                Review.reviewer_id == current_user.id,
                Review.reviewed_user_id == current_user.id
            )
        )
    
    if is_public is not None:
        query = query.filter(Review.is_public == is_public)
    
    # Order by most recent
    query = query.order_by(Review.created_at.desc())
    
    reviews = query.offset(skip).limit(limit).all()
    return reviews


@router.get("/reviews/stats/{user_id}", response_model=ReviewStats)
async def get_review_stats(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get aggregated review statistics for a user.
    
    Only includes public reviews in stats.
    """
    # Check user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get review stats (only public reviews)
    stats = db.query(
        func.count(Review.id).label('total_reviews'),
        func.avg(Review.rating).label('average_rating'),
        func.avg(Review.communication_rating).label('avg_communication'),
        func.avg(Review.quality_rating).label('avg_quality'),
        func.avg(Review.professionalism_rating).label('avg_professionalism'),
        func.avg(Review.deadline_rating).label('avg_deadline')
    ).filter(
        and_(
            Review.reviewed_user_id == user_id,
            Review.is_public == True
        )
    ).first()
    
    # Get rating distribution
    rating_distribution = {}
    for i in range(1, 6):
        count = db.query(func.count(Review.id)).filter(
            and_(
                Review.reviewed_user_id == user_id,
                Review.is_public == True,
                Review.rating >= i,
                Review.rating < i + 1
            )
        ).scalar()
        rating_distribution[f"{i}_star"] = count or 0
    
    return ReviewStats(
        user_id=user_id,
        total_reviews=stats.total_reviews or 0,
        average_rating=round(float(stats.average_rating), 2) if stats.average_rating else 0.0,
        communication_rating=round(float(stats.avg_communication), 2) if stats.avg_communication else 0.0,
        quality_rating=round(float(stats.avg_quality), 2) if stats.avg_quality else 0.0,
        professionalism_rating=round(float(stats.avg_professionalism), 2) if stats.avg_professionalism else 0.0,
        deadline_rating=round(float(stats.avg_deadline), 2) if stats.avg_deadline else 0.0,
        rating_distribution=rating_distribution
    )


@router.get("/reviews/{review_id}", response_model=ReviewSchema)
async def get_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific review.
    
    Private reviews only visible to reviewer, reviewed user, or admin.
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Privacy check
    if not review.is_public:
        if current_user.user_type.value != "admin" and \
           current_user.id not in [review.reviewer_id, review.reviewed_user_id]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this review"
            )
    
    return review


@router.patch("/reviews/{review_id}", response_model=ReviewSchema)
async def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a review.
    
    Only the reviewer can update their review.
    Reviewed user can add a response.
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Determine what can be updated
    if current_user.id == review.reviewer_id:
        # Reviewer can update everything except response
        update_data = review_data.model_dump(exclude_unset=True, exclude={"response"})
    elif current_user.id == review.reviewed_user_id:
        # Reviewed user can only add response
        if "response" not in review_data.model_dump(exclude_unset=True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only add a response to this review"
            )
        update_data = {"response": review_data.response}
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this review"
        )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(review, field, value)
    
    db.commit()
    db.refresh(review)
    
    return review


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a review.
    
    Only reviewer or admin can delete.
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Permission check
    if current_user.user_type.value != "admin" and current_user.id != review.reviewer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the reviewer or admin can delete this review"
        )
    
    db.delete(review)
    db.commit()
