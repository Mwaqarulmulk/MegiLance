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


def _recommendation(risk_level: str) -> str:
    return {
        "critical": "Block and manually review immediately — strong fraud signals.",
        "high": "Restrict actions and require manual verification.",
        "medium": "Monitor closely; request identity verification if it continues.",
        "low": "Low risk — routine monitoring is sufficient.",
        "minimal": "No action needed — looks legitimate.",
    }.get(risk_level, "Monitor.")


@router.get("/analyze/user/{user_id}")
async def analyze_user(user_id: int, current_user=Depends(require_admin)):
    """Risk analysis for a user (matches frontend fraud client shape)."""
    rows = parse_rows(execute_query("SELECT id, name, email FROM users WHERE id = ?", [user_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")
    a = _analyze_user_fraud(user_id)
    return {
        "user_id": user_id,
        "user_name": rows[0].get("name"),
        "risk_score": a["risk_score"],
        "risk_level": a["risk_level"],
        "risk_factors": a.get("flags", []),
        "recommendation": _recommendation(a["risk_level"]),
        "details": a.get("details", {}),
    }


@router.get("/analyze/project/{project_id}")
async def analyze_project(project_id: int, current_user=Depends(require_admin)):
    flags = []
    score = 0.0
    rows = parse_rows(execute_query(
        "SELECT id, client_id, budget_min, budget_max, description, created_at FROM projects WHERE id = ?", [project_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="Project not found")
    p = rows[0]
    desc = (p.get("description") or "")
    if len(desc) < 30:
        flags.append("very_short_description"); score += 0.2
    try:
        if float(p.get("budget_max") or 0) > 100000:
            flags.append("unusually_high_budget"); score += 0.2
    except (ValueError, TypeError):
        pass
    for kw in ("western union", "gift card", "telegram", "whatsapp only", "pay outside"):
        if kw in desc.lower():
            flags.append(f"offsite_payment_signal:{kw}"); score += 0.3
    # inherit some client risk
    if p.get("client_id"):
        score = min(1.0, score + _analyze_user_fraud(int(p["client_id"]))["risk_score"] * 0.3)
    level = "high" if score >= 0.5 else "medium" if score >= 0.3 else "low" if score >= 0.1 else "minimal"
    return {"project_id": project_id, "risk_score": round(min(score, 1.0), 3), "risk_level": level,
            "risk_factors": flags, "recommendation": _recommendation(level)}


@router.get("/analyze/proposal/{proposal_id}")
async def analyze_proposal(proposal_id: int, current_user=Depends(require_admin)):
    rows = parse_rows(execute_query(
        "SELECT id, freelancer_id, cover_letter, bid_amount FROM proposals WHERE id = ?", [proposal_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="Proposal not found")
    pr = rows[0]
    flags = []
    score = 0.0
    cl = (pr.get("cover_letter") or "")
    if len(cl) < 40:
        flags.append("generic_or_short_cover_letter"); score += 0.2
    if pr.get("freelancer_id"):
        fa = _analyze_user_fraud(int(pr["freelancer_id"]))
        score = min(1.0, score + fa["risk_score"] * 0.5)
        flags += fa.get("flags", [])
    level = "high" if score >= 0.5 else "medium" if score >= 0.3 else "low" if score >= 0.1 else "minimal"
    return {"proposal_id": proposal_id, "risk_score": round(score, 3), "risk_level": level,
            "risk_factors": flags, "recommendation": _recommendation(level)}


@router.get("/transaction/{transaction_id}")
async def analyze_transaction(transaction_id: int, current_user=Depends(require_admin)):
    rows = parse_rows(execute_query(
        "SELECT id, client_id, amount, status, created_at FROM payments WHERE id = ?", [transaction_id]))
    if not rows:
        return {"transaction_id": transaction_id, "risk_score": 0.0, "risk_level": "minimal",
                "risk_factors": ["transaction_not_found"], "recommendation": "No data."}
    t = rows[0]
    flags = []
    score = 0.0
    try:
        if float(t.get("amount") or 0) > 50000:
            flags.append("high_value_transaction"); score += 0.3
    except (ValueError, TypeError):
        pass
    if (t.get("status") or "") == "failed":
        flags.append("failed_transaction"); score += 0.2
    level = "high" if score >= 0.5 else "medium" if score >= 0.3 else "low" if score >= 0.1 else "minimal"
    return {"transaction_id": transaction_id, "risk_score": round(score, 3), "risk_level": level,
            "risk_factors": flags, "recommendation": _recommendation(level)}


class FraudReportRequest(BaseModel):
    type: Optional[str] = "user_report"
    target_id: str
    reason: str
    details: Optional[str] = None


@router.post("/report")
async def report_suspicious_activity(body: FraudReportRequest, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    try:
        target_user = int(body.target_id)
    except (ValueError, TypeError):
        target_user = None
    desc = body.reason + (f" — {body.details}" if body.details else "")
    execute_query(
        """INSERT INTO fraud_alerts (user_id, reporter_id, alert_type, severity, description, status, created_at)
           VALUES (?, ?, ?, 'medium', ?, 'pending', ?)""",
        [target_user, current_user.id, body.type or "user_report", desc, now],
    )
    return {"message": "Report submitted for review"}
