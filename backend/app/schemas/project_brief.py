# @AI-HINT: Schemas for AI-powered project briefing and freelancer matching
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ProjectComplexity(str, Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"


class ProjectBriefRequest(BaseModel):
    """Client submits structured project details via the AI wizard."""
    category: str = Field(..., description="Project category (e.g. Web Development, Mobile Development)")
    description: str = Field(..., min_length=20, description="Natural language project description")
    skills: list[str] = Field(default_factory=list, description="Required skills")
    budget_min: Optional[float] = Field(None, ge=0, description="Minimum budget in USD")
    budget_max: Optional[float] = Field(None, ge=0, description="Maximum budget in USD")
    timeline: str = Field(..., description="Expected timeline (e.g. '1 week', '1 month', '3 months')")
    complexity: ProjectComplexity = Field(default=ProjectComplexity.MODERATE)
    industry: Optional[str] = Field(None, description="Client's industry")
    deliverables: Optional[list[str]] = Field(None, description="Expected deliverables")
    additional_notes: Optional[str] = Field(None, description="Any extra context")


class ProjectBriefResponse(BaseModel):
    """AI-enriched project brief with recommendations."""
    enriched_description: str = Field(..., description="AI-polished project description")
    suggested_skills: list[str] = Field(..., description="AI-recommended skills to add")
    estimated_budget_min: float = Field(..., description="AI-estimated minimum budget")
    estimated_budget_max: float = Field(..., description="AI-estimated maximum budget")
    estimated_timeline: str = Field(..., description="AI-estimated timeline")
    complexity_score: float = Field(..., ge=0, le=1, description="Complexity score 0-1")
    ai_confidence: float = Field(..., ge=0, le=1, description="AI confidence in its assessment")
    missing_info: list[str] = Field(default_factory=list, description="What AI thinks is missing")
    project_type: str = Field(..., description="Detected project type")
    recommended_experience_level: str = Field(..., description="Recommended freelancer experience level")


class SmartMatchRequest(BaseModel):
    """Request AI matching after project brief is confirmed."""
    category: str
    skills: list[str]
    budget_min: float
    budget_max: float
    timeline: str
    complexity: str
    industry: Optional[str] = None
    deliverables: Optional[list[str]] = None
    preferences: Optional[dict] = Field(None, description="Location, language, timezone preferences")


class FreelancerMatch(BaseModel):
    """A single freelancer match with scoring breakdown."""
    freelancer_id: int
    fit_score: float = Field(..., ge=0, le=100, description="Overall fit score 0-100")
    skill_match: float = Field(..., ge=0, le=1, description="Skill match score")
    experience_match: float = Field(..., ge=0, le=1, description="Experience level match")
    rating_score: float = Field(..., ge=0, le=1, description="Rating score")
    availability_score: float = Field(..., ge=0, le=1, description="Availability score")
    fraud_score: float = Field(..., ge=0, le=1, description="Fraud risk (lower is better)")
    price_fit: float = Field(..., ge=0, le=1, description="Budget alignment score")
    explanation: str = Field(..., description="AI-generated match explanation")
    highlight: str = Field(..., description="Key strength of this freelancer")
    display_name: str = Field(..., description="Freelancer display name")
    headline: Optional[str] = Field(None, description="Freelancer headline")
    hourly_rate: Optional[float] = Field(None, description="Hourly rate")
    rating: Optional[float] = Field(None, description="Average rating")
    completed_projects: int = Field(default=0, description="Number of completed projects")
    profile_image_url: Optional[str] = Field(None)


class SmartMatchResponse(BaseModel):
    """AI matching results with ranked freelancer shortlist."""
    matches: list[FreelancerMatch] = Field(..., description="Top 3-5 matching freelancers")
    total_candidates: int = Field(..., description="Total candidates evaluated")
    ai_reasoning: str = Field(..., description="Overall AI reasoning for the match")
    estimated_budget: float = Field(..., description="AI-recommended budget")
    estimated_timeline: str = Field(..., description="AI-recommended timeline")


class HireConfirmRequest(BaseModel):
    """Client confirms hiring a freelancer from the shortlist."""
    freelancer_id: int
    project_brief: dict = Field(..., description="Confirmed project brief data")
    agreed_amount: float = Field(..., ge=0)
    milestone_plan: list[dict] = Field(default_factory=list, description="Proposed milestones")
    message_to_freelancer: Optional[str] = None


class HireConfirmResponse(BaseModel):
    """Hire confirmation result."""
    contract_id: Optional[int] = None
    project_id: int
    status: str
    message: str
    freelancer_notified: bool


class InvitationRespondRequest(BaseModel):
    """Freelancer responds to an AI-matched invitation."""
    accept: bool
    message: Optional[str] = None
    proposed_rate: Optional[float] = Field(None, ge=0, description="Counter-offer rate")


class InvitationResponse(BaseModel):
    """Invitation response result."""
    invitation_id: int
    status: str
    contract_id: Optional[int] = None
    message: str


class InvitationListResponse(BaseModel):
    """List of pending invitations for a freelancer."""
    invitations: list[dict]
    total: int
    pending_count: int
