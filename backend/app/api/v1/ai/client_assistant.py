# @AI-HINT: AI Client/Freelancer Assistant — full LLM tool-calling, SSE streaming, all roles
import json
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional, AsyncIterator
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

logger = logging.getLogger(__name__)

from app.core.security import get_current_user
from app.db.turso_http import execute_query, parse_rows
from app.services.llm_gateway import llm_gateway

router = APIRouter()

# ──────────────────────────────────────────────────────────────────────────────
# System prompts per role
# ──────────────────────────────────────────────────────────────────────────────

_CLIENT_SYSTEM = """You are Megi, an expert AI assistant on MegiLance — a professional freelancing marketplace.
You help CLIENTS: find the right freelancers, estimate project costs, plan project scope, understand platform features,
manage contracts, and navigate the platform. Be concise, professional, and action-oriented.

You can call tools to: search freelancers, estimate costs, plan scope, check market rates, find projects, show platform guides.
When showing data, format it clearly with markdown tables, bullet lists, and headings.
Keep responses under 300 words unless the user asks for detail. Always end with a follow-up question or next step."""

_FREELANCER_SYSTEM = """You are Megi, an expert AI assistant on MegiLance — a professional freelancing marketplace.
You help FREELANCERS: find projects, write better proposals, optimize their profile, understand their earnings/stats,
manage workloads, set competitive rates, and grow their business on the platform.

You can call tools to: find matching projects, draft proposal outlines, check market rates, analyze profile gaps,
show earnings stats. Be encouraging, practical, and results-focused.
Format data clearly. Keep responses under 300 words. Always suggest a concrete next action."""

_ADMIN_SYSTEM = """You are Megi, an internal AI assistant for MegiLance platform administrators.
You help ADMINS: understand platform metrics, manage users, review flagged content, interpret analytics,
handle disputes, and operate the platform. Be analytical and precise. Use markdown tables for data."""

_DEFAULT_SYSTEM = _CLIENT_SYSTEM

# ──────────────────────────────────────────────────────────────────────────────
# Tool definitions (sent to LLM)
# ──────────────────────────────────────────────────────────────────────────────

CLIENT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_freelancers",
            "description": "Search for freelancers matching specific skills, budget, or expertise. Returns a list of matching freelancers.",
            "parameters": {
                "type": "object",
                "properties": {
                    "skills": {"type": "string", "description": "Comma-separated skills to search for"},
                    "max_hourly_rate": {"type": "number", "description": "Maximum hourly rate in USD"},
                    "min_rating": {"type": "number", "description": "Minimum rating (1-5)"},
                    "limit": {"type": "integer", "description": "Number of results", "default": 4}
                },
                "required": ["skills"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "estimate_project_cost",
            "description": "Estimate the cost and timeline for a project based on description and type.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_description": {"type": "string", "description": "Description of the project"},
                    "project_type": {"type": "string", "description": "Type: web_app, mobile_app, design, marketing, data_science, other"},
                    "complexity": {"type": "string", "description": "simple, medium, complex"}
                },
                "required": ["project_description", "project_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_market_rates",
            "description": "Get current market rate ranges for specific roles or skills.",
            "parameters": {
                "type": "object",
                "properties": {
                    "role_or_skill": {"type": "string", "description": "Job role or skill to get rates for"}
                },
                "required": ["role_or_skill"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "plan_project_scope",
            "description": "Generate a detailed project scope and milestone plan.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_name": {"type": "string"},
                    "goals": {"type": "string", "description": "Main project goals"},
                    "timeline_weeks": {"type": "integer", "description": "Target timeline in weeks"}
                },
                "required": ["project_name", "goals"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_platform_guide",
            "description": "Get step-by-step guidance for using platform features.",
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {"type": "string", "description": "Topic: post_project, hire_freelancer, escrow, reviews, disputes, payments, contracts"}
                },
                "required": ["topic"]
            }
        }
    }
]

FREELANCER_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "find_matching_projects",
            "description": "Find open projects that match a freelancer's skills.",
            "parameters": {
                "type": "object",
                "properties": {
                    "skills": {"type": "string", "description": "Comma-separated skills"},
                    "min_budget": {"type": "number", "description": "Minimum project budget"},
                    "limit": {"type": "integer", "default": 5}
                },
                "required": ["skills"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_market_rates",
            "description": "Get market rate ranges for a role or skill to set competitive pricing.",
            "parameters": {
                "type": "object",
                "properties": {
                    "role_or_skill": {"type": "string"}
                },
                "required": ["role_or_skill"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "draft_proposal_outline",
            "description": "Generate a proposal outline for a specific project type.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_type": {"type": "string"},
                    "client_requirement": {"type": "string"},
                    "my_skills": {"type": "string"}
                },
                "required": ["project_type", "client_requirement"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_platform_guide",
            "description": "Get guidance for freelancer platform features.",
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {"type": "string", "description": "Topic: submit_proposal, contracts, payments, profile, disputes, reviews"}
                },
                "required": ["topic"]
            }
        }
    }
]

# ──────────────────────────────────────────────────────────────────────────────
# Tool execution (actual data queries)
# ──────────────────────────────────────────────────────────────────────────────

def _execute_tool(tool_name: str, args: dict, user_id: int, role: str) -> dict:
    """Execute tool and return structured data for frontend rendering."""
    try:
        if tool_name == "search_freelancers":
            return _tool_search_freelancers(args)
        elif tool_name == "estimate_project_cost":
            return _tool_estimate_cost(args)
        elif tool_name == "get_market_rates":
            return _tool_market_rates(args)
        elif tool_name == "plan_project_scope":
            return _tool_scope_plan(args)
        elif tool_name == "get_platform_guide":
            return _tool_platform_guide(args)
        elif tool_name == "find_matching_projects":
            return _tool_find_projects(args, user_id)
        elif tool_name == "draft_proposal_outline":
            return _tool_proposal_outline(args)
        else:
            return {"error": f"Unknown tool: {tool_name}"}
    except Exception as e:
        logger.error(f"Tool {tool_name} failed: {e}")
        return {"error": str(e)}


def _tool_search_freelancers(args: dict) -> dict:
    skills = args.get("skills", "")
    max_rate = args.get("max_hourly_rate", 999)
    min_rating = args.get("min_rating", 0)
    limit = min(int(args.get("limit", 4)), 8)

    skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    if not skill_list:
        return {"display_type": "freelancer_cards", "freelancers": []}

    conditions = []
    params = []
    for sk in skill_list[:3]:
        conditions.append("(p.skills LIKE ? OR p.bio LIKE ? OR u.name LIKE ?)")
        params.extend([f"%{sk}%", f"%{sk}%", f"%{sk}%"])

    where = f"({' OR '.join(conditions)})" if conditions else "1=1"
    if max_rate < 999:
        where += " AND (p.hourly_rate IS NULL OR p.hourly_rate <= ?)"
        params.append(max_rate)
    if min_rating > 0:
        where += " AND (p.avg_rating IS NULL OR p.avg_rating >= ?)"
        params.append(min_rating)
    params.append(limit)

    result = execute_query(f"""
        SELECT u.id, u.name, p.title, p.hourly_rate, p.avg_rating, p.avatar_url, p.skills
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.role = 'freelancer' AND {where}
        ORDER BY p.avg_rating DESC NULLS LAST
        LIMIT ?
    """, params)

    freelancers = []
    if result and result.get("rows"):
        for row in result["rows"]:
            freelancers.append({
                "id": row[0], "full_name": row[1], "title": row[2],
                "hourly_rate": float(row[3]) if row[3] else None,
                "rating": float(row[4]) if row[4] else None,
                "avatar_url": row[5],
            })

    return {
        "display_type": "freelancer_cards",
        "freelancers": freelancers,
        "search_query": skills,
        "total_found": len(freelancers)
    }


COST_RANGES = {
    "web_app": {"simple": (500, 2000), "medium": (2000, 8000), "complex": (8000, 30000)},
    "mobile_app": {"simple": (1000, 5000), "medium": (5000, 20000), "complex": (20000, 80000)},
    "design": {"simple": (200, 800), "medium": (800, 3000), "complex": (3000, 10000)},
    "marketing": {"simple": (300, 1000), "medium": (1000, 4000), "complex": (4000, 15000)},
    "data_science": {"simple": (500, 2000), "medium": (2000, 10000), "complex": (10000, 40000)},
    "other": {"simple": (300, 1500), "medium": (1500, 6000), "complex": (6000, 25000)},
}
TIMELINE = {"simple": "1–2 weeks", "medium": "3–8 weeks", "complex": "2–6 months"}


def _tool_estimate_cost(args: dict) -> dict:
    project_type = args.get("project_type", "other").lower()
    complexity = args.get("complexity", "medium").lower()
    if complexity not in ("simple", "medium", "complex"):
        complexity = "medium"
    if project_type not in COST_RANGES:
        project_type = "other"

    lo, hi = COST_RANGES[project_type][complexity]
    timeline = TIMELINE[complexity]

    phases = [
        {"name": "Discovery & Planning", "cost_min": int(lo * 0.1), "cost_max": int(hi * 0.1), "duration": "1 week"},
        {"name": "Design & Architecture", "cost_min": int(lo * 0.2), "cost_max": int(hi * 0.2), "duration": "1–2 weeks"},
        {"name": "Development", "cost_min": int(lo * 0.55), "cost_max": int(hi * 0.55), "duration": timeline},
        {"name": "Testing & Launch", "cost_min": int(lo * 0.15), "cost_max": int(hi * 0.15), "duration": "1 week"},
    ]
    return {
        "display_type": "cost_estimate",
        "total_min": lo, "total_max": hi,
        "estimated_timeline": timeline,
        "project_type": project_type,
        "complexity": complexity,
        "phases": phases,
        "tips": [
            "Use milestones for payment security",
            "Request portfolio samples matching your project",
            "Start with a small paid test task for new freelancers",
        ]
    }


MARKET_RATES = {
    "react": [{"role": "React Developer", "min": 25, "max": 90, "avg": 52}],
    "python": [{"role": "Python Developer", "min": 30, "max": 95, "avg": 58}],
    "ui/ux": [{"role": "UI/UX Designer", "min": 20, "max": 80, "avg": 45}],
    "design": [{"role": "Graphic Designer", "min": 15, "max": 70, "avg": 35}, {"role": "UI/UX Designer", "min": 25, "max": 90, "avg": 50}],
    "node": [{"role": "Node.js Developer", "min": 30, "max": 95, "avg": 55}],
    "fullstack": [{"role": "Full-Stack Developer", "min": 35, "max": 110, "avg": 65}],
    "mobile": [{"role": "iOS Developer", "min": 40, "max": 120, "avg": 70}, {"role": "Android Developer", "min": 35, "max": 110, "avg": 65}],
    "data": [{"role": "Data Scientist", "min": 45, "max": 130, "avg": 80}, {"role": "Data Analyst", "min": 25, "max": 75, "avg": 45}],
    "devops": [{"role": "DevOps Engineer", "min": 40, "max": 125, "avg": 75}],
    "wordpress": [{"role": "WordPress Developer", "min": 15, "max": 60, "avg": 30}],
    "seo": [{"role": "SEO Specialist", "min": 15, "max": 65, "avg": 35}],
    "content": [{"role": "Content Writer", "min": 10, "max": 50, "avg": 25}],
    "video": [{"role": "Video Editor", "min": 15, "max": 75, "avg": 38}],
}


def _tool_market_rates(args: dict) -> dict:
    query = args.get("role_or_skill", "").lower()
    rates = []
    for keyword, rate_list in MARKET_RATES.items():
        if keyword in query or query in keyword:
            rates.extend(rate_list)
    if not rates:
        rates = [{"role": "General Freelancer", "min": 15, "max": 100, "avg": 40}]
    return {"display_type": "market_rates", "rates": rates[:5], "currency": "USD", "period": "hourly"}


def _tool_scope_plan(args: dict) -> dict:
    name = args.get("project_name", "Project")
    goals = args.get("goals", "")
    weeks = int(args.get("timeline_weeks", 8))

    milestones = [
        {"title": "Discovery & Requirements", "description": f"Define goals, user stories, and technical requirements for {name}.", "duration": "1 week", "deliverables": ["Requirements doc", "User stories", "Tech stack decision"]},
        {"title": "Design & Prototyping", "description": "Create wireframes, UI mockups, and approve design system.", "duration": f"{max(1, weeks//6)} week(s)", "deliverables": ["Wireframes", "UI mockups", "Design system"]},
        {"title": "Core Development", "description": f"Build the main features: {goals[:120]}...", "duration": f"{max(2, weeks//2)} weeks", "deliverables": ["Core features", "API integrations", "Database setup"]},
        {"title": "Testing & QA", "description": "Unit tests, integration tests, and user acceptance testing.", "duration": f"{max(1, weeks//6)} week(s)", "deliverables": ["Test reports", "Bug fixes", "Performance review"]},
        {"title": "Launch & Handover", "description": "Deploy to production, documentation, and knowledge transfer.", "duration": "1 week", "deliverables": ["Deployed application", "Documentation", "Training session"]},
    ]

    return {
        "display_type": "scope_plan",
        "project_name": name,
        "total_weeks": weeks,
        "milestones": milestones,
        "risks": ["Scope creep", "Integration delays", "Feedback cycles"],
        "recommendations": ["Use MegiLance milestones for each phase", "Set clear acceptance criteria before starting"]
    }


PLATFORM_GUIDES = {
    "post_project": "## How to Post a Project\n\n1. Go to **Dashboard → Post Project**\n2. Fill in title, description, and required skills\n3. Set your **budget** (fixed or hourly) and deadline\n4. Add optional attachments\n5. Click **Publish** — freelancers will start submitting proposals!\n\n💡 **Tip**: Add detailed requirements to attract better proposals.",
    "hire_freelancer": "## How to Hire a Freelancer\n\n1. Review proposals on your project page\n2. Check freelancer **portfolios and reviews**\n3. Use the **interview** or **message** feature to ask questions\n4. Click **Accept Proposal** to start a contract\n5. Fund the first milestone in **Escrow**\n\n💡 **Tip**: Always start with a paid test task for new relationships.",
    "escrow": "## How Escrow Works\n\n| Step | Action |\n|------|--------|\n| 1 | Client funds milestone into Escrow |\n| 2 | Freelancer works on deliverables |\n| 3 | Freelancer submits work |\n| 4 | Client reviews and approves |\n| 5 | Funds released to freelancer |\n\n🔒 Funds are secure until you approve. Use **disputes** if issues arise.",
    "reviews": "## Leaving Reviews\n\n- Go to **Contracts → Completed**\n- Click **Leave Review**\n- Rate (1-5 stars) on: Communication, Quality, Timeliness\n- Write a detailed comment\n\n💡 Honest reviews help the whole community!",
    "disputes": "## Raising a Dispute\n\n1. Go to **Contracts → [Contract Name]**\n2. Click **Raise Dispute**\n3. Select reason and provide evidence\n4. Our team reviews within **48 hours**\n5. Both parties can respond\n\nEscrow funds are frozen during disputes.",
    "payments": "## Payment Methods\n\n- **Credit/Debit Cards** (Visa, Mastercard, Amex)\n- **PayPal** — instant processing\n- **Bank Transfer** — 3–5 business days\n- **Wise** — 1–2 business days\n\nPlatform fee: **10% for freelancers**, free for clients.",
    "contracts": "## Managing Contracts\n\n1. View all contracts in **Contracts** section\n2. Each contract has **milestones**, **workroom**, and **messages**\n3. The **Workroom** has a Kanban board, file sharing, and discussions\n4. Track milestone completion and release payments from there\n\n💡 Use the **Workroom** to stay organized with your freelancer.",
    "submit_proposal": "## Writing a Winning Proposal\n\n1. **Personalize** — mention the client's specific needs\n2. Show **relevant portfolio** items\n3. Set a **realistic timeline** — don't overpromise\n4. Explain your **approach** step by step\n5. Include a clear **budget breakdown**\n\n💡 Quality > quantity. 3 great proposals beat 30 generic ones.",
    "profile": "## Optimizing Your Profile\n\n- Add a **professional photo** (+40% views)\n- Write a **compelling bio** (100+ words)\n- List **10+ skills** with proficiency levels\n- Upload **3–5 portfolio** items\n- Complete **verification** for the trusted badge\n- Set an accurate **hourly rate**",
}


def _tool_platform_guide(args: dict) -> dict:
    topic = args.get("topic", "").lower().replace(" ", "_").replace("-", "_")
    content = PLATFORM_GUIDES.get(topic)
    if not content:
        # Try partial match
        for key, val in PLATFORM_GUIDES.items():
            if topic in key or key in topic:
                content = val
                break
    if not content:
        content = "Please visit our **Help Center** at `/support` for detailed guides on all platform features."
    return {"display_type": "text", "text": content, "topic": topic}


def _tool_find_projects(args: dict, user_id: int) -> dict:
    skills = args.get("skills", "")
    limit = min(int(args.get("limit", 5)), 10)
    min_budget = args.get("min_budget", 0)

    skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    conditions = []
    params = []
    if skill_list:
        for sk in skill_list[:3]:
            conditions.append("(p.skills_required LIKE ? OR p.title LIKE ? OR p.description LIKE ?)")
            params.extend([f"%{sk}%", f"%{sk}%", f"%{sk}%"])

    where = f"p.status = 'open'"
    if conditions:
        where += f" AND ({' OR '.join(conditions)})"
    if min_budget:
        where += " AND p.budget_max >= ?"
        params.append(min_budget)

    params.append(limit)
    result = execute_query(f"""
        SELECT p.id, p.title, p.description, p.budget_min, p.budget_max,
               p.skills_required, p.created_at, u.name
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        WHERE {where}
        ORDER BY p.created_at DESC
        LIMIT ?
    """, params)

    projects = []
    if result and result.get("rows"):
        for row in result["rows"]:
            desc = (row[2] or "")[:150]
            if len(row[2] or "") > 150:
                desc += "..."
            projects.append({
                "id": row[0], "title": row[1], "description": desc,
                "budget_min": float(row[3]) if row[3] else None,
                "budget_max": float(row[4]) if row[4] else None,
                "skills": row[5], "posted_by": row[7], "created_at": row[6],
            })

    return {
        "display_type": "project_list",
        "projects": projects,
        "search_skills": skills,
        "total_found": len(projects)
    }


def _tool_proposal_outline(args: dict) -> dict:
    project_type = args.get("project_type", "")
    requirement = args.get("client_requirement", "")
    skills = args.get("my_skills", "")

    outline = f"""## Proposal Outline for {project_type.title()} Project

**Opening (2–3 sentences)**
> "I have carefully read your requirements for {requirement[:80]}. With my background in {skills or 'relevant technologies'}, I'm confident I can deliver exactly what you need."

**My Approach**
1. **Discovery** — I'll start with a detailed requirements call to ensure full alignment
2. **Planning** — Break the project into clear milestones with deliverables
3. **Execution** — Regular updates and demos throughout development
4. **Delivery** — Full testing, documentation, and post-launch support

**Why Me**
- Relevant experience in {project_type}
- Portfolio items matching your requirements
- Clear communication and on-time delivery record

**Timeline & Budget**
- Provide realistic estimate based on requirements
- List milestones with payment schedule

**Call to Action**
> "I'd love to discuss your project in more detail. Let's schedule a quick call to get started!"
"""
    return {"display_type": "text", "text": outline, "topic": "proposal_outline"}


# ──────────────────────────────────────────────────────────────────────────────
# LLM Chat with tool calling
# ──────────────────────────────────────────────────────────────────────────────

async def _run_llm_chat(
    user_message: str,
    history: list,
    system_prompt: str,
    tools: list,
    user_id: int,
    role: str,
) -> dict:
    """Run LLM chat with tool calling — DigitalOcean AI (OpenAI-compatible)."""
    if not llm_gateway.is_active:
        return _fallback_response(user_message, role)
    return await _run_openai_chat(user_message, history, system_prompt, tools, user_id, role)


async def _run_openai_chat(
    user_message: str,
    history: list,
    system_prompt: str,
    tools: list,
    user_id: int,
    role: str,
) -> dict:
    """OpenAI-compatible (DigitalOcean) tool-use chat implementation."""
    import httpx

    messages = [{"role": "system", "content": system_prompt}]
    for h in history[-8:]:
        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
    messages.append({"role": "user", "content": user_message})

    tool_results_for_frontend: list = []

    try:
        payload = {
            "model": llm_gateway.do_model,
            "messages": messages,
            "tools": tools,
            "tool_choice": "auto",
            "max_tokens": 1000,
            "temperature": 0.7,
        }
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                f"{llm_gateway.do_api_base}/chat/completions",
                headers={"Authorization": f"Bearer {llm_gateway.do_api_key}", "Content-Type": "application/json"},
                json=payload,
            )

        if resp.status_code != 200:
            logger.error(f"DO LLM error {resp.status_code}: {resp.text[:200]}")
            return _fallback_response(user_message, role)

        data = resp.json()
        choice = data.get("choices", [{}])[0]
        assistant_msg = choice.get("message", {})
        finish_reason = choice.get("finish_reason", "stop")

        if finish_reason == "tool_calls" and assistant_msg.get("tool_calls"):
            tool_calls = assistant_msg["tool_calls"]
            tool_messages = [assistant_msg]

            for tc in tool_calls:
                fn = tc.get("function", {})
                tool_name = fn.get("name", "")
                try:
                    args = json.loads(fn.get("arguments", "{}"))
                except json.JSONDecodeError:
                    args = {}
                result = _execute_tool(tool_name, args, user_id, role)
                tool_results_for_frontend.append({
                    "tool_name": tool_name,
                    "data": result,
                    "display_type": result.get("display_type", "text"),
                })
                tool_messages.append({
                    "role": "tool",
                    "tool_call_id": tc.get("id", ""),
                    "content": json.dumps(result),
                })

            messages2 = messages + tool_messages
            payload2 = {"model": llm_gateway.do_model, "messages": messages2, "max_tokens": 600, "temperature": 0.7}
            async with httpx.AsyncClient(timeout=30.0) as client2:
                resp2 = await client2.post(
                    f"{llm_gateway.do_api_base}/chat/completions",
                    headers={"Authorization": f"Bearer {llm_gateway.do_api_key}", "Content-Type": "application/json"},
                    json=payload2,
                )
            final_content = ""
            if resp2.status_code == 200:
                final_content = resp2.json().get("choices", [{}])[0].get("message", {}).get("content", "")
            if not final_content:
                final_content = "I found relevant information for you. See the results above."
        else:
            final_content = assistant_msg.get("content", "")
            if not final_content:
                return _fallback_response(user_message, role)

        suggestions = _generate_suggestions(user_message, role, bool(tool_results_for_frontend))
        action_buttons = _generate_action_buttons(user_message, role, tool_results_for_frontend)
        return {
            "message": final_content,
            "tool_results": tool_results_for_frontend,
            "suggestions": suggestions,
            "action_buttons": action_buttons,
        }

    except Exception as e:
        logger.error(f"DO LLM chat error: {e}")
        return _fallback_response(user_message, role)


def _fallback_response(message: str, role: str) -> dict:
    """Rule-based fallback when LLM is unavailable."""
    m = message.lower()

    if any(w in m for w in ["hi", "hello", "hey"]):
        if role == "freelancer":
            msg = "Hello! 👋 I'm Megi. I can help you find matching projects, improve your proposals, check market rates, and grow your freelance career. What would you like to do?"
        else:
            msg = "Hello! 👋 I'm Megi, your AI assistant. I can help you find freelancers, estimate project costs, plan your scope, and navigate MegiLance. What can I help you with?"
    elif any(w in m for w in ["find", "search", "freelancer", "developer", "designer"]):
        msg = "I'd be happy to help you find the right freelancer! Please tell me:\n\n- **What skills** do you need?\n- **What's your budget range?**\n- **How long is the project?**"
    elif any(w in m for w in ["cost", "price", "estimate", "budget", "much"]):
        msg = "Let me help you estimate the project cost! Please share:\n\n- **Type of project** (web app, mobile, design, etc.)\n- **Key features** you need\n- **Rough complexity** (simple/medium/complex)"
    elif any(w in m for w in ["proposal", "bid", "apply"]):
        if role == "freelancer":
            msg = "A great proposal stands out! Key elements:\n\n1. **Personalized opening** — reference their specific problem\n2. **Your approach** — step-by-step how you'll solve it\n3. **Portfolio proof** — show relevant past work\n4. **Realistic timeline & milestones**\n5. **Strong CTA** — invite them to a quick call"
        else:
            msg = "To attract quality proposals:\n\n- Write a **detailed project description**\n- Set a **realistic budget range**\n- List **required skills** clearly\n- Add any **attachments** (mockups, docs)"
    elif any(w in m for w in ["rate", "price", "salary", "earn", "charge"]):
        msg = "Market rates vary by skill and experience. Common ranges:\n\n| Skill | Hourly Rate |\n|-------|------------|\n| React Dev | $25–$90 |\n| Python Dev | $30–$95 |\n| UI/UX Designer | $20–$80 |\n| Full-Stack | $35–$110 |\n| Data Scientist | $45–$130 |"
    elif any(w in m for w in ["help", "how", "guide", "tutorial"]):
        msg = "I can guide you through any platform feature. What do you need help with?\n\n- **Posting a project**\n- **Hiring a freelancer**\n- **Escrow & payments**\n- **Contracts & workroom**\n- **Reviews & disputes**"
    else:
        msg = "I can help you with finding talent, project cost estimates, scope planning, market rates, and platform guidance. What would you like to know?"

    sug = _generate_suggestions(message, role, False)
    return {"message": msg, "tool_results": [], "suggestions": sug, "action_buttons": []}


def _generate_suggestions(message: str, role: str, had_tools: bool) -> list:
    m = message.lower()
    if role == "freelancer":
        if any(w in m for w in ["project", "find", "search", "job"]):
            return ["Show my profile tips", "Check market rates", "How to write proposals", "My earnings stats"]
        if had_tools:
            return ["Show more projects", "How to submit a proposal", "What rate should I charge?"]
        return ["Find matching projects", "Check market rates", "Improve my profile", "How to get hired faster"]
    else:
        if any(w in m for w in ["find", "hire", "freelancer", "developer"]):
            return ["What's the market rate?", "How to evaluate proposals", "How does escrow work?"]
        if had_tools:
            return ["Find more freelancers", "How to write a great brief", "Post a project now"]
        return ["Find me a developer", "Estimate my project cost", "Plan my project scope", "How does hiring work?"]


def _generate_action_buttons(message: str, role: str, tool_results: list) -> list:
    buttons = []
    m = message.lower()
    has_freelancers = any(tr.get("display_type") == "freelancer_cards" for tr in tool_results)
    has_projects = any(tr.get("display_type") == "project_list" for tr in tool_results)

    if has_freelancers:
        buttons = [
            {"label": "Browse All Talent", "href": "/talent", "variant": "primary"},
            {"label": "Post a Project", "href": "/projects/new", "variant": "secondary"},
        ]
    elif has_projects:
        buttons = [
            {"label": "Browse All Projects", "href": "/projects", "variant": "primary"},
            {"label": "Update My Profile", "href": "/freelancer/profile", "variant": "secondary"},
        ]
    elif any(w in m for w in ["hire", "post project", "find freelancer"]):
        buttons = [{"label": "Post a Project", "href": "/projects/new", "variant": "primary"}]
    elif any(w in m for w in ["submit proposal", "apply", "find project"]):
        buttons = [{"label": "Browse Projects", "href": "/projects", "variant": "primary"}]

    return buttons


# ──────────────────────────────────────────────────────────────────────────────
# API Endpoints
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/client-assistant/welcome")
async def get_welcome(current_user=Depends(get_current_user)):
    role = getattr(current_user, "role", None) or getattr(current_user, "user_type", "client")
    role = (role or "client").lower()

    hour = datetime.now(timezone.utc).hour
    greeting = "Good morning" if hour < 12 else ("Good afternoon" if hour < 17 else "Good evening")
    name = getattr(current_user, "full_name", None) or getattr(current_user, "name", None) or "there"
    first_name = name.split()[0] if name and name != "there" else name

    if role == "freelancer":
        message = f"{greeting}, {first_name}! 👋 I'm **Megi**, your AI career assistant.\n\nI can help you **find matching projects**, write winning proposals, check market rates, and grow your freelance career. What would you like to explore today?"
        suggestions = ["Find projects matching my skills", "What should I charge?", "Help me write a proposal", "How to improve my profile", "Show me market rates for React"]
    elif role == "admin":
        message = f"{greeting}, {first_name}! 👋 I'm **Megi**, your platform intelligence assistant.\n\nI can help you understand analytics, manage users, and operate the platform efficiently."
        suggestions = ["Show platform health", "How to manage disputes", "Feature flag guide", "Analytics overview"]
    else:
        message = f"{greeting}, {first_name}! 👋 I'm **Megi**, your AI hiring assistant.\n\nI can help you **find the right freelancer**, estimate project costs, plan your scope, and navigate MegiLance like a pro. What are you working on?"
        suggestions = ["Find me a React developer", "Estimate my app's cost", "Plan my project scope", "How does escrow work?", "What's the market rate for UI/UX?"]

    return {"message": message, "suggestions": suggestions, "role": role}


class ChatRequest(BaseModel):
    message: str
    conversation_history: list = []
    page_context: Optional[str] = None
    session_id: Optional[str] = None


@router.post("/client-assistant/chat")
async def chat(body: ChatRequest, current_user=Depends(get_current_user)):
    role = getattr(current_user, "role", None) or getattr(current_user, "user_type", "client")
    role = (role or "client").lower()

    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if role == "freelancer":
        system_prompt = _FREELANCER_SYSTEM
        tools = FREELANCER_TOOLS
    elif role == "admin":
        system_prompt = _ADMIN_SYSTEM
        tools = CLIENT_TOOLS  # admins get full toolset
    else:
        system_prompt = _CLIENT_SYSTEM
        tools = CLIENT_TOOLS

    # Add page context to system prompt
    if body.page_context:
        system_prompt += f"\n\nUser is currently on page: {body.page_context}"

    result = await _run_llm_chat(
        user_message=body.message,
        history=body.conversation_history,
        system_prompt=system_prompt,
        tools=tools,
        user_id=current_user.id,
        role=role,
    )
    return result


@router.post("/client-assistant/stream")
async def chat_stream(body: ChatRequest, current_user=Depends(get_current_user)):
    """SSE streaming endpoint for real-time token-by-token responses."""
    role = getattr(current_user, "role", None) or getattr(current_user, "user_type", "client")
    role = (role or "client").lower()
    system_prompt = _FREELANCER_SYSTEM if role == "freelancer" else _CLIENT_SYSTEM

    if not llm_gateway.is_active:
        # Simulate streaming fallback
        async def fallback_stream():
            fb = _fallback_response(body.message, role)
            words = fb["message"].split()
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'type': 'delta', 'content': chunk})}\n\n"
                await asyncio.sleep(0.03)
            yield f"data: {json.dumps({'type': 'done', 'suggestions': fb['suggestions'], 'action_buttons': fb['action_buttons']})}\n\n"
        return StreamingResponse(fallback_stream(), media_type="text/event-stream")

    async def stream_llm():
        import httpx
        messages = [{"role": "system", "content": system_prompt}]
        for h in body.conversation_history[-8:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        messages.append({"role": "user", "content": body.message})

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    f"{llm_gateway.do_api_base}/chat/completions",
                    headers={"Authorization": f"Bearer {llm_gateway.do_api_key}", "Content-Type": "application/json"},
                    json={"model": llm_gateway.do_model, "messages": messages, "max_tokens": 800, "temperature": 0.7, "stream": True}
                ) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            raw = line[6:].strip()
                            if raw == "[DONE]":
                                break
                            try:
                                chunk_data = json.loads(raw)
                                delta = chunk_data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                                if delta:
                                    yield f"data: {json.dumps({'type': 'delta', 'content': delta})}\n\n"
                            except (json.JSONDecodeError, KeyError):
                                continue

            sug = _generate_suggestions(body.message, role, False)
            yield f"data: {json.dumps({'type': 'done', 'suggestions': sug, 'action_buttons': []})}\n\n"

        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'content': 'Connection error. Please try again.'})}\n\n"

    return StreamingResponse(stream_llm(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


class FeedbackRequest(BaseModel):
    message_id: str
    rating: int  # 1 (thumbs down) or 5 (thumbs up)
    comment: Optional[str] = None


@router.post("/client-assistant/feedback")
async def submit_feedback(body: FeedbackRequest, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    try:
        execute_query("""
            CREATE TABLE IF NOT EXISTS assistant_feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                message_id TEXT NOT NULL,
                rating INTEGER NOT NULL,
                comment TEXT,
                created_at TEXT NOT NULL
            )
        """, [])
        execute_query(
            "INSERT INTO assistant_feedback (user_id, message_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)",
            [current_user.id, body.message_id, body.rating, body.comment, now]
        )
    except Exception as e:
        logger.warning(f"Failed to save feedback: {e}")
    return {"message": "Thank you for your feedback!"}


@router.get("/client-assistant/suggestions")
async def get_suggestions(page: Optional[str] = None, current_user=Depends(get_current_user)):
    role = getattr(current_user, "role", None) or getattr(current_user, "user_type", "client")
    role = (role or "client").lower()
    suggestions = _generate_suggestions(page or "", role, False)
    return {"suggestions": suggestions, "role": role}
