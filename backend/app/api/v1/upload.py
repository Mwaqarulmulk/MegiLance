"""
File upload endpoints using AWS S3
Supports profile images, portfolio images, proposal attachments, and project files
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
import uuid
import os

from app.core.security import get_current_active_user
from app.core.s3 import S3Client
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

router = APIRouter()

# Initialize S3 client
s3_client = S3Client()

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt", ".md"}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_DOCUMENT_EXTENSIONS

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def validate_file(file: UploadFile, allowed_extensions: set) -> None:
    """Validate file extension and size"""
    # Check extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Check file size (if available)
    if hasattr(file, 'size') and file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )


@router.post("/profile-image", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_profile_image(
    file: UploadFile = File(..., description="Profile image file"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload user profile image
    Replaces existing profile image if present
    """
    validate_file(file, ALLOWED_IMAGE_EXTENSIONS)
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    s3_key = f"profile-images/{current_user.id}/{uuid.uuid4()}{ext}"
    
    # Upload to S3
    file_content = await file.read()
    s3_url = s3_client.upload_file(
        file_content=file_content,
        s3_key=s3_key,
        bucket_name=settings.s3_bucket_assets
    )
    
    # TODO: Delete old profile image from S3 if exists
    # TODO: Update user.profile_image in database
    
    return {
        "message": "Profile image uploaded successfully",
        "url": s3_url,
        "filename": file.filename,
        "s3_key": s3_key
    }


@router.post("/portfolio-image", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_portfolio_image(
    file: UploadFile = File(..., description="Portfolio image file"),
    portfolio_item_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload portfolio item image
    Freelancers only
    """
    if current_user.user_type != "Freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can upload portfolio images")
    
    validate_file(file, ALLOWED_IMAGE_EXTENSIONS)
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    portfolio_path = f"portfolio/{current_user.id}"
    if portfolio_item_id:
        portfolio_path += f"/{portfolio_item_id}"
    s3_key = f"{portfolio_path}/{uuid.uuid4()}{ext}"
    
    # Upload to S3
    file_content = await file.read()
    s3_url = s3_client.upload_file(
        file_content=file_content,
        s3_key=s3_key,
        bucket_name=settings.s3_bucket_assets
    )
    
    return {
        "message": "Portfolio image uploaded successfully",
        "url": s3_url,
        "filename": file.filename,
        "s3_key": s3_key
    }


@router.post("/proposal-attachment", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_proposal_attachment(
    file: UploadFile = File(..., description="Proposal attachment"),
    proposal_id: str = Form(..., description="Proposal ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload proposal attachment (PDF, documents)
    Freelancers only
    """
    if current_user.user_type != "Freelancer":
        raise HTTPException(status_code=403, detail="Only freelancers can upload proposal attachments")
    
    validate_file(file, ALLOWED_DOCUMENT_EXTENSIONS)
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    s3_key = f"proposals/{proposal_id}/attachments/{uuid.uuid4()}{ext}"
    
    # Upload to S3
    file_content = await file.read()
    s3_url = s3_client.upload_file(
        file_content=file_content,
        s3_key=s3_key,
        bucket_name=settings.s3_bucket_uploads
    )
    
    # TODO: Add attachment to proposal.attachments JSON field
    
    return {
        "message": "Proposal attachment uploaded successfully",
        "url": s3_url,
        "filename": file.filename,
        "s3_key": s3_key
    }


@router.post("/project-file", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_project_file(
    file: UploadFile = File(..., description="Project file"),
    project_id: str = Form(..., description="Project ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload project-related files
    Both clients and freelancers can upload to projects they're involved in
    """
    validate_file(file, ALLOWED_EXTENSIONS)
    
    # TODO: Verify user is part of the project (client or accepted freelancer)
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    s3_key = f"projects/{project_id}/files/{current_user.id}/{uuid.uuid4()}{ext}"
    
    # Upload to S3
    file_content = await file.read()
    s3_url = s3_client.upload_file(
        file_content=file_content,
        s3_key=s3_key,
        bucket_name=settings.s3_bucket_uploads
    )
    
    return {
        "message": "Project file uploaded successfully",
        "url": s3_url,
        "filename": file.filename,
        "s3_key": s3_key
    }


@router.post("/batch", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_multiple_files(
    files: List[UploadFile] = File(..., description="Multiple files"),
    file_type: str = Form(..., description="Type: profile, portfolio, proposal, project"),
    reference_id: Optional[str] = Form(None, description="Related entity ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload multiple files at once
    """
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files per batch")
    
    # Determine allowed extensions based on file type
    if file_type in ["profile", "portfolio"]:
        allowed_exts = ALLOWED_IMAGE_EXTENSIONS
    else:
        allowed_exts = ALLOWED_EXTENSIONS
    
    uploaded_files = []
    
    for file in files:
        validate_file(file, allowed_exts)
        
        ext = os.path.splitext(file.filename)[1]
        s3_key = f"{file_type}/{current_user.id}"
        if reference_id:
            s3_key += f"/{reference_id}"
        s3_key += f"/{uuid.uuid4()}{ext}"
        
        file_content = await file.read()
        s3_url = s3_client.upload_file(
            file_content=file_content,
            s3_key=s3_key,
            bucket_name=settings.s3_bucket_uploads
        )
        
        uploaded_files.append({
            "filename": file.filename,
            "url": s3_url,
            "s3_key": s3_key
        })
    
    return {
        "message": f"Uploaded {len(uploaded_files)} files successfully",
        "files": uploaded_files
    }


@router.delete("/file", response_model=dict)
async def delete_file(
    s3_key: str = Query(..., description="S3 object key"),
    bucket: str = Query("uploads", description="Bucket name: assets or uploads"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a file from S3
    Users can only delete their own files
    """
    # Verify the file belongs to the current user
    if f"/{current_user.id}/" not in s3_key and current_user.user_type != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this file")
    
    bucket_name = settings.s3_bucket_assets if bucket == "assets" else settings.s3_bucket_uploads
    
    success = s3_client.delete_file(s3_key=s3_key, bucket_name=bucket_name)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete file")
    
    return {
        "message": "File deleted successfully",
        "s3_key": s3_key
    }


@router.get("/presigned-url", response_model=dict)
async def get_presigned_url(
    s3_key: str = Query(..., description="S3 object key"),
    bucket: str = Query("uploads", description="Bucket name: assets or uploads"),
    expiration: int = Query(3600, description="URL expiration in seconds"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate presigned URL for secure file download
    """
    bucket_name = settings.s3_bucket_assets if bucket == "assets" else settings.s3_bucket_uploads
    
    presigned_url = s3_client.generate_presigned_url(
        s3_key=s3_key,
        bucket_name=bucket_name,
        expiration=expiration
    )
    
    if not presigned_url:
        raise HTTPException(status_code=404, detail="File not found or failed to generate URL")
    
    return {
        "url": presigned_url,
        "expiration": expiration,
        "s3_key": s3_key
    }
