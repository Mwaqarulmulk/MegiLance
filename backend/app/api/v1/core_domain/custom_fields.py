# @AI-HINT: Custom Fields router — dynamic entity metadata management
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def _ensure_table():
    execute_query("""
        CREATE TABLE IF NOT EXISTS custom_field_definitions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            entity_type TEXT NOT NULL,
            field_name TEXT NOT NULL,
            field_type TEXT DEFAULT 'text',
            field_options TEXT,
            is_required INTEGER DEFAULT 0,
            is_searchable INTEGER DEFAULT 1,
            display_order INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS custom_field_values (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            field_id INTEGER NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id INTEGER NOT NULL,
            value TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(field_id, entity_type, entity_id)
        )
    """, [])


class CustomFieldCreate(BaseModel):
    entity_type: str
    field_name: str
    field_type: str = "text"
    field_options: Optional[str] = None
    is_required: bool = False
    is_searchable: bool = True
    display_order: int = 0


class CustomFieldUpdate(BaseModel):
    field_name: Optional[str] = None
    field_type: Optional[str] = None
    field_options: Optional[str] = None
    is_required: Optional[bool] = None
    is_searchable: Optional[bool] = None
    display_order: Optional[int] = None


class CustomFieldValueSet(BaseModel):
    entity_type: str
    entity_id: int
    value: Optional[str] = None


def _row_to_field(row) -> dict:
    return {
        "id": row[0],
        "user_id": row[1],
        "entity_type": row[2],
        "field_name": row[3],
        "field_type": row[4],
        "field_options": row[5],
        "is_required": bool(row[6]),
        "is_searchable": bool(row[7]),
        "display_order": row[8],
        "created_at": row[9],
        "updated_at": row[10],
    }


def _row_to_value(row) -> dict:
    return {
        "id": row[0],
        "field_id": row[1],
        "entity_type": row[2],
        "entity_id": row[3],
        "value": row[4],
        "created_at": row[5],
        "updated_at": row[6],
    }


@router.post("/custom-fields", status_code=201)
def create_custom_field(body: CustomFieldCreate, current_user=Depends(get_current_user)):
    _ensure_table()
    user_id = str(getattr(current_user, "id", ""))
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO custom_field_definitions (user_id, entity_type, field_name, field_type, field_options, is_required, is_searchable, display_order, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
        [user_id, body.entity_type, body.field_name, body.field_type, body.field_options,
         1 if body.is_required else 0, 1 if body.is_searchable else 0, body.display_order, now, now],
    )
    rows = parse_rows(result) if result else []
    field_id = rows[0]["id"] if rows else 0
    return {"message": "Custom field created", "field_id": field_id}


@router.get("/custom-fields")
def list_custom_fields(
    entity_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user=Depends(get_current_user),
):
    _ensure_table()
    user_id = str(getattr(current_user, "id", ""))
    where = "WHERE user_id = ?"
    params: list = [user_id]
    if entity_type:
        where += " AND entity_type = ?"
        params.append(entity_type)
    params.append(limit)
    result = execute_query(
        f"SELECT id, user_id, entity_type, field_name, field_type, field_options, is_required, is_searchable, display_order, created_at, updated_at "
        f"FROM custom_field_definitions {where} ORDER BY display_order, field_name LIMIT ?",
        params,
    )
    rows = parse_rows(result) if result else []
    return {"items": [_row_to_field(r) for r in rows], "total": len(rows)}


@router.get("/custom-fields/{field_id}")
def get_custom_field(field_id: str, current_user=Depends(get_current_user)):
    _ensure_table()
    user_id = str(getattr(current_user, "id", ""))
    result = execute_query(
        "SELECT id, user_id, entity_type, field_name, field_type, field_options, is_required, is_searchable, display_order, created_at, updated_at "
        "FROM custom_field_definitions WHERE id = ? AND user_id = ?",
        [field_id, user_id],
    )
    rows = parse_rows(result) if result else []
    if not rows:
        raise HTTPException(status_code=404, detail="Custom field not found")
    return _row_to_field(rows[0])


@router.put("/custom-fields/{field_id}")
def update_custom_field(field_id: str, body: CustomFieldUpdate, current_user=Depends(get_current_user)):
    _ensure_table()
    user_id = str(getattr(current_user, "id", ""))
    now = datetime.now(timezone.utc).isoformat()
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        return {"message": "No changes"}
    parts = []
    params = []
    for k, v in updates.items():
        parts.append(f"{k} = ?")
        if isinstance(v, bool):
            params.append(1 if v else 0)
        else:
            params.append(v)
    parts.append("updated_at = ?")
    params.append(now)
    params.append(field_id)
    params.append(user_id)
    execute_query(
        f"UPDATE custom_field_definitions SET {', '.join(parts)} WHERE id = ? AND user_id = ?",
        params,
    )
    return {"message": "Custom field updated"}


@router.delete("/custom-fields/{field_id}", status_code=204)
def delete_custom_field(field_id: str, current_user=Depends(get_current_user)):
    _ensure_table()
    user_id = str(getattr(current_user, "id", ""))
    execute_query("DELETE FROM custom_field_definitions WHERE id = ? AND user_id = ?", [field_id, user_id])
    execute_query("DELETE FROM custom_field_values WHERE field_id = ?", [field_id])


@router.post("/custom-fields/{field_id}/values", status_code=201)
def set_custom_field_value(field_id: str, body: CustomFieldValueSet, current_user=Depends(get_current_user)):
    _ensure_table()
    user_id = str(getattr(current_user, "id", ""))
    result = execute_query(
        "SELECT id FROM custom_field_definitions WHERE id = ? AND user_id = ?",
        [field_id, user_id],
    )
    rows = parse_rows(result) if result else []
    if not rows:
        raise HTTPException(status_code=404, detail="Custom field not found")
    now = datetime.now(timezone.utc).isoformat()
    existing = execute_query(
        "SELECT id FROM custom_field_values WHERE field_id = ? AND entity_type = ? AND entity_id = ?",
        [field_id, body.entity_type, body.entity_id],
    )
    existing_rows = parse_rows(existing) if existing else []
    if existing_rows:
        execute_query(
            "UPDATE custom_field_values SET value = ?, updated_at = ? WHERE field_id = ? AND entity_type = ? AND entity_id = ?",
            [body.value, now, field_id, body.entity_type, body.entity_id],
        )
        value_id = existing_rows[0]["id"]
    else:
        ins = execute_query(
            "INSERT INTO custom_field_values (field_id, entity_type, entity_id, value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
            [field_id, body.entity_type, body.entity_id, body.value, now, now],
        )
        ins_rows = parse_rows(ins) if ins else []
        value_id = ins_rows[0]["id"] if ins_rows else 0
    return {"message": "Value set", "value_id": value_id}


@router.get("/custom-fields/values")
def get_custom_field_values(
    entity_type: str = Query(...),
    entity_id: int = Query(...),
    current_user=Depends(get_current_user),
):
    _ensure_table()
    result = execute_query(
        "SELECT v.id, v.field_id, v.entity_type, v.entity_id, v.value, v.created_at, v.updated_at "
        "FROM custom_field_values v "
        "JOIN custom_field_definitions f ON v.field_id = f.id "
        "WHERE v.entity_type = ? AND v.entity_id = ? AND f.user_id = ? "
        "ORDER BY f.display_order, f.field_name",
        [entity_type, entity_id, str(getattr(current_user, "id", ""))],
    )
    rows = parse_rows(result) if result else []
    return {"items": [_row_to_value(r) for r in rows], "total": len(rows)}


@router.delete("/custom-fields/values/{value_id}", status_code=204)
def delete_custom_field_value(value_id: str, current_user=Depends(get_current_user)):
    _ensure_table()
    user_id = str(getattr(current_user, "id", ""))
    execute_query(
        "DELETE FROM custom_field_values WHERE id = ? AND field_id IN (SELECT id FROM custom_field_definitions WHERE user_id = ?)",
        [value_id, user_id],
    )
