# @AI-HINT: AI chatbot router — conversational support, intent classification
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.services.ai_chatbot import AIChatbotService

router = APIRouter()
chatbot = AIChatbotService()


class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatFeedback(BaseModel):
    rating: int
    feedback: Optional[str] = None


@router.post("/chat")
async def chat(request: ChatMessage, current_user=Depends(get_current_user)):
    response = chatbot.process_message(
        user_id=current_user.id,
        message=request.message,
        conversation_id=request.conversation_id,
    )
    return response


@router.get("/chat/history")
async def chat_history(
    limit: int = 50,
    current_user=Depends(get_current_user),
):
    history = chatbot.get_conversation_history(current_user.id, limit=limit)
    return {"items": history}


@router.post("/chat/{conversation_id}/feedback")
async def chat_feedback(conversation_id: str, request: ChatFeedback, current_user=Depends(get_current_user)):
    chatbot.save_feedback(conversation_id, request.rating, request.feedback)
    return {"message": "Feedback saved"}


@router.get("/chat/faq")
async def get_faqs(category: Optional[str] = None):
    faqs = chatbot.get_faqs(category=category)
    return {"items": faqs}
