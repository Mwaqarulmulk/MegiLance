# @AI-HINT: Fraud detection router — behavioral analysis, suspicious account detection
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import logging
import json

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def _analyze_user_fraud(user_id: int) -> dict:
    """Perform multi-signal fraud analysis on a user."""
    flags = []
    risk_score = 0.0

    # 1. Account age check (< 24 hours old = suspicious)
    result = execute_query(
        "SELECT created_at, is_active FROM users WHERE id = ?", [user_id]
    )
    user_rows = parse_rows(result)
    if not user_rows:
        return {"risk_score": 1.0, "risk_level": "critical", "flags": ["user_not_found"]}

    user = user_rows[0]
    try:
        created = datetime.fromisoformat(str(user["created_at"]).replace("Z", "+00:00"))
        age_hours = (datetime.now(timezone.utc).replace(tzinfo=None) - created.replace(tzinfo=None)).total_seconds() / 3600
        if age_hours < 1:
            flags.append("brand_new_account")
            risk_score += 0.2
        elif age_hours < 24:
            flags.append("very_new_account")
            risk_score += 0.1
    except (ValueError, TypeError):
        pass

    # 2. Inactive account check
    if not user.get("is_active"):
        flags.append("inactive_account")
        risk_score += 0.3

    # 3. Velocity: rapid proposal submission (> 10 in last hour)
    result = execute_query(
        """SELECT COUNT(*) as cnt FROM proposals
           WHERE freelancer_id = ? AND created_at > datetime('now', '-1 hour')""",
        [user_id],
    )
    rows = parse_rows(result)
    recent_proposals = rows[0]["cnt"] if rows else 0
    if recent_proposals > 20:
        flags.append("extreme_proposal_velocity")
        risk_score += 0.4
    elif recent_proposals > 10:
        flags.append("high_proposal_velocity")
        risk_score += 0.2

    # 4. Multiple active contracts (> 5 simultaneously = suspicious)
    result = execute_query(
        """SELECT COUNT(*) as cnt FROM contracts
           WHERE freelancer_id = ? AND status IN ('active', 'in_progress')""",
        [user_id],
    )
    rows = parse_rows(result)
    active_contracts = rows[0]["cnt"] if rows else 0
    if active_contracts > 10:
        flags.append("too_many_active_contracts")
        risk_score += 0.3
    elif active_contracts > 5:
        flags.append("many_active_contracts")
        risk_score += 0.1

    # 5. Failed login attempts (> 5 in last hour)
    result = execute_query(
        """SELECT COUNT(*) as cnt FROM fraud_alerts
           WHERE user_id = ? AND alert_type = 'failed_login'
           AND created_at > datetime('now', '-1 hour')""",
        [user_id],
    )
    rows = parse_rows(result)
    failed_logins = rows[0]["cnt"] if rows else 0
    if failed_logins > 10:
        flags.append("brute_force_attempt")
        risk_score += 0.4
    elif failed_logins > 5:
        flags.append("multiple_failed_logins")
        risk_score += 0.2

    # 6. Dispute history (> 3 disputes = risk)
    result = execute_query(
        """SELECT COUNT(*) as cnt FROM disputes
           WHERE (filed_by = ? OR filed_against = ?)""",
        [user_id, user_id],
    )
    rows = parse_rows(result)
    disputes = rows[0]["cnt"] if rows else 0
    if disputes > 5:
        flags.append("frequent_disputes")
        risk_score += 0.3
    elif disputes > 3:
        flags.append("multiple_disputes")
        risk_score += 0.15

    # 7. Review pattern: all 1-star or all 5-star = suspicious
    result = execute_query(
        """SELECT rating, COUNT(*) as cnt FROM reviews
           WHERE reviewee_id = ? GROUP BY rating""",
        [user_id],
    )
    rows = parse_rows(result) or []
    if rows:
        total_reviews = sum(r["cnt"] for r in rows)
        if total_reviews >= 3:
            ratings = {r["rating"]: r["cnt"] for r in rows}
            if ratings.get(1, 0) == total_reviews:
                flags.append("all_negative_reviews")
                risk_score += 0.3
            elif ratings.get(5, 0) == total_reviews and total_reviews > 5:
                flags.append("suspiciously_perfect_reviews")
                risk_score += 0.15

    # 8. Payment anomalies: many failed payments
    result = execute_query(
        """SELECT COUNT(*) as cnt FROM payments
           WHERE client_id = ? AND status = 'failed'
           AND created_at > datetime('now', '-7 days')""",
        [user_id],
    )
    rows = parse_rows(result)
    failed_payments = rows[0]["cnt"] if rows else 0
    if failed_payments > 5:
        flags.append("multiple_failed_payments")
        risk_score += 0.25

    # Cap risk score at 1.0
    risk_score = min(risk_score, 1.0)

    # Determine risk level
    if risk_score >= 0.7:
        risk_level = "critical"
    elif risk_score >= 0.5:
        risk_level = "high"
    elif risk_score >= 0.3:
        risk_level = "medium"
    elif risk_score >= 0.1:
        risk_level = "low"
    else:
        risk_level = "minimal"

    return {
        "risk_score": round(risk_score, 3),
        "risk_level": risk_level,
        "flags": flags,
        "signals_checked": {
            "account_age": True,
            "proposal_velocity": True,
            "active_contracts": True,
            "dispute_history": True,
            "review_pattern": True,
            "payment_history": True,
        },
        "details": {
            "recent_proposals_1h": recent_proposals,
            "active_contracts": active_contracts,
            "disputes": disputes,
            "failed_payments_7d": failed_payments,
        },
    }


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

    analysis = _analyze_user_fraud(user_id)

    # Create fraud alert if risk is high or critical
    if analysis["risk_score"] >= 0.5:
        now = datetime.now(timezone.utc).isoformat()
        execute_query(
            """INSERT INTO fraud_alerts (user_id, alert_type, severity, description, status, created_at)
               VALUES (?, 'auto_detection', ?, ?, 'pending', ?)""",
            [
                user_id,
                analysis["risk_level"],
                f"Auto-detected risk score {analysis['risk_score']}: {', '.join(analysis['flags'])}",
                now,
            ],
        )

    return {
        "user_id": user_id,
        "user_name": rows[0].get("name"),
        "user_email": rows[0].get("email"),
        **analysis,
    }


@router.post("/report")
async def report_suspicious_activity(
    user_id: int,
    reason: str,
    current_user=Depends(get_current_user),
):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        """INSERT INTO fraud_alerts (user_id, reporter_id, alert_type, severity, description, status, created_at)
           VALUES (?, ?, 'user_report', 'medium', ?, 'pending', ?)""",
        [user_id, current_user.id, reason, now],
    )
    return {"message": "Report submitted for review"}
