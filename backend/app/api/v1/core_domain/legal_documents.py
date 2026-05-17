# @AI-HINT: Legal documents router — terms, privacy, policies
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()

LEGAL_DOCS = {
    "terms": {"title": "Terms of Service", "version": "2.0", "last_updated": "2026-01-01"},
    "privacy": {"title": "Privacy Policy", "version": "2.0", "last_updated": "2026-01-01"},
    "cookies": {"title": "Cookie Policy", "version": "1.0", "last_updated": "2026-01-01"},
    "disclaimer": {"title": "Disclaimer", "version": "1.0", "last_updated": "2026-01-01"},
}


@router.get("/")
async def get_documents():
    return {"documents": [{"doc_type": k, **v} for k, v in LEGAL_DOCS.items()]}


@router.get("/{doc_type}")
async def get_document(doc_type: str):
    if doc_type not in LEGAL_DOCS:
        raise HTTPException(status_code=404, detail="Document not found")

    result = execute_query(
        "SELECT id, doc_type, content, version, created_at FROM legal_documents WHERE doc_type = ? ORDER BY created_at DESC LIMIT 1",
        [doc_type],
    )
    rows = parse_rows(result)
    if rows:
        return rows[0]

    return {"doc_type": doc_type, "title": LEGAL_DOCS[doc_type]["title"], "content": f"Content for {LEGAL_DOCS[doc_type]['title']}", "version": LEGAL_DOCS[doc_type]["version"]}


@router.get("/{doc_type}/versions/{version}")
async def get_document_version(doc_type: str, version: str):
    result = execute_query(
        "SELECT id, doc_type, content, version, created_at FROM legal_documents WHERE doc_type = ? AND version = ?",
        [doc_type, version],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Version not found")
    return rows[0]


@router.post("/{doc_type}/accept")
async def accept_document(doc_type: str, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        "INSERT OR REPLACE INTO legal_acceptances (user_id, doc_type, accepted_at) VALUES (?, ?, ?)",
        [current_user.id, doc_type, now],
    )
    return {"message": f"{LEGAL_DOCS.get(doc_type, {}).get('title', 'Document')} accepted"}


@router.get("/acceptance-history")
async def get_acceptance_history(current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT doc_type, accepted_at FROM legal_acceptances WHERE user_id = ? ORDER BY accepted_at DESC",
        [current_user.id],
    )
    rows = parse_rows(result)
    return {"items": rows if rows else []}
