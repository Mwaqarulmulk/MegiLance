# @AI-HINT: Agentic AI Client Assistant — tool-calling LLM that can search freelancers,
# estimate costs, plan project scope, and guide clients through the MegiLance platform.
"""
Agentic AI Client Assistant
============================
POST /api/ai/client-assistant/chat    — Conversational endpoint with LLM tool calling
POST /api/ai/client-assistant/welcome — Personalised welcome message for clients

Uses DigitalOcean AI (llama3.3-70b-instruct) with OpenAI-compatible tool calling to
perform real actions: search freelancers in the DB, estimate project costs via AI,
plan project milestones, and surface live market-rate data.
"""

import json
import logging
import re
from datetime import datetime, timezone
from typing import Optional

import httpx
from app.core.security import get_current_active_user, get_current_user_optional
from app.db.turso_http import get_turso_http
from app.services.llm_gateway import llm_gateway
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

router = APIRouter(prefix="/client-assistant", tags=["AI Client Assistant"])
logger = logging.getLogger(__name__)


# ============================================================================
# Request / Response Models
# ============================================================================


class ConversationMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    tool_results: Optional[list] = None


class ClientAssistantRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=3000)
    conversation_history: list[ConversationMessage] = []
    page_context: Optional[str] = None  # e.g. current URL / page name
    client_id: Optional[int] = None  # Used to pull client-specific data


class ToolResult(BaseModel):
    tool_name: str
    data: dict
    display_type: str  # "freelancer_cards" | "cost_estimate" | "market_rates" | "scope_plan" | "text"


class ClientAssistantResponse(BaseModel):
    message: str
    reply: Optional[str] = None  # Legacy alias; populated automatically
    tool_results: list[ToolResult] = []
    suggestions: list[str] = []  # Quick-reply chips for the UI
    action_buttons: list[dict] = []  # {"label": "...", "href": "...", "variant": "..."}
    intent: Optional[str] = None


# ============================================================================
# System Prompt
# ============================================================================

SYSTEM_PROMPT = """You are Megi, the intelligent AI assistant for MegiLance — a professional freelancing platform.

You are an AGENTIC assistant for CLIENTS (businesses and individuals who hire freelancers). You can:
1. SEARCH for freelancers matching specific skills, budget, and rating requirements
2. ESTIMATE project costs based on scope, complexity, and market rates
3. PLAN project scope — milestones, deliverables, timelines
4. PROVIDE market intelligence on freelancer rates and skill availability
5. GUIDE clients through platform features (posting projects, escrow, reviews)

PERSONALITY: Professional, warm, data-driven, and concise. Use emojis sparingly but effectively.
RESPONSE FORMAT: Keep replies focused and actionable. Use markdown for lists.

TOOLS AVAILABLE:
- search_freelancers   — Find freelancers by skills, budget, rating
- estimate_project_cost — Get AI-powered cost and timeline estimates
- get_market_rates     — Surface current USD/hour market rates for any skill
- plan_project_scope   — Break a project into milestones and deliverables

Decision rules:
• User asks to find / hire / search for talent  → call search_freelancers
• User asks about cost / budget / price         → call estimate_project_cost
• User asks about rates for a skill             → call get_market_rates
• User describes a project needing structure    → call plan_project_scope

Platform context:
- MegiLance charges a 10-20 % platform fee (tiered by contract value)
- Escrow payment system: funds released only after client approves work
- Freelancers are vetted and rated by past clients
- Smart matching AI ranks candidates by skills + historical success rate"""


# ============================================================================
# Tool Definitions  (OpenAI-compatible format for DO AI API)
# ============================================================================

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_freelancers",
            "description": (
                "Search for freelancers who match the required skills, budget, and rating. "
                "Call this whenever the client wants to find, browse, or hire someone."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "skills": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Required skills e.g. ['React', 'Node.js', 'Python']",
                    },
                    "max_hourly_rate": {
                        "type": "number",
                        "description": "Maximum hourly rate in USD",
                    },
                    "min_rating": {
                        "type": "number",
                        "description": "Minimum star rating between 1 and 5",
                    },
                    "experience_level": {
                        "type": "string",
                        "enum": ["entry", "intermediate", "expert"],
                        "description": "Required experience level",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Number of results to return (default 5, max 10)",
                    },
                },
                "required": ["skills"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "estimate_project_cost",
            "description": (
                "Estimate the cost and timeline for a project from its description and scope. "
                "Call this when the client asks about budget, price, or cost."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "project_type": {
                        "type": "string",
                        "description": "Type of project e.g. 'web app', 'mobile app', 'logo design'",
                    },
                    "description": {
                        "type": "string",
                        "description": "Brief description of the project and its requirements",
                    },
                    "skills_required": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Skills needed for this project",
                    },
                    "complexity": {
                        "type": "string",
                        "enum": ["simple", "medium", "complex", "enterprise"],
                        "description": "Project complexity level",
                    },
                },
                "required": ["project_type", "description"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_market_rates",
            "description": (
                "Get current USD/hour market rates for a specific skill or job type. "
                "Call this when the client asks what they should pay or what rates are typical."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "skill": {
                        "type": "string",
                        "description": "Skill name e.g. 'Python', 'UI Design', 'React', 'Copywriting'",
                    },
                    "level": {
                        "type": "string",
                        "enum": ["junior", "mid", "senior", "expert"],
                        "description": "Experience level for the rate lookup",
                    },
                },
                "required": ["skill"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "plan_project_scope",
            "description": (
                "Break a project into milestones, deliverables, and a timeline. "
                "Call when the client describes a project and needs help planning or structuring it."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "project_description": {
                        "type": "string",
                        "description": "Detailed description of the project to plan",
                    },
                    "budget": {
                        "type": "number",
                        "description": "Total available budget in USD",
                    },
                    "timeline_weeks": {
                        "type": "integer",
                        "description": "Desired completion timeline in weeks",
                    },
                },
                "required": ["project_description"],
            },
        },
    },
]


# ============================================================================
# Tool Execution Functions
# ============================================================================


async def _tool_search_freelancers(
    skills: list,
    max_hourly_rate: Optional[float] = None,
    min_rating: Optional[float] = None,
    experience_level: Optional[str] = None,
    limit: int = 5,
) -> dict:
    """Query Turso for freelancers that match the given criteria."""
    try:
        turso = get_turso_http()
        where_clauses = ["user_type = 'freelancer'", "is_active = 1"]
        params: list = []

        if max_hourly_rate is not None:
            where_clauses.append("hourly_rate <= ?")
            params.append(max_hourly_rate)

        if min_rating is not None:
            where_clauses.append("rating >= ?")
            params.append(min_rating)

        if experience_level:
            where_clauses.append("experience_level = ?")
            params.append(experience_level)

        # Skill matching: LIKE search on the skills column (stored as JSON or CSV)
        if skills:
            skill_clauses = []
            for skill in skills[:3]:  # Cap at 3 to keep the query simple
                skill_clauses.append("skills LIKE ?")
                params.append(f"%{skill}%")
            where_clauses.append(f"({' OR '.join(skill_clauses)})")

        where_sql = " AND ".join(where_clauses)
        safe_limit = max(1, min(int(limit), 10))

        result = turso.execute(
            f"""SELECT id, name, profile_image_url, bio, hourly_rate,
                       headline, location, skills, rating, experience_level
                FROM users
                WHERE {where_sql}
                ORDER BY rating DESC NULLS LAST
                LIMIT ?""",
            params + [safe_limit],
        )

        columns = result.get("columns", [])
        rows = result.get("rows", [])

        freelancers = []
        for row in rows:
            item = dict(zip(columns, row))

            # Normalise skills field: JSON array string → Python list
            raw_skills = item.get("skills")
            if raw_skills:
                try:
                    if isinstance(raw_skills, str) and raw_skills.startswith("["):
                        item["skills"] = json.loads(raw_skills)
                    elif isinstance(raw_skills, str):
                        item["skills"] = [
                            s.strip() for s in raw_skills.split(",") if s.strip()
                        ]
                except (json.JSONDecodeError, AttributeError):
                    item["skills"] = []
            else:
                item["skills"] = []

            freelancers.append(item)

        return {
            "freelancers": freelancers,
            "total_found": len(freelancers),
            "search_criteria": {
                "skills": skills,
                "max_rate": max_hourly_rate,
                "min_rating": min_rating,
                "experience_level": experience_level,
            },
        }

    except Exception as exc:
        logger.error("_tool_search_freelancers error: %s", exc, exc_info=True)
        return {"freelancers": [], "total_found": 0, "error": str(exc)}


async def _tool_estimate_cost(
    project_type: str,
    description: str,
    skills_required: Optional[list] = None,
    complexity: str = "medium",
) -> dict:
    """Estimate project cost using market benchmarks + LLM-generated phase breakdown."""
    _complexity_map = {
        "simple": {"min": 500, "max": 2_000, "timeline": "1–2 weeks"},
        "medium": {"min": 2_000, "max": 10_000, "timeline": "2–6 weeks"},
        "complex": {"min": 10_000, "max": 50_000, "timeline": "2–6 months"},
        "enterprise": {"min": 50_000, "max": 200_000, "timeline": "6+ months"},
    }
    base = _complexity_map.get(complexity, _complexity_map["medium"])

    # Ask the LLM to generate a structured cost breakdown
    breakdown_prompt = (
        f'For a {project_type} project: "{description}"\n'
        f"Skills needed: {skills_required or ['general']}\n"
        f"Complexity: {complexity}\n\n"
        "Produce a JSON cost breakdown with this exact shape:\n"
        '{"phases":[{"name":"...","description":"...","cost_min":N,"cost_max":N,"weeks":N}],'
        '"total_min":N,"total_max":N,"key_risks":["..."],"tips":["..."]}\n\n'
        "Return ONLY valid JSON — no extra text."
    )

    try:
        ai_text = await llm_gateway.generate_text(
            breakdown_prompt, max_tokens=800, temperature=0.3
        )
        json_match = re.search(r"\{.*\}", ai_text, re.DOTALL)
        if json_match:
            breakdown = json.loads(json_match.group())
            return {**breakdown, "project_type": project_type, "complexity": complexity}
    except Exception as exc:
        logger.warning("Cost estimate AI breakdown failed, using fallback: %s", exc)

    # Pure market-rate fallback
    return {
        "project_type": project_type,
        "complexity": complexity,
        "total_min": base["min"],
        "total_max": base["max"],
        "estimated_timeline": base["timeline"],
        "notes": (
            "Estimate based on market benchmarks. "
            "Actual cost depends on specific requirements and freelancer rates."
        ),
    }


async def _tool_get_market_rates(skill: str, level: str = "mid") -> dict:
    """Return USD/hour market rates for the given skill and experience level."""
    _rates_db: dict[str, dict] = {
        "react": {"junior": 35, "mid": 65, "senior": 110, "expert": 175},
        "vue": {"junior": 30, "mid": 60, "senior": 100, "expert": 165},
        "angular": {"junior": 30, "mid": 60, "senior": 100, "expert": 160},
        "python": {"junior": 30, "mid": 60, "senior": 105, "expert": 170},
        "node.js": {"junior": 35, "mid": 65, "senior": 110, "expert": 175},
        "typescript": {"junior": 35, "mid": 65, "senior": 110, "expert": 175},
        "javascript": {"junior": 30, "mid": 58, "senior": 100, "expert": 165},
        "ui/ux design": {"junior": 25, "mid": 55, "senior": 95, "expert": 150},
        "graphic design": {"junior": 20, "mid": 45, "senior": 85, "expert": 150},
        "mobile app": {"junior": 40, "mid": 75, "senior": 130, "expert": 200},
        "flutter": {"junior": 35, "mid": 70, "senior": 120, "expert": 190},
        "react native": {"junior": 35, "mid": 70, "senior": 120, "expert": 190},
        "devops": {"junior": 40, "mid": 75, "senior": 135, "expert": 220},
        "data science": {"junior": 45, "mid": 85, "senior": 150, "expert": 250},
        "machine learning": {"junior": 50, "mid": 90, "senior": 160, "expert": 280},
        "wordpress": {"junior": 20, "mid": 40, "senior": 70, "expert": 110},
        "shopify": {"junior": 25, "mid": 50, "senior": 85, "expert": 140},
        "copywriting": {"junior": 15, "mid": 35, "senior": 60, "expert": 100},
        "seo": {"junior": 25, "mid": 50, "senior": 100, "expert": 175},
        "blockchain": {"junior": 50, "mid": 95, "senior": 170, "expert": 320},
        "aws": {"junior": 40, "mid": 80, "senior": 140, "expert": 230},
        "docker": {"junior": 35, "mid": 70, "senior": 120, "expert": 190},
        "kubernetes": {"junior": 45, "mid": 85, "senior": 145, "expert": 230},
    }

    skill_key = skill.lower().strip()
    rates = _rates_db.get(skill_key)

    # Fuzzy match: check if any known key is a substring of (or matches) the input
    if rates is None:
        for key, val in _rates_db.items():
            if key in skill_key or skill_key in key:
                rates = val
                break

    # Ultimate fallback — generic knowledge-worker rates
    if rates is None:
        rates = {"junior": 25, "mid": 50, "senior": 90, "expert": 150}

    safe_level = level if level in rates else "mid"

    return {
        "skill": skill,
        "rates_usd_per_hour": rates,
        "requested_level": level,
        "rate_for_level": rates[safe_level],
        "market_insight": f"Strong demand for {skill} professionals in 2025.",
        "availability": "good",
    }


async def _tool_plan_scope(
    project_description: str,
    budget: Optional[float] = None,
    timeline_weeks: Optional[int] = None,
) -> dict:
    """Use the LLM to produce a structured milestone plan for the described project."""
    budget_line = f"Budget: ${budget:,.0f}" if budget else ""
    timeline_line = (
        f"Desired timeline: {timeline_weeks} weeks" if timeline_weeks else ""
    )

    prompt = (
        f'Create a detailed project scope plan for:\n"{project_description}"\n'
        f"{budget_line}\n{timeline_line}\n\n"
        "Return JSON with this exact shape:\n"
        '{"milestones":[{"week":N,"title":"...","deliverables":["..."],"description":"..."}],'
        '"total_weeks":N,"recommended_team":["..."],"key_risks":["..."],"success_criteria":["..."]}\n\n'
        "Return ONLY valid JSON — no extra text."
    )

    try:
        response = await llm_gateway.generate_text(
            prompt, max_tokens=1000, temperature=0.4
        )
        json_match = re.search(r"\{.*\}", response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except Exception as exc:
        logger.warning("Plan scope AI call failed, using fallback: %s", exc)

    # Static 4-week fallback plan
    return {
        "milestones": [
            {
                "week": 1,
                "title": "Discovery & Planning",
                "deliverables": [
                    "Requirements document",
                    "Tech stack decision",
                    "Project timeline",
                ],
                "description": "Define scope, architecture, and success criteria.",
            },
            {
                "week": 2,
                "title": "Core Development",
                "deliverables": ["Core feature implementation", "API integrations"],
                "description": "Build the foundational features.",
            },
            {
                "week": 3,
                "title": "Testing & Refinement",
                "deliverables": ["QA report", "Bug fixes", "Performance tuning"],
                "description": "Thorough testing and polishing.",
            },
            {
                "week": 4,
                "title": "Launch & Handover",
                "deliverables": [
                    "Deployed product",
                    "Documentation",
                    "Knowledge transfer",
                ],
                "description": "Final delivery and deployment.",
            },
        ],
        "total_weeks": timeline_weeks or 4,
        "recommended_team": ["Senior Developer", "UI/UX Designer"],
        "key_risks": ["Scope creep", "Integration complexity", "Timeline pressure"],
        "success_criteria": [
            "All deliverables accepted by client",
            "Zero critical bugs at launch",
            "Client sign-off received",
        ],
    }


# ============================================================================
# Helper Functions
# ============================================================================


def _rule_based_response(message: str) -> str:
    """Keyword-based fallback response when the AI gateway is unavailable."""
    msg = message.lower()
    if any(
        w in msg
        for w in ["find", "search", "freelancer", "developer", "designer", "hire"]
    ):
        return (
            "I can help you find the perfect freelancer! Please tell me:\n"
            "1. What skills do you need?\n"
            "2. What's your budget (hourly or fixed)?\n"
            "3. What's your ideal timeline?\n\n"
            "Or browse our [freelancer directory](/freelancers) directly."
        )
    if any(w in msg for w in ["cost", "price", "budget", "estimate", "how much"]):
        return (
            "Project costs vary based on scope and complexity:\n"
            "- **Simple projects**: $500 – $2,000\n"
            "- **Medium projects**: $2,000 – $10,000\n"
            "- **Complex projects**: $10,000 – $50,000+\n\n"
            "Describe your project and I'll give you a more accurate estimate!"
        )
    if any(w in msg for w in ["post", "project", "create", "publish"]):
        return (
            "Ready to post your project? [Post a Project](/create-project)\n\n"
            "Tips for a great project post:\n"
            "✓ Be specific about deliverables\n"
            "✓ Set a realistic budget range\n"
            "✓ Include your deadline"
        )
    if any(w in msg for w in ["escrow", "payment", "pay", "safe", "secure"]):
        return (
            "💳 **MegiLance Escrow System**\n\n"
            "Your funds are always protected:\n"
            "1. You deposit into escrow before work begins\n"
            "2. Freelancer completes the agreed milestone\n"
            "3. You review and approve the deliverable\n"
            "4. Funds are released automatically\n\n"
            "If there's a dispute, our team mediates fairly."
        )
    return (
        "I'm here to help! You can ask me to:\n"
        "🔍 **Find freelancers** by skill, budget, or rating\n"
        "💰 **Estimate project cost** for any type of work\n"
        "📋 **Plan your project** scope and milestones\n"
        "📊 **Explain platform features** and best practices"
    )


def _get_suggestions(message: str, tool_results: list) -> list:
    """Generate contextual quick-reply suggestion chips for the frontend."""
    if tool_results:
        first = tool_results[0]
        if first.display_type == "freelancer_cards":
            return [
                "Refine by budget",
                "Filter by rating 4.5+",
                "Post my project",
                "See full profiles",
            ]
        if first.display_type == "cost_estimate":
            return [
                "Find freelancers for this",
                "Post this project",
                "Adjust scope",
                "Get detailed breakdown",
            ]
        if first.display_type == "scope_plan":
            return [
                "Estimate cost for this scope",
                "Find a team for this",
                "Post this project",
                "Revise timeline",
            ]
        if first.display_type == "market_rates":
            return [
                "Find freelancers with this skill",
                "Post a project",
                "Compare junior vs senior",
                "Estimate my project",
            ]

    msg = message.lower()
    if any(w in msg for w in ["hi", "hello", "hey", "start", "help"]):
        return [
            "Find a React developer",
            "Estimate my app cost",
            "How does MegiLance work?",
            "Post a project",
        ]
    return [
        "Find freelancers",
        "Estimate project cost",
        "How does escrow work?",
        "Post my project",
    ]


def _get_action_buttons(message: str, tool_results: list) -> list:
    """Generate contextual CTA buttons for the frontend."""
    buttons: list = []

    if tool_results:
        first = tool_results[0]
        if first.display_type == "freelancer_cards":
            buttons.append(
                {
                    "label": "Browse All Freelancers",
                    "href": "/freelancers",
                    "variant": "secondary",
                }
            )
        if first.display_type in ("cost_estimate", "scope_plan"):
            buttons.append(
                {
                    "label": "Post a Project",
                    "href": "/create-project",
                    "variant": "primary",
                }
            )

    if not buttons:
        buttons = [
            {
                "label": "Post a Project",
                "href": "/create-project",
                "variant": "primary",
            },
            {
                "label": "Browse Freelancers",
                "href": "/freelancers",
                "variant": "secondary",
            },
        ]

    return buttons


# ============================================================================
# Endpoints
# ============================================================================


@router.post("/chat", response_model=ClientAssistantResponse)
async def client_assistant_chat(
    request: ClientAssistantRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Agentic AI chat for clients with LLM tool calling.

    Flow:
    1. Build messages array (system prompt + history + user message)
    2. Send to DO AI API with tool definitions
    3. If the model triggers tool calls → execute them → send results back for summarisation
    4. Return the final reply, structured tool results, suggestions, and action buttons
    """
    # ── Build message list ─────────────────────────────────────────────────
    messages: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]

    if request.page_context:
        messages.append(
            {
                "role": "system",
                "content": f"Current page context: {request.page_context}",
            }
        )

    # Include last 10 turns to stay within context limits
    for msg in request.conversation_history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": request.message})

    tool_results: list[ToolResult] = []
    reply = ""

    if llm_gateway.is_active:
        try:
            async with httpx.AsyncClient(timeout=45.0) as http:
                # ── First LLM call: tool-use enabled ──────────────────────
                first_resp = await http.post(
                    f"{llm_gateway.do_api_base}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {llm_gateway.do_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": llm_gateway.do_model,
                        "messages": messages,
                        "tools": TOOLS,
                        "tool_choice": "auto",
                        "max_tokens": 2000,
                        "temperature": 0.5,
                    },
                )

                if first_resp.status_code != 200:
                    logger.error(
                        "DO AI API error %s: %s",
                        first_resp.status_code,
                        first_resp.text[:300],
                    )
                    raise ValueError(f"LLM API returned HTTP {first_resp.status_code}")

                first_data = first_resp.json()
                choice = first_data["choices"][0]
                finish_reason = choice.get("finish_reason", "")
                assistant_message = choice.get("message", {})

                if finish_reason == "tool_calls":
                    # ── Execute every tool the model requested ─────────────
                    tool_calls = assistant_message.get("tool_calls", [])
                    tool_messages: list[dict] = []

                    for tc in tool_calls:
                        fn_name = tc["function"]["name"]
                        try:
                            fn_args = json.loads(tc["function"].get("arguments", "{}"))
                        except json.JSONDecodeError:
                            fn_args = {}

                        result_data: dict = {}
                        display_type = "text"

                        if fn_name == "search_freelancers":
                            result_data = await _tool_search_freelancers(**fn_args)
                            display_type = "freelancer_cards"
                        elif fn_name == "estimate_project_cost":
                            result_data = await _tool_estimate_cost(**fn_args)
                            display_type = "cost_estimate"
                        elif fn_name == "get_market_rates":
                            result_data = await _tool_get_market_rates(**fn_args)
                            display_type = "market_rates"
                        elif fn_name == "plan_project_scope":
                            result_data = await _tool_plan_scope(**fn_args)
                            display_type = "scope_plan"
                        else:
                            result_data = {
                                "error": f"Unknown tool requested: {fn_name}"
                            }
                            logger.warning("LLM requested unknown tool: %s", fn_name)

                        tool_results.append(
                            ToolResult(
                                tool_name=fn_name,
                                data=result_data,
                                display_type=display_type,
                            )
                        )
                        tool_messages.append(
                            {
                                "role": "tool",
                                "tool_call_id": tc["id"],
                                "content": json.dumps(result_data, default=str),
                            }
                        )

                    # ── Second LLM call: natural-language summary ──────────
                    summary_messages = (
                        messages
                        + [
                            {
                                "role": "assistant",
                                "content": None,
                                "tool_calls": tool_calls,
                            }
                        ]
                        + tool_messages
                    )

                    summary_resp = await http.post(
                        f"{llm_gateway.do_api_base}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {llm_gateway.do_api_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": llm_gateway.do_model,
                            "messages": summary_messages,
                            "max_tokens": 800,
                            "temperature": 0.5,
                        },
                    )

                    if summary_resp.status_code == 200:
                        reply = (
                            summary_resp.json()["choices"][0]["message"].get("content")
                            or ""
                        )
                    else:
                        logger.warning(
                            "Summary call returned %s", summary_resp.status_code
                        )
                        reply = (
                            "I've found some results for you — see the cards below! ✨"
                        )

                else:
                    # Straight conversational reply — no tools triggered
                    reply = assistant_message.get("content") or ""

        except Exception as exc:
            logger.error("client_assistant_chat error: %s", exc, exc_info=True)
            # Graceful degradation: plain LLM without tools, then keyword fallback
            try:
                reply = await llm_gateway.generate_text(
                    request.message,
                    system_message=SYSTEM_PROMPT,
                    max_tokens=800,
                )
            except Exception:
                reply = _rule_based_response(request.message)
    else:
        reply = _rule_based_response(request.message)

    suggestions = _get_suggestions(request.message, tool_results)
    action_buttons = _get_action_buttons(request.message, tool_results)

    return ClientAssistantResponse(
        message=reply,
        reply=reply,
        tool_results=tool_results,
        suggestions=suggestions,
        action_buttons=action_buttons,
    )


@router.post("/welcome")
async def get_welcome_message(
    current_user: dict = Depends(get_current_active_user),
):
    """Return a personalised welcome message for the authenticated client."""
    hour = datetime.now(timezone.utc).hour
    if hour < 12:
        greeting_word = "Good morning"
    elif hour < 17:
        greeting_word = "Good afternoon"
    else:
        greeting_word = "Good evening"

    # Extract first name from whichever field is populated
    name: str = current_user.get("full_name") or current_user.get("name") or "there"
    first_name = name.split()[0] if name.strip() else "there"

    # Lightweight DB stats — sync Turso calls are safe inside an async handler
    turso = get_turso_http()
    user_id = current_user.get("id") or current_user.get("user_id")

    project_count = 0
    proposal_count = 0

    try:
        proj_row = turso.fetch_one(
            "SELECT COUNT(*) FROM projects WHERE client_id = ?", [user_id]
        )
        project_count = int(proj_row[0]) if proj_row else 0
    except Exception as exc:
        logger.warning("Welcome: failed to fetch project count: %s", exc)

    try:
        prop_row = turso.fetch_one(
            """SELECT COUNT(*) FROM proposals p
               JOIN projects j ON p.project_id = j.id
               WHERE j.client_id = ? AND p.status = 'pending'""",
            [user_id],
        )
        proposal_count = int(prop_row[0]) if prop_row else 0
    except Exception as exc:
        logger.warning("Welcome: failed to fetch proposal count: %s", exc)

    # Contextual tip based on account activity
    if project_count == 0:
        contextual_tip = (
            "💡 **Tip:** Post your first project and receive proposals within hours "
            "from vetted freelancers!"
        )
    elif proposal_count > 0:
        contextual_tip = (
            f"📬 You have **{proposal_count} new proposal(s)** waiting for your review!"
        )
    else:
        contextual_tip = (
            "🎯 Your projects are running smoothly. Need to hire for something new?"
        )

    return {
        "greeting": f"{greeting_word}, {first_name}! 👋",
        "message": (
            f"{greeting_word}, {first_name}! 👋\n\n"
            "I'm **Megi**, your AI assistant. I can help you find talent, estimate costs, "
            f"review proposals, and guide you through the platform.\n\n{contextual_tip}"
        ),
        "suggestions": [
            "Find a developer",
            "Estimate my project cost",
            "Review my proposals",
            "Post a new project",
        ],
        "action_buttons": [
            {
                "label": "Post a Project",
                "href": "/create-project",
                "variant": "primary",
            },
            {
                "label": "Browse Freelancers",
                "href": "/freelancers",
                "variant": "secondary",
            },
        ],
    }
