from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging
import math

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
