# @AI-HINT: Skill Analyzer router — skill gap analysis, learning path recommendations
from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone
import logging
import json

logger = logging.getLogger(__name__)

from app.core.security import get_current_user_optional
from app.db.turso_http import execute_query, parse_rows
from app.services.skill_analyzer_engine import (
    get_available_skills as engine_get_skills,
    analyze_skills as engine_analyze,
)

router = APIRouter()

# Skill category mappings for learning path recommendations
SKILL_CATEGORIES = {
    "frontend": ["React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Svelte"],
    "backend": ["Python", "Node.js", "FastAPI", "Django", "Express.js", "Go", "Rust", "Java", "C#", "Ruby on Rails"],
    "mobile": ["React Native", "Flutter", "Swift", "Kotlin", "Dart", "Ionic"],
    "data": ["Python", "R", "SQL", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Machine Learning", "Deep Learning"],
    "devops": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Nginx", "Jenkins"],
    "design": ["Figma", "Adobe XD", "Photoshop", "Illustrator", "UI/UX", "Wireframing", "Prototyping"],
    "blockchain": ["Solidity", "Ethereum", "Web3.js", "Rust", "Smart Contracts", "DeFi"],
    "database": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Turso", "SQLite"],
}

# Skill dependencies (prerequisites)
SKILL_DEPENDENCIES = {
    "React": ["JavaScript", "HTML", "CSS"],
    "Next.js": ["React", "JavaScript"],
    "Vue.js": ["JavaScript", "HTML", "CSS"],
    "Angular": ["TypeScript", "JavaScript"],
    "TypeScript": ["JavaScript"],
    "FastAPI": ["Python"],
    "Django": ["Python"],
    "React Native": ["React", "JavaScript"],
    "Flutter": ["Dart"],
    "TensorFlow": ["Python"],
    "PyTorch": ["Python"],
    "Kubernetes": ["Docker"],
    "Terraform": ["AWS"],
    "Smart Contracts": ["Solidity"],
    "Web3.js": ["JavaScript"],
    "Machine Learning": ["Python", "NumPy", "Pandas"],
}


def _get_skill_category(skill: str) -> Optional[str]:
    for cat, skills in SKILL_CATEGORIES.items():
        if skill in skills:
            return cat
    return None


def _analyze_skill_gaps(user_skills: List[str], target_role: Optional[str] = None) -> dict:
    """Analyze gaps between user's current skills and market demands."""
    # Get market demand data
    result = execute_query(
        """SELECT skills, COUNT(*) as cnt FROM proposals p
           JOIN users u ON p.freelancer_id = u.id
           WHERE p.created_at > datetime('now', '-30 days')
           GROUP BY skills ORDER BY cnt DESC""",
        [],
    )
    rows = parse_rows(result) or []
    demand_count = {}
    for row in rows:
        try:
            for s in json.loads(row["skills"] or "[]"):
                demand_count[s] = demand_count.get(s, 0) + row["cnt"]
        except (json.JSONDecodeError, TypeError):
            pass

    # Get supply data
    result = execute_query(
        """SELECT skills, COUNT(*) as cnt FROM users
           WHERE user_type = 'freelancer' AND is_active = 1
           GROUP BY skills""",
        [],
    )
    rows = parse_rows(result) or []
    supply_count = {}
    for row in rows:
        try:
            for s in json.loads(row["skills"] or "[]"):
                supply_count[s] = supply_count.get(s, 0) + row["cnt"]
        except (json.JSONDecodeError, TypeError):
            pass

    user_set = set(user_skills)

    # Identify gaps: high demand but user doesn't have
    gaps = []
    for skill, demand in demand_count.items():
        if skill not in user_set:
            supply = supply_count.get(skill, 0)
            competition = supply / max(demand, 1)
            gaps.append({
                "skill": skill,
                "demand": demand,
                "supply": supply,
                "competition_ratio": round(competition, 2),
                "opportunity_score": round(demand / max(supply, 1), 2),
            })

    gaps.sort(key=lambda x: x["opportunity_score"], reverse=True)

    # Strengths: skills user has that are in demand
    strengths = []
    for skill in user_set:
        demand = demand_count.get(skill, 0)
        supply = supply_count.get(skill, 0)
        if demand > 0:
            strengths.append({
                "skill": skill,
                "demand": demand,
                "supply": supply,
                "market_value": round(demand / max(supply, 1), 2),
            })

    strengths.sort(key=lambda x: x["market_value"], reverse=True)

    # Category coverage
    category_coverage = {}
    for cat, cat_skills in SKILL_CATEGORIES.items():
        user_in_cat = sum(1 for s in user_set if s in cat_skills)
        total = len(cat_skills)
        category_coverage[cat] = {
            "covered": user_in_cat,
            "total": total,
            "percentage": round(user_in_cat / max(total, 1) * 100, 1),
        }

    return {
        "skill_gaps": gaps[:10],
        "strengths": strengths[:10],
        "category_coverage": category_coverage,
        "total_skills": len(user_set),
        "market_demand_skills": len(demand_count),
    }


def _learning_path(user_skills: List[str], target_skills: List[str]) -> dict:
    """Generate a learning path from current skills to target skills."""
    user_set = set(user_skills)
    target_set = set(target_skills) - user_set  # Only skills they don't have

    if not target_set:
        return {
            "already_has": list(user_skills),
            "learning_path": [],
            "estimated_hours": 0,
        }

    # Build dependency chain
    path = []
    visited = set()
    estimated_hours = 0

    HOURS_ESTIMATES = {
        "JavaScript": 60, "TypeScript": 40, "React": 50, "Next.js": 40,
        "Vue.js": 40, "Angular": 60, "Python": 50, "FastAPI": 30,
        "Django": 40, "Node.js": 40, "Docker": 20, "Kubernetes": 40,
        "AWS": 60, "SQL": 30, "PostgreSQL": 30, "MongoDB": 25,
        "Figma": 20, "React Native": 50, "Flutter": 50,
        "TensorFlow": 80, "PyTorch": 80, "Machine Learning": 100,
        "Tailwind CSS": 15, "Go": 60, "Rust": 80, "Solidity": 40,
    }

    def _add_with_deps(skill, chain):
        if skill in visited or skill in user_set:
            return
        visited.add(skill)

        # Add prerequisites first
        for dep in SKILL_DEPENDENCIES.get(skill, []):
            if dep not in user_set and dep not in visited:
                _add_with_deps(dep, chain)

        chain.append({
            "skill": skill,
            "estimated_hours": HOURS_ESTIMATES.get(skill, 30),
            "category": _get_skill_category(skill),
        })

    for skill in sorted(target_set):
        _add_with_deps(skill, path)

    total_hours = sum(s["estimated_hours"] for s in path)

    return {
        "current_skills": list(user_set),
        "target_skills": list(target_set),
        "learning_path": path,
        "estimated_hours": total_hours,
        "estimated_weeks": round(total_hours / 5, 1),  # ~5 hours/week
    }


@router.get("/skills")
def list_skill_categories():
    """Return all analyzable skills grouped by category for the frontend UI.

    Backed by the market-data engine so the keys returned here match the keys
    the /analyze endpoint expects (the SkillAnalyzer wizard sends them back).
    """
    return engine_get_skills()


from pydantic import BaseModel as _BaseModel

class AnalyzeRequest(_BaseModel):
    skills: List[str] = []
    experience_level: str = "mid"
    country_code: Optional[str] = None
    target_role: Optional[str] = None


def _map_synergy(syn: dict) -> dict:
    """Adapt an engine synergy to the shape the SkillAnalyzer UI expects."""
    missing = syn.get("missing_skills", [])
    all_skills = syn.get("skills", [])
    return {
        "label": syn.get("label", ""),
        "skills_present": [s for s in all_skills if s not in missing],
        "skills_needed": missing,
        "current_match": syn.get("matched_count", 0),
        "total": syn.get("total_count", len(all_skills)),
        "rate_premium": syn.get("rate_premium", 1.0),
        "description": syn.get("description", ""),
    }


@router.post("/analyze")
def analyze_skills(req: AnalyzeRequest, current_user=Depends(get_current_user_optional)):
    """Full skill analysis: profile score, gaps, synergies, recommendations.

    Delegates to the market-data engine (skill_analyzer_engine) which produces
    the rich response shape the SkillAnalyzer wizard renders. Guest-accessible.
    """
    user_skills = req.skills
    if not user_skills and current_user is not None:
        # Fall back to the user's saved skills only for logged-in users
        result = execute_query("SELECT skills FROM users WHERE id = ?", [current_user.id])
        rows = parse_rows(result) if result else []
        if rows:
            raw = rows[0].get("skills", "") or ""
            try:
                user_skills = json.loads(raw)
            except (json.JSONDecodeError, TypeError):
                # skills may be stored as a comma-separated string
                user_skills = [s.strip() for s in raw.split(",") if s.strip()]

    analysis = engine_analyze(
        user_skills=user_skills,
        experience_level=req.experience_level,
        country_code=req.country_code,
        target_role=req.target_role,
    )

    # Map synergies to the UI contract and guarantee regional_context is an
    # object (the UI calls Object.entries on it and would crash on null).
    analysis["synergies"] = [_map_synergy(s) for s in analysis.get("synergies", [])]
    if analysis.get("regional_context") is None:
        analysis["regional_context"] = {}

    return analysis


@router.get("/gaps/{user_id}")
def skill_gaps(user_id: int, current_user=Depends(get_current_user_optional)):
    """Analyze skill gaps for a freelancer. Guest-accessible for public profiles."""
    result = execute_query("SELECT skills FROM users WHERE id = ?", [user_id])
    rows = parse_rows(result)
    if not rows:
        return {"error": "User not found"}

    user_skills = []
    try:
        user_skills = json.loads(rows[0].get("skills", "[]") or "[]")
    except (json.JSONDecodeError, TypeError):
        pass

    return {"user_id": user_id, **_analyze_skill_gaps(user_skills)}


@router.get("/gaps")
def my_skill_gaps(current_user=Depends(get_current_user_optional)):
    """Analyze skill gaps for the current user. Returns empty for guests."""
    if current_user is None:
        return {"user_id": None, "skill_gaps": [], "strengths": [], "category_coverage": {}, "total_skills": 0, "message": "Sign in to see your personal skill gaps"}
    result = execute_query("SELECT skills FROM users WHERE id = ?", [current_user.id])
    rows = parse_rows(result)
    user_skills = []
    try:
        user_skills = json.loads(rows[0].get("skills", "[]") or "[]")
    except (json.JSONDecodeError, TypeError):
        pass

    return {"user_id": current_user.id, **_analyze_skill_gaps(user_skills)}


@router.get("/learning-path/{user_id}")
def get_learning_path(
    user_id: int,
    target_skills: str = Query(..., description="Comma-separated target skills"),
    current_user=Depends(get_current_user_optional),
):
    """Generate a learning path to acquire target skills."""
    result = execute_query("SELECT skills FROM users WHERE id = ?", [user_id])
    rows = parse_rows(result)
    if not rows:
        return {"error": "User not found"}

    user_skills = []
    try:
        user_skills = json.loads(rows[0].get("skills", "[]") or "[]")
    except (json.JSONDecodeError, TypeError):
        pass

    targets = [s.strip() for s in target_skills.split(",") if s.strip()]
    return {"user_id": user_id, **_learning_path(user_skills, targets)}


@router.get("/compare")
def compare_skills(
    skill_a: str = Query(...),
    skill_b: str = Query(...),
    current_user=Depends(get_current_user_optional),
):
    """Compare two skills by market demand and supply."""
    result = execute_query(
        """SELECT skills, COUNT(*) as cnt FROM proposals p
           JOIN users u ON p.freelancer_id = u.id
           WHERE p.created_at > datetime('now', '-30 days')
           GROUP BY skills""",
        [],
    )
    rows = parse_rows(result) or []
    demand = {}
    for row in rows:
        try:
            for s in json.loads(row["skills"] or "[]"):
                demand[s] = demand.get(s, 0) + row["cnt"]
        except (json.JSONDecodeError, TypeError):
            pass

    result = execute_query(
        """SELECT skills, COUNT(*) as cnt FROM users
           WHERE user_type = 'freelancer' AND is_active = 1
           GROUP BY skills""",
        [],
    )
    rows = parse_rows(result) or []
    supply = {}
    for row in rows:
        try:
            for s in json.loads(row["skills"] or "[]"):
                supply[s] = supply.get(s, 0) + row["cnt"]
        except (json.JSONDecodeError, TypeError):
            pass

    def _skill_stat(skill):
        d = demand.get(skill, 0)
        s = supply.get(skill, 0)
        return {
            "skill": skill,
            "demand": d,
            "supply": s,
            "competition_ratio": round(s / max(d, 1), 2),
            "opportunity_score": round(d / max(s, 1), 2),
        }

    return {
        "skill_a": _skill_stat(skill_a),
        "skill_b": _skill_stat(skill_b),
        "recommendation": skill_a if _skill_stat(skill_a)["opportunity_score"] > _skill_stat(skill_b)["opportunity_score"] else skill_b,
    }
