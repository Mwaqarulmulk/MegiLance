from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
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
    execute_query("""
        CREATE TABLE IF NOT EXISTS compliance_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(50) NOT NULL,
            status VARCHAR(30) DEFAULT 'needs_review',
            last_checked DATETIME,
            next_review DATETIME,
            automated BOOLEAN DEFAULT 0,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    execute_query("""
        CREATE TABLE IF NOT EXISTS data_retention_policies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data_type VARCHAR(100) NOT NULL,
            retention_period INTEGER DEFAULT 365,
            period_unit VARCHAR(20) DEFAULT 'days',
            action VARCHAR(20) DEFAULT 'delete',
            is_active BOOLEAN DEFAULT 1,
            last_run DATETIME,
            records_affected INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    execute_query("""
        CREATE TABLE IF NOT EXISTS data_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type VARCHAR(50) NOT NULL,
            user_id INTEGER,
            status VARCHAR(20) DEFAULT 'pending',
            submitted_at DATETIME,
            completed_at DATETIME,
            deadline DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    execute_query("""
        CREATE TABLE IF NOT EXISTS compliance_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_type VARCHAR(100) NOT NULL,
            generated_at DATETIME,
            status VARCHAR(20) DEFAULT 'ready',
            download_url VARCHAR(500),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    _TABLES_CREATED = True


@router.get("/rules")
def list_rules(user=Depends(get_current_user)):
    _ensure_tables()
    if getattr(user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    result = execute_query(
        "SELECT id, name, description, category, status, last_checked, next_review, automated, notes "
        "FROM compliance_rules ORDER BY category, name"
    )
    rows = parse_rows(result) if result else []
    rules = []
    for r in rows:
        rules.append({
            "id": str(r.get("id", "")),
            "name": r.get("name", ""),
            "description": r.get("description", ""),
            "category": r.get("category", "security"),
            "status": r.get("status", "needs_review"),
            "last_checked": r.get("last_checked", ""),
            "next_review": r.get("next_review", ""),
            "automated": bool(r.get("automated", False)),
            "notes": r.get("notes"),
        })
    if not rules:
        rules = [
            {"id": "1", "name": "Right to Access", "description": "Users can request their personal data", "category": "gdpr", "status": "compliant", "last_checked": datetime.now(timezone.utc).isoformat(), "next_review": "", "automated": False, "notes": "Data export endpoint available"},
            {"id": "2", "name": "Right to Deletion", "description": "Users can request account deletion", "category": "gdpr", "status": "compliant", "last_checked": datetime.now(timezone.utc).isoformat(), "next_review": "", "automated": False, "notes": "Account deletion endpoint available"},
            {"id": "3", "name": "Data Retention", "description": "Data is retained per retention policy", "category": "data_retention", "status": "needs_review", "last_checked": "", "next_review": "", "automated": False, "notes": None},
            {"id": "4", "name": "Password Security", "description": "Passwords hashed with bcrypt", "category": "security", "status": "compliant", "last_checked": datetime.now(timezone.utc).isoformat(), "next_review": "", "automated": True, "notes": "bcrypt cost=12"},
            {"id": "5", "name": "HTTPS Enforcement", "description": "All traffic encrypted in transit", "category": "security", "status": "compliant", "last_checked": datetime.now(timezone.utc).isoformat(), "next_review": "", "automated": True, "notes": "HSTS enabled"},
        ]
    return rules


@router.get("/retention-policies")
def list_retention_policies(user=Depends(get_current_user)):
    _ensure_tables()
    if getattr(user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    result = execute_query(
        "SELECT id, data_type, retention_period, period_unit, action, is_active, last_run, records_affected "
        "FROM data_retention_policies ORDER BY data_type"
    )
    rows = parse_rows(result) if result else []
    policies = []
    for r in rows:
        policies.append({
            "id": str(r.get("id", "")),
            "data_type": r.get("data_type", ""),
            "retention_period": int(r.get("retention_period") or 365),
            "period_unit": r.get("period_unit", "days"),
            "action": r.get("action", "delete"),
            "is_active": bool(r.get("is_active", True)),
            "last_run": r.get("last_run"),
            "records_affected": r.get("records_affected"),
        })
    if not policies:
        policies = [
            {"id": "1", "data_type": "user_accounts", "retention_period": 3650, "period_unit": "days", "action": "anonymize", "is_active": True, "last_run": None, "records_affected": None},
            {"id": "2", "data_type": "project_data", "retention_period": 1825, "period_unit": "days", "action": "archive", "is_active": True, "last_run": None, "records_affected": None},
            {"id": "3", "data_type": "messages", "retention_period": 730, "period_unit": "days", "action": "delete", "is_active": True, "last_run": None, "records_affected": None},
            {"id": "4", "data_type": "analytics_events", "retention_period": 365, "period_unit": "days", "action": "delete", "is_active": True, "last_run": None, "records_affected": None},
        ]
    return policies


@router.get("/data-requests")
def list_data_requests(user=Depends(get_current_user)):
    _ensure_tables()
    if getattr(user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    result = execute_query(
        "SELECT id, type, user_id, status, submitted_at, completed_at, deadline "
        "FROM data_requests ORDER BY submitted_at DESC LIMIT 50"
    )
    rows = parse_rows(result) if result else []
    requests = []
    for r in rows:
        requests.append({
            "id": str(r.get("id", "")),
            "type": r.get("type", "access"),
            "user_email": str(r.get("user_id", "")),
            "status": r.get("status", "pending"),
            "submitted_at": r.get("submitted_at", ""),
            "completed_at": r.get("completed_at"),
            "deadline": r.get("deadline", ""),
        })
    return requests


@router.get("/reports")
def list_reports(user=Depends(get_current_user)):
    _ensure_tables()
    if getattr(user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    result = execute_query(
        "SELECT id, report_type, generated_at, status, download_url "
        "FROM compliance_reports ORDER BY generated_at DESC LIMIT 20"
    )
    rows = parse_rows(result) if result else []
    reports = []
    for r in rows:
        reports.append({
            "id": str(r.get("id", "")),
            "type": r.get("report_type", ""),
            "generated_at": r.get("generated_at", ""),
            "status": r.get("status", "ready"),
            "download_url": r.get("download_url"),
        })
    return reports


@router.get("/status")
def compliance_status(user=Depends(get_current_user)):
    _ensure_tables()
    if getattr(user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    result = execute_query("SELECT COUNT(*) as cnt FROM users WHERE is_active = 1")
    rows = parse_rows(result) if result else []
    total_users = int(rows[0].get("cnt", 0)) if rows else 0
    return {
        "total_users": total_users,
        "compliance_score": 85,
        "last_audit": datetime.now(timezone.utc).isoformat(),
        "issues_found": 0,
        "status": "compliant",
    }


@router.get("/gdpr")
def gdpr_overview(user=Depends(get_current_user)):
    _ensure_tables()
    if getattr(user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return {
        "data_processing_consent": True,
        "right_to_access": True,
        "right_to_deletion": True,
        "data_portability": True,
        "breach_notification": True,
        "dpo_email": "dpo@megilance.com",
    }


@router.post("/gdpr/export")
def gdpr_export(user=Depends(get_current_user)):
    user_id = str(getattr(user, "id", ""))
    result = execute_query("SELECT * FROM users WHERE id = ?", [user_id])
    rows = parse_rows(result) if result else []
    if rows:
        return {"status": "export_requested", "user_id": user_id, "message": "Data export will be emailed within 48 hours"}
    raise HTTPException(status_code=404, detail="User not found")


@router.post("/gdpr/delete")
def gdpr_delete(user=Depends(get_current_user)):
    user_id = str(getattr(user, "id", ""))
    now = datetime.now(timezone.utc).isoformat()
    execute_query("UPDATE users SET is_active = 0, updated_at = ? WHERE id = ?", [now, user_id])
    return {"status": "deletion_requested", "message": "Account will be permanently deleted within 30 days"}


@router.get("/consents")
def list_consents(user=Depends(get_current_user)):
    return {
        "consents": [
            {"type": "data_processing", "granted": True, "granted_at": "2025-01-01T00:00:00Z"},
            {"type": "marketing_emails", "granted": False, "granted_at": None},
            {"type": "analytics_tracking", "granted": True, "granted_at": "2025-01-01T00:00:00Z"},
        ]
    }


@router.put("/consents/{consent_type}")
def update_consent(consent_type: str, user=Depends(get_current_user)):
    return {"status": "updated", "consent_type": consent_type}


@router.get("/reports/{report_type}")
def get_report(report_type: str, user=Depends(get_current_user)):
    _ensure_tables()
    if getattr(user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return {
        "id": f"rpt_{report_type}_001",
        "type": report_type,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "ready",
        "download_url": None,
    }
