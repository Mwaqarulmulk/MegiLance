# @AI-HINT: User feedback router — NPS surveys, feature requests, bug reports, satisfaction ratings
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class FeedbackCreate(BaseModel):
    feedback_type: str  # "nps", "feature_request", "bug_report", "general"
    rating: Optional[int] = None  # 1-10 for NPS, 1-5 for satisfaction
    title: Optional[str] = None
    description: str
    category: Optional[str] = None
    page_url: Optional[str] = None


class FeedbackUpdate(BaseModel):
    status: Optional[str] = None
    admin_response: Optional[str] = None


@router.post("")
async def submit_feedback(request: FeedbackCreate, current_user=Depends(get_current_user)):
    """Submit user feedback (NPS, feature request, bug report, etc.)"""
    if request.feedback_type not in ("nps", "feature_request", "bug_report", "general"):
        raise HTTPException(status_code=400, detail="Invalid feedback type")

    if request.rating is not None:
        if request.feedback_type == "nps" and not (0 <= request.rating <= 10):
            raise HTTPException(status_code=400, detail="NPS rating must be 0-10")
        elif request.feedback_type != "nps" and not (1 <= request.rating <= 5):
            raise HTTPException(status_code=400, detail="Rating must be 1-5")

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO user_feedback (user_id, feedback_type, rating, title, description, category, page_url, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)""",
        [
            current_user.id,
            request.feedback_type,
            request.rating,
            request.title or "",
            request.description,
            request.category or "",
            request.page_url or "",
            now,
        ],
    )

    if not result:
        raise HTTPException(status_code=500, detail="Failed to submit feedback")

    # Track NPS score for analytics
    if request.feedback_type == "nps" and request.rating is not None:
        logger.info(f"nps_score user={current_user.id} score={request.rating}")

    return {
        "message": "Feedback submitted successfully",
        "feedback_id": result.get("last_insert_rowid"),
    }


@router.get("")
async def list_feedback(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    feedback_type: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    """List the current user's feedback"""
    offset = (page - 1) * page_size
    conditions = ["user_id = ?"]
    params = [current_user.id]

    if feedback_type:
        conditions.append("feedback_type = ?")
        params.append(feedback_type)

    where = " AND ".join(conditions)
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT id, feedback_type, rating, title, description, category, page_url,
                  status, admin_response, created_at
           FROM user_feedback
           WHERE {where}
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.get("/stats")
async def get_feedback_stats(current_user=Depends(get_current_user)):
    """Get feedback statistics for the current user"""
    result = execute_query(
        """SELECT feedback_type, COUNT(*) as count, AVG(rating) as avg_rating
           FROM user_feedback
           WHERE user_id = ?
           GROUP BY feedback_type""",
        [current_user.id],
    )
    stats = {}
    for row in parse_rows(result) or []:
        stats[row["feedback_type"]] = {
            "count": row["count"],
            "avg_rating": round(float(row["avg_rating"]), 2) if row["avg_rating"] else None,
        }

    # NPS calculation
    nps_result = execute_query(
        """SELECT rating, COUNT(*) as count FROM user_feedback
           WHERE user_id = ? AND feedback_type = 'nps' AND rating IS NOT NULL
           GROUP BY rating""",
        [current_user.id],
    )
    nps_scores = {}
    for row in parse_rows(nps_result) or []:
        nps_scores[row["rating"]] = row["count"]

    total_nps = sum(nps_scores.values())
    promoters = sum(v for k, v in nps_scores.items() if k >= 9)
    detractors = sum(v for k, v in nps_scores.items() if k <= 6)
    nps_score = round(((promoters - detractors) / total_nps * 100), 1) if total_nps > 0 else 0

    return {
        "stats": stats,
        "nps": {
            "score": nps_score,
            "total_responses": total_nps,
            "promoters": promoters,
            "passives": total_nps - promoters - detractors,
            "detractors": detractors,
        },
    }


@router.get("/feature-requests")
async def list_feature_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: Optional[str] = "newest",
):
    """List public feature requests (sorted by votes)"""
    offset = (page - 1) * page_size
    sort_map = {
        "newest": "created_at DESC",
        "popular": "votes DESC",
        "oldest": "created_at ASC",
    }
    order = sort_map.get(sort_by, "created_at DESC")

    result = execute_query(
        f"""SELECT f.id, f.title, f.description, f.category, f.status, f.votes,
                   f.created_at, u.name as author_name
           FROM user_feedback f
           JOIN users u ON f.user_id = u.id
           WHERE f.feedback_type = 'feature_request'
           ORDER BY {order}
           LIMIT ? OFFSET ?""",
        [page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.post("/{feedback_id}/vote")
async def vote_feature_request(feedback_id: int, current_user=Depends(get_current_user)):
    """Vote for a feature request"""
    # Check if already voted
    existing = execute_query(
        "SELECT id FROM feedback_votes WHERE feedback_id = ? AND user_id = ?",
        [feedback_id, current_user.id],
    )
    if existing and existing.get("rows") and parse_rows(existing):
        raise HTTPException(status_code=400, detail="You already voted for this feature request")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO feedback_votes (feedback_id, user_id, created_at) VALUES (?, ?, ?)",
        [feedback_id, current_user.id, now],
    )
    execute_query(
        "UPDATE user_feedback SET votes = votes + 1 WHERE id = ?",
        [feedback_id],
    )

    return {"message": "Vote recorded"}
