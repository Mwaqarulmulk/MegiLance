from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import logging
import math

logger = logging.getLogger(__name__)

router = APIRouter()


class TeamMemberRequest(BaseModel):
    role: str = "developer"
    rate: Optional[float] = None
    hours_per_week: int = 40


class PlanRequest(BaseModel):
    project_name: str = "Untitled Project"
    category: str = "web_app"
    description: str = ""
    complexity: str = "moderate"
    total_weeks: int = 12
    start_date: str = ""
    total_budget: Optional[float] = None
    currency: str = "USD"
    hourly_rate: float = 75
    risk_buffer_percent: float = 15
    team_members: Optional[List[TeamMemberRequest]] = None
    features: Optional[List[str]] = None
    deliverables: Optional[List[str]] = None


CATEGORY_LABELS = {
    "web_app": "Web Application",
    "mobile_app": "Mobile Application",
    "ecommerce": "E-Commerce Platform",
    "branding": "Branding & Identity",
    "marketing": "Marketing Campaign",
    "data_science": "Data Science & Analytics",
    "devops": "DevOps & Infrastructure",
    "ui_ux": "UI/UX Design",
    "api_backend": "API & Backend Services",
}

COMPLEXITY_LABELS = {
    "simple": "Simple",
    "moderate": "Moderate",
    "complex": "Complex",
    "enterprise": "Enterprise",
}

COMPLEXITY_MULTIPLIERS = {
    "simple": 0.7,
    "moderate": 1.0,
    "complex": 1.5,
    "enterprise": 2.5,
}

ROLE_LABELS = {
    "developer": "Developer",
    "frontend_dev": "Frontend Developer",
    "backend_dev": "Backend Developer",
    "fullstack_dev": "Full-Stack Developer",
    "designer": "UI/UX Designer",
    "pm": "Project Manager",
    "qa": "QA Engineer",
    "devops": "DevOps Engineer",
}


@router.get("/options")
def get_options():
    return {
        "categories": [
            {"key": "web_app", "label": "Web Application", "description": "Websites and web applications"},
            {"key": "mobile_app", "label": "Mobile Application", "description": "iOS and Android apps"},
            {"key": "ecommerce", "label": "E-Commerce Platform", "description": "Online stores and marketplaces"},
            {"key": "branding", "label": "Branding & Identity", "description": "Brand strategy, logos, visual identity"},
            {"key": "marketing", "label": "Marketing Campaign", "description": "Digital marketing and advertising"},
            {"key": "data_science", "label": "Data Science & Analytics", "description": "Analytics, ML, data pipelines"},
            {"key": "devops", "label": "DevOps & Infrastructure", "description": "CI/CD, cloud, automation"},
            {"key": "ui_ux", "label": "UI/UX Design", "description": "User interface and experience design"},
            {"key": "api_backend", "label": "API & Backend Services", "description": "REST/GraphQL APIs, microservices"},
        ],
        "complexity_levels": [
            {"key": "simple", "label": "Simple", "multiplier": 0.7},
            {"key": "moderate", "label": "Moderate", "multiplier": 1.0},
            {"key": "complex", "label": "Complex", "multiplier": 1.5},
            {"key": "enterprise", "label": "Enterprise", "multiplier": 2.5},
        ],
        "team_roles": [
            {"key": "developer", "label": "Developer", "default_rate": 50},
            {"key": "frontend_dev", "label": "Frontend Developer", "default_rate": 45},
            {"key": "backend_dev", "label": "Backend Developer", "default_rate": 50},
            {"key": "fullstack_dev", "label": "Full-Stack Developer", "default_rate": 55},
            {"key": "designer", "label": "UI/UX Designer", "default_rate": 40},
            {"key": "pm", "label": "Project Manager", "default_rate": 45},
            {"key": "qa", "label": "QA Engineer", "default_rate": 35},
            {"key": "devops", "label": "DevOps Engineer", "default_rate": 55},
        ],
    }


@router.post("/plan")
def plan_project(req: PlanRequest):
    now = datetime.now(timezone.utc)
    start = datetime.strptime(req.start_date, "%Y-%m-%d") if req.start_date else now
    complexity_mult = COMPLEXITY_MULTIPLIERS.get(req.complexity, 1.0)
    total_weeks = req.total_weeks or 12
    hourly_rate = req.hourly_rate or 75
    risk_buffer_pct = req.risk_buffer_percent or 15

    # Build team
    team_members = req.team_members or []
    if not team_members:
        team_members = [TeamMemberRequest(role="developer", rate=hourly_rate, hours_per_week=40)]

    # Phase definitions by category
    phase_templates = [
        {"name": "Discovery & Planning", "pct": 0.10, "description": "Requirements gathering, stakeholder interviews, technical research, and project planning"},
        {"name": "Design", "pct": 0.15, "description": "Wireframing, UI design, prototyping, design system creation, and stakeholder review"},
        {"name": "Development", "pct": 0.50, "description": "Core feature implementation, API integration, database design, and unit testing"},
        {"name": "Testing & QA", "pct": 0.15, "description": "Integration testing, performance testing, bug fixes, and quality assurance"},
        {"name": "Deployment & Handoff", "pct": 0.10, "description": "Production deployment, documentation, training, and project handoff"},
    ]

    phases = []
    week_counter = 1
    for i, pt in enumerate(phase_templates):
        weeks = max(1, round(total_weeks * pt["pct"]))
        if i == len(phase_templates) - 1:
            weeks = total_weeks - sum(p["weeks"] for p in phases)
        phases.append({
            "number": i + 1,
            "name": pt["name"],
            "weeks": weeks,
            "start_week": week_counter,
            "end_week": week_counter + weeks - 1,
            "description": pt["description"],
            "percent_of_total": round(pt["pct"] * 100),
            "status": "pending",
        })
        week_counter += weeks

    # Budget calculations
    team_breakdown = []
    total_labor = 0
    for m in team_members:
        rate = m.rate if m.rate and m.rate > 0 else hourly_rate
        hours = m.hours_per_week * total_weeks
        cost = rate * hours * complexity_mult
        total_labor += cost
        team_breakdown.append({
            "role": ROLE_LABELS.get(m.role, m.role),
            "rate": rate,
            "total_hours": hours,
            "cost": round(cost, 2),
        })

    risk_buffer = total_labor * (risk_buffer_pct / 100)
    total = total_labor + risk_buffer
    monthly_burn = total / (total_weeks / 4.33) if total_weeks > 0 else 0

    phase_budgets = []
    for p in phases:
        pb = round(total * (p["percent_of_total"] / 100), 2)
        phase_budgets.append({"phase": p["name"], "budget": pb, "percent": p["percent_of_total"]})

    budget_status = "within_budget" if not req.total_budget or total <= req.total_budget else "over_budget"

    # Resource allocation
    allocation = []
    for p in phases:
        resources = []
        for m in team_members:
            role_label = ROLE_LABELS.get(m.role, m.role)
            resources.append({
                "role": role_label,
                "involvement_percent": round(100 * p["percent_of_total"] / 100),
                "hours": round(m.hours_per_week * p["weeks"]),
            })
        allocation.append({"phase": p["name"], "resources": resources})

    # Risk assessment
    risks = []
    if req.total_budget and total > req.total_budget:
        risks.append({"category": "Budget", "severity": "high", "title": "Budget Overrun", "message": f"Estimated budget ({req.currency} {total:,.2f}) exceeds your target ({req.currency} {req.total_budget:,.2f})", "mitigation": "Reduce scope, negotiate rates, or extend timeline"})
    if total_weeks < 4 and complexity_mult > 1.2:
        risks.append({"category": "Timeline", "severity": "high", "title": "Aggressive Timeline", "message": f"Complex project in {total_weeks} weeks may lead to quality issues", "mitigation": "Extend timeline or reduce complexity"})
    risks.append({"category": "Scope", "severity": "medium", "title": "Scope Creep", "message": "Requirements may expand beyond initial agreement", "mitigation": "Clear requirements document and formal change request process"})
    risks.append({"category": "Technical", "severity": "medium", "title": "Technical Debt", "message": "Rapid development may accumulate technical debt", "mitigation": "Regular code reviews, testing, and refactoring sprints"})
    if len(team_members) > 3:
        risks.append({"category": "Communication", "severity": "low", "title": "Team Coordination", "message": "Larger teams require more coordination overhead", "mitigation": "Daily standups, clear communication channels, and project management tools"})
    risks.append({"category": "Dependencies", "severity": "low", "title": "External Dependencies", "message": "Third-party services or APIs may cause delays", "mitigation": "Identify dependencies early, have fallback options"})

    features_list = req.features or ["Authentication", "Dashboard", "API integration"]
    deliverables_list = req.deliverables or [d for p in phases for d in [p["name"]]]

    # Completeness score
    completeness_factors = []
    score = 0
    if req.project_name and req.project_name != "Untitled Project":
        score += 20
        completeness_factors.append({"factor": "Project name provided", "points": 20})
    if req.description:
        score += 20
        completeness_factors.append({"factor": "Description provided", "points": 20})
    if req.total_budget:
        score += 15
        completeness_factors.append({"factor": "Budget defined", "points": 15})
    if req.start_date:
        score += 10
        completeness_factors.append({"factor": "Start date set", "points": 10})
    if len(team_members) > 0 and any(m.rate for m in team_members):
        score += 15
        completeness_factors.append({"factor": "Team rates specified", "points": 15})
    if features_list:
        score += 10
        completeness_factors.append({"factor": "Features listed", "points": 10})
    if deliverables_list:
        score += 10
        completeness_factors.append({"factor": "Deliverables defined", "points": 10})
    completeness_level = "excellent" if score >= 85 else "good" if score >= 65 else "needs_improvement"

    # Recommendations
    recommendations = []
    if not req.total_budget:
        recommendations.append({"type": "warning", "title": "Set a Budget", "message": "Defining a budget helps manage expectations and prevent scope creep"})
    if not req.start_date:
        recommendations.append({"type": "info", "title": "Set a Start Date", "message": "A start date helps with resource scheduling and deadline tracking"})
    if complexity_mult >= 1.5 and total_weeks < 8:
        recommendations.append({"type": "warning", "title": "Extend Timeline", "message": "Complex projects benefit from longer timelines to ensure quality"})
    if len(team_members) < 2 and complexity_mult > 1.0:
        recommendations.append({"type": "info", "title": "Consider More Resources", "message": "Adding team members can help meet deadlines for complex projects"})
    if risk_buffer_pct < 10:
        recommendations.append({"type": "warning", "title": "Increase Risk Buffer", "message": "A 10-20% risk buffer is recommended for most projects"})
    recommendations.append({"type": "success", "title": "Good Foundation", "message": "Your project plan covers the key areas for a successful delivery"})

    return {
        "project": {
            "name": req.project_name,
            "category": req.category,
            "category_label": CATEGORY_LABELS.get(req.category, req.category),
            "complexity": req.complexity,
            "complexity_label": COMPLEXITY_LABELS.get(req.complexity, req.complexity),
            "multiplier": complexity_mult,
        },
        "timeline": {
            "total_weeks": total_weeks,
            "total_months": round(total_weeks / 4.33, 1),
            "start_date": req.start_date or now.strftime("%Y-%m-%d"),
            "phases": phases,
        },
        "budget": {
            "labor_cost": round(total_labor, 2),
            "risk_buffer": round(risk_buffer, 2),
            "risk_buffer_percent": risk_buffer_pct,
            "total": round(total, 2),
            "team_breakdown": team_breakdown,
            "phase_budgets": phase_budgets,
            "budget_status": budget_status,
            "monthly_burn_rate": round(monthly_burn, 2),
            "currency": req.currency,
        },
        "resources": {
            "team_size": len(team_members),
            "allocation": allocation,
        },
        "risks": risks,
        "features": [{"feature": f, "phase": phases[min(i, len(phases) - 1)]["name"]} for i, f in enumerate(features_list)],
        "deliverables": deliverables_list,
        "completeness": {
            "score": score,
            "level": completeness_level,
            "factors": completeness_factors,
        },
        "recommendations": recommendations,
        "meta": {
            "currency": req.currency,
            "generated_at": now.isoformat(),
        },
    }
