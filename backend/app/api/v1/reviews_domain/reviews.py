# @AI-HINT: Reviews router — submit, list, rate reviews
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows, parse_date
from app.services.db_utils import get_val as _get_val, safe_str as _safe_str

router = APIRouter()


class ReviewCreate(BaseModel):
    contract_id: int
    rating: int
    comment: Optional[str] = None
    communication_rating: Optional[int] = None
    quality_rating: Optional[int] = None
    deadline_rating: Optional[int] = None
    professionalism_rating: Optional[int] = None
    would_recommend: bool = True

class ReviewResponse(BaseModel):
    response: str


@router.get("")
async def list_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: Optional[int] = None,
    current_user=Depends(get_current_user),
):
    where = "WHERE 1=1"
    params: list = []

    if user_id:
        where += " AND (r.reviewer_id = ? OR r.reviewee_id = ?)"
        params.extend([user_id, user_id])

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT r.id, r.contract_id, r.reviewer_id, r.reviewee_id, r.rating,
                   r.comment, r.communication_rating, r.quality_rating, r.deadline_rating,
                   r.professionalism_rating, r.would_recommend, r.is_public,
                   r.created_at, r.updated_at,
                   ru.name as reviewer_name, ru.profile_image_url as reviewer_avatar,
                   reu.name as reviewee_name, reu.profile_image_url as reviewee_avatar,
                   pr.title as project_title
            FROM reviews r
            LEFT JOIN users ru ON r.reviewer_id = ru.id
            LEFT JOIN users reu ON r.reviewee_id = reu.id
            LEFT JOIN contracts c ON r.contract_id = c.id
            LEFT JOIN projects pr ON c.project_id = pr.id
            {where} AND r.is_public = 1
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.get("/{review_id}")
async def get_review(review_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        """SELECT r.id, r.contract_id, r.reviewer_id, r.reviewee_id, r.rating,
                  r.comment, r.communication_rating, r.quality_rating, r.deadline_rating,
                  r.professionalism_rating, r.would_recommend, r.is_public,
                  r.created_at, r.updated_at,
                  ru.name as reviewer_name, reu.name as reviewee_name,
                  pr.title as project_title
           FROM reviews r
           LEFT JOIN users ru ON r.reviewer_id = ru.id
           LEFT JOIN users reu ON r.reviewee_id = reu.id
           LEFT JOIN contracts c ON r.contract_id = c.id
           LEFT JOIN projects pr ON c.project_id = pr.id
           WHERE r.id = ?""",
        [review_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Review not found")
    return rows[0]


@router.post("")
async def create_review(request: ReviewCreate, current_user=Depends(get_current_user)):
    contract_result = execute_query(
        "SELECT id, client_id, freelancer_id, status FROM contracts WHERE id = ?",
        [request.contract_id],
    )
    contract_rows = parse_rows(contract_result)
    if not contract_rows:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = contract_rows[0]
    if contract["client_id"] != current_user.id and contract["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only contract parties can review")

    if contract["client_id"] == current_user.id:
        reviewee_id = contract["freelancer_id"]
    else:
        reviewee_id = contract["client_id"]

    existing = execute_query(
        "SELECT id FROM reviews WHERE contract_id = ? AND reviewer_id = ?",
        [request.contract_id, current_user.id],
    )
    if parse_rows(existing):
        raise HTTPException(status_code=409, detail="You already reviewed this contract")

    if request.rating < 1 or request.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO reviews (contract_id, reviewer_id, reviewee_id, rating, comment,
                  communication_rating, quality_rating, deadline_rating, professionalism_rating,
                  would_recommend, is_public, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)""",
        [
            request.contract_id, current_user.id, reviewee_id, request.rating,
            request.comment or "", request.communication_rating, request.quality_rating,
            request.deadline_rating, request.professionalism_rating, request.would_recommend,
            now, now,
        ],
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to create review")

    return {"message": "Review submitted successfully", "review_id": result.get("last_insert_rowid")}


@router.post("/{review_id}/respond")
async def respond_to_review(review_id: int, request: ReviewResponse, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, reviewee_id FROM reviews WHERE id = ?",
        [review_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Review not found")

    if rows[0]["reviewee_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the reviewed user can respond")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE reviews SET response = ?, updated_at = ? WHERE id = ?",
        [request.response, now, review_id],
    )
    return {"message": "Response added successfully"}
