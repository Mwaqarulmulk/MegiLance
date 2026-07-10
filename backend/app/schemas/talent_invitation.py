# @AI-HINT: Pydantic schemas for Talent Invitation system
"""Talent invitation schemas."""

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class InvitationStatusEnum(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class TalentInvitationCreate(BaseModel):
    """Schema for creating a talent invitation."""
    project_id: int
    freelancer_id: int
    message: Optional[str] = Field(None, max_length=1000)
    suggested_rate: Optional[float] = Field(None, ge=0)


class TalentInvitationBulkCreate(BaseModel):
    """Schema for sending invitations to multiple freelancers."""
    project_id: int
    freelancer_ids: List[int] = Field(..., min_length=1, max_length=50)
    message: Optional[str] = Field(None, max_length=1000)


class TalentInvitationResponse(BaseModel):
    """Schema for invitation response (freelancer perspective)."""
    accept: bool
    response_message: Optional[str] = Field(None, max_length=500)


class TalentInvitationDetail(BaseModel):
    """Full invitation detail response."""
    id: int
    
    # Project info
    project_id: int
    project_title: str
    project_description: str
    project_budget_min: Optional[float]
    project_budget_max: Optional[float]
    project_skills: List[str]
    
    # Client info
    client_id: int
    client_name: str
    client_image: Optional[str]
    client_country: Optional[str]
    client_projects_posted: int
    client_hire_rate: float
    
    # Freelancer info
    freelancer_id: int
    freelancer_name: str
    
    # Invitation details
    message: Optional[str]
    suggested_rate: Optional[float]
    status: str
    response_message: Optional[str]
    
    # Tracking
    viewed: bool
    viewed_at: Optional[datetime]
    responded_at: Optional[datetime]
    proposal_id: Optional[int]
    
    # Timing
    expires_at: datetime
    is_expired: bool
    days_until_expiry: int
    
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TalentInvitationListItem(BaseModel):
    """Compact invitation for list views."""
    id: int
    project_id: int
    project_title: str
    client_name: str
    client_image: Optional[str]
    message_preview: Optional[str]  # First 100 chars
    suggested_rate: Optional[float]
    status: str
    viewed: bool
    expires_at: datetime
    is_expired: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InvitationListResponse(BaseModel):
    """Paginated invitation list response."""
    invitations: List[TalentInvitationListItem]
    total: int
    page: int
    per_page: int
    pending_count: int
    accepted_count: int
    declined_count: int


class ProjectInvitationsResponse(BaseModel):
    """Invitations for a specific project (client view)."""
    project_id: int
    project_title: str
    invitations: List[TalentInvitationListItem]
    total_sent: int
    pending: int
    accepted: int
    declined: int
    expired: int


class InviteSuggestedFreelancers(BaseModel):
    """AI-suggested freelancers to invite."""
    project_id: int


class SuggestedFreelancer(BaseModel):
    """Freelancer suggested for invitation."""
    id: int
    name: str
    profile_image_url: Optional[str]
    tagline: Optional[str]
    hourly_rate: Optional[float]
    skills: List[str]
    skill_match_score: float  # 0-100
    level: str
    average_rating: float
    total_reviews: int
    completed_projects: int
    location: Optional[str]
    is_available: bool
    already_invited: bool
    already_proposed: bool

    model_config = ConfigDict(from_attributes=True)


class SuggestedFreelancersResponse(BaseModel):
    """Response with suggested freelancers."""
    project_id: int
    suggested: List[SuggestedFreelancer]
    total: int
