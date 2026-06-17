from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging
import math

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows
from app.services.llm_gateway import llm_gateway

logger = logging.getLogger(__name__)

router = APIRouter()


class RateAdviseRequest(BaseModel):
    service_type: str
    experience_level: str = "intermediate"
    country_code: str = "US"
    target_platform: str = "upwork"
    weekly_hours: int = 40
    portfolio_strength: str = "moderate"


@router.get("/options")
def get_options():
    return {
        "service_types": [
            {"key": "web_development", "label": "Web Development"},
            {"key": "mobile_development", "label": "Mobile Development"},
            {"key": "ui_ux_design", "label": "UI/UX Design"},
            {"key": "data_science", "label": "Data Science"},
            {"key": "content_writing", "label": "Content Writing"},
            {"key": "digital_marketing", "label": "Digital Marketing"},
            {"key": "video_editing", "label": "Video Editing"},
            {"key": "virtual_assistant", "label": "Virtual Assistant"},
        ],
        "experience_levels": ["entry", "intermediate", "expert", "specialist"],
        "platforms": [
            {"key": "upwork", "label": "Upwork", "fee_pct": 10},
            {"key": "fiverr", "label": "Fiverr", "fee_pct": 20},
            {"key": "freelancer", "label": "Freelancer.com", "fee_pct": 10},
            {"key": "direct", "label": "Direct Client", "fee_pct": 0},
        ],
        "portfolio_strengths": ["beginner", "moderate", "strong", "exceptional"],
    }


@router.post("/advise")
def advise_rate(req: RateAdviseRequest):
    now = datetime.now(timezone.utc)

    base_rates = {
        "web_development": {"entry": 20, "intermediate": 40, "expert": 75, "specialist": 120},
        "mobile_development": {"entry": 25, "intermediate": 50, "expert": 85, "specialist": 130},
        "ui_ux_design": {"entry": 18, "intermediate": 35, "expert": 65, "specialist": 110},
        "data_science": {"entry": 25, "intermediate": 50, "expert": 90, "specialist": 150},
        "content_writing": {"entry": 10, "intermediate": 25, "expert": 50, "specialist": 80},
        "digital_marketing": {"entry": 12, "intermediate": 30, "expert": 60, "specialist": 100},
        "video_editing": {"entry": 15, "intermediate": 30, "expert": 55, "specialist": 90},
        "virtual_assistant": {"entry": 8, "intermediate": 18, "expert": 35, "specialist": 55},
    }

    country_multipliers = {
        "US": 1.0, "GB": 0.95, "CA": 0.9, "AU": 0.95, "DE": 0.85,
        "PK": 0.4, "IN": 0.45, "NG": 0.35, "BR": 0.5, "PH": 0.45,
    }

    portfolio_multiplier = {"beginner": 0.85, "moderate": 1.0, "strong": 1.15, "exceptional": 1.3}

    base = base_rates.get(req.service_type, base_rates["web_development"])
    level_rate = base.get(req.experience_level, base["intermediate"])
    country_mult = country_multipliers.get(req.country_code, 0.7)
    port_mult = portfolio_multiplier.get(req.portfolio_strength, 1.0)

    minimum = round(level_rate * country_mult * 0.75 * port_mult, 2)
    recommended = round(level_rate * country_mult * port_mult, 2)
    premium = round(level_rate * country_mult * 1.4 * port_mult, 2)

    platform_data = {
        "upwork": {"platform": "Upwork", "fee_pct": 10},
        "fiverr": {"platform": "Fiverr", "fee_pct": 20},
        "freelancer": {"platform": "Freelancer.com", "fee_pct": 10},
        "direct": {"platform": "Direct Client", "fee_pct": 0},
    }
    plat = platform_data.get(req.target_platform, platform_data["upwork"])
    fee_pct = plat["fee_pct"]
    take_home = round(recommended * (1 - fee_pct / 100), 2)

    weekly_gross = recommended * req.weekly_hours
    monthly_gross = weekly_gross * 4.33

    platform_comparison = []
    for pkey, pdata in platform_data.items():
        pfee = pdata["fee_pct"]
        pnet = round(recommended * (1 - pfee / 100), 2)
        platform_comparison.append({
            "platform": pdata["platform"],
            "fee_pct": pfee,
            "net_hourly": pnet,
            "monthly_estimate": round(pnet * req.weekly_hours * 4.33, 2),
            "annual_estimate": round(pnet * req.weekly_hours * 50, 2),
        })

    return {
        "rates": {
            "minimum": minimum,
            "recommended": recommended,
            "premium": premium,
            "currency": "USD",
        },
        "income": {
            "hourly_net": take_home,
            "projections": {
                "conservative": {
                    "label": "Conservative",
                    "billable_hours_week": max(20, req.weekly_hours - 10),
                    "weekly": round(take_home * max(20, req.weekly_hours - 10), 2),
                    "monthly": round(take_home * max(20, req.weekly_hours - 10) * 4.33, 2),
                    "annual": round(take_home * max(20, req.weekly_hours - 10) * 50, 2),
                },
                "average": {
                    "label": "Average",
                    "billable_hours_week": req.weekly_hours,
                    "weekly": round(take_home * req.weekly_hours, 2),
                    "monthly": round(monthly_gross * (1 - fee_pct / 100), 2),
                    "annual": round(monthly_gross * 12 * (1 - fee_pct / 100), 2),
                },
                "optimistic": {
                    "label": "Optimistic",
                    "billable_hours_week": min(50, req.weekly_hours + 5),
                    "weekly": round(take_home * min(50, req.weekly_hours + 5), 2),
                    "monthly": round(take_home * min(50, req.weekly_hours + 5) * 4.33, 2),
                    "annual": round(take_home * min(50, req.weekly_hours + 5) * 50, 2),
                },
            },
        },
        "platform": {
            "platform": plat["platform"],
            "gross_rate": recommended,
            "fee_pct": fee_pct,
            "take_home_rate": take_home,
            "fee_per_hour": round(recommended * fee_pct / 100, 2),
            "note": f"Platform takes {fee_pct}% service fee" if fee_pct > 0 else "No platform fees",
        },
        "platform_comparison": sorted(platform_comparison, key=lambda x: x["net_hourly"], reverse=True),
        "market_comparison": {
            "comparisons": [
                {"benchmark": "Bottom 25%", "rate": minimum, "your_position": "above" if recommended > minimum else "at", "difference_pct": round((recommended - minimum) / minimum * 100, 1) if minimum else 0},
                {"benchmark": "Market Average", "rate": recommended, "your_position": "at", "difference_pct": 0},
                {"benchmark": "Top 25%", "rate": premium, "your_position": "below" if recommended < premium else "at", "difference_pct": round((premium - recommended) / recommended * 100, 1) if recommended else 0},
            ],
            "estimated_percentile": 50 + (port_mult - 1) * 100,
        },
        "rate_breakdown": [
            {"step": "Base Rate", "value": level_rate, "description": f"Average for {req.experience_level} level"},
            {"step": "Country Adjustment", "value": round(level_rate * country_mult, 2), "description": f"Adjusted for {req.country_code}"},
            {"step": "Portfolio Factor", "value": round(level_rate * country_mult * port_mult, 2), "description": f"Portfolio strength: {req.portfolio_strength}"},
            {"step": "Final Rate", "value": recommended, "description": "Your recommended hourly rate"},
        ],
        "tips": [
            {"type": "pricing", "title": "Start slightly below recommended", "detail": f"Consider starting at ${round(recommended * 0.9, 2)}/hr to build reviews quickly"},
            {"type": "platform", "title": "Use direct clients when possible", "detail": f"Direct clients pay {round(fee_pct * recommended / 100, 2)}$/hr more (no platform fee)"},
            {"type": "growth", "title": "Increase rate every 10 reviews", "detail": f"Aim for ${round(recommended * 1.15, 2)}/hr after 10+ positive reviews"},
        ],
        "meta": {
            "service_type": req.service_type,
            "experience_level": req.experience_level,
            "country_code": req.country_code,
            "target_platform": req.target_platform,
            "weekly_hours": req.weekly_hours,
        },
    }


# ──────────────────────────────────────────────────────────────────────────────
# AI-powered: auto-analyze the signed-in freelancer's REAL profile and advise.
# Grounds the LLM on deterministic market rates + the user's actual track record
# so the recommendation is concrete, not hallucinated.
# ──────────────────────────────────────────────────────────────────────────────

# Map common skills / focus keywords onto the deterministic rate service buckets.
_SERVICE_KEYWORDS = {
    "web_development": ["react", "vue", "angular", "node", "django", "fastapi", "php", "laravel", "frontend", "backend", "full stack", "fullstack", "web", "javascript", "typescript", "wordpress"],
    "mobile_development": ["ios", "android", "flutter", "react native", "swift", "kotlin", "mobile"],
    "ui_ux_design": ["ui", "ux", "figma", "design", "wireframe", "prototype", "user experience", "graphic"],
    "data_science": ["data science", "machine learning", "ml", "ai", "pandas", "tensorflow", "pytorch", "data analyst", "analytics", "nlp"],
    "content_writing": ["writing", "copywriting", "content", "blog", "article", "seo writing", "editor"],
    "digital_marketing": ["marketing", "seo", "ppc", "ads", "social media", "growth", "email marketing"],
    "video_editing": ["video", "premiere", "after effects", "motion", "animation", "editing"],
    "virtual_assistant": ["virtual assistant", "admin", "data entry", "support", "scheduling"],
}

_COUNTRY_HINTS = {
    "united states": "US", "usa": "US", "u.s": "US", "america": "US",
    "united kingdom": "GB", "uk": "GB", "england": "GB", "london": "GB",
    "canada": "CA", "australia": "AU", "germany": "DE",
    "pakistan": "PK", "india": "IN", "nigeria": "NG", "brazil": "BR", "philippines": "PH",
}


def _infer_service_type(text: str) -> str:
    t = (text or "").lower()
    best, best_hits = "web_development", 0
    for service, kws in _SERVICE_KEYWORDS.items():
        hits = sum(1 for kw in kws if kw in t)
        if hits > best_hits:
            best, best_hits = service, hits
    return best


def _infer_country(location: str) -> str:
    loc = (location or "").lower()
    for hint, code in _COUNTRY_HINTS.items():
        if hint in loc:
            return code
    return "US"


def _map_experience(experience_level: Optional[str], years: Optional[float]) -> str:
    lvl = (experience_level or "").lower()
    if lvl in ("entry", "intermediate", "expert", "specialist"):
        return lvl
    try:
        y = float(years or 0)
    except (TypeError, ValueError):
        y = 0
    if y >= 10:
        return "specialist"
    if y >= 5:
        return "expert"
    if y >= 2:
        return "intermediate"
    return "entry"


def _load_freelancer_profile(user_id: int) -> dict:
    """Pull the rich, real profile + track record for grounding the advice."""
    rows = parse_rows(execute_query(
        """SELECT name, headline, tagline, bio, skills, hourly_rate, location,
                  experience_level, years_of_experience, industry_focus,
                  tools_and_technologies, languages, seller_level
           FROM users WHERE id = ?""", [user_id]))
    profile = rows[0] if rows else {}

    avg_rating, review_count = 0.0, 0
    r = parse_rows(execute_query(
        "SELECT COALESCE(AVG(rating),0) AS avg, COUNT(*) AS cnt FROM reviews WHERE reviewee_id = ?", [user_id]))
    if r:
        try:
            avg_rating = round(float(r[0]["avg"] or 0), 2)
            review_count = int(r[0]["cnt"] or 0)
        except (TypeError, ValueError):
            pass

    completed = 0
    c = parse_rows(execute_query(
        "SELECT COUNT(*) AS cnt FROM contracts WHERE freelancer_id = ? AND status = 'completed'", [user_id]))
    if c:
        try:
            completed = int(c[0]["cnt"] or 0)
        except (TypeError, ValueError):
            pass

    profile["_avg_rating"] = avg_rating
    profile["_review_count"] = review_count
    profile["_completed_contracts"] = completed
    return profile


def _portfolio_strength(profile: dict) -> str:
    """Derive portfolio strength from real track record + profile completeness."""
    score = 0
    if profile.get("_completed_contracts", 0) >= 10:
        score += 2
    elif profile.get("_completed_contracts", 0) >= 3:
        score += 1
    if profile.get("_avg_rating", 0) >= 4.7 and profile.get("_review_count", 0) >= 5:
        score += 2
    elif profile.get("_avg_rating", 0) >= 4.0:
        score += 1
    if profile.get("bio") and len(str(profile["bio"])) > 200:
        score += 1
    if profile.get("tools_and_technologies") or profile.get("certifications"):
        score += 1
    return ["beginner", "moderate", "strong", "exceptional"][min(score // 2, 3)]


@router.get("/advise-me")
def advise_me(weekly_hours: int = 40, target_platform: str = "direct", current_user=Depends(get_current_user)):
    """Auto-analyze the signed-in freelancer's real profile and produce grounded,
    AI-personalized rate & budget advice. Falls back to deterministic numbers if
    the LLM gateway is unavailable."""
    profile = _load_freelancer_profile(current_user.id)

    skills_blob = " ".join(str(profile.get(k) or "") for k in ("skills", "headline", "tagline", "industry_focus", "tools_and_technologies"))
    service_type = _infer_service_type(skills_blob)
    experience = _map_experience(profile.get("experience_level"), profile.get("years_of_experience"))
    country = _infer_country(profile.get("location"))
    portfolio = _portfolio_strength(profile)

    req = RateAdviseRequest(
        service_type=service_type,
        experience_level=experience,
        country_code=country,
        target_platform=target_platform,
        weekly_hours=weekly_hours,
        portfolio_strength=portfolio,
    )
    market = advise_rate(req)

    current_rate = None
    try:
        current_rate = float(profile.get("hourly_rate")) if profile.get("hourly_rate") else None
    except (TypeError, ValueError):
        current_rate = None

    detected = {
        "service_type": service_type,
        "experience_level": experience,
        "country_code": country,
        "portfolio_strength": portfolio,
        "current_hourly_rate": current_rate,
        "avg_rating": profile.get("_avg_rating"),
        "review_count": profile.get("_review_count"),
        "completed_contracts": profile.get("_completed_contracts"),
    }

    ai = _ai_rate_narrative(profile, detected, market)
    return {
        "detected_profile": detected,
        "market_rates": market["rates"],
        "income": market["income"],
        "platform_comparison": market["platform_comparison"],
        "ai_advice": ai,
        "ai_powered": ai.get("source") == "llm",
    }


def _ai_rate_narrative(profile: dict, detected: dict, market: dict) -> dict:
    """Ask the LLM to interpret the real profile + computed rates. Grounded:
    the recommended numbers come from `market`, the LLM explains/positions them."""
    rates = market["rates"]
    fallback = {
        "source": "rules",
        "headline": f"Your data-driven recommended rate is ${rates['recommended']}/hr.",
        "positioning": f"Based on {detected['experience_level']} {detected['service_type'].replace('_',' ')} work "
                       f"with {detected['completed_contracts']} completed contracts and a "
                       f"{detected['avg_rating']}★ average, aim for ${rates['recommended']}/hr "
                       f"(range ${rates['minimum']}–${rates['premium']}).",
        "strengths": [],
        "gaps": [],
        "action_items": [
            f"Set your hourly rate to ${rates['recommended']}/hr.",
            "Add portfolio items and collect reviews to justify premium pricing.",
        ],
        "suggested_project_budget_range": {"min": rates["minimum"] * 20, "max": rates["premium"] * 40},
    }
    if not llm_gateway.is_active:
        return fallback

    profile_summary = {
        "headline": profile.get("headline"),
        "tagline": profile.get("tagline"),
        "bio": (str(profile.get("bio") or ""))[:600],
        "skills": profile.get("skills"),
        "tools": profile.get("tools_and_technologies"),
        "experience_level": detected["experience_level"],
        "years_of_experience": profile.get("years_of_experience"),
        "location": profile.get("location"),
        "current_hourly_rate": detected["current_hourly_rate"],
        "avg_rating": detected["avg_rating"],
        "review_count": detected["review_count"],
        "completed_contracts": detected["completed_contracts"],
    }
    system = (
        "You are a senior freelance pricing strategist on MegiLance. You are given a freelancer's REAL "
        "profile and a data-driven market rate range computed from platform data. Interpret it and give "
        "concrete, honest, personalized pricing advice. Do NOT invent rates outside the provided range. "
        "Respond ONLY with a JSON object with keys: headline (string, one punchy sentence), "
        "positioning (2-3 sentences explaining where they stand and why), strengths (array of strings), "
        "gaps (array of strings, what's holding their rate back), action_items (array of 3 short imperatives), "
        "suggested_project_budget_range (object with numeric min and max in USD for a typical fixed project)."
    )
    user = (
        f"FREELANCER PROFILE:\n{profile_summary}\n\n"
        f"DATA-DRIVEN MARKET RATES (USD/hr): minimum={rates['minimum']}, "
        f"recommended={rates['recommended']}, premium={rates['premium']}.\n"
        f"Detected: {detected['service_type']} / {detected['experience_level']} / "
        f"portfolio={detected['portfolio_strength']}.\n\n"
        "Give the JSON advice now."
    )
    result = llm_gateway.chat_json_sync(
        [{"role": "system", "content": system}, {"role": "user", "content": user}],
        task="reasoning", max_tokens=900, temperature=0.4,
    )
    if not result or not isinstance(result, dict):
        return fallback
    result["source"] = "llm"
    # Guarantee the grounded numbers are always present even if the model omits them.
    result.setdefault("suggested_project_budget_range", fallback["suggested_project_budget_range"])
    return result
