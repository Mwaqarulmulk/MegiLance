# @AI-HINT: AI writing router — proposal/description generation, improvement, feasibility, upsell.
# Backed by AIWritingService (LLM gateway → DigitalOcean AI). Paths/bodies match frontend lib/api/ai.ts aiWritingApi.
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, get_current_user_optional
from app.services.ai_writing import AIWritingService, ToneStyle, WritingContentType

router = APIRouter()
writing_service = AIWritingService()


def _tone(value: Optional[str]) -> ToneStyle:
    try:
        return ToneStyle(value) if value else ToneStyle.PROFESSIONAL
    except (ValueError, TypeError):
        return ToneStyle.PROFESSIONAL


def _content_type(value: Optional[str]) -> WritingContentType:
    try:
        return WritingContentType(value) if value else WritingContentType.PROPOSAL
    except (ValueError, TypeError):
        return WritingContentType.PROPOSAL


# ── Request models (mirror frontend aiWritingApi) ────────────────────────────────

class ProposalRequest(BaseModel):
    project_title: str
    project_description: str
    user_skills: List[str] = []
    user_experience: Optional[str] = None
    tone: Optional[str] = "professional"
    highlight_points: Optional[List[str]] = None


class ProjectDescriptionRequest(BaseModel):
    project_type: str
    key_features: List[str] = []
    target_audience: Optional[str] = None
    budget_range: Optional[str] = None
    tone: Optional[str] = "professional"


class ImproveRequest(BaseModel):
    content: str
    content_type: Optional[str] = "proposal"
    improvements: Optional[List[str]] = None


class FeasibilityRequest(BaseModel):
    project_description: str
    budget_min: float
    budget_max: float
    timeline_days: int


class UpsellRequest(BaseModel):
    project_description: str
    proposal_content: str


# ── Endpoints ────────────────────────────────────────────────────────────────────

@router.post("/generate/proposal")
async def generate_proposal(request: ProposalRequest, current_user=Depends(get_current_user_optional)):
    try:
        result = await writing_service.generate_proposal(
            user_id=current_user.id if current_user else 0,
            project_title=request.project_title,
            project_description=request.project_description,
            user_skills=request.user_skills,
            user_experience=request.user_experience,
            tone=_tone(request.tone),
            highlight_points=request.highlight_points,
        )
        return {"content": result["content"], "word_count": result.get("word_count", 0),
                "suggestions": result.get("suggestions", [])}
    except Exception as e:
        logger.error(f"generate_proposal failed: {e}")
        raise HTTPException(status_code=503, detail="AI proposal generation is temporarily unavailable.")


@router.post("/generate/project-description")
async def generate_project_description(request: ProjectDescriptionRequest, current_user=Depends(get_current_user_optional)):
    try:
        result = await writing_service.generate_project_description(
            user_id=current_user.id if current_user else 0,
            project_type=request.project_type,
            key_features=request.key_features,
            target_audience=request.target_audience,
            budget_range=request.budget_range,
            tone=_tone(request.tone),
        )
        return {"content": result["content"], "word_count": result.get("word_count", 0)}
    except Exception as e:
        logger.error(f"generate_project_description failed: {e}")
        raise HTTPException(status_code=503, detail="AI description generation is temporarily unavailable.")


@router.post("/improve")
async def improve(request: ImproveRequest, current_user=Depends(get_current_user_optional)):
    try:
        result = await writing_service.improve_content(
            user_id=current_user.id if current_user else 0,
            content=request.content,
            content_type=_content_type(request.content_type),
            improvements=request.improvements,
        )
        return {"content": result["improved"], "changes": result.get("changes", []),
                "readability_score": result.get("readability_score", {})}
    except Exception as e:
        logger.error(f"improve_content failed: {e}")
        raise HTTPException(status_code=503, detail="AI text improvement is temporarily unavailable.")


@router.post("/analyze/feasibility")
async def analyze_feasibility(request: FeasibilityRequest, current_user=Depends(get_current_user_optional)):
    try:
        return await writing_service.analyze_feasibility(
            user_id=current_user.id if current_user else 0,
            project_description=request.project_description,
            budget_min=request.budget_min,
            budget_max=request.budget_max,
            timeline_days=request.timeline_days,
        )
    except Exception as e:
        logger.error(f"analyze_feasibility failed: {e}")
        raise HTTPException(status_code=503, detail="AI feasibility analysis is temporarily unavailable.")


@router.post("/generate/upsell")
async def generate_upsell(request: UpsellRequest, current_user=Depends(get_current_user_optional)):
    try:
        result = await writing_service.generate_upsell_suggestions(
            user_id=current_user.id if current_user else 0,
            project_description=request.project_description,
            proposal_content=request.proposal_content,
        )
        return {"suggestions": result.get("suggestions", [])}
    except Exception as e:
        logger.error(f"generate_upsell failed: {e}")
        raise HTTPException(status_code=503, detail="AI upsell suggestions are temporarily unavailable.")
