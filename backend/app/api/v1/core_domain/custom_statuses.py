# @AI-HINT: Custom Statuses router — workflow customization for projects and tasks
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import json
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def _ensure_table():
    execute_query("""
        CREATE TABLE IF NOT EXISTS custom_statuses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            entity_type TEXT NOT NULL,
            name TEXT NOT NULL,
            color TEXT DEFAULT '#6B7280',
            icon TEXT,
            display_order INTEGER DEFAULT 0,
            is_terminal INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS workflow_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            entity_type TEXT NOT NULL,
            from_status TEXT NOT NULL,
            to_status TEXT NOT NULL,
            requires_approval INTEGER DEFAULT 0,
            auto_transition INTEGER DEFAULT 0,
            conditions_json TEXT,
            created_at TEXT NOT NULL
        )
    """, [])


class CustomStatusCreate(BaseModel):
    entity_type: str
    name: str
    color: Optional[str] = "#6B7280"
    icon: Optional[str] = None
    display_order: Optional[int] = 0
    is_terminal: Optional[bool] = False


class CustomStatusUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    display_order: Optional[int] = None
    is_terminal: Optional[bool] = None


class ReorderRequest(BaseModel):
    entity_type: str
    status_ids: List[int]


class WorkflowRuleCreate(BaseModel):
    entity_type: str
    from_status: str
    to_status: str
    requires_approval: Optional[bool] = False
    auto_transition: Optional[bool] = False
    conditions_json: Optional[str] = None


class WorkflowConfigureRequest(BaseModel):
    entity_type: str
    rules: List[WorkflowRuleCreate]


@router.post("")
def create_custom_status(
    body: CustomStatusCreate,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO custom_statuses (user_id, entity_type, name, color, icon, display_order, is_terminal, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            current_user.id,
            body.entity_type,
            body.name,
            body.color or "#6B7280",
            body.icon,
            body.display_order or 0,
            1 if body.is_terminal else 0,
            now,
            now,
        ],
    )
    status_id = result.get("last_insert_rowid") if result else None
    return {"message": "Status created", "status_id": status_id}


@router.get("")
def list_custom_statuses(
    entity_type: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
):
    _ensure_table()
    if entity_type:
        result = execute_query(
            "SELECT id, user_id, entity_type, name, color, icon, display_order, is_terminal, created_at, updated_at "
            "FROM custom_statuses WHERE user_id = ? AND entity_type = ? ORDER BY display_order, id",
            [current_user.id, entity_type],
        )
    else:
        result = execute_query(
            "SELECT id, user_id, entity_type, name, color, icon, display_order, is_terminal, created_at, updated_at "
            "FROM custom_statuses WHERE user_id = ? ORDER BY entity_type, display_order, id",
            [current_user.id],
        )
    rows = parse_rows(result) if result else []
    return {"items": rows, "total": len(rows)}


@router.put("/{status_id}")
def update_custom_status(
    status_id: int,
    body: CustomStatusUpdate,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    existing = execute_query(
        "SELECT id FROM custom_statuses WHERE id = ? AND user_id = ?",
        [status_id, current_user.id],
    )
    if not parse_rows(existing):
        raise HTTPException(status_code=404, detail="Status not found")

    updates = {}
    if body.name is not None:
        updates["name"] = body.name
    if body.color is not None:
        updates["color"] = body.color
    if body.icon is not None:
        updates["icon"] = body.icon
    if body.display_order is not None:
        updates["display_order"] = body.display_order
    if body.is_terminal is not None:
        updates["is_terminal"] = 1 if body.is_terminal else 0

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_parts = [f"{k} = ?" for k in updates]
    set_parts.append("updated_at = ?")
    values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), status_id]

    execute_query(
        f"UPDATE custom_statuses SET {', '.join(set_parts)} WHERE id = ?",
        values,
    )
    return {"message": "Status updated"}


@router.delete("/{status_id}")
def delete_custom_status(
    status_id: int,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    existing = execute_query(
        "SELECT id FROM custom_statuses WHERE id = ? AND user_id = ?",
        [status_id, current_user.id],
    )
    if not parse_rows(existing):
        raise HTTPException(status_code=404, detail="Status not found")

    execute_query(
        "DELETE FROM custom_statuses WHERE id = ? AND user_id = ?",
        [status_id, current_user.id],
    )
    execute_query(
        "DELETE FROM workflow_rules WHERE user_id = ? AND (from_status = (SELECT name FROM custom_statuses WHERE id = ?) OR to_status = (SELECT name FROM custom_statuses WHERE id = ?))",
        [current_user.id, status_id, status_id],
    )
    return {"message": "Status deleted"}


@router.post("/reorder")
def reorder_statuses(
    body: ReorderRequest,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()
    for index, status_id in enumerate(body.status_ids):
        execute_query(
            "UPDATE custom_statuses SET display_order = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            [index, now, status_id, current_user.id],
        )
    return {"message": "Statuses reordered"}


@router.get("/workflow")
def get_workflow_configuration(
    entity_type: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
):
    _ensure_table()
    if entity_type:
        result = execute_query(
            "SELECT id, user_id, entity_type, from_status, to_status, requires_approval, auto_transition, conditions_json, created_at "
            "FROM workflow_rules WHERE user_id = ? AND entity_type = ? ORDER BY id",
            [current_user.id, entity_type],
        )
    else:
        result = execute_query(
            "SELECT id, user_id, entity_type, from_status, to_status, requires_approval, auto_transition, conditions_json, created_at "
            "FROM workflow_rules WHERE user_id = ? ORDER BY entity_type, id",
            [current_user.id],
        )
    rows = parse_rows(result) if result else []
    return {"items": rows, "total": len(rows)}


@router.post("/workflow")
def configure_workflow_transitions(
    body: WorkflowConfigureRequest,
    current_user=Depends(get_current_user),
):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()

    execute_query(
        "DELETE FROM workflow_rules WHERE user_id = ? AND entity_type = ?",
        [current_user.id, body.entity_type],
    )

    created_ids = []
    for rule in body.rules:
        result = execute_query(
            "INSERT INTO workflow_rules (user_id, entity_type, from_status, to_status, requires_approval, auto_transition, conditions_json, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                current_user.id,
                body.entity_type,
                rule.from_status,
                rule.to_status,
                1 if rule.requires_approval else 0,
                1 if rule.auto_transition else 0,
                rule.conditions_json,
                now,
            ],
        )
        rule_id = result.get("last_insert_rowid") if result else None
        if rule_id:
            created_ids.append(rule_id)

    return {"message": "Workflow configured", "rules_created": len(created_ids)}


@router.get("/presets")
def get_preset_status_sets(
    entity_type: Optional[str] = Query("project"),
    current_user=Depends(get_current_user),
):
    presets = {
        "project": [
            {"name": "Draft", "color": "#9CA3AF", "icon": "draft", "display_order": 0, "is_terminal": False},
            {"name": "Open", "color": "#3B82F6", "icon": "open", "display_order": 1, "is_terminal": False},
            {"name": "In Progress", "color": "#F59E0B", "icon": "in_progress", "display_order": 2, "is_terminal": False},
            {"name": "Under Review", "color": "#8B5CF6", "icon": "review", "display_order": 3, "is_terminal": False},
            {"name": "Completed", "color": "#10B981", "icon": "completed", "display_order": 4, "is_terminal": True},
            {"name": "Cancelled", "color": "#EF4444", "icon": "cancelled", "display_order": 5, "is_terminal": True},
        ],
        "task": [
            {"name": "To Do", "color": "#9CA3AF", "icon": "todo", "display_order": 0, "is_terminal": False},
            {"name": "In Progress", "color": "#3B82F6", "icon": "in_progress", "display_order": 1, "is_terminal": False},
            {"name": "Blocked", "color": "#EF4444", "icon": "blocked", "display_order": 2, "is_terminal": False},
            {"name": "In Review", "color": "#8B5CF6", "icon": "review", "display_order": 3, "is_terminal": False},
            {"name": "Done", "color": "#10B981", "icon": "done", "display_order": 4, "is_terminal": True},
        ],
        "proposal": [
            {"name": "Draft", "color": "#9CA3AF", "icon": "draft", "display_order": 0, "is_terminal": False},
            {"name": "Submitted", "color": "#3B82F6", "icon": "submitted", "display_order": 1, "is_terminal": False},
            {"name": "Under Review", "color": "#F59E0B", "icon": "review", "display_order": 2, "is_terminal": False},
            {"name": "Shortlisted", "color": "#8B5CF6", "icon": "shortlisted", "display_order": 3, "is_terminal": False},
            {"name": "Accepted", "color": "#10B981", "icon": "accepted", "display_order": 4, "is_terminal": True},
            {"name": "Rejected", "color": "#EF4444", "icon": "rejected", "display_order": 5, "is_terminal": True},
        ],
        "contract": [
            {"name": "Pending", "color": "#F59E0B", "icon": "pending", "display_order": 0, "is_terminal": False},
            {"name": "Active", "color": "#3B82F6", "icon": "active", "display_order": 1, "is_terminal": False},
            {"name": "On Hold", "color": "#8B5CF6", "icon": "hold", "display_order": 2, "is_terminal": False},
            {"name": "Completed", "color": "#10B981", "icon": "completed", "display_order": 3, "is_terminal": True},
            {"name": "Terminated", "color": "#EF4444", "icon": "terminated", "display_order": 4, "is_terminal": True},
        ],
    }

    selected = presets.get(entity_type or "project", presets["project"])
    return {"presets": selected, "available_entity_types": list(presets.keys())}
