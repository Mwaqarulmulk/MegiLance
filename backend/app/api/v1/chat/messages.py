# @AI-HINT: Messages router — conversations, send/receive messages with real-time WebSocket broadcasting
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows, parse_date
from app.services.messages_service import (
    list_conversations_for_user,
    get_conversation_by_id,
    get_conversation_participants,
    find_conversation_between,
    create_conversation_record,
    create_message_record,
    check_user_exists_active,
    update_conversation_fields,
    sanitize_content,
    find_existing_conversation,
    get_messaging_contacts,
)

# Import WebSocket manager for real-time broadcasting
try:
    from app.core.websocket import websocket_manager
    _ws_available = True
except Exception:
    _ws_available = False
    logger.warning("WebSocket manager not available — real-time messaging disabled")

router = APIRouter()


class ConversationCreate(BaseModel):
    freelancer_id: int
    project_id: Optional[int] = None
    initial_message: Optional[str] = None

class MessageCreate(BaseModel):
    content: str
    message_type: str = "text"
    attachment_url: Optional[str] = None


@router.get("/conversations")
async def list_conversations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    archived: Optional[bool] = None,
    current_user=Depends(get_current_user),
):
    conversations = list_conversations_for_user(
        user_id=current_user.id,
        status_filter=status_filter,
        archived=archived,
        limit=page_size,
        skip=(page - 1) * page_size,
    )
    return {"items": conversations, "total": len(conversations), "page": page}


@router.get("/conversations/contacts")
async def get_contacts(current_user=Depends(get_current_user)):
    """Return users who have contracts with the current user — the default messageable contacts."""
    contacts = get_messaging_contacts(current_user.id)
    return {"items": contacts}


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: int, current_user=Depends(get_current_user)):
    participants = get_conversation_participants(conversation_id)
    if not participants:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if participants["client_id"] != current_user.id and participants["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    conversation = get_conversation_by_id(conversation_id)
    return conversation


@router.post("/conversations")
async def create_conversation(request: ConversationCreate, current_user=Depends(get_current_user)):
    if request.freelancer_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    freelancer = check_user_exists_active(request.freelancer_id)
    if not freelancer:
        raise HTTPException(status_code=404, detail="Freelancer not found")

    existing_id = find_conversation_between(current_user.id, request.freelancer_id, request.project_id)
    if existing_id:
        return {"conversation_id": existing_id, "message": "Existing conversation found"}

    now = datetime.now(timezone.utc).isoformat()

    if current_user.user_type == "freelancer":
        client_id = request.freelancer_id
        freelancer_id = current_user.id
    else:
        client_id = current_user.id
        freelancer_id = request.freelancer_id

    conv_id = create_conversation_record(client_id, freelancer_id, request.project_id, now)
    if not conv_id:
        raise HTTPException(status_code=500, detail="Failed to create conversation")

    if request.initial_message:
        content = sanitize_content(request.initial_message)
        msg_id = create_message_record(
            conversation_id=conv_id,
            sender_id=current_user.id,
            receiver_id=request.freelancer_id,
            project_id=request.project_id,
            content=content,
            message_type="text",
            now=now,
        )
        update_conversation_fields(conv_id, "last_message_at = ?, updated_at = ?", [now, now])

        # Broadcast initial message via WebSocket
        if _ws_available and msg_id:
            try:
                import asyncio
                message_payload = {
                    "id": msg_id,
                    "conversation_id": conv_id,
                    "sender_id": current_user.id,
                    "receiver_id": request.freelancer_id,
                    "content": content,
                    "message_type": "text",
                    "is_read": False,
                    "sent_at": now,
                    "created_at": now,
                }
                asyncio.create_task(
                    websocket_manager.broadcast_to_chat(str(conv_id), "new_message", message_payload)
                )
                asyncio.create_task(
                    websocket_manager.send_message_notification(str(request.freelancer_id), message_payload)
                )
            except Exception as e:
                logger.warning("WebSocket broadcast failed for initial message: %s", e)

    return {"conversation_id": conv_id, "message": "Conversation created"}


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    participants = get_conversation_participants(conversation_id)
    if not participants:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if participants["client_id"] != current_user.id and participants["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    offset = (page - 1) * page_size
    result = execute_query(
        """SELECT m.id, m.conversation_id, m.sender_id, m.receiver_id, m.content,
                  m.message_type, m.is_read, m.is_deleted, m.sent_at, m.created_at,
                  u.name as sender_name, u.profile_image_url as sender_avatar
           FROM messages m
           LEFT JOIN users u ON m.sender_id = u.id
           WHERE m.conversation_id = ? AND m.is_deleted = 0
           ORDER BY m.created_at ASC
           LIMIT ? OFFSET ?""",
        [conversation_id, page_size, offset],
    )
    rows = parse_rows(result)
    messages = rows if rows else []

    unread_ids = [m["id"] for m in messages if m["receiver_id"] == current_user.id and not m["is_read"]]
    if unread_ids:
        placeholders = ",".join(["?" for _ in unread_ids])
        execute_query(f"UPDATE messages SET is_read = 1 WHERE id IN ({placeholders})", unread_ids)

    return {"items": messages, "total": len(messages), "page": page}


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: int,
    request: MessageCreate,
    current_user=Depends(get_current_user),
):
    participants = get_conversation_participants(conversation_id)
    if not participants:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if participants["client_id"] != current_user.id and participants["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if participants["status"] != "active":
        raise HTTPException(status_code=400, detail="Conversation is not active")

    receiver_id = participants["freelancer_id"] if participants["client_id"] == current_user.id else participants["client_id"]

    content = sanitize_content(request.content)
    if not content:
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    now = datetime.now(timezone.utc).isoformat()

    msg_id = create_message_record(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        receiver_id=receiver_id,
        project_id=participants.get("project_id"),
        content=content,
        message_type=request.message_type,
        now=now,
    )

    if not msg_id:
        raise HTTPException(status_code=500, detail="Failed to send message")

    update_conversation_fields(conversation_id, "last_message_at = ?, updated_at = ?", [now, now])

    # Broadcast message via WebSocket for real-time delivery
    if _ws_available:
        try:
            import asyncio
            message_payload = {
                "id": msg_id,
                "conversation_id": conversation_id,
                "sender_id": current_user.id,
                "receiver_id": receiver_id,
                "content": content,
                "message_type": request.message_type,
                "attachment_url": request.attachment_url,
                "is_read": False,
                "sent_at": now,
                "created_at": now,
                "sender_name": getattr(current_user, "name", None),
            }
            # Broadcast to the chat room (all participants in the conversation)
            asyncio.create_task(
                websocket_manager.broadcast_to_chat(
                    str(conversation_id), "new_message", message_payload
                )
            )
            # Also send a notification to the receiver specifically
            asyncio.create_task(
                websocket_manager.send_message_notification(str(receiver_id), message_payload)
            )
        except Exception as e:
            logger.warning("WebSocket broadcast failed for message %s: %s", msg_id, e)

    return {"message_id": msg_id, "message": "Message sent successfully"}


@router.post("/conversations/{conversation_id}/archive")
async def archive_conversation(conversation_id: int, current_user=Depends(get_current_user)):
    participants = get_conversation_participants(conversation_id)
    if not participants:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if participants["client_id"] != current_user.id and participants["freelancer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    update_conversation_fields(conversation_id, "is_archived = 1, updated_at = ?", [datetime.now(timezone.utc).isoformat()])
    return {"message": "Conversation archived"}
