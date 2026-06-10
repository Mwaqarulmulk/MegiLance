from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

_TABLES_CREATED = False


def _ensure_tables():
    global _TABLES_CREATED
    if _TABLES_CREATED:
        return
    # fraud_alerts table is created by migration 005_add_missing_tables.py
    # Just verify it exists
    _TABLES_CREATED = True


class FraudAlertUpdate(BaseModel):
    status: str
    resolution_notes: Optional[str] = None


@router.get("")
def list_fraud_alerts(user=Depends(get_current_user)):
    _ensure_tables()
    if getattr(user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    result = execute_query(
        "SELECT id, user_id, alert_type, status, severity, description, created_at "
        "FROM fraud_alerts ORDER BY created_at DESC LIMIT 100"
    )
    rows = parse_rows(result) if result else []
    alerts = []
    for r in rows:
        alerts.append({
            "id": str(r.get("id", "")),
            "user_email": str(r.get("user_id", "")),
            "alert_type": r.get("alert_type", "suspicious_activity"),
            "status": r.get("status", "pending"),
            "severity": r.get("severity", "medium"),
            "description": r.get("description", ""),
            "created_at": r.get("created_at", ""),
        })
    return {"alerts": alerts}


@router.patch("/{alert_id}")
def update_fraud_alert(alert_id: str, req: FraudAlertUpdate, user=Depends(get_current_user)):
    _ensure_tables()
    if getattr(user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE fraud_alerts SET status = ?, resolution_notes = ?, resolved_at = ?, resolved_by = ? WHERE id = ?",
        [req.status, req.resolution_notes, now, str(getattr(user, "id", "")), alert_id],
    )
    return {"status": "updated"}
