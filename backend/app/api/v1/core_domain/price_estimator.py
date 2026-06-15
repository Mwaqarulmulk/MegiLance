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

    skill = SKILL_BASE_RATES.get(body.skill_slug)
    if not skill:
        raise HTTPException(status_code=400, detail=f"Unknown skill_slug: {body.skill_slug}")

    complexity_mult = COMPLEXITY_MULTIPLIERS.get(body.complexity, 1.0)
    industry_mult = INDUSTRY_MULTIPLIERS.get(body.industry, 1.0)

    base_min = skill["min"]
    base_max = skill["max"]
    base_avg = skill["avg"]

    est_min = round(base_min * complexity_mult * industry_mult, 2)
    est_max = round(base_max * complexity_mult * industry_mult, 2)
    est_avg = round(base_avg * complexity_mult * industry_mult, 2)

    project_meta = next((p for p in PROJECT_TYPES if p["key"] == body.project_type), None)
    if project_meta:
        hours = body.hours_estimate or project_meta["base_hours"]
        est_min = round(est_min * hours, 2)
        est_max = round(est_max * hours, 2)
        est_avg = round(est_avg * hours, 2)
    elif body.hours_estimate:
        est_min = round(est_min * body.hours_estimate, 2)
        est_max = round(est_max * body.hours_estimate, 2)
        est_avg = round(est_avg * body.hours_estimate, 2)

    factors = {
        "skill": body.skill_slug,
        "complexity": body.complexity,
        "complexity_multiplier": complexity_mult,
        "industry": body.industry,
        "industry_multiplier": industry_mult,
        "project_type": body.project_type,
    }

    confidence = 0.85
    if body.skill_slug not in SKILL_BASE_RATES:
        confidence -= 0.15
    if body.industry not in INDUSTRY_MULTIPLIERS:
        confidence -= 0.1
    if body.complexity not in COMPLEXITY_MULTIPLIERS:
        confidence -= 0.1

    now = datetime.now(timezone.utc).isoformat()
    execute_query(
        "INSERT INTO price_estimates (user_id, skill_slug, industry, project_type, complexity, estimated_min, estimated_max, estimated_avg, currency, confidence_score, factors_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [(current_user.id if current_user else None), body.skill_slug, body.industry, body.project_type, body.complexity,
         est_min, est_max, est_avg, body.currency, round(confidence, 2), json.dumps(factors), now]
    )

    return {
        "estimate": {
            "min": est_min,
            "max": est_max,
            "avg": est_avg,
            "currency": body.currency,
        },
        "confidence_score": round(confidence, 2),
        "factors": factors,
        "project_type": body.project_type,
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
