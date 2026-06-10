from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

_TABLES_CREATED = False


def _ensure_tables():
    global _TABLES_CREATED
    if _TABLES_CREATED:
        return
    execute_query("""
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(255) NOT NULL UNIQUE,
            source VARCHAR(100) DEFAULT 'website',
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL
        )
    """)
    _TABLES_CREATED = True


class SubscribeRequest(BaseModel):
    email: EmailStr
    source: str = "website"


@router.post("/subscribe")
def subscribe(req: SubscribeRequest):
    _ensure_tables()
    now = datetime.now(timezone.utc).isoformat()
    existing = execute_query(
        "SELECT id FROM newsletter_subscribers WHERE email = ?", [req.email]
    )
    rows = parse_rows(existing) if existing else []
    if rows:
        return {"status": "already_subscribed", "message": "Email already subscribed"}
    execute_query(
        "INSERT INTO newsletter_subscribers (email, source, is_active, created_at, updated_at) VALUES (?, ?, 1, ?, ?)",
        [req.email, req.source, now, now],
    )
    logger.info(f"[NEWSLETTER] New subscriber: {req.email} from {req.source}")
    return {"status": "subscribed", "message": "Successfully subscribed to newsletter"}
