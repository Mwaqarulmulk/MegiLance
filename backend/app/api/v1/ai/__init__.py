from fastapi import APIRouter
from . import (
    ai_advanced,
    ai_matching,
    ai_services,
    ai_writing,
    chatbot,
    client_assistant,
    fraud_detection,
    instant_match,
    project_brief,
    skill_analyzer,
)

router = APIRouter()
