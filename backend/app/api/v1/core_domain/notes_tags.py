from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import json
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
        CREATE TABLE IF NOT EXISTS user_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            entity_type VARCHAR(50),
            entity_id VARCHAR(50),
            content TEXT NOT NULL,
            color VARCHAR(20) DEFAULT '#fff9c4',
            is_pinned BOOLEAN DEFAULT 0,
            is_private BOOLEAN DEFAULT 0,
            tags TEXT DEFAULT '[]',
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    execute_query("""
        CREATE TABLE IF NOT EXISTS user_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name VARCHAR(100) NOT NULL,
            color VARCHAR(20) DEFAULT '#1976d2',
            created_at DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    _TABLES_CREATED = True


class NoteCreate(BaseModel):
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    content: str
    is_private: bool = False
    color: str = "#fff9c4"
    tags: Optional[List[str]] = None


class NoteUpdate(BaseModel):
    content: Optional[str] = None
    color: Optional[str] = None
    is_pinned: Optional[bool] = None


class TagCreate(BaseModel):
    name: str
    color: str = "#1976d2"


@router.get("/notes")
def list_notes(limit: int = 50, user=Depends(get_current_user)):
    _ensure_tables()
    user_id = str(getattr(user, "id", ""))
    result = execute_query(
        "SELECT id, entity_id, entity_type, content, color, is_pinned, is_private, tags, created_at, updated_at "
        "FROM user_notes WHERE user_id = ? ORDER BY is_pinned DESC, created_at DESC LIMIT ?",
        [user_id, limit],
    )
    rows = parse_rows(result) if result else []
    notes = []
    for r in rows:
        tags_raw = r.get("tags") or "[]"
        try:
            tags = json.loads(tags_raw) if isinstance(tags_raw, str) else tags_raw
        except Exception:
            tags = []
        notes.append({
            "id": str(r.get("id", "")),
            "entity_id": r.get("entity_id"),
            "entity_type": r.get("entity_type"),
            "content": r.get("content", ""),
            "color": r.get("color", "#fff9c4"),
            "is_pinned": bool(r.get("is_pinned", False)),
            "is_private": bool(r.get("is_private", False)),
            "created_at": r.get("created_at", ""),
            "updated_at": r.get("updated_at", ""),
            "tags": tags,
        })
    return notes


@router.post("/notes")
def create_note(req: NoteCreate, user=Depends(get_current_user)):
    _ensure_tables()
    user_id = str(getattr(user, "id", ""))
    now = datetime.now(timezone.utc).isoformat()
    tags_json = json.dumps(req.tags or [])
    result = execute_query(
        "INSERT INTO user_notes (user_id, entity_type, entity_id, content, color, is_pinned, is_private, tags, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?) RETURNING id",
        [user_id, req.entity_type, req.entity_id, req.content, req.color, req.is_private, tags_json, now, now],
    )
    rows = parse_rows(result) if result else []
    note_id = str(rows[0].get("id", "")) if rows else "0"
    return {"id": note_id, "name": req.entity_type or "note", "color": req.color, "entity_count": 0}


@router.put("/notes/{note_id}")
def update_note(note_id: str, req: NoteUpdate, user=Depends(get_current_user)):
    _ensure_tables()
    user_id = str(getattr(user, "id", ""))
    now = datetime.now(timezone.utc).isoformat()
    updates = []
    params = []
    if req.content is not None:
        updates.append("content = ?")
        params.append(req.content)
    if req.color is not None:
        updates.append("color = ?")
        params.append(req.color)
    if req.is_pinned is not None:
        updates.append("is_pinned = ?")
        params.append(1 if req.is_pinned else 0)
    if not updates:
        return {"status": "no_changes"}
    updates.append("updated_at = ?")
    params.extend([now, note_id, user_id])
    execute_query(
        f"UPDATE user_notes SET {', '.join(updates)} WHERE id = ? AND user_id = ?",
        params,
    )
    return {"status": "updated"}


@router.delete("/notes/{note_id}")
def delete_note(note_id: str, user=Depends(get_current_user)):
    _ensure_tables()
    user_id = str(getattr(user, "id", ""))
    execute_query("DELETE FROM user_notes WHERE id = ? AND user_id = ?", [note_id, user_id])
    return {"status": "deleted"}


@router.get("/tags")
def list_tags(user=Depends(get_current_user)):
    _ensure_tables()
    user_id = str(getattr(user, "id", ""))
    result = execute_query(
        "SELECT id, name, color, created_at FROM user_tags WHERE user_id = ? ORDER BY name",
        [user_id],
    )
    rows = parse_rows(result) if result else []
    tags = []
    for r in rows:
        tags.append({
            "id": str(r.get("id", "")),
            "name": r.get("name", ""),
            "color": r.get("color", "#1976d2"),
            "entity_count": 0,
        })
    return tags


@router.post("/tags")
def create_tag(req: TagCreate, user=Depends(get_current_user)):
    _ensure_tables()
    user_id = str(getattr(user, "id", ""))
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT INTO user_tags (name, color, user_id, created_at) VALUES (?, ?, ?, ?) RETURNING id",
        [req.name, req.color, user_id, now],
    )
    rows = parse_rows(result) if result else []
    tag_id = str(rows[0].get("id", "")) if rows else "0"
    return {"id": tag_id, "name": req.name, "color": req.color, "entity_count": 0}


@router.delete("/tags/{tag_id}")
def delete_tag(tag_id: str, user=Depends(get_current_user)):
    _ensure_tables()
    user_id = str(getattr(user, "id", ""))
    execute_query("DELETE FROM user_tags WHERE id = ? AND user_id = ?", [tag_id, user_id])
    return {"status": "deleted"}
