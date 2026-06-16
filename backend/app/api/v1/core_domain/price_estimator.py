# @AI-HINT: AI Price Estimator router — AI-powered pricing intelligence for projects
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging
import math

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, get_current_user_optional
from app.db.turso_http import execute_query, parse_rows

router = APIRouter()


def _ensure_table():
    execute_query("""
        CREATE TABLE IF NOT EXISTS price_estimates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            skill_slug TEXT,
            industry TEXT,
            project_type TEXT,
            complexity TEXT,
            estimated_min REAL,
            estimated_max REAL,
            estimated_avg REAL,
            currency TEXT DEFAULT 'USD',
            confidence_score REAL,
            factors_json TEXT,
            created_at TEXT NOT NULL
        )
    """, [])
    execute_query("""
        CREATE TABLE IF NOT EXISTS market_rates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            skill_slug TEXT NOT NULL,
            industry TEXT,
            rate_type TEXT DEFAULT 'hourly',
            min_rate REAL,
            max_rate REAL,
            avg_rate REAL,
            sample_size INTEGER DEFAULT 0,
            currency TEXT DEFAULT 'USD',
            period TEXT DEFAULT 'monthly',
            updated_at TEXT NOT NULL
        )
    """, [])


# ── Reference Data ──────────────────────────────────────────────────────────

SKILL_BASE_RATES = {
    "web-development": {"min": 25, "max": 150, "avg": 55},
    "mobile-development": {"min": 30, "max": 170, "avg": 65},
    "ui-ux-design": {"min": 20, "max": 130, "avg": 50},
    "data-science": {"min": 35, "max": 180, "avg": 70},
    "content-writing": {"min": 10, "max": 80, "avg": 30},
    "digital-marketing": {"min": 15, "max": 100, "avg": 40},
    "video-editing": {"min": 15, "max": 90, "avg": 35},
    "backend-development": {"min": 30, "max": 160, "avg": 60},
    "frontend-development": {"min": 20, "max": 130, "avg": 50},
    "devops": {"min": 40, "max": 200, "avg": 80},
    "machine-learning": {"min": 50, "max": 250, "avg": 100},
    "blockchain": {"min": 60, "max": 300, "avg": 120},
    "cybersecurity": {"min": 45, "max": 220, "avg": 90},
    "cloud-architecture": {"min": 50, "max": 250, "avg": 95},
    "database-administration": {"min": 30, "max": 150, "avg": 55},
    "qa-testing": {"min": 15, "max": 90, "avg": 35},
    "graphic-design": {"min": 15, "max": 100, "avg": 40},
    "virtual-assistant": {"min": 8, "max": 40, "avg": 18},
}

COMPLEXITY_MULTIPLIERS = {
    "simple": 0.7,
    "moderate": 1.0,
    "complex": 1.4,
    "enterprise": 1.9,
}

INDUSTRY_MULTIPLIERS = {
    "fintech": 1.3,
    "healthcare": 1.25,
    "ecommerce": 1.0,
    "saas": 1.15,
    "gaming": 1.1,
    "education": 0.9,
    "media": 1.0,
    "real-estate": 0.95,
    "logistics": 1.05,
    "nonprofit": 0.8,
    "government": 1.1,
    "startups": 0.9,
    "enterprise": 1.35,
    "general": 1.0,
}

PROJECT_TYPES = [
    {"key": "landing-page", "label": "Landing Page", "base_hours": 20},
    {"key": "website", "label": "Full Website", "base_hours": 60},
    {"key": "web-app", "label": "Web Application", "base_hours": 150},
    {"key": "mobile-app", "label": "Mobile Application", "base_hours": 200},
    {"key": "api-backend", "label": "API / Backend Service", "base_hours": 80},
    {"key": "ecommerce-store", "label": "E-commerce Store", "base_hours": 100},
    {"key": "dashboard", "label": "Analytics Dashboard", "base_hours": 120},
    {"key": "chatbot", "label": "Chatbot / AI Integration", "base_hours": 80},
    {"key": "migration", "label": "System Migration", "base_hours": 100},
    {"key": "audit", "label": "Code Audit / Review", "base_hours": 30},
]


# ── Pro Estimator datasets (categories, services, countries, options) ────────

EXPERIENCE_MULT = {
    "entry": 0.7, "junior": 0.7, "intermediate": 1.0, "mid": 1.0,
    "expert": 1.45, "senior": 1.45, "specialist": 1.9,
}
QUALITY_MULT = {"budget": 0.8, "standard": 1.0, "premium": 1.35, "enterprise": 1.8}
URGENCY_MULT = {"flexible": 0.9, "standard": 1.0, "urgent": 1.25, "rush": 1.6}
SCOPE_MULT = {"small": 0.6, "medium": 1.0, "large": 1.8, "enterprise": 3.0, "moderate": 1.0, "complex": 1.8}

# Each service: numeric base hourly rate, typical base hours, demand label
PRO_CATEGORIES = [
    {"key": "software_development", "label": "Software Development", "icon": "Code", "description": "Web, mobile & backend engineering", "services": [
        {"key": "web_application", "label": "Web Application", "rate": 65, "hours": 160, "demand": "Very High"},
        {"key": "website", "label": "Website / Landing", "rate": 45, "hours": 50, "demand": "High"},
        {"key": "mobile_app", "label": "Mobile App", "rate": 70, "hours": 220, "demand": "Very High"},
        {"key": "api_backend", "label": "API / Backend", "rate": 68, "hours": 90, "demand": "High"},
        {"key": "ecommerce", "label": "E-commerce Store", "rate": 60, "hours": 120, "demand": "High"},
    ]},
    {"key": "ai_ml", "label": "AI & Machine Learning", "icon": "Brain", "description": "Models, LLMs, data pipelines", "services": [
        {"key": "ml_model", "label": "ML Model / Pipeline", "rate": 100, "hours": 160, "demand": "Very High"},
        {"key": "llm_integration", "label": "LLM / GenAI Integration", "rate": 110, "hours": 120, "demand": "Very High"},
        {"key": "data_analysis", "label": "Data Analysis", "rate": 70, "hours": 60, "demand": "High"},
        {"key": "computer_vision", "label": "Computer Vision", "rate": 105, "hours": 180, "demand": "High"},
    ]},
    {"key": "design", "label": "Design & Creative", "icon": "Palette", "description": "UI/UX, branding, graphics", "services": [
        {"key": "ui_ux", "label": "UI/UX Design", "rate": 55, "hours": 80, "demand": "Very High"},
        {"key": "branding", "label": "Brand Identity", "rate": 50, "hours": 40, "demand": "High"},
        {"key": "graphic_design", "label": "Graphic Design", "rate": 40, "hours": 30, "demand": "Medium"},
        {"key": "design_system", "label": "Design System", "rate": 65, "hours": 100, "demand": "High"},
    ]},
    {"key": "data", "label": "Data & Analytics", "icon": "BarChart3", "description": "BI, dashboards, engineering", "services": [
        {"key": "dashboard", "label": "Analytics Dashboard", "rate": 70, "hours": 90, "demand": "High"},
        {"key": "data_engineering", "label": "Data Engineering", "rate": 85, "hours": 140, "demand": "High"},
        {"key": "data_viz", "label": "Data Visualization", "rate": 60, "hours": 50, "demand": "Medium"},
    ]},
    {"key": "devops", "label": "DevOps & Cloud", "icon": "Cloud", "description": "Infra, CI/CD, reliability", "services": [
        {"key": "cloud_setup", "label": "Cloud Architecture", "rate": 95, "hours": 100, "demand": "Very High"},
        {"key": "cicd", "label": "CI/CD Pipeline", "rate": 85, "hours": 60, "demand": "High"},
        {"key": "k8s", "label": "Kubernetes / Containers", "rate": 100, "hours": 90, "demand": "High"},
    ]},
    {"key": "marketing", "label": "Marketing & Growth", "icon": "TrendingUp", "description": "SEO, ads, growth", "services": [
        {"key": "seo", "label": "SEO Strategy", "rate": 45, "hours": 60, "demand": "High"},
        {"key": "paid_ads", "label": "Paid Ads Management", "rate": 50, "hours": 40, "demand": "High"},
        {"key": "growth", "label": "Growth Strategy", "rate": 65, "hours": 50, "demand": "Medium"},
    ]},
    {"key": "writing", "label": "Writing & Content", "icon": "PenTool", "description": "Copy, technical & content", "services": [
        {"key": "content_writing", "label": "Content Writing", "rate": 30, "hours": 30, "demand": "High"},
        {"key": "copywriting", "label": "Copywriting", "rate": 40, "hours": 24, "demand": "High"},
        {"key": "technical_writing", "label": "Technical Writing", "rate": 50, "hours": 40, "demand": "Medium"},
    ]},
    {"key": "video", "label": "Video & Animation", "icon": "Video", "description": "Editing, motion, 3D", "services": [
        {"key": "video_editing", "label": "Video Editing", "rate": 40, "hours": 40, "demand": "High"},
        {"key": "motion_graphics", "label": "Motion Graphics", "rate": 55, "hours": 50, "demand": "Medium"},
        {"key": "animation_3d", "label": "3D Animation", "rate": 70, "hours": 80, "demand": "Medium"},
    ]},
    {"key": "blockchain", "label": "Blockchain & Web3", "icon": "Link", "description": "Smart contracts, dApps", "services": [
        {"key": "smart_contract", "label": "Smart Contracts", "rate": 130, "hours": 120, "demand": "High"},
        {"key": "dapp", "label": "dApp Development", "rate": 120, "hours": 200, "demand": "Medium"},
        {"key": "tokenomics", "label": "Tokenomics / Audit", "rate": 140, "hours": 80, "demand": "Medium"},
    ]},
    {"key": "consulting", "label": "Consulting & Strategy", "icon": "Briefcase", "description": "Product, technical, business", "services": [
        {"key": "product_strategy", "label": "Product Strategy", "rate": 90, "hours": 40, "demand": "Medium"},
        {"key": "technical_audit", "label": "Technical Audit", "rate": 95, "hours": 40, "demand": "Medium"},
        {"key": "business_consulting", "label": "Business Consulting", "rate": 85, "hours": 50, "demand": "Medium"},
    ]},
]

# Quick lookup: service key → service dict (merged with category)
_SERVICE_INDEX = {
    s["key"]: {**s, "category": c["key"]}
    for c in PRO_CATEGORIES for s in c["services"]
}

COUNTRIES = [
    {"code": "US", "name": "United States", "region": "north_america", "flag": "🇺🇸", "rate_multiplier": 1.0, "client_budget_multiplier": 1.0, "currency": "USD", "ppp_index": 1.0, "cost_of_living": 100},
    {"code": "CA", "name": "Canada", "region": "north_america", "flag": "🇨🇦", "rate_multiplier": 0.88, "client_budget_multiplier": 0.9, "currency": "CAD", "ppp_index": 0.84, "cost_of_living": 88},
    {"code": "GB", "name": "United Kingdom", "region": "europe", "flag": "🇬🇧", "rate_multiplier": 0.92, "client_budget_multiplier": 0.95, "currency": "GBP", "ppp_index": 0.72, "cost_of_living": 90},
    {"code": "DE", "name": "Germany", "region": "europe", "flag": "🇩🇪", "rate_multiplier": 0.9, "client_budget_multiplier": 0.92, "currency": "EUR", "ppp_index": 0.75, "cost_of_living": 85},
    {"code": "AU", "name": "Australia", "region": "oceania", "flag": "🇦🇺", "rate_multiplier": 0.9, "client_budget_multiplier": 0.93, "currency": "AUD", "ppp_index": 0.68, "cost_of_living": 92},
    {"code": "AE", "name": "United Arab Emirates", "region": "middle_east", "flag": "🇦🇪", "rate_multiplier": 0.85, "client_budget_multiplier": 0.95, "currency": "AED", "ppp_index": 0.6, "cost_of_living": 78},
    {"code": "IN", "name": "India", "region": "south_asia", "flag": "🇮🇳", "rate_multiplier": 0.45, "client_budget_multiplier": 0.5, "currency": "INR", "ppp_index": 0.27, "cost_of_living": 30},
    {"code": "PK", "name": "Pakistan", "region": "south_asia", "flag": "🇵🇰", "rate_multiplier": 0.4, "client_budget_multiplier": 0.45, "currency": "PKR", "ppp_index": 0.25, "cost_of_living": 26},
    {"code": "PH", "name": "Philippines", "region": "southeast_asia", "flag": "🇵🇭", "rate_multiplier": 0.42, "client_budget_multiplier": 0.48, "currency": "PHP", "ppp_index": 0.32, "cost_of_living": 35},
    {"code": "BR", "name": "Brazil", "region": "south_america", "flag": "🇧🇷", "rate_multiplier": 0.5, "client_budget_multiplier": 0.55, "currency": "BRL", "ppp_index": 0.36, "cost_of_living": 42},
    {"code": "UA", "name": "Ukraine", "region": "europe", "flag": "🇺🇦", "rate_multiplier": 0.5, "client_budget_multiplier": 0.55, "currency": "UAH", "ppp_index": 0.3, "cost_of_living": 35},
    {"code": "NG", "name": "Nigeria", "region": "africa", "flag": "🇳🇬", "rate_multiplier": 0.38, "client_budget_multiplier": 0.42, "currency": "NGN", "ppp_index": 0.22, "cost_of_living": 28},
]
_COUNTRY_INDEX = {c["code"]: c for c in COUNTRIES}

REGION_META = {
    "north_america": {"label": "North America", "icon": "🌎", "multiplier": 1.0},
    "europe": {"label": "Europe", "icon": "🌍", "multiplier": 0.9},
    "oceania": {"label": "Oceania", "icon": "🌏", "multiplier": 0.9},
    "middle_east": {"label": "Middle East", "icon": "🕌", "multiplier": 0.85},
    "south_asia": {"label": "South Asia", "icon": "🏯", "multiplier": 0.45},
    "southeast_asia": {"label": "Southeast Asia", "icon": "🌴", "multiplier": 0.45},
    "south_america": {"label": "Latin America", "icon": "🌎", "multiplier": 0.52},
    "africa": {"label": "Africa", "icon": "🌍", "multiplier": 0.4},
    "global_remote": {"label": "Global / Remote", "icon": "🌐", "multiplier": 0.85},
}

EXPERIENCE_LEVELS = ["entry", "intermediate", "expert", "specialist"]
URGENCY_OPTIONS = ["flexible", "standard", "urgent", "rush"]
QUALITY_TIERS = ["budget", "standard", "premium", "enterprise"]
SCOPE_OPTIONS = ["small", "medium", "large", "enterprise"]

# Hours-estimation questions (generic + per-category extras)
_GENERIC_HOURS_QUESTIONS = [
    {"id": "scale", "label": "How large is the project?", "type": "single", "options": [
        {"value": "tiny", "label": "Tiny — a single feature/page", "hours": 20},
        {"value": "small", "label": "Small — a few features", "hours": 60},
        {"value": "medium", "label": "Medium — full product / MVP", "hours": 160},
        {"value": "large", "label": "Large — multi-module platform", "hours": 360},
    ]},
    {"id": "integrations", "label": "How many external integrations?", "type": "single", "options": [
        {"value": "none", "label": "None", "hours": 0},
        {"value": "few", "label": "1–2 (payments, auth…)", "hours": 24},
        {"value": "several", "label": "3–5", "hours": 60},
        {"value": "many", "label": "6+ complex integrations", "hours": 120},
    ]},
    {"id": "polish", "label": "How much design polish / QA?", "type": "single", "options": [
        {"value": "basic", "label": "Functional / basic", "hours": 10},
        {"value": "polished", "label": "Polished, responsive", "hours": 40},
        {"value": "pixel", "label": "Pixel-perfect + full QA", "hours": 90},
    ]},
]


def _format_rate(rate: float) -> str:
    return f"${int(rate * 0.7)}–{int(rate * 1.8)}/hr"


# ── Request / Response Schemas ──────────────────────────────────────────────

class EstimateRequest(BaseModel):
    skill_slug: Optional[str] = None
    project_type: str = "web-app"
    complexity: Optional[str] = None
    industry: str = "general"
    hours_estimate: Optional[int] = None
    currency: str = "USD"
    # Frontend payload format (for schema compatibility)
    category: Optional[str] = None
    service_type: Optional[str] = None
    scope: Optional[str] = None
    quality_tier: Optional[str] = None
    urgency: Optional[str] = None
    description: Optional[str] = None
    # Pro estimator fields
    experience_level: Optional[str] = None
    region: Optional[str] = None
    estimated_hours: Optional[int] = None
    features: Optional[List[str]] = None
    team_size: Optional[int] = 1
    client_country: Optional[str] = None
    freelancer_country: Optional[str] = None


# Mapping tables for frontend → backend schema
SERVICE_TYPE_TO_SKILL = {
    "web_application": "web-development",
    "web-app": "web-development",
    "website": "web-development",
    "mobile_app": "mobile-development",
    "mobile": "mobile-development",
    "api": "backend-development",
    "backend": "backend-development",
    "frontend": "frontend-development",
    "design": "ui-ux-design",
    "data": "data-science",
    "devops": "devops",
}

CATEGORY_TO_INDUSTRY = {
    "software_development": "general",
    "fintech": "fintech",
    "healthcare": "healthcare",
    "ecommerce": "ecommerce",
    "saas": "saas",
    "gaming": "gaming",
    "education": "education",
    "media": "media",
}

SCOPE_TO_COMPLEXITY = {
    "simple": "simple",
    "small": "simple",
    "moderate": "moderate",
    "medium": "moderate",
    "complex": "complex",
    "large": "complex",
    "enterprise": "enterprise",
    "high": "complex",
    "low": "simple",
}


def normalize_estimate_request(body: EstimateRequest) -> EstimateRequest:
    """Convert frontend schema to backend schema if needed."""
    # If frontend payload format detected, map to backend schema
    if body.service_type or body.category or body.scope:
        # Map service_type → skill_slug
        skill = SERVICE_TYPE_TO_SKILL.get(
            (body.service_type or "web_application").lower().replace(" ", "_"),
            "web-development"
        )
        body.skill_slug = body.skill_slug or skill

        # Map category → industry
        industry = CATEGORY_TO_INDUSTRY.get(
            (body.category or "software_development").lower(),
            "general"
        )
        body.industry = industry

        # Map scope → complexity
        complexity = SCOPE_TO_COMPLEXITY.get(
            (body.scope or "moderate").lower(),
            "moderate"
        )
        body.complexity = body.complexity or complexity

    # Ensure required fields
    if not body.skill_slug:
        body.skill_slug = "web-development"
    if not body.complexity:
        body.complexity = "moderate"

    return body


class CompareRequest(BaseModel):
    skill_slugs: List[str]
    project_type: str = "web-app"
    complexity: str = "moderate"
    industry: str = "general"


class SuggestRequest(BaseModel):
    skill_slug: str
    project_type: str = "web-app"
    complexity: str = "moderate"
    industry: str = "general"
    client_budget_min: Optional[float] = None
    client_budget_max: Optional[float] = None
    competitor_count: int = 3
    experience_level: str = "intermediate"


class RangeRequest(BaseModel):
    skill_slug: str
    project_type: str = "web-app"
    complexity: str = "moderate"
    industry: str = "general"
    scope_description: Optional[str] = None


# ── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/estimate")
async def estimate_price(body: EstimateRequest, current_user=Depends(get_current_user_optional)):
    # Public lead-gen tool: usable without an account (marketed as "no sign-up required").
    _ensure_table()

    # Handle both frontend and backend request formats
    body = normalize_estimate_request(body)

    # Resolve service & base rate (Pro path), with legacy skill fallback
    service = _SERVICE_INDEX.get(body.service_type or "")
    if service:
        base_rate = float(service["rate"])
        base_hours = float(service["hours"])
        demand_level = service["demand"]
        category = body.category or service["category"]
    else:
        skill = SKILL_BASE_RATES.get(body.skill_slug) or SKILL_BASE_RATES["web-development"]
        base_rate = float(skill["avg"])
        pmeta = next((p for p in PROJECT_TYPES if p["key"] == body.project_type), None)
        base_hours = float(pmeta["base_hours"]) if pmeta else 80.0
        demand_level = "High"
        category = body.category or "software_development"

    exp_mult = EXPERIENCE_MULT.get(body.experience_level or "intermediate", 1.0)
    quality_mult = QUALITY_MULT.get(body.quality_tier or "standard", 1.0)
    urgency_mult = URGENCY_MULT.get(body.urgency or "standard", 1.0)
    scope_mult = SCOPE_MULT.get(body.scope or "medium", 1.0)

    fc = _COUNTRY_INDEX.get((body.freelancer_country or "").upper())
    cc = _COUNTRY_INDEX.get((body.client_country or "").upper())
    if fc:
        region_mult = fc["rate_multiplier"]
    elif body.region and body.region in REGION_META:
        region_mult = REGION_META[body.region]["multiplier"]
    else:
        region_mult = REGION_META["global_remote"]["multiplier"]

    hourly_rate = max(5, round(base_rate * exp_mult * quality_mult * urgency_mult * region_mult))

    feature_bonus = len(body.features or []) * 8
    total_hours = max(1, int(body.estimated_hours or round(base_hours * scope_mult)) + feature_bonus)
    team_size = max(1, int(body.team_size or 1))

    total_estimate = hourly_rate * total_hours
    low_estimate = round(total_estimate * 0.82)
    high_estimate = round(total_estimate * 1.28)

    phases = [
        ("Discovery & Planning", "planning", 0.10), ("Design", "design", 0.18),
        ("Development", "development", 0.47), ("Testing & QA", "testing", 0.15),
        ("Deployment & Handover", "deployment", 0.10),
    ]
    breakdown = [
        {"label": l, "category": c, "hours": round(total_hours * p), "cost": round(total_hours * p) * hourly_rate, "percentage": round(p * 100)}
        for (l, c, p) in phases
    ]

    provided = sum(1 for v in [body.service_type, body.experience_level, body.scope, body.quality_tier, body.estimated_hours, (body.region or body.freelancer_country)] if v)
    conf_score = min(95, 55 + provided * 7)
    conf_level = "high" if conf_score >= 80 else "medium" if conf_score >= 65 else "low"
    confidence = {
        "score": conf_score,
        "level": conf_level,
        "factors": [
            {"factor": "Service type", "impact": "high" if body.service_type else "missing"},
            {"factor": "Scope", "impact": "high" if body.scope else "assumed"},
            {"factor": "Hours provided" if body.estimated_hours else "Hours auto-estimated", "impact": "high" if body.estimated_hours else "medium"},
            {"factor": "Location data", "impact": "high" if (fc or body.region) else "default"},
        ],
    }

    tiers = {}
    for t, m in QUALITY_MULT.items():
        t_hourly = max(5, round(base_rate * exp_mult * urgency_mult * region_mult * m))
        tiers[t] = {"label": t.capitalize(), "total": t_hourly * total_hours, "hourly": t_hourly}
    your_tier = body.quality_tier or "standard"

    factors = [
        {"label": "Experience level", "value": (body.experience_level or "intermediate").capitalize(), "impact": "increases" if exp_mult > 1 else "lowers" if exp_mult < 1 else "neutral", "description": "Senior talent costs more but reduces delivery risk.", "multiplier": exp_mult},
        {"label": "Quality tier", "value": your_tier.capitalize(), "impact": "increases" if quality_mult > 1 else "lowers" if quality_mult < 1 else "neutral", "description": "Higher tiers include more polish, testing and support.", "multiplier": quality_mult},
        {"label": "Urgency", "value": (body.urgency or "standard").capitalize(), "impact": "increases" if urgency_mult > 1 else "neutral", "description": "Rush timelines need dedicated capacity.", "multiplier": urgency_mult},
        {"label": "Scope", "value": (body.scope or "medium").capitalize(), "impact": "increases" if scope_mult > 1 else "lowers" if scope_mult < 1 else "neutral", "description": "Larger scope means more hours.", "multiplier": scope_mult},
        {"label": "Location", "value": (fc["name"] if fc else REGION_META.get(body.region or "global_remote", {}).get("label", "Global")), "impact": "lowers" if region_mult < 1 else "neutral", "description": "Rates vary widely by talent location.", "multiplier": region_mult},
    ]

    weeks = max(1, math.ceil(math.ceil(total_hours / (6 * team_size)) / 5))
    roi_insights = [
        {"type": "savings", "title": "Fair market pricing", "message": f"This reflects current rates for {demand_level.lower()}-demand {category.replace('_', ' ')} work — so you don't overpay."},
        {"type": "risk", "title": "No payment risk", "message": "Funds sit in secure escrow and release per approved milestone — you never pay for unfinished work."},
        {"type": "speed", "title": "Realistic timeline", "message": f"Plan ~{weeks} week(s) with a team of {team_size}; a ~15% buffer prevents late delivery."},
    ]

    timeline = {
        "working_days": max(1, math.ceil(total_hours / (6 * team_size))),
        "weeks": weeks, "label": f"~{weeks} week(s)", "team_size": team_size, "hours_per_day": 6,
    }

    regional_analysis = None
    if fc or cc:
        def _pub(c):
            return {"code": c["code"], "name": c["name"], "flag": c["flag"], "currency": c["currency"],
                    "cost_of_living": c["cost_of_living"], "ppp_index": c["ppp_index"],
                    "budget_multiplier": c["client_budget_multiplier"], "rate_multiplier": c["rate_multiplier"]}
        pricing_context = []
        local_value_context = None
        if fc:
            ppp_adjusted = round(total_estimate / max(0.1, fc["ppp_index"]))
            local_value_context = {"usd_total": total_estimate, "ppp_adjusted": ppp_adjusted,
                                   "ppp_ratio": round(1 / max(0.1, fc["ppp_index"]), 2),
                                   "description": f"${total_estimate:,} carries the local purchasing power of roughly ${ppp_adjusted:,} in {fc['name']}."}
            pricing_context.append({"type": "info", "title": "Cross-border advantage",
                                    "message": f"Talent in {fc['name']} can cut cost while keeping quality — and payments settle instantly via secure escrow, no PayPal or bank-transfer friction."})
        if cc and fc and cc["cost_of_living"] > fc["cost_of_living"]:
            pricing_context.append({"type": "success", "title": "Your budget goes further",
                                    "message": f"A budget set in {cc['name']} stretches further with {fc['name']}-based talent — without giving up escrow protection."})
        comparison = [
            {"code": c["code"], "name": c["name"], "flag": c["flag"],
             "hourly_rate": max(5, round(base_rate * exp_mult * quality_mult * c["rate_multiplier"])),
             "rate_multiplier": c["rate_multiplier"], "cost_of_living": c["cost_of_living"]}
            for c in COUNTRIES if not (fc and c["code"] == fc["code"])
        ]
        comparison.sort(key=lambda x: x["hourly_rate"])
        regional_analysis = {
            "has_country_data": True,
            "client_country": _pub(cc) if cc else None,
            "freelancer_country": _pub(fc) if fc else None,
            "local_value_context": local_value_context,
            "pricing_context": pricing_context,
            "comparison_countries": comparison[:6],
        }

    now = datetime.now(timezone.utc).isoformat()
    try:
        execute_query(
            "INSERT INTO price_estimates (user_id, skill_slug, industry, project_type, complexity, estimated_min, estimated_max, estimated_avg, currency, confidence_score, factors_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [(current_user.id if current_user else None), (body.service_type or body.skill_slug), category, (body.service_type or body.project_type), body.scope,
             low_estimate, high_estimate, total_estimate, body.currency, conf_score / 100.0, json.dumps({"hourly_rate": hourly_rate, "total_hours": total_hours}), now]
        )
    except Exception:
        pass

    return {
        "estimate": {
            "hourly_rate": hourly_rate,
            "total_hours": total_hours,
            "total_estimate": total_estimate,
            "low_estimate": low_estimate,
            "high_estimate": high_estimate,
            "currency": body.currency,
            # legacy aliases
            "min": low_estimate, "max": high_estimate, "avg": total_estimate,
        },
        "breakdown": breakdown,
        "confidence": confidence,
        "market_comparison": {"tiers": tiers, "your_position": your_tier, "your_position_label": your_tier.capitalize()},
        "factors": factors,
        "roi_insights": roi_insights,
        "timeline": timeline,
        "regional_analysis": regional_analysis,
        "demand_level": demand_level,
        "meta": {
            "category": category, "service_type": body.service_type or body.project_type,
            "experience_level": body.experience_level or "intermediate", "region": body.region or "global_remote",
            "client_country": body.client_country, "freelancer_country": body.freelancer_country,
            "urgency": body.urgency or "standard", "quality_tier": your_tier, "scope": body.scope or "medium",
            "team_size": team_size, "generated_at": now,
        },
    }


# ── Pro: categories, hours questions, smart hours ───────────────────────────

@router.get("/categories")
async def get_categories():
    categories = [
        {
            "key": c["key"], "label": c["label"], "icon": c.get("icon"), "description": c["description"],
            "services": [
                {"key": s["key"], "label": s["label"], "avg_rate": _format_rate(s["rate"]), "demand": s["demand"]}
                for s in c["services"]
            ],
        }
        for c in PRO_CATEGORIES
    ]
    regions = []
    for rkey, meta in REGION_META.items():
        if rkey == "global_remote":
            continue
        rcountries = [
            {"code": c["code"], "name": c["name"], "flag": c["flag"], "rate_multiplier": c["rate_multiplier"],
             "client_budget_multiplier": c["client_budget_multiplier"], "currency": c["currency"], "cost_of_living": c["cost_of_living"]}
            for c in COUNTRIES if c["region"] == rkey
        ]
        regions.append({"key": rkey, "label": meta["label"], "icon": meta["icon"], "multiplier": meta["multiplier"], "countries": rcountries})
    regions.append({"key": "global_remote", "label": "Global / Remote", "icon": "🌐", "multiplier": REGION_META["global_remote"]["multiplier"], "countries": []})
    return {
        "categories": categories,
        "experience_levels": EXPERIENCE_LEVELS,
        "regions": regions,
        "countries": COUNTRIES,
        "urgency_options": URGENCY_OPTIONS,
        "quality_tiers": QUALITY_TIERS,
        "scope_options": SCOPE_OPTIONS,
    }


def _questions_for_category(category: str):
    return list(_GENERIC_HOURS_QUESTIONS)


@router.get("/hours-questions/{category}")
async def get_hours_questions(category: str):
    return {"category": category, "questions": _questions_for_category(category)}


class EstimateHoursRequest(BaseModel):
    category: Optional[str] = None
    service_type: Optional[str] = None
    scope: Optional[str] = "medium"
    answers: dict = {}
    features: Optional[List[str]] = None


@router.post("/estimate-hours")
async def estimate_hours(body: EstimateHoursRequest):
    questions = _questions_for_category(body.category or "")
    qmap = {q["id"]: q for q in questions}

    question_hours = 0
    breakdown = []
    for qid, answer_val in (body.answers or {}).items():
        q = qmap.get(qid)
        if not q:
            continue
        opt = next((o for o in q["options"] if o["value"] == answer_val), None)
        if not opt:
            continue
        question_hours += opt["hours"]
        breakdown.append({"question": q["label"], "answer": opt["label"], "hours": opt["hours"]})

    scope_multiplier = SCOPE_MULT.get(body.scope or "medium", 1.0)
    feature_bonus = len(body.features or []) * 8

    service = _SERVICE_INDEX.get(body.service_type or "")
    template_hours = float(service["hours"]) if service else None

    adjusted_hours = round(question_hours * scope_multiplier) + feature_bonus
    if template_hours:
        estimated_hours = max(1, round((adjusted_hours + template_hours * scope_multiplier) / 2)) if adjusted_hours else round(template_hours * scope_multiplier) + feature_bonus
    else:
        estimated_hours = max(1, adjusted_hours or 40)

    answered = len(breakdown)
    total_q = len(questions)
    confidence = "high" if answered >= total_q and total_q else "medium" if answered >= 1 else "low"

    return {
        "estimated_hours": estimated_hours,
        "question_hours": question_hours,
        "adjusted_hours": adjusted_hours,
        "template_hours": template_hours,
        "breakdown": breakdown,
        "scope_multiplier": scope_multiplier,
        "feature_bonus": feature_bonus,
        "low_hours": max(1, round(estimated_hours * 0.8)),
        "high_hours": round(estimated_hours * 1.25),
        "confidence": confidence,
    }


@router.get("/rates/{skill_slug}")
async def get_market_rates(skill_slug: str, industry: Optional[str] = Query(None)):
    _ensure_table()

    skill = SKILL_BASE_RATES.get(skill_slug)
    if not skill:
        raise HTTPException(status_code=404, detail=f"No market rates for skill: {skill_slug}")

    result = execute_query(
        "SELECT skill_slug, industry, rate_type, min_rate, max_rate, avg_rate, sample_size, currency, period, updated_at "
        "FROM market_rates WHERE skill_slug = ? ORDER BY updated_at DESC LIMIT 1",
        [skill_slug]
    )
    db_rates = parse_rows(result) if result else []

    industry_mult = INDUSTRY_MULTIPLIERS.get(industry, 1.0) if industry else 1.0
    adjusted_min = round(skill["min"] * industry_mult, 2)
    adjusted_max = round(skill["max"] * industry_mult, 2)
    adjusted_avg = round(skill["avg"] * industry_mult, 2)

    return {
        "skill_slug": skill_slug,
        "industry": industry or "general",
        "rates": {
            "min": adjusted_min,
            "max": adjusted_max,
            "avg": adjusted_avg,
            "currency": "USD",
            "period": "hourly",
        },
        "percentiles": {
            "p25": round(adjusted_min * 1.2, 2),
            "p50": adjusted_avg,
            "p75": round(adjusted_max * 0.8, 2),
            "p90": round(adjusted_max * 0.95, 2),
        },
        "database_record": db_rates[0] if db_rates else None,
    }


@router.post("/compare")
async def compare_pricing(body: CompareRequest, current_user=Depends(get_current_user_optional)):
    _ensure_table()

    complexity_mult = COMPLEXITY_MULTIPLIERS.get(body.complexity, 1.0)
    industry_mult = INDUSTRY_MULTIPLIERS.get(body.industry, 1.0)

    project_meta = next((p for p in PROJECT_TYPES if p["key"] == body.project_type), None)
    hours = project_meta["base_hours"] if project_meta else 100

    comparisons = []
    for slug in body.skill_slugs:
        skill = SKILL_BASE_RATES.get(slug)
        if not skill:
            comparisons.append({"skill_slug": slug, "error": "Unknown skill"})
            continue

        est_min = round(skill["min"] * complexity_mult * industry_mult * hours, 2)
        est_max = round(skill["max"] * complexity_mult * industry_mult * hours, 2)
        est_avg = round(skill["avg"] * complexity_mult * industry_mult * hours, 2)

        comparisons.append({
            "skill_slug": slug,
            "estimate": {"min": est_min, "max": est_max, "avg": est_avg, "currency": "USD"},
            "hourly_rate": {
                "min": round(skill["min"] * complexity_mult * industry_mult, 2),
                "max": round(skill["max"] * complexity_mult * industry_mult, 2),
                "avg": round(skill["avg"] * complexity_mult * industry_mult, 2),
            },
        })

    comparisons.sort(key=lambda x: x.get("estimate", {}).get("avg", 0), reverse=True)

    return {
        "project_type": body.project_type,
        "complexity": body.complexity,
        "industry": body.industry,
        "estimated_hours": hours,
        "comparisons": comparisons,
        "recommendation": comparisons[0]["skill_slug"] if comparisons and "error" not in comparisons[0] else None,
    }


@router.get("/trends")
async def get_pricing_trends(
    skill_slug: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    months: int = Query(6, ge=1, le=24),
):
    _ensure_table()

    now = datetime.now(timezone.utc)
    trends = []
    for i in range(months):
        month_offset = months - 1 - i
        month_date = now.replace(day=1)
        if month_offset > 0:
            month_date = month_date.replace(month=month_date.month - month_offset) if month_date.month > month_offset else month_date.replace(year=month_date.year - 1, month=12 + month_date.month - month_offset)

        noise = 1 + (math.sin(i * 0.7) * 0.05)
        skill_data = SKILL_BASE_RATES.get(skill_slug or "web-development", SKILL_BASE_RATES["web-development"])
        industry_mult = INDUSTRY_MULTIPLIERS.get(industry or "general", 1.0)

        trends.append({
            "month": month_date.strftime("%Y-%m"),
            "avg_rate": round(skill_data["avg"] * industry_mult * noise, 2),
            "min_rate": round(skill_data["min"] * industry_mult * noise, 2),
            "max_rate": round(skill_data["max"] * industry_mult * noise, 2),
            "sample_size": 50 + (i * 7),
        })

    first_avg = trends[0]["avg_rate"] if trends else 0
    last_avg = trends[-1]["avg_rate"] if trends else 0
    change_pct = round((last_avg - first_avg) / first_avg * 100, 1) if first_avg else 0

    return {
        "skill_slug": skill_slug or "all",
        "industry": industry or "general",
        "months": months,
        "trends": trends,
        "summary": {
            "overall_change_pct": change_pct,
            "direction": "up" if change_pct > 0 else ("down" if change_pct < 0 else "flat"),
            "current_avg": last_avg,
        },
    }


@router.post("/suggest")
async def suggest_bid(body: SuggestRequest, current_user=Depends(get_current_user_optional)):
    _ensure_table()

    skill = SKILL_BASE_RATES.get(body.skill_slug)
    if not skill:
        raise HTTPException(status_code=400, detail=f"Unknown skill_slug: {body.skill_slug}")

    complexity_mult = COMPLEXITY_MULTIPLIERS.get(body.complexity, 1.0)
    industry_mult = INDUSTRY_MULTIPLIERS.get(body.industry, 1.0)

    project_meta = next((p for p in PROJECT_TYPES if p["key"] == body.project_type), None)
    hours = project_meta["base_hours"] if project_meta else 100

    base_avg = skill["avg"] * complexity_mult * industry_mult * hours

    experience_mults = {"entry": 0.8, "intermediate": 1.0, "expert": 1.2, "specialist": 1.4}
    exp_mult = experience_mults.get(body.experience_level, 1.0)
    adjusted = base_avg * exp_mult

    competitor_factor = max(0.85, 1.0 - (body.competitor_count - 1) * 0.03)
    competitive_price = round(adjusted * competitor_factor, 2)

    budget_mid = None
    if body.client_budget_min is not None and body.client_budget_max is not None:
        budget_mid = (body.client_budget_min + body.client_budget_max) / 2

    suggested = round(competitive_price, 2)
    sweet_spot_min = round(suggested * 0.92, 2)
    sweet_spot_max = round(suggested * 1.05, 2)

    if budget_mid is not None:
        suggested = round((competitive_price * 0.6 + budget_mid * 0.4), 2)
        sweet_spot_min = round(suggested * 0.95, 2)
        sweet_spot_max = round(suggested * 1.08, 2)

    confidence = 0.8
    if body.client_budget_min is not None and body.client_budget_max is not None:
        confidence += 0.1
    if body.competitor_count > 5:
        confidence -= 0.05

    return {
        "suggested_bid": suggested,
        "sweet_spot": {"min": sweet_spot_min, "max": sweet_spot_max},
        "currency": "USD",
        "confidence_score": round(min(confidence, 1.0), 2),
        "breakdown": {
            "base_hourly_rate": skill["avg"],
            "complexity_factor": complexity_mult,
            "industry_factor": industry_mult,
            "experience_factor": exp_mult,
            "competitor_factor": competitor_factor,
            "estimated_hours": hours,
        },
        "strategy": {
            "aggressive": round(suggested * 0.88, 2),
            "competitive": suggested,
            "premium": round(suggested * 1.15, 2),
        },
        "tips": [
            f"Competitive range: ${sweet_spot_min} - ${sweet_spot_max}",
            f"Based on {body.competitor_count} competitors and {body.experience_level} experience",
            f"Project scope: ~{hours} hours at {body.complexity} complexity",
        ],
    }


@router.get("/industry-rates")
async def get_industry_rates(industry: Optional[str] = Query(None)):
    _ensure_table()

    result = execute_query(
        "SELECT skill_slug, industry, rate_type, min_rate, max_rate, avg_rate, sample_size, currency, period "
        "FROM market_rates WHERE industry = ? ORDER BY avg_rate DESC",
        [industry] if industry else []
    )
    db_rates = parse_rows(result) if result else []

    target = industry or "general"
    industry_mult = INDUSTRY_MULTIPLIERS.get(target, 1.0)

    rates_by_skill = []
    for slug, base in SKILL_BASE_RATES.items():
        rates_by_skill.append({
            "skill_slug": slug,
            "min_rate": round(base["min"] * industry_mult, 2),
            "max_rate": round(base["max"] * industry_mult, 2),
            "avg_rate": round(base["avg"] * industry_mult, 2),
            "currency": "USD",
            "period": "hourly",
        })

    rates_by_skill.sort(key=lambda x: x["avg_rate"], reverse=True)

    return {
        "industry": target,
        "industry_multiplier": industry_mult,
        "total_skills": len(rates_by_skill),
        "rates": rates_by_skill,
        "database_records": db_rates,
        "insights": {
            "highest_paying": rates_by_skill[0] if rates_by_skill else None,
            "lowest_paying": rates_by_skill[-1] if rates_by_skill else None,
            "overall_avg": round(sum(r["avg_rate"] for r in rates_by_skill) / len(rates_by_skill), 2) if rates_by_skill else 0,
        },
    }


@router.post("/range")
async def get_price_range(body: RangeRequest, current_user=Depends(get_current_user_optional)):
    _ensure_table()

    skill = SKILL_BASE_RATES.get(body.skill_slug)
    if not skill:
        raise HTTPException(status_code=400, detail=f"Unknown skill_slug: {body.skill_slug}")

    complexity_mult = COMPLEXITY_MULTIPLIERS.get(body.complexity, 1.0)
    industry_mult = INDUSTRY_MULTIPLIERS.get(body.industry, 1.0)

    project_meta = next((p for p in PROJECT_TYPES if p["key"] == body.project_type), None)
    hours = project_meta["base_hours"] if project_meta else 100

    range_min = round(skill["min"] * complexity_mult * industry_mult * hours, 2)
    range_max = round(skill["max"] * complexity_mult * industry_mult * hours, 2)
    range_avg = round(skill["avg"] * complexity_mult * industry_mult * hours, 2)

    scopes = {
        "budget": {"min": round(range_min, 2), "max": round(range_avg * 0.9, 2)},
        "standard": {"min": round(range_avg * 0.85, 2), "max": round(range_avg * 1.15, 2)},
        "premium": {"min": round(range_avg * 1.1, 2), "max": round(range_max, 2)},
    }

    scope_hint = None
    if body.scope_description:
        desc_lower = body.scope_description.lower()
        if any(w in desc_lower for w in ["simple", "basic", "small", "quick"]):
            scope_hint = "budget"
        elif any(w in desc_lower for w in ["complex", "advanced", "large", "enterprise", "full"]):
            scope_hint = "premium"
        else:
            scope_hint = "standard"

    return {
        "skill_slug": body.skill_slug,
        "project_type": body.project_type,
        "complexity": body.complexity,
        "industry": body.industry,
        "estimated_hours": hours,
        "range": {"min": range_min, "max": range_max, "avg": range_avg, "currency": "USD"},
        "tiered_scopes": scopes,
        "recommended_tier": scope_hint or "standard",
        "breakdown": {
            "skill_base": skill["avg"],
            "complexity_multiplier": complexity_mult,
            "industry_multiplier": industry_mult,
            "hours": hours,
        },
    }
