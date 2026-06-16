# @AI-HINT: Error/issue reporting — auto-captured runtime errors (frontend + backend)
# and manual user-submitted issues. Stored in Turso `error_reports`, surfaced in the
# admin portal (/admin/issues) for monitoring, copying, triage and fixing.
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime, timezone
import hashlib
import json
import logging

logger = logging.getLogger(__name__)

from app.core.security import require_admin, get_current_user_optional
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

_table_ready = False

VALID_STATUS = {"new", "investigating", "resolved", "ignored"}
VALID_SEVERITY = {"low", "medium", "high", "critical"}


def _ensure_table():
    global _table_ready
    if _table_ready:
        return
    try:
        execute_query(
            """
            CREATE TABLE IF NOT EXISTS error_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fingerprint   TEXT,
                source        TEXT DEFAULT 'frontend',
                severity      TEXT DEFAULT 'medium',
                error_type    TEXT,
                message       TEXT,
                stack         TEXT,
                path          TEXT,
                method        TEXT,
                status_code   INTEGER,
                user_id       INTEGER,
                user_email    TEXT,
                user_agent    TEXT,
                context       TEXT,
                occurrences   INTEGER DEFAULT 1,
                status        TEXT DEFAULT 'new',
                admin_notes   TEXT,
                first_seen    TEXT,
                last_seen     TEXT
            )
            """,
            [],
        )
        execute_query(
            "CREATE INDEX IF NOT EXISTS idx_error_reports_fp ON error_reports (fingerprint, status)", []
        )
        _table_ready = True
    except Exception as e:
        logger.warning(f"error_reports table init failed (non-critical): {e}")


def _fingerprint(source: str, error_type: str, message: str, path: str) -> str:
    raw = f"{source}|{error_type}|{(message or '')[:200]}|{path or ''}"
    return hashlib.md5(raw.encode("utf-8", "ignore")).hexdigest()


def record_error(
    *,
    source: str = "backend",
    severity: str = "medium",
    error_type: str = "Error",
    message: str = "",
    stack: Optional[str] = None,
    path: Optional[str] = None,
    method: Optional[str] = None,
    status_code: Optional[int] = None,
    user_id: Optional[int] = None,
    user_email: Optional[str] = None,
    user_agent: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None,
) -> Optional[int]:
    """Record (or de-duplicate) an error. Best-effort — never raises."""
    try:
        _ensure_table()
        now = datetime.now(timezone.utc).isoformat()
        if severity not in VALID_SEVERITY:
            severity = "medium"
        fp = _fingerprint(source, error_type, message, path or "")

        # De-dupe: bump an existing open report instead of flooding the table.
        existing = parse_rows(execute_query(
            "SELECT id, occurrences FROM error_reports WHERE fingerprint = ? AND status IN ('new','investigating') ORDER BY id DESC LIMIT 1",
            [fp],
        ))
        if existing:
            rid = existing[0]["id"]
            execute_query(
                "UPDATE error_reports SET occurrences = occurrences + 1, last_seen = ?, severity = ? WHERE id = ?",
                [now, severity, rid],
            )
            return rid

        result = execute_query(
            """INSERT INTO error_reports
               (fingerprint, source, severity, error_type, message, stack, path, method,
                status_code, user_id, user_email, user_agent, context, occurrences, status, first_seen, last_seen)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'new', ?, ?)""",
            [fp, source, severity, error_type, (message or "")[:2000], (stack or "")[:8000],
             (path or "")[:500], method, status_code, user_id, user_email,
             (user_agent or "")[:500], json.dumps(context or {})[:4000], now, now],
        )
        return result.get("last_insert_rowid")
    except Exception as e:
        logger.warning(f"record_error failed (non-critical): {e}")
        return None


# ── Capture (public, optional auth) ──────────────────────────────────────────────

class ErrorReportIn(BaseModel):
    source: str = "frontend"            # frontend | backend | manual
    severity: str = "medium"
    error_type: Optional[str] = "Error"
    message: str = ""
    stack: Optional[str] = None
    path: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    user_email: Optional[str] = None    # for manual reports from guests


@router.post("", status_code=201)
async def capture_error(payload: ErrorReportIn, request: Request, current_user=Depends(get_current_user_optional)):
    rid = record_error(
        source=payload.source if payload.source in ("frontend", "backend", "manual") else "frontend",
        severity=payload.severity,
        error_type=payload.error_type or ("Issue" if payload.source == "manual" else "Error"),
        message=payload.message,
        stack=payload.stack,
        path=payload.path,
        user_id=getattr(current_user, "id", None),
        user_email=payload.user_email or getattr(current_user, "email", None),
        user_agent=request.headers.get("user-agent"),
        context=payload.context,
    )
    return {"message": "Report received", "id": rid}


# ── Admin: list / stats / detail / update / delete ───────────────────────────────

@router.get("")
async def list_errors(
    status: Optional[str] = None,
    source: Optional[str] = None,
    severity: Optional[str] = None,
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    current_user=Depends(require_admin),
):
    _ensure_table()
    where = "WHERE 1=1"
    params: list = []
    if status:
        where += " AND status = ?"; params.append(status)
    if source:
        where += " AND source = ?"; params.append(source)
    if severity:
        where += " AND severity = ?"; params.append(severity)
    if q:
        where += " AND (message LIKE ? OR error_type LIKE ? OR path LIKE ?)"
        like = f"%{q}%"; params.extend([like, like, like])

    total_rows = parse_rows(execute_query(f"SELECT COUNT(*) as c FROM error_reports {where}", params))
    total = total_rows[0]["c"] if total_rows else 0

    offset = (page - 1) * page_size
    rows = parse_rows(execute_query(
        f"""SELECT id, fingerprint, source, severity, error_type, message, path, method,
                   status_code, user_id, user_email, occurrences, status, first_seen, last_seen
            FROM error_reports {where} ORDER BY last_seen DESC LIMIT ? OFFSET ?""",
        params + [page_size, offset],
    ))
    return {"items": rows or [], "total": total, "page": page, "page_size": page_size}


@router.get("/stats/overview")
async def error_stats(current_user=Depends(require_admin)):
    _ensure_table()
    def _count(cond: str, p: list):
        r = parse_rows(execute_query(f"SELECT COUNT(*) as c FROM error_reports WHERE {cond}", p))
        return r[0]["c"] if r else 0
    by_status = parse_rows(execute_query(
        "SELECT status, COUNT(*) as count FROM error_reports GROUP BY status", []))
    by_severity = parse_rows(execute_query(
        "SELECT severity, COUNT(*) as count FROM error_reports GROUP BY severity", []))
    return {
        "total": _count("1=1", []),
        "new": _count("status = 'new'", []),
        "investigating": _count("status = 'investigating'", []),
        "resolved": _count("status = 'resolved'", []),
        "critical_open": _count("severity = 'critical' AND status IN ('new','investigating')", []),
        "by_status": by_status or [],
        "by_severity": by_severity or [],
    }


@router.get("/{report_id}")
async def get_error(report_id: int, current_user=Depends(require_admin)):
    _ensure_table()
    rows = parse_rows(execute_query("SELECT * FROM error_reports WHERE id = ?", [report_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="Report not found")
    return rows[0]


class ErrorUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    admin_notes: Optional[str] = None


@router.patch("/{report_id}")
async def update_error(report_id: int, request: ErrorUpdate, current_user=Depends(require_admin)):
    _ensure_table()
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if "status" in updates and updates["status"] not in VALID_STATUS:
        raise HTTPException(status_code=400, detail="Invalid status")
    if "severity" in updates and updates["severity"] not in VALID_SEVERITY:
        raise HTTPException(status_code=400, detail="Invalid severity")
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    set_parts = [f"{k} = ?" for k in updates]
    values = list(updates.values()) + [report_id]
    execute_query(f"UPDATE error_reports SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Report updated"}


@router.delete("/{report_id}", status_code=204)
async def delete_error(report_id: int, current_user=Depends(require_admin)):
    _ensure_table()
    execute_query("DELETE FROM error_reports WHERE id = ?", [report_id])
    return None
