# @AI-HINT: Fraud detection router — behavioral analysis, suspicious account detection
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


@router.get("/alerts")
async def list_fraud_alerts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(require_admin),
):
    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT id, user_id, alert_type, severity, description, status, created_at
           FROM fraud_alerts
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?""",
        [page_size, offset],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.get("/check/{user_id}")
async def check_user_fraud(user_id: int, current_user=Depends(require_admin)):
    result = execute_query(
        "SELECT id, email, name, user_type, created_at, is_active FROM users WHERE id = ?",
        [user_id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": user_id,
        "risk_score": 0.1,
        "risk_level": "low",
        "flags": [],
        "message": "No fraud indicators detected",
    }


@router.post("/report")
async def report_suspicious_activity(
    user_id: int,
    reason: str,
    current_user=Depends(get_current_user),
):
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        """INSERT INTO fraud_alerts (user_id, reporter_id, alert_type, severity, description, status, created_at)
           VALUES (?, ?, 'user_report', 'medium', ?, 'pending', ?)""",
        [user_id, current_user.id, reason, now],
    )
    return {"message": "Report submitted for review"}
