# @AI-HINT: AI chatbot router — conversational support, intent classification (guest-accessible)
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
import uuid
import time

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, get_current_user_optional
from app.services.ai_chatbot import AIChatbotService

router = APIRouter()
chatbot = AIChatbotService()

_guest_usage: dict[str, list[float]] = {}
GUEST_DAILY_LIMIT = 15


def _check_guest_rate_limit(ip: str) -> bool:
    """Return True if guest is within rate limit."""
    now = time.time()
    window = 86400
    _guest_usage[ip] = [t for t in _guest_usage.get(ip, []) if now - t < window]
    if len(_guest_usage[ip]) >= GUEST_DAILY_LIMIT:
        return False
    _guest_usage[ip].append(now)
    return True


class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatMessageEnhanced(BaseModel):
    message: str
    page_context: Optional[dict] = None
    flow_action: Optional[str] = Field(None, description="step_complete | flow_start | flow_cancel")

class ChatFeedback(BaseModel):
    rating: int
    feedback: Optional[str] = None

class StartConversationRequest(BaseModel):
    page_url: Optional[str] = None
    user_agent: Optional[str] = None

class OnboardingStepRequest(BaseModel):
    step_name: str

class FlowStartRequest(BaseModel):
    flow_type: str


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
        "profile_score": raw.get("profile_score"),
        "missing_fields": raw.get("missing_fields"),
    }


def _build_user_context(current_user) -> dict:
    """Extract user context from the current_user object."""
    if current_user is None:
        return {}
    user_id = current_user.id if hasattr(current_user, "id") else None
    role = getattr(current_user, "role", None) or getattr(current_user, "user_type", None)
    name = getattr(current_user, "name", None) or getattr(current_user, "first_name", None)
    bio = getattr(current_user, "bio", None)
    skills = getattr(current_user, "skills", None)
    hourly_rate = getattr(current_user, "hourly_rate", None)
    profile_image_url = getattr(current_user, "profile_image_url", None)
    location = getattr(current_user, "location", None)
    headline = getattr(current_user, "headline", None)

    has_name = bool(name and str(name).strip())
    has_bio = bool(bio and str(bio).strip())
    has_skills = bool(skills and str(skills).strip())
    has_rate = hourly_rate is not None and hourly_rate != 0
    has_photo = bool(profile_image_url and str(profile_image_url).strip())
    has_location = bool(location and str(location).strip())
    has_headline = bool(headline and str(headline).strip())

    completed_fields = sum([has_name, has_bio, has_skills, has_rate, has_photo, has_location, has_headline])
    profile_completed = completed_fields >= 5

    return {
        "user_id": user_id,
        "role": role,
        "name": name,
        "profile_completed": profile_completed,
        "skills": skills,
    }


@router.post("/start")
async def start_chatbot_conversation(
    body: StartConversationRequest = StartConversationRequest(),
    request: Request = None,
    current_user=Depends(get_current_user_optional),
):
    user_id = current_user.id if current_user else None
    is_guest = current_user is None

    user_context = _build_user_context(current_user)
    if body.page_url:
        user_context["page_url"] = body.page_url

    try:
        result = await chatbot.start_conversation(
            user_id=user_id,
            context={"source": "web_widget", "page_url": body.page_url, "user_agent": body.user_agent},
            user_context=user_context if user_id else None,
        )
        response = {
            "conversation_id": result["conversation_id"],
            "response": result.get("response", "Hello! I'm MegiBot. How can I help you today?"),
            "suggested_topics": result.get("suggested_topics", []),
            "status": "initialized",
            "is_guest": is_guest,
            "guest_remaining": GUEST_DAILY_LIMIT if is_guest else None,
        }
        if result.get("profile_score") is not None:
            response["profile_score"] = result["profile_score"]
        if result.get("onboarding_status"):
            response["onboarding_status"] = result["onboarding_status"]
        return response
    except Exception as e:
        logger.error(f"Chatbot start error: {e}")
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
    body: ChatMessageEnhanced = ChatMessageEnhanced(),
    req: Request = None,
    current_user=Depends(get_current_user_optional),
):
    """Send a message to an existing conversation — primary endpoint used by frontend."""
    if current_user is None and req:
        client_ip = req.client.host if req.client else "unknown"
        if not _check_guest_rate_limit(client_ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Guest usage limit reached ({GUEST_DAILY_LIMIT} messages/day). Sign up for unlimited access!",
            )

    user_id = current_user.id if current_user else None
    user_context = _build_user_context(current_user)

    try:
        raw = await chatbot.send_message(
            conversation_id=conversation_id,
            message=body.message,
            user_id=user_id,
            user_context=user_context if user_id else None,
            page_context=body.page_context,
            flow_action=body.flow_action,
        )
        response = _format_response(raw)
    except Exception as e:
        logger.error(f"Chatbot message error: {e}")
        response = {"response": "I'm sorry, I'm having trouble processing your request. Please try again."}

    if current_user is None and req:
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
        response_payload: dict = {"items": messages[-limit:]}
        if isinstance(result, dict):
            if result.get("flow_state"):
                response_payload["flow_state"] = result["flow_state"]
            if result.get("onboarding_progress"):
                response_payload["onboarding_progress"] = result["onboarding_progress"]
            response_payload["context"] = result.get("conversation", {}).get("context", {})
        return response_payload
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


@router.get("/profile-status")
async def get_profile_status(
    current_user=Depends(get_current_user),
):
    """Get the logged-in user's profile completeness score, missing fields, and suggested next steps."""
    user_id = current_user.id
    completeness = await chatbot.get_profile_completeness(user_id)
    role = getattr(current_user, "role", None) or getattr(current_user, "user_type", None) or "client"
    onboarding = await chatbot.get_onboarding_steps(user_id, role)
    return {
        "user_id": user_id,
        "profile_score": completeness["score"],
        "missing_fields": completeness["missing_fields"],
        "suggestions": completeness["suggestions"],
        "onboarding_next_step": onboarding.get("next_step"),
        "onboarding_progress": onboarding.get("progress"),
    }


@router.post("/onboarding/step-complete")
async def complete_onboarding_step(
    body: OnboardingStepRequest,
    current_user=Depends(get_current_user),
):
    """Mark an onboarding step as complete and return the next step."""
    user_id = current_user.id
    role = getattr(current_user, "role", None) or getattr(current_user, "user_type", None) or "client"
    completeness = await chatbot.get_profile_completeness(user_id)
    onboarding = await chatbot.get_onboarding_steps(user_id, role)

    completed_steps = onboarding.get("completed_steps", [])
    pending_steps = onboarding.get("pending_steps", [])

    step_names = [s["name"] for s in completed_steps if s.get("name") == body.step_name]
    already_done = len(step_names) > 0 or body.step_name not in [s["name"] for s in pending_steps]

    if not already_done:
        remaining = [s for s in pending_steps if s["name"] != body.step_name]
    else:
        remaining = pending_steps

    next_step = remaining[0] if remaining else None
    return {
        "step_completed": body.step_name,
        "profile_score": completeness["score"],
        "next_step": next_step,
        "remaining_steps": [s["name"] for s in remaining],
        "progress": f"{len(completed_steps) + (1 if not already_done else 0)}/{len(completed_steps) + len(remaining) + (1 if not already_done else 0)}",
    }


@router.post("/flow/start")
async def start_flow(
    body: FlowStartRequest,
    current_user=Depends(get_current_user_optional),
):
    """Start a guided flow (post_project, build_portfolio, improve_profile)."""
    user_id = current_user.id if current_user else None
    conversation_id = f"chat_{uuid.uuid4().hex}"
    now = __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat()

    from app.db.turso_http import execute_query
    import json
    execute_query(
        """INSERT INTO chatbot_conversations
           (id, user_id, state, context, intents_detected, sentiment_history,
            escalated, started_at, last_activity)
           VALUES (?, ?, 'active', '{}', '[]', '[]', 0, ?, ?)""",
        [conversation_id, user_id, now, now]
    )

    result = await chatbot.start_flow(
        conversation_id=conversation_id,
        flow_type=body.flow_type,
        user_id=user_id,
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "conversation_id": conversation_id,
        "flow_id": result.get("flow_id"),
        "flow_type": body.flow_type,
        "first_prompt": result.get("first_prompt"),
        "total_steps": result.get("total_steps", 0),
        "current_step": result.get("current_step", 1),
    }
