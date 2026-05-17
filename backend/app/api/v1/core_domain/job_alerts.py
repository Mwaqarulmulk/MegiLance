# @AI-HINT: Job alerts router — saved job search alerts
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class JobAlertCreate(BaseModel):
    title: str
    keywords: Optional[str] = None
    category: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    location: Optional[str] = None
    email_notifications: bool = True


@router.get("/")
async def list_job_alerts(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, user_id, title, keywords, category, budget_min, budget_max, location, email_notifications, created_at, updated_at FROM job_alerts WHERE user_id = ? ORDER BY created_at DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.post("/")
async def create_job_alert(request: JobAlertCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO job_alerts (user_id, title, keywords, category, budget_min, budget_max, location, email_notifications, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [current_user.id, request.title, request.keywords or "", request.category or "", request.budget_min, request.budget_max, request.location or "", 1 if request.email_notifications else 0, now, now],
    )
    return {"message": "Job alert created", "alert_id": result.get("last_insert_rowid")}


@router.put("/{alert_id}")
async def update_job_alert(alert_id: int, request: JobAlertCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "UPDATE job_alerts SET title = ?, keywords = ?, category = ?, budget_min = ?, budget_max = ?, location = ?, email_notifications = ?, updated_at = ? WHERE id = ? AND user_id = ?",
        [request.title, request.keywords or "", request.category or "", request.budget_min, request.budget_max, request.location or "", 1 if request.email_notifications else 0, now, alert_id, current_user.id],
    )
    return {"message": "Job alert updated"}


@router.delete("/{alert_id}")
async def delete_job_alert(alert_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM job_alerts WHERE id = ? AND user_id = ?", [alert_id, current_user.id])
    return {"message": "Job alert deleted"}
