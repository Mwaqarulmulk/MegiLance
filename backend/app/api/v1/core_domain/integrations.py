# @AI-HINT: Integrations router — third-party integrations management
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class IntegrationConnect(BaseModel):
    provider: str
    credentials: dict

class IntegrationUpdate(BaseModel):
    is_active: Optional[bool] = None
    settings: Optional[dict] = None


@router.get("")
def list_integrations(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, provider, is_active, settings, connected_at, updated_at FROM integrations WHERE user_id = ? ORDER BY connected_at DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0}


@router.get("/available")
def get_available_integrations():
    return {
        "integrations": [
            {"id": "slack", "name": "Slack", "description": "Get notifications in Slack", "category": "communication"},
            {"id": "github", "name": "GitHub", "description": "Link GitHub repositories", "category": "development"},
            {"id": "jira", "name": "Jira", "description": "Sync projects with Jira", "category": "project_management"},
            {"id": "trello", "name": "Trello", "description": "Sync with Trello boards", "category": "project_management"},
            {"id": "google_calendar", "name": "Google Calendar", "description": "Sync meetings and deadlines", "category": "calendar"},
            {"id": "zapier", "name": "Zapier", "description": "Automate workflows", "category": "automation"},
        ]
    }


@router.post("/connect")
def connect_integration(request: IntegrationConnect, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO integrations (user_id, provider, credentials, is_active, settings, connected_at, updated_at) VALUES (?, ?, ?, 1, '{}', ?, ?)",
        [current_user.id, request.provider, str(request.credentials), now, now],
    )
    return {"message": f"{request.provider} connected", "integration_id": result.get("last_insert_rowid")}


@router.put("/{integration_id}")
def update_integration(integration_id: int, request: IntegrationUpdate, current_user=Depends(get_current_user)):
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    for k, v in updates.items():
        if isinstance(v, bool):
            updates[k] = 1 if v else 0
        elif isinstance(v, dict):
            updates[k] = str(v)

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), integration_id, current_user.id]

    execute_query(f"UPDATE integrations SET {', '.join(set_parts)} WHERE id = ? AND user_id = ?", values)
    return {"message": "Integration updated"}


@router.delete("/{integration_id}")
def disconnect_integration(integration_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM integrations WHERE id = ? AND user_id = ?", [integration_id, current_user.id])
    return {"message": "Integration disconnected"}
