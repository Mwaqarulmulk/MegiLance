from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging
import re

logger = logging.getLogger(__name__)

router = APIRouter()


class ProposalGenerateRequest(BaseModel):
    project_description: str
    project_budget: Optional[float] = None
    project_type: Optional[str] = None
    freelancer_skills: Optional[List[str]] = None
    freelancer_experience: str = "intermediate"
    tone: str = "professional"
    length: str = "medium"
    hourly_rate: Optional[float] = None


@router.get("/options")
def get_options():
    return {
        "tones": [
            {"key": "professional", "label": "Professional", "description": "Formal and business-like"},
            {"key": "friendly", "label": "Friendly", "description": "Warm and approachable"},
            {"key": "confident", "label": "Confident", "description": "Assertive and bold"},
            {"key": "enthusiastic", "label": "Enthusiastic", "description": "Energetic and passionate"},
        ],
        "lengths": [
            {"key": "short", "label": "Short", "description": "~100 words, concise pitch"},
            {"key": "medium", "label": "Medium", "description": "~200 words, balanced detail"},
            {"key": "long", "label": "Long", "description": "~350 words, comprehensive proposal"},
        ],
        "experience_levels": ["entry", "intermediate", "expert"],
    }


@router.post("/generate")
def generate_proposal(req: ProposalGenerateRequest):
    now = datetime.now(timezone.utc)
    skills = req.freelancer_skills or []

    # Detect project type from description
    project_types = {
        "web_development": ["website", "web app", "frontend", "backend", "full stack", "react", "next.js", "node"],
        "mobile_development": ["mobile app", "ios", "android", "flutter", "react native"],
        "data_science": ["data", "machine learning", "ai", "analytics", "model"],
        "design": ["design", "ui/ux", "figma", "logo", "branding"],
        "writing": ["content", "blog", "copywriting", "article", "seo"],
        "devops": ["devops", "cloud", "aws", "docker", "kubernetes", "ci/cd"],
    }
    desc_lower = req.project_description.lower()
    detected_types = []
    for ptype, keywords in project_types.items():
        matches = sum(1 for kw in keywords if kw in desc_lower)
        if matches > 0:
            detected_types.append({"type": ptype, "keyword_matches": matches})
    detected_types.sort(key=lambda x: x["keyword_matches"], reverse=True)
    primary_type = detected_types[0] if detected_types else {"type": "general", "keyword_matches": 0}

    # Skill match analysis
    skill_matches = []
    for skill in skills:
        mentioned = skill.lower() in desc_lower
        skill_matches.append({
            "skill": skill,
            "mentioned_in_description": mentioned,
            "relevant_to_type": True,
        })
    matched_count = sum(1 for s in skill_matches if s["mentioned_in_description"])
    match_pct = round((matched_count / len(skills) * 100) if skills else 50)

    # Generate proposal text
    tone_prefix = {
        "professional": "I am writing to express my interest in this project.",
        "friendly": "I came across your project and I'm excited about the opportunity!",
        "confident": "I'm the ideal candidate for this project.",
        "enthusiastic": "This project immediately caught my attention — it's exactly what I love doing!",
    }
    intro = tone_prefix.get(req.tone, tone_prefix["professional"])

    length_sentences = {"short": 3, "medium": 5, "long": 8}
    target_sentences = length_sentences.get(req.length, 5)

    rate_text = ""
    if req.hourly_rate and req.project_budget:
        rate_text = f" My rate is ${req.hourly_rate}/hour, which fits within your budget of ${req.project_budget}."
    elif req.hourly_rate:
        rate_text = f" My rate is ${req.hourly_rate}/hour."

    proposal_text = (
        f"{intro} "
        f"With my experience in {', '.join(skills[:3]) if skills else 'this field'}, "
        f"I am confident in delivering high-quality results.{rate_text} "
        f"I understand the requirements well and can start immediately. "
        f"I would love to discuss the project details further."
    )

    # Proposal score
    score = min(100, 40 + match_pct // 2 + (10 if req.hourly_rate else 0) + (10 if len(skills) > 2 else 5))
    score_breakdown = {
        "skill_relevance": min(30, matched_count * 10),
        "proposal_quality": min(25, target_sentences * 4),
        "budget_fit": 20 if req.hourly_rate and req.project_budget else 10,
        "completeness": 15 if req.freelancer_experience != "entry" else 10,
    }

    return {
        "proposal": proposal_text,
        "word_count": len(proposal_text.split()),
        "detected_project_type": {
            "primary": primary_type["type"],
            "confidence": min(0.95, primary_type["keyword_matches"] * 0.3),
            "all_matches": detected_types[:3],
        },
        "skill_match": {
            "matched_skills": skill_matches,
            "other_skills": [],
            "match_percentage": match_pct,
            "match_level": "strong" if match_pct > 70 else "moderate" if match_pct > 40 else "weak",
            "missing_signals": [],
        },
        "suggested_rate": {
            "recommended": req.hourly_rate or 35,
            "range_low": max(15, (req.hourly_rate or 35) - 10),
            "range_high": (req.hourly_rate or 35) + 15,
            "currency": "USD",
            "basis": "hourly",
        },
        "proposal_score": {
            "total": score,
            "max": 100,
            "level": "excellent" if score > 80 else "good" if score > 60 else "needs_improvement",
            "breakdown": score_breakdown,
        },
        "tips": [
            {"type": "content", "tip": "Mention specific relevant experience", "detail": "Reference past projects similar to this one"},
            {"type": "content", "tip": "Address the client's pain points", "detail": "Show you understand their specific challenges"},
            {"type": "timing", "tip": "Respond quickly", "detail": "First proposals get 3x more views"},
        ],
        "meta": {
            "tone": req.tone,
            "length": req.length,
            "word_count": len(proposal_text.split()),
            "experience_level": req.freelancer_experience,
        },
    }
