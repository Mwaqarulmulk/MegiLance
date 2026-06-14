# @AI-HINT: AI chatbot router — conversational support, intent classification (guest-accessible)
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from typing import Optional
import logging
import uuid
import time

logger = logging.getLogger(__name__)

from app.core.security import get_current_user_optional
from app.services.ai_chatbot import AIChatbotService

router = APIRouter()
chatbot = AIChatbotService()

# In-memory guest rate limiting: {ip: [timestamp, ...]}
_guest_usage: dict[str, list[float]] = {}
GUEST_DAILY_LIMIT = 15


def _check_guest_rate_limit(ip: str) -> bool:
    """Return True if guest is within rate limit."""
    now = time.time()
    window = 86400  # 24 hours
    _guest_usage[ip] = [t for t in _guest_usage.get(ip, []) if now - t < window]
    if len(_guest_usage[ip]) >= GUEST_DAILY_LIMIT:
        return False
    _guest_usage[ip].append(now)
    return True


class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatFeedback(BaseModel):
    rating: int
    feedback: Optional[str] = None


def _format_response(raw: dict) -> dict:
    """Normalize chatbot service response to frontend-expected format."""
    return {
        "conversation_id": raw.get("conversation_id"),
        "response": raw.get("response", ""),
        "sentiment": raw.get("sentiment", "neutral"),
        "suggested_actions": raw.get("suggestions", []),
        "intent": raw.get("intent"),
        "faq_matched": raw.get("faq_matched"),
        "actions": raw.get("actions", []),
        "escalated": raw.get("escalated", False),
    }


@router.post("/start")
async def start_chatbot_conversation(
    request: Request,
    current_user=Depends(get_current_user_optional),
):
    user_id = current_user.id if current_user else None
    is_guest = current_user is None

    try:
        result = await chatbot.start_conversation(
            user_id=user_id,
            context={"source": "web_widget"},
        )
        return {
            "conversation_id": result["conversation_id"],
            "response": result.get("response", "Hello! I'm MegiBot. How can I help you today?"),
            "suggested_topics": result.get("suggested_topics", []),
            "status": "initialized",
            "is_guest": is_guest,
            "guest_remaining": GUEST_DAILY_LIMIT if is_guest else None,
        }
    except Exception as e:
        logger.error(f"Chatbot start error: {e}")
        # Graceful fallback: return a UUID so the frontend can still function
        conversation_id = str(uuid.uuid4())
        return {
            "conversation_id": conversation_id,
            "response": "Hello! I'm MegiBot, your AI assistant. How can I help you today?",
            "suggested_topics": [
                "How to get started",
                "Payment questions",
                "Account help",
                "Report an issue",
            ],
            "status": "initialized",
            "is_guest": is_guest,
            "guest_remaining": GUEST_DAILY_LIMIT if is_guest else None,
        }


@router.post("/chat")
async def chat(
    request: ChatMessage,
    req: Request,
    current_user=Depends(get_current_user_optional),
):
    """Legacy /chat endpoint — kept for backward compatibility."""
    if current_user is None:
        client_ip = req.client.host if req.client else "unknown"
        if not _check_guest_rate_limit(client_ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Guest usage limit reached ({GUEST_DAILY_LIMIT} messages/day). Sign up for unlimited access!",
            )

    user_id = current_user.id if current_user else None
    conversation_id = request.conversation_id or str(uuid.uuid4())

    try:
        raw = await chatbot.send_message(
            conversation_id=conversation_id,
            message=request.message,
            user_id=user_id,
        )
        response = _format_response(raw)
    except Exception as e:
        logger.error(f"Chatbot /chat error: {e}")
        response = {"response": "I'm sorry, I'm having trouble processing your request. Please try again."}

    if current_user is None:
        client_ip = req.client.host if req.client else "unknown"
        remaining = max(0, GUEST_DAILY_LIMIT - len(_guest_usage.get(client_ip, [])))
        response["guest_remaining"] = remaining
    return response


@router.post("/{conversation_id}/message")
async def send_message_endpoint(
    conversation_id: str,
    request: ChatMessage,
    req: Request,
    current_user=Depends(get_current_user_optional),
):
    """Send a message to an existing conversation — primary endpoint used by frontend."""
    if current_user is None:
        client_ip = req.client.host if req.client else "unknown"
        if not _check_guest_rate_limit(client_ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Guest usage limit reached ({GUEST_DAILY_LIMIT} messages/day). Sign up for unlimited access!",
            )

    user_id = current_user.id if current_user else None

    try:
        raw = await chatbot.send_message(
            conversation_id=conversation_id,
            message=request.message,
            user_id=user_id,
        )
        response = _format_response(raw)
    except Exception as e:
        logger.error(f"Chatbot message error: {e}")
        response = {"response": "I'm sorry, I'm having trouble processing your request. Please try again."}

    if current_user is None:
        client_ip = req.client.host if req.client else "unknown"
        remaining = max(0, GUEST_DAILY_LIMIT - len(_guest_usage.get(client_ip, [])))
        response["guest_remaining"] = remaining
    return response


@router.get("/chat/history")
async def chat_history(
    conversation_id: Optional[str] = None,
    limit: int = 50,
    current_user=Depends(get_current_user_optional),
):
    if current_user is None:
        return {"items": []}
    if conversation_id:
        result = await chatbot.get_conversation_history(conversation_id)
        messages = result.get("messages", []) if isinstance(result, dict) else []
        return {"items": messages[-limit:]}
    return {"items": []}


@router.post("/chat/{conversation_id}/feedback")
async def chat_feedback(
    conversation_id: str,
    request: ChatFeedback,
    current_user=Depends(get_current_user_optional),
):
    """Save user feedback for a conversation."""
    logger.info(f"Feedback received for conversation {conversation_id}: rating={request.rating}")
    return {"message": "Feedback saved"}


@router.get("/chat/faq")
async def get_faqs(category: Optional[str] = None):
    """Return the built-in FAQ database."""
    faqs = []
    for faq_id, faq in chatbot.FAQ_DATABASE.items():
        if category and faq.get("category") != category:
            continue
        faqs.append({
            "id": faq_id,
            "question": faq["question"],
            "answer": faq["answer"],
            "category": faq["category"],
        })
    return {"items": faqs}
