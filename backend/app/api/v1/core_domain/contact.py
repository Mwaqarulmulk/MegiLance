# @AI-HINT: Contact Form router — customer inquiry submissions
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.db.turso_http import execute_query
from app.core.rate_limit import public_rate_limit

router = APIRouter()


def _ensure_table():
    execute_query("""
        CREATE TABLE IF NOT EXISTS contact_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            category TEXT DEFAULT 'general',
            status TEXT DEFAULT 'new',
            created_at TEXT NOT NULL
        )
    """, [])


class ContactForm(BaseModel):
    name: str
    email: str
    subject: Optional[str] = None
    message: str
    category: str = "general"


@router.post("")
@router.post("/")
@public_rate_limit()
async def submit_contact(body: ContactForm):
    _ensure_table()
    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO contact_submissions (name, email, subject, message, category, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [body.name, body.email, body.subject or "General Inquiry", body.message, body.category, now]
    )
    return {"message": "Thank you! Your message has been received and we'll respond within 24 hours."}


@router.get("/categories")
async def get_categories():
    return {
        "categories": [
            {"id": "general", "label": "General Inquiry"},
            {"id": "billing", "label": "Billing & Payments"},
            {"id": "technical", "label": "Technical Support"},
            {"id": "dispute", "label": "Dispute Resolution"},
            {"id": "partnership", "label": "Partnership"},
            {"id": "press", "label": "Press & Media"},
        ]
    }
