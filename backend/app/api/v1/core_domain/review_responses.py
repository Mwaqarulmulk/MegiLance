# @AI-HINT: Review responses router — respond to reviews
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class ReviewResponseCreate(BaseModel):
    response: str


@router.get("/{review_id}")
async def get_response(review_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, review_id, response, created_at, updated_at FROM review_responses WHERE review_id = ?",
        [review_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Response not found")
    return rows[0]


@router.post("/{review_id}")
async def create_response(review_id: int, request: ReviewResponseCreate, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, reviewee_id FROM reviews WHERE id = ?",
        [review_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Review not found")

    if rows[0]["reviewee_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the reviewed user can respond")

    existing = execute_query("SELECT id FROM review_responses WHERE review_id = ?", [review_id])
    if parse_rows(existing):
        now = datetime.now(timezone.utc).isoformat()
        execute_query(
            "UPDATE review_responses SET response = ?, updated_at = ? WHERE review_id = ?",
            [request.response, now, review_id],
        )
        return {"message": "Response updated"}

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO review_responses (review_id, user_id, response, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        [review_id, current_user.id, request.response, now, now],
    )
    return {"message": "Response created", "response_id": result.get("last_insert_rowid")}


@router.put("/{review_id}")
async def update_response(review_id: int, request: ReviewResponseCreate, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id FROM review_responses WHERE review_id = ? AND user_id = ?",
        [review_id, current_user.id],
    )
    if not parse_rows(result):
        raise HTTPException(status_code=404, detail="Response not found")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE review_responses SET response = ?, updated_at = ? WHERE review_id = ? AND user_id = ?",
        [request.response, now, review_id, current_user.id],
    )
    return {"message": "Response updated"}


@router.delete("/{review_id}")
async def delete_response(review_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "DELETE FROM review_responses WHERE review_id = ? AND user_id = ?",
        [review_id, current_user.id],
    )
    return {"message": "Response deleted"}
