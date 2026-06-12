# @AI-HINT: Workflow automation router — automated workflows and triggers
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


class WorkflowCreate(BaseModel):
    name: str
    trigger: str
    actions: list[dict]


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    trigger: Optional[str] = None
    actions: Optional[list[dict]] = None


@router.get("")
async def list_workflows(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, name, trigger, actions, is_active, created_at, updated_at FROM workflows WHERE user_id = ? ORDER BY created_at DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.get("/{workflow_id}")
async def get_workflow(workflow_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, name, trigger, actions, is_active, created_at, updated_at FROM workflows WHERE id = ? AND user_id = ?",
        [workflow_id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return rows[0]


@router.post("")
async def create_workflow(request: WorkflowCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    import json
    result = execute_query(
        "INSERT INTO workflows (user_id, name, trigger, actions, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)",
        [current_user.id, request.name, request.trigger, json.dumps(request.actions), now, now],
    )
    return {"message": "Workflow created", "workflow_id": result.get("last_insert_rowid")}


@router.put("/{workflow_id}")
async def update_workflow(workflow_id: int, request: WorkflowUpdate, current_user=Depends(get_current_user)):
    existing = execute_query("SELECT id FROM workflows WHERE id = ? AND user_id = ?", [workflow_id, current_user.id])
    if not parse_rows(existing):
        raise HTTPException(status_code=404, detail="Workflow not found")

    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    import json
    set_parts = []
    values = []
    for k, v in updates.items():
        if k == "actions":
            set_parts.append(f"{k} = ?")
            values.append(json.dumps(v))
        else:
            set_parts.append(f"{k} = ?")
            values.append(v)

    set_parts.append("updated_at = ?")
    values.extend([datetime.now(timezone.utc).isoformat(), workflow_id])

    execute_query(f"UPDATE workflows SET {', '.join(set_parts)} WHERE id = ?", values)
    return {"message": "Workflow updated"}


@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: int, current_user=Depends(get_current_user)):
    execute_query("DELETE FROM workflows WHERE id = ? AND user_id = ?", [workflow_id, current_user.id])
    return {"message": "Workflow deleted"}


@router.post("/{workflow_id}/enable")
async def enable_workflow(workflow_id: int, current_user=Depends(get_current_user)):
    execute_query("UPDATE workflows SET is_active = 1 WHERE id = ? AND user_id = ?", [workflow_id, current_user.id])
    return {"message": "Workflow enabled"}


@router.post("/{workflow_id}/disable")
async def disable_workflow(workflow_id: int, current_user=Depends(get_current_user)):
    execute_query("UPDATE workflows SET is_active = 0 WHERE id = ? AND user_id = ?", [workflow_id, current_user.id])
    return {"message": "Workflow disabled"}


@router.get("/{workflow_id}/logs")
async def get_workflow_logs(workflow_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, workflow_id, status, message, created_at FROM workflow_logs WHERE workflow_id = ? ORDER BY created_at DESC LIMIT 50",
        [workflow_id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}


@router.get("/triggers")
async def get_triggers(current_user=Depends(get_current_user)):
    return {
        "triggers": [
            {"id": "new_project", "name": "New Project Created", "description": "Triggered when a new project is posted"},
            {"id": "new_proposal", "name": "New Proposal", "description": "Triggered when a proposal is submitted"},
            {"id": "contract_started", "name": "Contract Started", "description": "Triggered when a contract begins"},
            {"id": "payment_received", "name": "Payment Received", "description": "Triggered when payment is received"},
        ]
    }


@router.get("/actions")
async def get_actions(current_user=Depends(get_current_user)):
    return {
        "actions": [
            {"id": "send_email", "name": "Send Email", "description": "Send an email notification"},
            {"id": "send_notification", "name": "Send Notification", "description": "Send an in-app notification"},
            {"id": "create_task", "name": "Create Task", "description": "Create a new task"},
            {"id": "update_status", "name": "Update Status", "description": "Update project/contract status"},
        ]
    }
