# @AI-HINT: Uploads router — file upload handling (avatar, documents, project files)
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from typing import Optional
import os
import uuid
import re
import logging

logger = logging.getLogger(__name__)

from datetime import datetime, timezone

from app.core.security import get_current_user
from app.services.storage import store_bytes
from app.db.turso_http import execute_query

router = APIRouter()


def _persist_user_image(user_id: int, column: str, url: str) -> None:
    """Persist an uploaded image URL onto the user's row immediately so it is
    saved/displayed even before the profile form is submitted."""
    if column not in ("profile_image_url", "cover_image_url"):
        return
    now = datetime.now(timezone.utc).isoformat()
    try:
        execute_query(
            f"UPDATE users SET {column} = ?, updated_at = ? WHERE id = ?",
            [url, now, user_id],
        )
    except Exception:
        # The column may not exist yet (e.g. cover_image_url) — self-heal then retry.
        try:
            execute_query(f"ALTER TABLE users ADD COLUMN {column} TEXT", [])
            execute_query(
                f"UPDATE users SET {column} = ?, updated_at = ? WHERE id = ?",
                [url, now, user_id],
            )
        except Exception:  # pragma: no cover - non-fatal; URL still returned
            logger.exception("Failed to persist %s for user %s", column, user_id)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_DOC_TYPES = {"application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def _sanitize_extension(filename: str) -> str:
    """Extract file extension safely — only allows alphanumeric, max 10 chars."""
    if not filename or "." not in filename:
        return "jpg"
    ext = filename.rsplit(".", 1)[-1].lower()
    # Only allow alphanumeric extensions, max 10 chars
    ext = re.sub(r'[^a-z0-9]', '', ext)[:10]
    return ext if ext and len(ext) <= 10 else "bin"


def _safe_path(base_dir: str, filename: str) -> str:
    """Build a safe file path, ensuring no path traversal."""
    safe_name = f"{uuid.uuid4().hex[:8]}.{_sanitize_extension(filename)}"
    full_path = os.path.join(base_dir, safe_name)
    # Verify resolved path stays within base_dir
    resolved = os.path.realpath(full_path)
    base_resolved = os.path.realpath(base_dir)
    if not resolved.startswith(base_resolved):
        raise HTTPException(status_code=400, detail="Invalid file path")
    return full_path


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    key = f"avatars/{uuid.uuid4().hex[:12]}.{_sanitize_extension(file.filename)}"
    url = store_bytes(contents, key, file.content_type or "image/jpeg")
    _persist_user_image(current_user.id, "profile_image_url", url)
    return {"message": "Avatar uploaded", "url": url, "file_url": url, "path": url}


@router.post("/cover")
async def upload_cover(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    key = f"covers/{uuid.uuid4().hex[:12]}.{_sanitize_extension(file.filename)}"
    url = store_bytes(contents, key, file.content_type or "image/jpeg")
    _persist_user_image(current_user.id, "cover_image_url", url)
    return {"message": "Cover uploaded", "url": url, "file_url": url, "path": url}


@router.post("/document")
async def upload_document(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    if file.content_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(status_code=400, detail=f"Allowed types: {', '.join(ALLOWED_DOC_TYPES)}")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    key = f"documents/{uuid.uuid4().hex[:12]}.{_sanitize_extension(file.filename)}"
    url = store_bytes(contents, key, file.content_type or "application/pdf")
    return {"message": "Document uploaded", "url": url, "file_url": url}


@router.post("/project/{project_id}")
async def upload_project_file(
    project_id: str,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    # Sanitize project_id — only allow alphanumeric and hyphens
    safe_project_id = re.sub(r'[^a-zA-Z0-9\-]', '', project_id)[:50]
    key = f"projects/{safe_project_id}/{uuid.uuid4().hex[:12]}.{_sanitize_extension(file.filename)}"
    url = store_bytes(contents, key, file.content_type or "application/octet-stream")
    return {"message": "File uploaded", "url": url, "file_url": url}
