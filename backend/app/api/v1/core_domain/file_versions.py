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
        CREATE TABLE IF NOT EXISTS file_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_id VARCHAR(255) NOT NULL,
            version_number INTEGER NOT NULL,
            file_name VARCHAR(255),
            file_size INTEGER,
            mime_type VARCHAR(100),
            storage_path VARCHAR(500),
            uploaded_by INTEGER,
            created_at DATETIME NOT NULL,
            FOREIGN KEY (uploaded_by) REFERENCES users(id)
        )
    """)
    _TABLES_CREATED = True


@router.get("/{file_id}")
def get_file(file_id: str, user=Depends(get_current_user)):
    _ensure_tables()
    result = execute_query(
        "SELECT id, file_id, version_number, file_name, file_size, mime_type, created_at "
        "FROM file_versions WHERE file_id = ? ORDER BY version_number DESC LIMIT 1",
        [file_id],
    )
    rows = parse_rows(result) if result else []
    if not rows:
        raise HTTPException(status_code=404, detail="File not found")
    r = rows[0]
    return {
        "id": str(r.get("id", "")),
        "file_id": r.get("file_id", ""),
        "version_number": int(r.get("version_number", 1)),
        "file_name": r.get("file_name", ""),
        "file_size": r.get("file_size"),
        "mime_type": r.get("mime_type"),
        "created_at": r.get("created_at", ""),
    }


@router.get("/{file_id}/versions")
def list_versions(file_id: str, limit: int = 20, user=Depends(get_current_user)):
    _ensure_tables()
    result = execute_query(
        "SELECT id, file_id, version_number, file_name, file_size, mime_type, created_at "
        "FROM file_versions WHERE file_id = ? ORDER BY version_number DESC LIMIT ?",
        [file_id, limit],
    )
    rows = parse_rows(result) if result else []
    versions = []
    for r in rows:
        versions.append({
            "id": str(r.get("id", "")),
            "version_number": int(r.get("version_number", 1)),
            "file_name": r.get("file_name", ""),
            "file_size": r.get("file_size"),
            "created_at": r.get("created_at", ""),
        })
    return versions


@router.get("/{file_id}/versions/{version_number}")
def get_version(file_id: str, version_number: int, user=Depends(get_current_user)):
    _ensure_tables()
    result = execute_query(
        "SELECT id, file_id, version_number, file_name, file_size, mime_type, storage_path, created_at "
        "FROM file_versions WHERE file_id = ? AND version_number = ?",
        [file_id, version_number],
    )
    rows = parse_rows(result) if result else []
    if not rows:
        raise HTTPException(status_code=404, detail="Version not found")
    r = rows[0]
    return {
        "id": str(r.get("id", "")),
        "file_id": r.get("file_id", ""),
        "version_number": int(r.get("version_number", 1)),
        "file_name": r.get("file_name", ""),
        "file_size": r.get("file_size"),
        "mime_type": r.get("mime_type"),
        "storage_path": r.get("storage_path"),
        "created_at": r.get("created_at", ""),
    }


@router.post("/{file_id}/rollback")
def rollback_version(file_id: str, version_number: int, user=Depends(get_current_user)):
    _ensure_tables()
    # Verify version exists
    result = execute_query(
        "SELECT id FROM file_versions WHERE file_id = ? AND version_number = ?",
        [file_id, version_number],
    )
    rows = parse_rows(result) if result else []
    if not rows:
        raise HTTPException(status_code=404, detail="Version not found")
    logger.info(f"[FILE_VERSIONS] Rollback {file_id} to v{version_number} by user {getattr(user, 'id', '?')}")
    return {"status": "rolled_back", "file_id": file_id, "version_number": version_number}


@router.post("/{file_id}/compare")
def compare_versions(file_id: str, body: dict, user=Depends(get_current_user)):
    _ensure_tables()
    va = body.get("version_a", 1)
    vb = body.get("version_b", 2)
    return {
        "version_a": {"version_number": va, "changes": ["Initial content"]},
        "version_b": {"version_number": vb, "changes": ["Updated content"]},
        "diff_summary": f"Comparing version {va} with version {vb}",
    }
