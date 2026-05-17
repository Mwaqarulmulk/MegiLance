# @AI-HINT: AI writing router — proposal writer, cover letter generator, content assistance
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.services.ai_writing import AIWritingService

router = APIRouter()
writing_service = AIWritingService()


class ProposalWriteRequest(BaseModel):
    project_title: str
    project_description: str
    required_skills: str
    freelancer_skills: str
    freelancer_experience: str

class CoverLetterRequest(BaseModel):
    project_title: str
    project_description: str
    freelancer_name: str
    freelancer_skills: str

class ContentImproveRequest(BaseModel):
    content: str
    tone: str = "professional"


@router.post("/proposal")
async def write_proposal(request: ProposalWriteRequest, current_user=Depends(get_current_user)):
    proposal = writing_service.generate_proposal(
        project_title=request.project_title,
        project_description=request.project_description,
        required_skills=request.required_skills,
        freelancer_skills=request.freelancer_skills,
        freelancer_experience=request.freelancer_experience,
    )
    return {"proposal": proposal}


@router.post("/cover-letter")
async def write_cover_letter(request: CoverLetterRequest, current_user=Depends(get_current_user)):
    letter = writing_service.generate_cover_letter(
        project_title=request.project_title,
        project_description=request.project_description,
        freelancer_name=request.freelancer_name,
        freelancer_skills=request.freelancer_skills,
    )
    return {"cover_letter": letter}


@router.post("/improve")
async def improve_content(request: ContentImproveRequest, current_user=Depends(get_current_user)):
    improved = writing_service.improve_content(request.content, tone=request.tone)
    return {"improved_content": improved}


@router.post("/summarize")
async def summarize_content(request: ContentImproveRequest, current_user=Depends(get_current_user)):
    summary = writing_service.summarize_content(request.content)
    return {"summary": summary}
