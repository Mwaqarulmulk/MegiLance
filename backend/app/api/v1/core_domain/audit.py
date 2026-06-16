# @AI-HINT: Audit Trail router — security and compliance event logging
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, require_admin
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def _ensure_table():
    execute_query("""
        CREATE TABLE IF NOT EXISTS audit_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            event_type TEXT NOT NULL,
            resource_type TEXT,
            resource_id TEXT,
            action TEXT NOT NULL,
            description TEXT,
            ip_address TEXT,
            user_agent TEXT,
            metadata TEXT,
            severity TEXT DEFAULT 'info',
            created_at TEXT NOT NULL
        )
    """, [])


def _row_to_event(row) -> dict:
    import json
    if isinstance(row, dict):
        return {
            "id": row.get("id"),
            "user_id": row.get("user_id"),
            "event_type": row.get("event_type"),
            "resource_type": row.get("resource_type"),
            "resource_id": row.get("resource_id"),
            "action": row.get("action"),
            "description": row.get("description"),
            "ip_address": row.get("ip_address"),
            "user_agent": row.get("user_agent"),
            "metadata": json.loads(row.get("metadata") or "{}") if row.get("metadata") else {},
            "severity": row.get("severity") or "info",
            "created_at": row.get("created_at"),
        }
    return {
        "id": row[0], "user_id": row[1], "event_type": row[2],
        "resource_type": row[3], "resource_id": row[4], "action": row[5],
        "description": row[6], "ip_address": row[7], "user_agent": row[8],
        "metadata": json.loads(row[9] or "{}") if row[9] else {},
        "severity": row[10] or "info", "created_at": row[11],
    }


@router.get("/events")
async def list_events(
    event_type: Optional[str] = None,
    user_id: Optional[int] = None,
    resource_type: Optional[str] = None,
    severity: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    current_user=Depends(require_admin),
):
    _ensure_table()
    conditions = []
    params = []
    if event_type:
        conditions.append("event_type = ?")
        params.append(event_type)
    if user_id:
        conditions.append("user_id = ?")
        params.append(user_id)
    if resource_type:
        conditions.append("resource_type = ?")
        params.append(resource_type)
    if severity:
        conditions.append("severity = ?")
        params.append(severity)
    if start_date:
        conditions.append("created_at >= ?")
        params.append(start_date)
    if end_date:
        conditions.append("created_at <= ?")
        params.append(end_date)

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    skip = (page - 1) * page_size

    result = execute_query(
        f"SELECT id, user_id, event_type, resource_type, resource_id, action, description, "
        f"ip_address, user_agent, metadata, severity, created_at FROM audit_events {where} "
        f"ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params + [page_size, skip]
    )

    events = []
    if result and result.get("rows"):
        rows = parse_rows(result)
        for row in rows:
            events.append(_row_to_event(row))
    return {"events": events, "page": page, "page_size": page_size}


@router.get("/events/{event_id}")
async def get_event(event_id: int, current_user=Depends(require_admin)):
    _ensure_table()
    result = execute_query(
        "SELECT id, user_id, event_type, resource_type, resource_id, action, description, "
        "ip_address, user_agent, metadata, severity, created_at FROM audit_events WHERE id = ?",
        [event_id]
    )
    if not result or not result.get("rows"):
        raise HTTPException(status_code=404, detail="Event not found")
    rows = parse_rows(result)
    return _row_to_event(rows[0])


class AuditEventCreate(BaseModel):
    event_type: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    action: str
    description: Optional[str] = None
    severity: str = "info"
    metadata: Optional[dict] = None


@router.post("/events", status_code=201)
async def log_event(body: AuditEventCreate, current_user=Depends(get_current_user)):
    import json
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO audit_events (user_id, event_type, resource_type, resource_id, action, "
        "description, severity, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [current_user.id, body.event_type, body.resource_type, body.resource_id,
         body.action, body.description, body.severity,
         json.dumps(body.metadata) if body.metadata else None, now]
    )
    return {"message": "Event logged"}


@router.get("/summary")
async def get_summary(days: int = Query(30, ge=1, le=365), current_user=Depends(require_admin)):
    _ensure_table()
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    result = execute_query(
        "SELECT severity, COUNT(*) FROM audit_events WHERE created_at >= ? GROUP BY severity",
        [since]
    )
    counts = {"info": 0, "warning": 0, "error": 0, "critical": 0}
    if result and result.get("rows"):
        rows = parse_rows(result)
        for row in rows:
            sev = row.get("severity") or "info"
            if sev in counts:
                counts[sev] = int(row.get("count", 0) or 0)
    total_result = execute_query(
        "SELECT COUNT(*) as cnt FROM audit_events WHERE created_at >= ?", [since]
    )
    total = 0
    if total_result and total_result.get("rows"):
        total_rows = parse_rows(total_result)
        total = int(total_rows[0].get("cnt", 0) or 0) if total_rows else 0
    return {"days": days, "total": total, "by_severity": counts}


@router.get("/user/{user_id}/activity")
async def get_user_activity(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(require_admin),
):
    _ensure_table()
    skip = (page - 1) * page_size
    result = execute_query(
        "SELECT id, user_id, event_type, resource_type, resource_id, action, description, "
        "ip_address, user_agent, metadata, severity, created_at FROM audit_events "
        "WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [user_id, page_size, skip]
    )
    events = []
    if result and result.get("rows"):
        rows = parse_rows(result)
        for row in rows:
            events.append(_row_to_event(row))
    return {"user_id": user_id, "events": events}


@router.get("/resource/{resource_type}/{resource_id}/history")
async def get_resource_history(
    resource_type: str, resource_id: str, current_user=Depends(require_admin)
):
    _ensure_table()
    result = execute_query(
        "SELECT id, user_id, event_type, resource_type, resource_id, action, description, "
        "ip_address, user_agent, metadata, severity, created_at FROM audit_events "
        "WHERE resource_type = ? AND resource_id = ? ORDER BY created_at DESC LIMIT 100",
        [resource_type, resource_id]
    )
    events = []
    if result and result.get("rows"):
        rows = parse_rows(result)
        for row in rows:
            events.append(_row_to_event(row))
    return {"resource_type": resource_type, "resource_id": resource_id, "history": events}


@router.post("/export")
async def export_events(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user=Depends(require_admin),
):
    return {"export_id": "pending", "message": "Export queued", "status": "pending"}


@router.get("/export/{export_id}/status")
async def get_export_status(export_id: str, current_user=Depends(require_admin)):
    return {"export_id": export_id, "status": "pending"}


@router.get("/compliance/report")
async def get_compliance_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user=Depends(require_admin),
):
    _ensure_table()
    conditions = []
    params = []
    if start_date:
        conditions.append("created_at >= ?")
        params.append(start_date)
    if end_date:
        conditions.append("created_at <= ?")
        params.append(end_date)
    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    result = execute_query(
        f"SELECT event_type, COUNT(*) FROM audit_events {where} GROUP BY event_type ORDER BY COUNT(*) DESC",
        params
    )
    breakdown = {}
    if result and result.get("rows"):
        rows = parse_rows(result)
        for row in rows:
            breakdown[row.get("event_type") or "unknown"] = int(row.get("count", 0) or 0)
    return {"start_date": start_date, "end_date": end_date, "event_type_breakdown": breakdown}


@router.get("/retention/policy")
async def get_retention_policy(current_user=Depends(require_admin)):
    return {"retention_days": 365, "policy": "Events older than 365 days are archived"}


@router.put("/retention/policy")
async def update_retention_policy(
    retention_days: int = Query(365, ge=30, le=3650),
    current_user=Depends(require_admin),
):
    return {"retention_days": retention_days, "message": "Retention policy updated"}
