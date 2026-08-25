"""
@AI-HINT: Simple local file storage utility for MegiLance
Handles file uploads, downloads, and management.
Can be easily upgraded to cloud storage (S3, Cloudflare R2, etc.) in the future.
"""

import logging
import os
from pathlib import Path
from typing import Optional
from datetime import datetime
from uuid import uuid4
import boto3
from botocore.exceptions import ClientError
from app.core.config import get_settings
logger = logging.getLogger(__name__)

settings = get_settings()


def _safe_upload_parts(filename: str, subfolder: str = "") -> tuple[str, str, str]:
    """Return safe path components for untrusted upload metadata."""
    safe_name = Path(filename or "upload").name
    stem = Path(safe_name).stem or "upload"
    suffix = Path(safe_name).suffix.lower()
    safe_stem = "".join(ch for ch in stem if ch.isalnum() or ch in ("-", "_", "."))[:100] or "upload"
    safe_folder = "/".join(part for part in Path(subfolder or "").parts if part not in ("", ".", ".."))
    unique_filename = f"{safe_stem}_{uuid4().hex}{suffix}"
    return safe_folder, unique_filename, f"{safe_folder}/{unique_filename}" if safe_folder else unique_filename


def _safe_local_path(upload_dir: Path, file_path: str) -> Path:
    """Resolve a stored path and reject traversal outside the upload directory."""
    root = upload_dir.resolve()
    candidate = (root / file_path).resolve()
    if candidate != root and root not in candidate.parents:
        raise ValueError("Invalid storage path")
    return candidate


class StorageBackend:
    """Abstract base class for storage backends"""
    def save_file(self, file_data: bytes, filename: str, subfolder: str = "") -> str:
        raise NotImplementedError
    
    def delete_file(self, file_path: str) -> bool:
        raise NotImplementedError
        
    def get_file_url(self, file_path: str) -> str:
        raise NotImplementedError

class S3Storage(StorageBackend):
    """S3-compatible storage backend (AWS S3, Cloudflare R2, MinIO)"""
    def __init__(self):
        self.bucket_name = os.getenv("S3_BUCKET_NAME")
        self.s3_client = boto3.client(
            's3',
            endpoint_url=os.getenv("S3_ENDPOINT_URL"),
            aws_access_key_id=os.getenv("S3_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("S3_SECRET_ACCESS_KEY"),
            region_name=os.getenv("S3_REGION", "auto")
        )

    def save_file(self, file_data: bytes, filename: str, subfolder: str = "") -> str:
        _, _, key = _safe_upload_parts(filename, subfolder)
        
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_data,
                ACL='public-read'
            )
            return key
        except ClientError as e:
            logger.info(f"S3 Upload Error: {e}")
            raise

    def delete_file(self, file_path: str) -> bool:
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=file_path)
            return True
        except ClientError:
            return False

    def get_file_url(self, file_path: str) -> str:
        # Assuming public bucket or CDN
        endpoint = os.getenv("S3_PUBLIC_URL") or os.getenv("S3_ENDPOINT_URL")
        return f"{endpoint}/{self.bucket_name}/{file_path}"


class LocalStorage(StorageBackend):
    """Simple local file storage handler"""
    
    def __init__(self):
        self.upload_dir = Path(settings.upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    def save_file(self, file_data: bytes, filename: str, subfolder: str = "") -> str:
        """
        Save a file to local storage
        
        Args:
            file_data: File content as bytes
            filename: Name of the file
            subfolder: Optional subfolder (e.g., 'avatars', 'portfolios', 'attachments')
        
        Returns:
            Relative path to the saved file
        """
        safe_folder, unique_filename, relative_path = _safe_upload_parts(filename, subfolder)
        target_dir = _safe_local_path(self.upload_dir, safe_folder) if safe_folder else self.upload_dir
        target_dir.mkdir(parents=True, exist_ok=True)
        file_path = _safe_local_path(target_dir, unique_filename)
        
        # Write file
        with open(file_path, "wb") as f:
            f.write(file_data)
        
        # Return normalized relative path for DB storage
        return relative_path

# Factory to get storage backend
def get_storage_backend() -> StorageBackend:
    if os.getenv("USE_S3_STORAGE", "false").lower() == "true":
        return S3Storage()
    return LocalStorage()

# Global instance (backwards compatibility)
storage = get_storage_backend()

def save_file(file_data: bytes, filename: str, subfolder: str = "") -> str:
    return storage.save_file(file_data, filename, subfolder)

def delete_file(file_path: str) -> bool:
    return storage.delete_file(file_path)

def get_file_url(file_path: str) -> str:
    if isinstance(storage, S3Storage):
        return storage.get_file_url(file_path)
    # Local fallback
    return f"/uploads/{file_path}"


def get_storage() -> StorageBackend:
    """Dependency for getting storage instance"""
    return storage


def get_file(file_path: str) -> Optional[bytes]:
    """Get file content from local storage"""
    if isinstance(storage, LocalStorage):
        try:
            full_path = _safe_local_path(storage.upload_dir, file_path)
        except ValueError:
            return None
        if not full_path.exists():
            return None
        with open(full_path, "rb") as f:
            return f.read()
    return None


def file_exists(file_path: str) -> bool:
    """Check if file exists"""
    if isinstance(storage, LocalStorage):
        try:
            full_path = _safe_local_path(storage.upload_dir, file_path)
        except ValueError:
            return False
        return full_path.exists()
    return False
