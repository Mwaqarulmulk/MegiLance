# @AI-HINT: Pydantic schemas for Gig marketplace - request/response models for gig CRUD and ordering
"""Gig marketplace schemas."""

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class GigStatusEnum(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    ACTIVE = "active"
    PAUSED = "paused"
    DENIED = "denied"
    DELETED = "deleted"


class GigPackageTierEnum(str, Enum):
    BASIC = "basic"
    STANDARD = "standard"
    PREMIUM = "premium"


class GigOrderStatusEnum(str, Enum):
    PENDING = "pending"
    REQUIREMENTS = "requirements"
    IN_PROGRESS = "in_progress"
    DELIVERED = "delivered"
    REVISION_REQUESTED = "revision_requested"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"
    LATE = "late"


# =====================
# GIG PACKAGE SCHEMAS
# =====================

class GigPackageCreate(BaseModel):
    """Schema for creating/updating a single package tier."""
    title: str = Field(..., max_length=100)
    description: Optional[str] = None
    price: float = Field(..., ge=5, le=50000)
    delivery_days: int = Field(..., ge=1, le=365)
    revisions: int = Field(1, ge=0, le=100)
    features: Optional[List[str]] = None


class GigPackageResponse(BaseModel):
    """Schema for package tier response."""
    title: str
    description: Optional[str]
    price: float
    delivery_days: int
    revisions: int
    features: Optional[List[str]] = None


# =====================
# GIG EXTRA SCHEMAS
# =====================

class GigExtraCreate(BaseModel):
    """Schema for gig extras/add-ons."""
    title: str = Field(..., max_length=100)
    description: Optional[str] = None
    price: float = Field(..., ge=1)
    delivery_days_add: int = Field(0, ge=0)  # Extra days added to delivery


class GigExtraResponse(BaseModel):
    """Schema for gig extra response."""
    id: str
    title: str
    description: Optional[str]
    price: float
    delivery_days_add: int


# =====================
# GIG FAQ SCHEMAS
# =====================

class GigFAQCreate(BaseModel):
    """Schema for creating gig FAQ."""
    question: str = Field(..., max_length=500)
    answer: str


class GigFAQResponse(BaseModel):
    """Schema for gig FAQ response."""
    id: int
    question: str
    answer: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


# =====================
# GIG CREATE/UPDATE
# =====================

class GigCreate(BaseModel):
    """Schema for creating a new gig."""
    title: str = Field(..., min_length=10, max_length=80)
    description: str = Field(..., min_length=100)
    short_description: Optional[str] = Field(None, max_length=200)
    category_id: Optional[int] = None
    subcategory: Optional[str] = None
    tags: Optional[List[str]] = None
    search_tags: Optional[List[str]] = None
    
    # Packages
    basic_package: GigPackageCreate
    standard_package: Optional[GigPackageCreate] = None
    premium_package: Optional[GigPackageCreate] = None
    
    # Extras
    extras: Optional[List[GigExtraCreate]] = None
    
    # Requirements from buyer
    requirements: Optional[List[str]] = None
    
    # FAQs
    faqs: Optional[List[GigFAQCreate]] = None
    
    # Media (URLs)
    images: Optional[List[str]] = None
    video_url: Optional[str] = None
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        # Remove "I will" prefix if present (Fiverr convention)
        if v.lower().startswith('i will '):
            v = v[7:]
        return v.strip()


class GigUpdate(BaseModel):
    """Schema for updating a gig."""
    title: Optional[str] = Field(None, min_length=10, max_length=80)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=200)
    category_id: Optional[int] = None
    subcategory: Optional[str] = None
    tags: Optional[List[str]] = None
    search_tags: Optional[List[str]] = None
    
    # Packages
    basic_package: Optional[GigPackageCreate] = None
    standard_package: Optional[GigPackageCreate] = None
    premium_package: Optional[GigPackageCreate] = None
    
    # Extras
    extras: Optional[List[GigExtraCreate]] = None
    
    # Requirements
    requirements: Optional[List[str]] = None
    
    # FAQs
    faqs: Optional[List[GigFAQCreate]] = None
    
    # Media
    images: Optional[List[str]] = None
    video_url: Optional[str] = None
    
    # Status
    status: Optional[GigStatusEnum] = None


# =====================
# GIG RESPONSE SCHEMAS
# =====================

class GigSellerInfo(BaseModel):
    """Seller info embedded in gig response."""
    id: int
    name: str
    profile_image_url: Optional[str]
    location: Optional[str]
    seller_level: Optional[str]
    average_rating: Optional[float]
    total_reviews: int = 0
    member_since: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class GigListResponse(BaseModel):
    """Schema for gig in list view (compact)."""
    id: int
    title: str
    slug: str
    short_description: Optional[str]
    thumbnail_url: Optional[str]
    category_id: Optional[int]
    
    # Pricing (show starting from price)
    starting_price: float
    
    # Stats
    average_rating: float
    total_reviews: int
    orders_count: int
    
    # Seller
    seller: GigSellerInfo
    
    # Status
    is_featured: bool
    is_promoted: bool
    
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GigDetailResponse(BaseModel):
    """Schema for full gig detail view."""
    id: int
    title: str
    slug: str
    description: str
    short_description: Optional[str]
    
    # Category
    category_id: Optional[int]
    category_name: Optional[str]
    subcategory: Optional[str]
    tags: Optional[List[str]]
    
    # Packages
    basic_package: GigPackageResponse
    standard_package: Optional[GigPackageResponse]
    premium_package: Optional[GigPackageResponse]
    
    # Extras
    extras: Optional[List[GigExtraResponse]]
    
    # Requirements
    requirements: Optional[List[str]]
    
    # FAQs
    faqs: Optional[List[GigFAQResponse]]
    
    # Media
    images: Optional[List[str]]
    video_url: Optional[str]
    
    # Stats
    average_rating: float
    total_reviews: int
    orders_count: int
    completed_orders: int
    views: int
    
    # Response & Delivery metrics
    average_response_time: Optional[int]  # hours
    on_time_delivery_rate: float
    
    # Seller
    seller: GigSellerInfo
    
    # Status
    status: str
    is_featured: bool
    is_promoted: bool
    
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


# =====================
# GIG ORDER SCHEMAS
# =====================

class GigOrderCreate(BaseModel):
    """Schema for placing a gig order."""
    gig_id: int
    package_tier: GigPackageTierEnum
    selected_extras: Optional[List[str]] = None  # List of extra IDs
    requirements: Optional[dict] = None  # Answers to gig requirements
    
    # Custom order (when seller sends custom offer)
    is_custom_order: bool = False
    custom_price: Optional[float] = None
    custom_delivery_days: Optional[int] = None
    custom_revisions: Optional[int] = None
    custom_description: Optional[str] = None


class GigOrderRequirementsSubmit(BaseModel):
    """Schema for submitting order requirements."""
    requirements: dict  # Key-value pairs for requirement answers
    attachments: Optional[List[str]] = None  # File URLs


class GigOrderResponse(BaseModel):
    """Schema for order response."""
    id: int
    order_number: str
    gig_id: int
    gig_title: str
    
    # Buyer/Seller
    buyer_id: int
    buyer_name: str
    seller_id: int
    seller_name: str
    
    # Package
    package_tier: str
    package_title: str
    
    # Pricing
    base_price: float
    extras_price: float
    total_price: float
    service_fee: float
    seller_earnings: float
    tip_amount: float
    
    # Delivery
    delivery_days: int
    expected_delivery_at: datetime
    actual_delivery_at: Optional[datetime]
    was_late: bool
    
    # Revisions
    revisions_included: int
    revisions_used: int
    revisions_remaining: int
    
    # Status
    status: str
    requirements_submitted: bool
    
    # Timestamps
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


# =====================
# GIG DELIVERY SCHEMAS
# =====================

class GigDeliveryCreate(BaseModel):
    """Schema for delivering an order."""
    message: str = Field(..., min_length=10)
    files: Optional[List[str]] = None  # File URLs
    source_files: Optional[List[str]] = None


class GigDeliveryResponse(BaseModel):
    """Schema for delivery response."""
    id: int
    delivery_number: int
    message: str
    files: Optional[List[str]]
    source_files: Optional[List[str]]
    status: str
    is_final: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================
# GIG REVISION SCHEMAS
# =====================

class GigRevisionRequest(BaseModel):
    """Schema for requesting a revision."""
    request_description: str = Field(..., min_length=20)
    request_files: Optional[List[str]] = None


class GigRevisionResponse(BaseModel):
    """Schema for revision response."""
    id: int
    revision_number: int
    request_description: str
    request_files: Optional[List[str]]
    delivery_description: Optional[str]
    delivery_files: Optional[List[str]]
    status: str
    is_extra: bool
    extra_cost: float
    created_at: datetime
    delivered_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


# =====================
# GIG REVIEW SCHEMAS
# =====================

class GigReviewCreate(BaseModel):
    """Schema for creating a gig review."""
    order_id: int
    communication_rating: float = Field(..., ge=1, le=5)
    service_rating: float = Field(..., ge=1, le=5)
    delivery_rating: float = Field(..., ge=1, le=5)
    recommendation_rating: float = Field(..., ge=1, le=5)
    review_text: Optional[str] = Field(None, max_length=2000)
    private_feedback: Optional[str] = None
    images: Optional[List[str]] = None


class GigReviewResponse(BaseModel):
    """Schema for review response."""
    id: int
    gig_id: int
    order_id: int
    
    # Reviewer
    reviewer_id: int
    reviewer_name: str
    reviewer_image: Optional[str]
    reviewer_country: Optional[str]
    
    # Ratings
    communication_rating: float
    service_rating: float
    delivery_rating: float
    recommendation_rating: float
    overall_rating: float
    
    # Content
    review_text: Optional[str]
    seller_response: Optional[str]
    seller_responded_at: Optional[datetime]
    
    # Images
    images: Optional[List[str]]
    
    # Helpful
    helpful_count: int
    
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GigReviewSellerResponse(BaseModel):
    """Schema for seller responding to a review."""
    response: str = Field(..., max_length=1000)


# =====================
# SEARCH & FILTER
# =====================

class GigSearchParams(BaseModel):
    """Schema for gig search parameters."""
    query: Optional[str] = None
    category_id: Optional[int] = None
    subcategory: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    delivery_time: Optional[int] = None  # Max days
    seller_level: Optional[str] = None
    min_rating: Optional[float] = None
    sort_by: Optional[str] = "recommended"  # recommended, best_selling, newest, price_low, price_high
    page: int = 1
    per_page: int = 24


class GigSearchResponse(BaseModel):
    """Schema for gig search results."""
    gigs: List[GigListResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
    filters_applied: dict
