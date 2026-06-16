# @AI-HINT: Media storage — Cloudflare R2 (S3-compatible) when configured, else local disk.
# Fixes ephemeral local uploads on DigitalOcean/multi-instance. Set R2_* env vars to enable R2.
import os
import logging

logger = logging.getLogger(__name__)

# Cloudflare R2 (free tier 10GB). To enable, set these env vars:
#   R2_ACCOUNT_ID         — Cloudflare account id
#   R2_ACCESS_KEY_ID      — R2 S3 API token access key
#   R2_SECRET_ACCESS_KEY  — R2 S3 API token secret
#   R2_BUCKET             — bucket name (default: megilance-media)
#   R2_PUBLIC_URL         — public base URL (r2.dev or custom domain), e.g. https://pub-xxxx.r2.dev
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET = os.getenv("R2_BUCKET", "megilance-media")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL")

# Local fallback dir: backend/uploads
UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads"
)

_client = None


def r2_enabled() -> bool:
    return bool(R2_ACCOUNT_ID and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY and R2_PUBLIC_URL)


def _r2_client():
    global _client
    if _client is None:
        import boto3  # lazy — only needed when R2 is configured
        from botocore.config import Config
        _client = boto3.client(
            "s3",
            endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=R2_ACCESS_KEY_ID,
            aws_secret_access_key=R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )
    return _client


def store_bytes(data: bytes, key: str, content_type: str = "application/octet-stream") -> str:
    """Store bytes under `key` (e.g. 'avatars/ab12.png'); return a public URL.

    Uses Cloudflare R2 when configured; otherwise writes to local disk and returns
    a /uploads/* URL (served by the backend). Never raises on R2 failure — falls back.
    """
    key = key.lstrip("/")
    if r2_enabled():
        try:
            _r2_client().put_object(
                Bucket=R2_BUCKET, Key=key, Body=data, ContentType=content_type
            )
            return f"{R2_PUBLIC_URL.rstrip('/')}/{key}"
        except Exception as e:
            logger.error(f"R2 upload failed for {key}, falling back to local: {e}")

    full_path = os.path.join(UPLOAD_DIR, key)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "wb") as f:
        f.write(data)
    return f"/uploads/{key}"
