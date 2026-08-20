# @AI-HINT: Reviews router — submit, list, rate reviews
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, get_current_user_optional
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

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None
    communication_rating: Optional[int] = None
    quality_rating: Optional[int] = None
    deadline_rating: Optional[int] = None
    professionalism_rating: Optional[int] = None
    would_recommend: Optional[bool] = None

class ReviewResponse(BaseModel):
    response: str


@router.get("")
def list_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    limit: Optional[int] = Query(None, ge=1, le=100),
    user_id: Optional[int] = None,
    current_user=Depends(get_current_user_optional),
):
    effective_page_size = limit if limit is not None else page_size
    where = "WHERE 1=1"
    params: list = []

    if user_id:
        where += " AND (r.reviewer_id = ? OR r.reviewee_id = ?)"
        params.extend([user_id, user_id])

    offset = (page - 1) * effective_page_size
    params.extend([effective_page_size, offset])

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
def get_review(review_id: int, current_user=Depends(get_current_user)):
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
def create_review(request: ReviewCreate, current_user=Depends(get_current_user)):
    contract_result = execute_query(
        "SELECT id, client_id, freelancer_id, status FROM contracts WHERE id = ?",
        [request.contract_id],
    )
    contract_rows = parse_rows(contract_result)
    if not contract_rows:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = contract_rows[0]
    contract_client_id = str(contract.get("client_id", ""))
    contract_freelancer_id = str(contract.get("freelancer_id", ""))
    user_id_str = str(getattr(current_user, "id", ""))

    if user_id_str != contract_client_id and user_id_str != contract_freelancer_id:
        raise HTTPException(status_code=403, detail="Only contract parties can review")

    if user_id_str == contract_client_id:
        reviewee_id = int(contract["freelancer_id"]) if str(contract.get("freelancer_id", "")).isdigit() else contract.get("freelancer_id")
    else:
        reviewee_id = int(contract["client_id"]) if str(contract.get("client_id", "")).isdigit() else contract.get("client_id")

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


@router.put("/{review_id}")
def update_review(review_id: int, request: ReviewUpdate, current_user=Depends(get_current_user)):
    rows = parse_rows(execute_query("SELECT id, reviewer_id FROM reviews WHERE id = ?", [review_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="Review not found")
    if str(rows[0].get("reviewer_id", "")) != str(getattr(current_user, "id", "")):
        raise HTTPException(status_code=403, detail="Only the reviewer can edit this review")

    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    _ALLOWED = frozenset({"rating", "comment", "communication_rating", "quality_rating",
                          "deadline_rating", "professionalism_rating", "would_recommend"})
    for k in updates:
        if k not in _ALLOWED:
            raise HTTPException(status_code=400, detail=f"Invalid field: {k}")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), review_id]
    execute_query(f"UPDATE reviews SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Review updated"}


@router.delete("/{review_id}")
def delete_review(review_id: int, current_user=Depends(get_current_user)):
    rows = parse_rows(execute_query("SELECT id, reviewer_id FROM reviews WHERE id = ?", [review_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="Review not found")
    if str(rows[0].get("reviewer_id", "")) != str(getattr(current_user, "id", "")):
        raise HTTPException(status_code=403, detail="Only the reviewer can delete this review")
    execute_query("DELETE FROM reviews WHERE id = ?", [review_id])
    return {"message": "Review deleted"}


@router.post("/{review_id}/respond")
def respond_to_review(review_id: int, request: ReviewResponse, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, reviewee_id FROM reviews WHERE id = ?",
        [review_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Review not found")

    if str(rows[0].get("reviewee_id", "")) != str(getattr(current_user, "id", "")):
        raise HTTPException(status_code=403, detail="Only the reviewed user can respond")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE reviews SET response = ?, updated_at = ? WHERE id = ?",
        [request.response, now, review_id],
    )
    return {"message": "Response added successfully"}
