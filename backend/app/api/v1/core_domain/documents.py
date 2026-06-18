# @AI-HINT: Documents router — user document records (contracts, NDAs, proposals, tax forms)
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def _ensure_documents_table() -> None:
    execute_query(
        """CREATE TABLE IF NOT EXISTS documents (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               user_id INTEGER NOT NULL,
               title TEXT NOT NULL,
               type TEXT DEFAULT 'contract',
               category TEXT DEFAULT '',
               notes TEXT DEFAULT '',
               file_url TEXT DEFAULT '',
               status TEXT DEFAULT 'draft',
               created_at TEXT,
               updated_at TEXT
           )""",
        [],
    )


class DocumentCreate(BaseModel):
    title: str
    type: str = "contract"
    category: Optional[str] = ""
    notes: Optional[str] = ""
    file_url: Optional[str] = ""
    status: str = "draft"


@router.get("")
async def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=200),
    current_user=Depends(get_current_user),
):
    _ensure_documents_table()
    offset = (page - 1) * page_size
    rows = parse_rows(
        execute_query(
            """SELECT id, title, type, category, notes, file_url, status, created_at
               FROM documents WHERE user_id = ?
               ORDER BY created_at DESC LIMIT ? OFFSET ?""",
            [current_user.id, page_size, offset],
        )
    ) or []
    return {"items": rows, "total": len(rows), "page": page}


@router.post("")
async def create_document(request: DocumentCreate, current_user=Depends(get_current_user)):
    if not (request.title or "").strip():
        raise HTTPException(status_code=422, detail="Document title is required")
    _ensure_documents_table()
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO documents (user_id, title, type, category, notes, file_url, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        [
            current_user.id, request.title.strip(), request.type,
            request.category or "", request.notes or "", request.file_url or "",
            request.status or "draft", now, now,
        ],
    )
    return {
        "message": "Document created",
        "document_id": result.get("last_insert_rowid") if result else None,
    }


@router.delete("/{document_id}")
async def delete_document(document_id: int, current_user=Depends(get_current_user)):
    _ensure_documents_table()
    rows = parse_rows(execute_query("SELECT user_id FROM documents WHERE id = ?", [document_id]))
    if not rows:
        raise HTTPException(status_code=404, detail="Document not found")
    if int(rows[0]["user_id"]) != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    execute_query("DELETE FROM documents WHERE id = ?", [document_id])
    return {"message": "Document deleted"}
