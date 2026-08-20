# @AI-HINT: AI services router — rate estimation, skill analysis, project estimation using real market data
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional, List
import logging
import json

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, get_current_user_optional
from app.db.turso_http import execute_query, parse_rows
from app.services.matching_engine import normalize_skill, SKILL_CATEGORIES

router = APIRouter()


class RateEstimateRequest(BaseModel):
    skills: List[str]
    experience_level: Optional[str] = None
    location: Optional[str] = None


@router.post("/estimate-rate")
def estimate_rate(request: RateEstimateRequest, current_user=Depends(get_current_user_optional)):
    """Estimate market rate based on actual freelancer data in the platform."""
    skill_list = [s.strip().lower() for s in request.skills if s.strip()]

    # Query actual freelancers with matching skills
    if skill_list:
        conditions = " OR ".join(["LOWER(u.skills) LIKE ?" for _ in skill_list])
        params = [f"%{s}%" for s in skill_list]
        result = execute_query(
            f"""SELECT u.hourly_rate, u.experience_level, u.seller_level, u.skills
                FROM users u
                WHERE u.user_type = 'freelancer' AND u.is_active = 1
                AND ({conditions})""",
            params,
        )
    else:
        result = execute_query(
            """SELECT u.hourly_rate, u.experience_level, u.seller_level, u.skills
               FROM users u
               WHERE u.user_type = 'freelancer' AND u.is_active = 1"""
        )

    freelancers = parse_rows(result) or []

    if not freelancers:
        # Fallback to global averages
        result = execute_query(
            """SELECT AVG(hourly_rate) as avg_rate, MIN(hourly_rate) as min_rate,
                      MAX(hourly_rate) as max_rate
               FROM users WHERE user_type = 'freelancer' AND is_active = 1
               AND hourly_rate IS NOT NULL AND hourly_rate > 0"""
        )
        rows = parse_rows(result)
        if rows and rows[0].get("avg_rate"):
            avg = float(rows[0]["avg_rate"])
            return {
                "estimated_rate": round(avg, 2),
                "range": {"min": round(float(rows[0]["min_rate"]), 2), "max": round(float(rows[0]["max_rate"]), 2)},
                "confidence": 0.5,
                "factors": {"skills": request.skills, "experience": request.experience_level, "sample_size": 0},
                "message": "Estimated from global averages (no matching freelancers found)",
            }
        return {
            "estimated_rate": 25.0,
            "range": {"min": 10.0, "max": 50.0},
            "confidence": 0.3,
            "factors": {"skills": request.skills, "experience": request.experience_level, "sample_size": 0},
            "message": "Default estimate — no freelancer data available",
        }

    # Calculate rates from actual market data
    rates = []
    for f in freelancers:
        rate = f.get("hourly_rate")
        if rate and float(rate) > 0:
            rates.append(float(rate))

    if not rates:
        return {
            "estimated_rate": 25.0,
            "range": {"min": 10.0, "max": 50.0},
            "confidence": 0.3,
            "factors": {"skills": request.skills, "experience": request.experience_level, "sample_size": 0},
            "message": "No hourly rate data available",
        }

    avg_rate = sum(rates) / len(rates)
    min_rate = min(rates)
    max_rate = max(rates)

    # Adjust for experience level
    experience_multiplier = {"entry": 0.7, "intermediate": 1.0, "expert": 1.4}
    multiplier = experience_multiplier.get((request.experience_level or "").lower(), 1.0)
    adjusted_rate = avg_rate * multiplier

    # Confidence based on sample size
    confidence = min(0.95, 0.4 + (len(rates) * 0.05))

    return {
        "estimated_rate": round(adjusted_rate, 2),
        "range": {"min": round(min_rate * multiplier, 2), "max": round(max_rate * multiplier, 2)},
        "confidence": round(confidence, 2),
        "factors": {
            "skills": request.skills,
            "experience": request.experience_level,
            "location": request.location,
            "sample_size": len(rates),
            "market_avg": round(avg_rate, 2),
        },
        "message": f"Based on {len(rates)} matching freelancers in the platform",
    }


@router.get("/skills/analysis")
def analyze_skills(
    skills: str = Query(..., description="Comma-separated skills"),
    current_user=Depends(get_current_user_optional),
):
    """Analyze skills based on actual market demand from the platform data."""
    skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    analysis = []

    for skill in skill_list:
        normalized = normalize_skill(skill)

        # Count freelancers with this skill
        result = execute_query(
            """SELECT COUNT(*) as count, AVG(hourly_rate) as avg_rate
               FROM users
               WHERE user_type = 'freelancer' AND is_active = 1
               AND LOWER(skills) LIKE ?""",
            [f"%{normalized}%"],
        )
        rows = parse_rows(result)
        supply_count = rows[0]["count"] if rows else 0
        avg_rate = float(rows[0]["avg_rate"]) if rows and rows[0].get("avg_rate") else 0

        # Count projects requiring this skill
        result = execute_query(
            """SELECT COUNT(*) as count
               FROM projects
               WHERE status = 'open' AND LOWER(skills) LIKE ?""",
            [f"%{normalized}%"],
        )
        rows = parse_rows(result)
        demand_count = rows[0]["count"] if rows else 0

        # Determine demand level based on supply/demand ratio
        if supply_count == 0:
            demand_level = "low"
        elif demand_count > supply_count * 2:
            demand_level = "very_high"
        elif demand_count > supply_count:
            demand_level = "high"
        elif demand_count > 0:
            demand_level = "medium"
        else:
            demand_level = "low"

        # Check if skill is in a hot category
        category = None
        for cat, cat_skills in SKILL_CATEGORIES.items():
            if normalized in cat_skills:
                category = cat
                break

        analysis.append({
            "skill": skill,
            "normalized": normalized,
            "demand": demand_level,
            "supply_count": supply_count,
            "demand_count": demand_count,
            "avg_rate": round(avg_rate, 2) if avg_rate else None,
            "category": category,
        })

    return {"skills": analysis, "total": len(analysis)}


@router.get("/project/estimate")
def estimate_project(
    title: str = Query(...),
    description: str = Query(...),
    category: Optional[str] = None,
    current_user=Depends(get_current_user_optional),
):
    """Estimate project budget and duration based on similar completed projects."""
    word_count = len(description.split())

    # Find similar projects by category and extract budget data
    if category:
        result = execute_query(
            """SELECT budget_min, budget_max, budget_type, estimated_duration,
                      experience_level
               FROM projects
               WHERE category = ? AND status IN ('completed', 'in_progress', 'open')
               ORDER BY created_at DESC LIMIT 50""",
            [category],
        )
    else:
        result = execute_query(
            """SELECT budget_min, budget_max, budget_type, estimated_duration,
                      experience_level, category
               FROM projects
               WHERE status IN ('completed', 'in_progress', 'open')
               ORDER BY created_at DESC LIMIT 50"""
        )

    projects = parse_rows(result) or []

    if projects:
        budgets = []
        durations = []
        for p in projects:
            bmin = float(p.get("budget_min") or 0)
            bmax = float(p.get("budget_max") or 0)
            if bmax > 0:
                budgets.append((bmin + bmax) / 2)
            dur = p.get("estimated_duration")
            if dur:
                try:
                    durations.append(int(dur))
                except (ValueError, TypeError):
                    pass

        if budgets:
            avg_budget = sum(budgets) / len(budgets)
            min_budget = min(budgets)
            max_budget = max(budgets)
            avg_duration = int(sum(durations) / len(durations)) if durations else 14
            confidence = min(0.9, 0.4 + (len(budgets) * 0.01))

            return {
                "estimated_budget": round(avg_budget, 2),
                "budget_range": {"min": round(min_budget, 2), "max": round(max_budget, 2)},
                "estimated_duration_days": avg_duration,
                "confidence": round(confidence, 2),
                "factors": {
                    "word_count": word_count,
                    "category": category,
                    "similar_projects": len(budgets),
                },
                "message": f"Based on {len(budgets)} similar projects in the platform",
            }

    # Fallback: estimate from description complexity
    base_estimate = max(500, word_count * 10)
    duration = max(7, word_count // 20)

    return {
        "estimated_budget": base_estimate,
        "budget_range": {"min": base_estimate * 0.6, "max": base_estimate * 1.5},
        "estimated_duration_days": duration,
        "confidence": 0.3,
        "factors": {"word_count": word_count, "category": category, "similar_projects": 0},
        "message": "Estimated from description complexity (no similar projects found)",
    }


class InvoiceItemizeRequest(BaseModel):
    amount: float
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None


# Standard delivery-phase weights, lightly adjusted per category. This is a
# transparent template (not a precise prediction), so confidence is reported
# accordingly rather than overstated.
_BASE_PHASES = [
    ("Discovery & planning", 0.15),
    ("Design", 0.20),
    ("Development & implementation", 0.45),
    ("Testing & QA", 0.12),
    ("Deployment & handover", 0.08),
]

_CATEGORY_PHASE_OVERRIDES = {
    "design": [
        ("Discovery & research", 0.15),
        ("Concept & wireframes", 0.25),
        ("Visual design", 0.40),
        ("Revisions", 0.12),
        ("Handover & assets", 0.08),
    ],
    "writing": [
        ("Research & outline", 0.20),
        ("First draft", 0.45),
        ("Editing & revisions", 0.25),
        ("Final delivery", 0.10),
    ],
    "marketing": [
        ("Strategy & planning", 0.25),
        ("Content & creative", 0.35),
        ("Campaign execution", 0.30),
        ("Reporting", 0.10),
    ],
}


@router.post("/itemize-invoice")
def itemize_invoice(request: InvoiceItemizeRequest, current_user=Depends(get_current_user_optional)):
    """Break a contract/total amount into standard delivery-phase line items.

    Returns a transparent template breakdown the user can edit. Confidence
    reflects that it is a category template, not a per-item prediction.
    """
    total = max(0.0, float(request.amount or 0))
    if total <= 0:
        raise HTTPException(status_code=422, detail="A positive amount is required")

    haystack = " ".join(
        [request.category or "", request.title or "", request.description or ""]
    ).lower()

    phases = _BASE_PHASES
    matched_category = None
    for key, override in _CATEGORY_PHASE_OVERRIDES.items():
        if key in haystack:
            phases = override
            matched_category = key
            break

    # Allocate amounts, then push any rounding remainder onto the largest line
    # so the items always sum exactly to the total.
    items = []
    allocated = 0.0
    for label, weight in phases:
        rate = round(total * weight, 2)
        allocated = round(allocated + rate, 2)
        items.append({"description": label, "quantity": 1, "rate": rate})
    remainder = round(total - allocated, 2)
    if remainder and items:
        largest = max(range(len(items)), key=lambda i: items[i]["rate"])
        items[largest]["rate"] = round(items[largest]["rate"] + remainder, 2)

    confidence = 0.6 if matched_category else 0.5

    return {
        "items": items,
        "total": total,
        "confidence": confidence,
        "factors": {
            "matched_category": matched_category,
            "phase_count": len(items),
        },
        "message": (
            f"Standard {matched_category} project breakdown — adjust line items as needed"
            if matched_category
            else "Standard project phase breakdown — adjust line items as needed"
        ),
    }


class ProjectPriceEstimateRequest(BaseModel):
    category: Optional[str] = None
    skills_required: Optional[List[str]] = []
    description: Optional[str] = None
    estimated_hours: Optional[int] = None
    complexity: Optional[str] = "medium"


@router.post("/estimate-price")
def estimate_project_price(
    request: ProjectPriceEstimateRequest,
    current_user=Depends(get_current_user_optional),
):
    """Estimate project price and hourly rates based on skills, category, and complexity."""
    skills = [s.strip().lower() for s in (request.skills_required or []) if s.strip()]
    category = request.category or "General"
    complexity = (request.complexity or "medium").lower()

    # Complexity multipliers
    complexity_mult = {
        "entry": 0.7,
        "simple": 0.7,
        "low": 0.7,
        "medium": 1.0,
        "intermediate": 1.0,
        "moderate": 1.0,
        "expert": 1.45,
        "complex": 1.45,
        "high": 1.45,
        "senior": 1.45,
        "enterprise": 1.8,
    }.get(complexity, 1.0)

    # Calculate hourly rate from matching freelancers in DB if any
    base_rate = 35.0
    if skills:
        conditions = " OR ".join(["LOWER(u.skills) LIKE ?" for _ in skills])
        params = [f"%{s}%" for s in skills]
        res = execute_query(
            f"""SELECT AVG(u.hourly_rate) as avg_rate, MIN(u.hourly_rate) as min_rate, MAX(u.hourly_rate) as max_rate
                FROM users u
                WHERE (u.user_type = 'freelancer' OR u.role = 'freelancer') AND u.is_active = 1
                AND u.hourly_rate IS NOT NULL AND u.hourly_rate > 0
                AND ({conditions})""",
            params,
        )
        rows = parse_rows(res)
        if rows and rows[0].get("avg_rate"):
            base_rate = float(rows[0]["avg_rate"])
    elif category:
        res = execute_query(
            """SELECT AVG(u.hourly_rate) as avg_rate
               FROM users u
               WHERE (u.user_type = 'freelancer' OR u.role = 'freelancer') AND u.is_active = 1
               AND u.hourly_rate IS NOT NULL AND u.hourly_rate > 0
               AND (LOWER(u.tagline) LIKE ? OR LOWER(u.headline) LIKE ? OR LOWER(u.skills) LIKE ?)""",
            [f"%{category.lower()}%", f"%{category.lower()}%", f"%{category.lower()}%"],
        )
        rows = parse_rows(res)
        if rows and rows[0].get("avg_rate"):
            base_rate = float(rows[0]["avg_rate"])

    estimated_hourly_rate = round(base_rate * complexity_mult, 2)

    # Estimate hours
    if request.estimated_hours and request.estimated_hours > 0:
        estimated_hours = int(request.estimated_hours)
    else:
        # Default hours based on complexity
        hours_map = {
            "simple": 30, "entry": 30, "low": 30,
            "medium": 60, "intermediate": 60, "moderate": 60,
            "complex": 120, "expert": 120, "high": 120,
            "enterprise": 200,
        }
        desc_words = len((request.description or "").split())
        estimated_hours = hours_map.get(complexity, 60)
        if desc_words > 50:
            estimated_hours = max(estimated_hours, min(250, desc_words * 2))

    estimated_total = round(estimated_hourly_rate * estimated_hours, 2)
    low_estimate = round(estimated_total * 0.8, 2)
    high_estimate = round(estimated_total * 1.25, 2)

    factors = [
        f"Category: {category}",
        f"Complexity multiplier: {complexity_mult}x ({complexity})",
        f"Market hourly rate: ${estimated_hourly_rate}/hr",
        f"Estimated effort: {estimated_hours} hours",
    ]
    if skills:
        factors.append(f"Skills considered: {', '.join(skills[:5])}")

    return {
        "estimated_hourly_rate": estimated_hourly_rate,
        "estimated_total": estimated_total,
        "estimated_hours": estimated_hours,
        "low_estimate": low_estimate,
        "high_estimate": high_estimate,
        "complexity": complexity,
        "category": category,
        "confidence": 0.85 if skills else 0.7,
        "factors": factors,
    }

