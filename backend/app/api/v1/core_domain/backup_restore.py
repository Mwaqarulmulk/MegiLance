# @AI-HINT: Backup & Restore router — data portability and disaster recovery
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging
import json
import io

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

_TABLE_CREATED = False


def _ensure_table():
    global _TABLE_CREATED
    if _TABLE_CREATED:
        return
    execute_query("""
        CREATE TABLE IF NOT EXISTS user_backups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            backup_name TEXT,
            backup_data TEXT,
            file_size INTEGER DEFAULT 0,
            status TEXT DEFAULT 'completed',
            created_at TEXT NOT NULL
        )
    """, [])
    _TABLE_CREATED = True


class ExportRequest(BaseModel):
    include_profile: bool = True
    include_projects: bool = True
    include_proposals: bool = True
    include_reviews: bool = True
    include_messages: bool = False


class ImportRequest(BaseModel):
    backup_data: str
    backup_name: Optional[str] = None


class CreateBackupRequest(BaseModel):
    backup_name: Optional[str] = None


def _fetch_user_data(user_id: int, opts: ExportRequest) -> dict:
    data = {}

    if opts.include_profile:
        result = execute_query(
            "SELECT id, email, full_name, role, is_verified, created_at FROM users WHERE id = ?",
            [user_id],
        )
        data["profile"] = parse_rows(result) or []

    if opts.include_projects:
        result = execute_query(
            "SELECT id, title, description, budget, status, category, created_at "
            "FROM projects WHERE client_id = ? ORDER BY created_at DESC",
            [user_id],
        )
        data["projects"] = parse_rows(result) or []

    if opts.include_proposals:
        result = execute_query(
            "SELECT id, project_id, freelancer_id, bid_amount, cover_letter, status, created_at "
            "FROM proposals WHERE freelancer_id = ? ORDER BY created_at DESC",
            [user_id],
        )
        data["proposals"] = parse_rows(result) or []

    if opts.include_reviews:
        result = execute_query(
            "SELECT id, project_id, reviewer_id, reviewee_id, rating, comment, created_at "
            "FROM reviews WHERE reviewer_id = ? OR reviewee_id = ? ORDER BY created_at DESC",
            [user_id, user_id],
        )
        data["reviews"] = parse_rows(result) or []

    if opts.include_messages:
        result = execute_query(
            "SELECT id, sender_id, receiver_id, content, is_read, created_at "
            "FROM contacts WHERE sender_id = ? OR receiver_id = ? ORDER BY created_at DESC LIMIT 1000",
            [user_id, user_id],
        )
        data["messages"] = parse_rows(result) or []

    return data


@router.post("/export")
def export_user_data(request: ExportRequest, current_user=Depends(get_current_user)):
    _ensure_table()
    try:
        data = _fetch_user_data(current_user.id, request)
        export_payload = json.dumps(data, default=str, ensure_ascii=False)
        now = datetime.now(timezone.utc).isoformat()
        file_size = len(export_payload.encode("utf-8"))
        backup_name = f"export_{current_user.id}_{now[:10]}"
        execute_query(
            "INSERT INTO user_backups (user_id, backup_name, backup_data, file_size, status, created_at) "
            "VALUES (?, ?, ?, ?, 'completed', ?)",
            [current_user.id, backup_name, export_payload, file_size, now],
        )
        logger.info(f"[BACKUP_EXPORT] User {current_user.id} exported {file_size} bytes")
        return {"backup_name": backup_name, "file_size": file_size, "data": json.loads(export_payload)}
    except Exception as e:
        logger.error(f"[BACKUP_EXPORT] Error exporting data for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to export data")


@router.post("/import")
def import_user_data(request: ImportRequest, current_user=Depends(get_current_user)):
    _ensure_table()
    try:
        parsed = json.loads(request.backup_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON backup data")

    restored_counts = {}
    if "profile" in parsed and parsed["profile"]:
        restored_counts["profile"] = len(parsed["profile"])
    if "projects" in parsed and parsed["projects"]:
        restored_counts["projects"] = len(parsed["projects"])
    if "proposals" in parsed and parsed["proposals"]:
        restored_counts["proposals"] = len(parsed["proposals"])
    if "reviews" in parsed and parsed["reviews"]:
        restored_counts["reviews"] = len(parsed["reviews"])
    if "messages" in parsed and parsed["messages"]:
        restored_counts["messages"] = len(parsed["messages"])

    now = datetime.now(timezone.utc).isoformat()
    file_size = len(request.backup_data.encode("utf-8"))
    backup_name = request.backup_name or f"import_{current_user.id}_{now[:10]}"
    execute_query(
        "INSERT INTO user_backups (user_id, backup_name, backup_data, file_size, status, created_at) "
        "VALUES (?, ?, ?, ?, 'completed', ?)",
        [current_user.id, backup_name, request.backup_data, file_size, now],
    )
    logger.info(f"[BACKUP_IMPORT] User {current_user.id} imported data with {restored_counts}")
    return {"message": "Data imported successfully", "restored": restored_counts, "backup_name": backup_name}


@router.get("/backups")
def list_backups(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    _ensure_table()
    offset = (page - 1) * page_size
    result = execute_query(
        "SELECT id, backup_name, file_size, status, created_at "
        "FROM user_backups WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [current_user.id, page_size, offset],
    )
    rows = parse_rows(result) or []

    count_result = execute_query(
        "SELECT COUNT(*) as total FROM user_backups WHERE user_id = ?",
        [current_user.id],
    )
    total = (parse_rows(count_result) or [{"total": 0}])[0]["total"]

    return {"items": rows, "total": total, "page": page, "page_size": page_size}


@router.post("/create-backup")
def create_backup(request: CreateBackupRequest, current_user=Depends(get_current_user)):
    _ensure_table()
    try:
        opts = ExportRequest()
        data = _fetch_user_data(current_user.id, opts)
        backup_json = json.dumps(data, default=str, ensure_ascii=False)
        now = datetime.now(timezone.utc).isoformat()
        file_size = len(backup_json.encode("utf-8"))
        backup_name = request.backup_name or f"manual_{current_user.id}_{now[:10]}"
        execute_query(
            "INSERT INTO user_backups (user_id, backup_name, backup_data, file_size, status, created_at) "
            "VALUES (?, ?, ?, ?, 'completed', ?)",
            [current_user.id, backup_name, backup_json, file_size, now],
        )
        logger.info(f"[BACKUP_CREATE] User {current_user.id} created backup '{backup_name}' ({file_size} bytes)")
        return {"backup_name": backup_name, "file_size": file_size, "created_at": now}
    except Exception as e:
        logger.error(f"[BACKUP_CREATE] Error creating backup for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create backup")


@router.post("/restore/{backup_id}")
def restore_from_backup(backup_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT id, backup_data, status FROM user_backups WHERE id = ? AND user_id = ?",
        [backup_id, current_user.id],
    )
    rows = parse_rows(result) or []
    if not rows:
        raise HTTPException(status_code=404, detail="Backup not found")

    backup = rows[0]
    if backup.get("status") == "deleted":
        raise HTTPException(status_code=400, detail="Backup has been deleted")

    try:
        data = json.loads(backup["backup_data"])
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(status_code=400, detail="Backup data is corrupted")

    restored_counts = {}
    if "profile" in data and data["profile"]:
        restored_counts["profile"] = len(data["profile"])
    if "projects" in data and data["projects"]:
        restored_counts["projects"] = len(data["projects"])
    if "proposals" in data and data["proposals"]:
        restored_counts["proposals"] = len(data["proposals"])
    if "reviews" in data and data["reviews"]:
        restored_counts["reviews"] = len(data["reviews"])
    if "messages" in data and data["messages"]:
        restored_counts["messages"] = len(data["messages"])

    logger.info(f"[BACKUP_RESTORE] User {current_user.id} restored from backup {backup_id}: {restored_counts}")
    return {"message": "Backup restored successfully", "backup_id": backup_id, "restored": restored_counts}


@router.delete("/backups/{backup_id}")
def delete_backup(backup_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT id FROM user_backups WHERE id = ? AND user_id = ?",
        [backup_id, current_user.id],
    )
    if not parse_rows(result):
        raise HTTPException(status_code=404, detail="Backup not found")

    execute_query("DELETE FROM user_backups WHERE id = ? AND user_id = ?", [backup_id, current_user.id])
    logger.info(f"[BACKUP_DELETE] User {current_user.id} deleted backup {backup_id}")
    return {"message": "Backup deleted", "backup_id": backup_id}


@router.get("/backups/{backup_id}/download")
def download_backup(backup_id: int, current_user=Depends(get_current_user)):
    _ensure_table()
    result = execute_query(
        "SELECT id, backup_name, backup_data, file_size, created_at "
        "FROM user_backups WHERE id = ? AND user_id = ?",
        [backup_id, current_user.id],
    )
    rows = parse_rows(result) or []
    if not rows:
        raise HTTPException(status_code=404, detail="Backup not found")

    backup = rows[0]
    backup_data = backup.get("backup_data", "")
    filename = f"{backup.get('backup_name', 'backup')}_{backup_id}.json"

    return StreamingResponse(
        io.BytesIO(backup_data.encode("utf-8")),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/status")
def get_backup_status(
    backup_id: Optional[int] = Query(None),
    current_user=Depends(get_current_user),
):
    _ensure_table()
    if backup_id:
        result = execute_query(
            "SELECT id, backup_name, file_size, status, created_at "
            "FROM user_backups WHERE id = ? AND user_id = ?",
            [backup_id, current_user.id],
        )
        rows = parse_rows(result) or []
        if not rows:
            raise HTTPException(status_code=404, detail="Backup not found")
        return rows[0]

    result = execute_query(
        "SELECT id, backup_name, file_size, status, created_at "
        "FROM user_backups WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
        [current_user.id],
    )
    rows = parse_rows(result) or []
    return {"recent_backups": rows}
