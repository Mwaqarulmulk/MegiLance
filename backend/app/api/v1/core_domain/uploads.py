# @AI-HINT: Uploads router — file upload handling (avatar, documents, project files)
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from typing import Optional
import os
import uuid
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_DOC_TYPES = {"application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


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

    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"avatar_{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, "avatars")
    os.makedirs(filepath, exist_ok=True)
    full_path = os.path.join(filepath, filename)

    with open(full_path, "wb") as f:
        f.write(contents)

    url = f"/uploads/avatars/{filename}"
    return {"message": "Avatar uploaded", "url": url, "file_url": url, "path": url}


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

    ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    filename = f"doc_{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, "documents")
    os.makedirs(filepath, exist_ok=True)
    full_path = os.path.join(filepath, filename)

    with open(full_path, "wb") as f:
        f.write(contents)

    url = f"/uploads/documents/{filename}"
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

    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    filename = f"project_{project_id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, "projects", project_id)
    os.makedirs(filepath, exist_ok=True)
    full_path = os.path.join(filepath, filename)

    with open(full_path, "wb") as f:
        f.write(contents)

    url = f"/uploads/projects/{project_id}/{filename}"
    return {"message": "File uploaded", "url": url, "file_url": url}
