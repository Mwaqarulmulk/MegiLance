# @AI-HINT: Support tickets router — create, list, reply, close tickets
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows, parse_date

router = APIRouter()


class TicketCreate(BaseModel):
    subject: str
    description: str
    category: str = "general"
    priority: str = "medium"

class TicketReply(BaseModel):
    message: str


@router.get("")
async def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    where = "WHERE user_id = ?"
    params = [current_user.id]

    if status_filter:
        where += " AND status = ?"
        params.append(status_filter)

    offset = (page - 1) * page_size
    params.extend([page_size, offset])

    result = execute_query(
        f"""SELECT id, user_id, subject, description, category, priority, status,
                   created_at, updated_at
            FROM support_tickets
            {where}
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?""",
        params,
    )
    rows = parse_rows(result)
    return {"items": rows if rows else [], "total": len(rows) if rows else 0, "page": page}


@router.get("/{ticket_id}")
async def get_ticket(ticket_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id, user_id, subject, description, category, priority, status, created_at, updated_at FROM support_tickets WHERE id = ? AND user_id = ?",
        [ticket_id, current_user.id],
    )
    rows = parse_rows(result)
    if not rows:
        raise HTTPException(status_code=404, detail="Ticket not found")

    messages = execute_query(
        "SELECT id, ticket_id, sender_id, message, created_at FROM support_messages WHERE ticket_id = ? ORDER BY created_at ASC",
        [ticket_id],
    )
    rows[0]["messages"] = parse_rows(messages) or []
    return rows[0]


@router.post("")
async def create_ticket(request: TicketCreate, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO support_tickets (user_id, subject, description, category, priority, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'open', ?, ?)""",
        [current_user.id, request.subject, request.description, request.category, request.priority, now, now],
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create ticket")

    return {"message": "Ticket created", "ticket_id": result.get("last_insert_rowid")}


@router.post("/{ticket_id}/reply")
async def reply_ticket(ticket_id: int, request: TicketReply, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id FROM support_tickets WHERE id = ? AND user_id = ?",
        [ticket_id, current_user.id],
    )
    if not parse_rows(result):
        raise HTTPException(status_code=404, detail="Ticket not found")

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO support_messages (ticket_id, sender_id, message, created_at) VALUES (?, ?, ?, ?)",
        [ticket_id, current_user.id, request.message, now],
    )
    execute_query("UPDATE support_tickets SET updated_at = ? WHERE id = ?", [now, ticket_id])
    return {"message": "Reply sent"}


@router.post("/{ticket_id}/close")
async def close_ticket(ticket_id: int, current_user=Depends(get_current_user)):
    result = execute_query(
        "SELECT id FROM support_tickets WHERE id = ? AND user_id = ?",
        [ticket_id, current_user.id],
    )
    if not parse_rows(result):
        raise HTTPException(status_code=404, detail="Ticket not found")

    now = datetime.now(timezone.utc).isoformat()
    execute_query("UPDATE support_tickets SET status = 'closed', updated_at = ? WHERE id = ?", [now, ticket_id])
    return {"message": "Ticket closed"}
