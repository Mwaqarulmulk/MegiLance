from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging
import math

logger = logging.getLogger(__name__)

router = APIRouter()


class PlanRequest(BaseModel):
    project_type: str = "web_development"
    complexity: str = "medium"
    budget: float = 5000
    timeline_weeks: int = 8
    team_size: int = 1
    features: Optional[List[str]] = None


@router.get("/options")
def get_options():
    return {
        "categories": [
            {"key": "web_development", "label": "Web Development", "description": "Websites and web applications"},
            {"key": "mobile_development", "label": "Mobile Development", "description": "iOS and Android apps"},
            {"key": "ui_ux_design", "label": "UI/UX Design", "description": "User interface and experience design"},
            {"key": "data_science", "label": "Data Science", "description": "Analytics, ML, data pipelines"},
            {"key": "devops", "label": "DevOps & Infrastructure", "description": "CI/CD, cloud, automation"},
        ],
        "complexity_levels": [
            {"key": "simple", "label": "Simple", "multiplier": 0.7},
            {"key": "medium", "label": "Medium", "multiplier": 1.0},
            {"key": "complex", "label": "Complex", "multiplier": 1.5},
            {"key": "enterprise", "label": "Enterprise", "multiplier": 2.5},
        ],
        "team_roles": [
            {"key": "fullstack_dev", "label": "Full-Stack Developer", "default_rate": 50},
            {"key": "frontend_dev", "label": "Frontend Developer", "default_rate": 45},
            {"key": "backend_dev", "label": "Backend Developer", "default_rate": 50},
            {"key": "designer", "label": "UI/UX Designer", "default_rate": 40},
            {"key": "pm", "label": "Project Manager", "default_rate": 45},
        ],
    }


@router.post("/plan")
def plan_project(req: PlanRequest):
    now = datetime.now(timezone.utc)
    complexity_mult = {"simple": 0.7, "medium": 1.0, "complex": 1.5, "enterprise": 2.5}
    mult = complexity_mult.get(req.complexity, 1.0)

    phases = [
        {"name": "Discovery & Planning", "duration_pct": 0.1, "deliverables": ["Requirements doc", "Technical spec", "Project plan"]},
        {"name": "Design", "duration_pct": 0.15, "deliverables": ["Wireframes", "UI design", "Design system"]},
        {"name": "Development", "duration_pct": 0.5, "deliverables": ["Core features", "API integration", "Testing"]},
        {"name": "Testing & QA", "duration_pct": 0.15, "deliverables": ["Test plan", "Bug fixes", "Performance testing"]},
        {"name": "Deployment & Handoff", "duration_pct": 0.1, "deliverables": ["Production deployment", "Documentation", "Training"]},
    ]

    for p in phases:
        p["duration_weeks"] = round(req.timeline_weeks * p["duration_pct"], 1)
        p["status"] = "pending"

    labor_rate = 50
    labor_cost = labor_rate * 40 * req.timeline_weeks * req.team_size * mult
    risk_buffer = labor_cost * 0.15
    total_budget = labor_cost + risk_buffer

    phase_budgets = []
    for p in phases:
        pb = round(total_budget * p["duration_pct"], 2)
        phase_budgets.append({"phase": p["name"], "budget": pb})

    features_list = req.features or ["Authentication", "Dashboard", "API integration"]

    return {
        "project": {
            "type": req.project_type,
            "complexity": req.complexity,
            "budget": req.budget,
            "timeline_weeks": req.timeline_weeks,
        },
        "timeline": {"phases": phases, "total_weeks": req.timeline_weeks},
        "budget": {
            "labor_cost": round(labor_cost, 2),
            "risk_buffer": round(risk_buffer, 2),
            "total_estimated": round(total_budget, 2),
            "team_breakdown": [{"role": "Developer", "rate": labor_rate, "hours": 40 * req.timeline_weeks}],
            "phase_budgets": phase_budgets,
        },
        "resources": {
            "team_size": req.team_size,
            "total_hours": 40 * req.timeline_weeks * req.team_size,
            "hourly_rate": labor_rate,
        },
        "risks": [
            {"risk": "Scope creep", "probability": "high", "impact": "high", "mitigation": "Clear requirements and change process"},
            {"risk": "Technical debt", "probability": "medium", "impact": "medium", "mitigation": "Regular code reviews"},
        ],
        "features": [{"name": f, "priority": "high" if i < 2 else "medium"} for i, f in enumerate(features_list)],
        "deliverables": [d for p in phases for d in p["deliverables"]],
        "completeness": {"score": 75, "level": "good", "missing": []},
        "recommendations": [
            {"type": "budget", "detail": f"Estimated budget: ${round(total_budget, 2):,.2f}"},
            {"type": "timeline", "detail": f"Estimated timeline: {req.timeline_weeks} weeks"},
        ],
        "meta": {"project_type": req.project_type, "complexity": req.complexity, "calculated_at": now.isoformat()},
    }
