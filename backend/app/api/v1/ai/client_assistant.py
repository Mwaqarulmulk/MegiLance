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

_CLIENT_SYSTEM = """You are Megi, the AI concierge/receptionist for CLIENTS on MegiLance — a professional freelancing marketplace.
Act like a capable personal attendant: you can both advise AND look up the client's real account data to answer precisely.

You can call tools to:
• See the client's OWN account — get_account_overview, get_my_projects, get_proposals_received, get_my_contracts, get_wallet_summary.
• Help them act — search_freelancers, estimate_project_cost, plan_project_scope, get_market_rates, get_platform_guide.
• Post a job FOR them — propose_post_project drafts a complete project posting and shows a confirmation card. When a client asks you to post/create a project, gather the essentials (what they need, budget, timeline), then call propose_post_project with every field filled. NEVER say the project is posted — it only goes live after the client clicks Confirm on the card.

IMPORTANT BEHAVIOUR:
- When the user asks anything about THEIR status ("what's going on", "my projects", "who applied", "my balance", "where do things stand"), CALL the account tools first and answer with their real numbers — never guess.
- You may call several tools in one turn to give a complete picture.
- The account tools already return only THIS user's data; never ask the user for their own id.
- When a tool returns a list, summarise it clearly with markdown (short tables or bullet lists), highlight what needs the client's attention (e.g. new proposals to review, milestones to approve), and end with a concrete next step.

YOU ARE AN AGENT THAT TAKES ACTION:
- You can chain tools — e.g. look up the client's projects, THEN draft something — across multiple steps in one turn. Use as many tool calls as needed before answering.
- update_my_profile lets the client edit their own profile (name/photo aside). navigate takes them to any page (e.g. /client/post-job, /client/proposals, /client/wallet, /client/dashboard).
- For ANY write/change action (posting a project, updating the profile) you ONLY ever PROPOSE a draft via the relevant tool; the change is applied solely when the user presses Confirm on the card. Never state that something was posted/updated yourself.
Keep responses under 300 words unless the user asks for detail."""

_FREELANCER_SYSTEM = """You are Megi, the AI concierge/assistant for FREELANCERS on MegiLance — a professional freelancing marketplace.
Act like a capable personal attendant: advise AND look up the freelancer's real account data to answer precisely.

You can call tools to:
• See the freelancer's OWN account — get_account_overview, get_my_proposals, get_my_contracts, get_wallet_summary.
• Help them grow — find_matching_projects, draft_proposal_outline, get_market_rates, get_platform_guide.

IMPORTANT BEHAVIOUR:
- When the user asks about THEIR status ("my proposals", "did I get accepted", "my earnings", "my active work"), CALL the account tools first and answer with their real numbers — never guess.
- The account tools already return only THIS user's data; never ask the user for their own id.
- Summarise lists clearly with markdown, highlight what needs attention (accepted proposals, contracts to start), and end with a concrete next action.

YOU ARE AN AGENT THAT TAKES ACTION:
- You can chain tools in one turn — e.g. search_projects/find_matching_projects to get a real project_id, THEN submit_proposal to draft an application to it. Use as many tool calls as needed before you answer.
- submit_proposal drafts a tailored application to a specific open project (you need its numeric project_id first). update_my_profile lets the freelancer edit their bio, headline, hourly rate, skills, availability, etc. navigate takes them to any page (e.g. /freelancer/jobs, /freelancer/proposals, /freelancer/wallet, /freelancer/profile).
- For ANY write/change action (submitting a proposal, updating the profile) you ONLY ever PROPOSE a draft via the relevant tool; it is applied solely when the user presses Confirm on the card. Never claim a proposal was submitted or a profile updated yourself.
Be encouraging and results-focused. Keep responses under 300 words unless asked for detail."""

_ADMIN_SYSTEM = """You are Megi, an internal AI assistant for MegiLance platform administrators.
You help ADMINS: understand platform metrics, manage users, review flagged content, interpret analytics,
handle disputes, and operate the platform. Be analytical and precise. Use markdown tables for data."""

_GUEST_SYSTEM = """You are Megi, the friendly AI guide on MegiLance — a professional freelancing marketplace — talking to a VISITOR who is not signed in.
You help them understand the platform and explore it. You can call tools to:
• search_projects — show real open projects, • search_freelancers — show real talent,
• estimate_project_cost / get_market_rates — pricing intelligence, • plan_project_scope — break a project into milestones,
• get_platform_guide — explain how features work, • navigate — take them to a public page (e.g. /projects, /freelancers, /signup, /pricing, /how-it-works).

IMPORTANT:
- You have NO access to any account data and cannot post jobs, submit proposals, or change anything — the visitor must sign up/sign in first. When they want to DO something that needs an account (post a project, apply, save anything), warmly invite them to sign up and use navigate('/signup').
- Be welcoming and concise. Use markdown. End with a helpful next step.
Keep responses under 250 words."""

_DEFAULT_SYSTEM = _CLIENT_SYSTEM

# ── Guest usage limiting (per-IP, in-memory daily window) ──────────────────────
import time as _time

_guest_usage: dict[str, list[float]] = {}
_GUEST_DAILY_LIMIT = 20


def _check_guest_rate_limit(ip: str) -> bool:
    """Return True if the guest IP is within its daily message allowance."""
    now = _time.time()
    window = 86400
    _guest_usage[ip] = [t for t in _guest_usage.get(ip, []) if now - t < window]
    if len(_guest_usage[ip]) >= _GUEST_DAILY_LIMIT:
        return False
    _guest_usage[ip].append(now)
    return True

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
# Account-aware tools — let the assistant act as a real receptionist/attendant by
# reading the signed-in user's own data (projects, proposals, contracts, wallet).
# These tools are personal/secured: every query is scoped to the current user_id.
# ──────────────────────────────────────────────────────────────────────────────

CLIENT_ACCOUNT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_account_overview",
            "description": "Get a snapshot of the CURRENT client's account: number of open/active projects, total proposals received, active contracts, and wallet balance. Use this whenever the user asks 'what's going on', 'where do things stand', 'my dashboard', or any status question about their own account.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_projects",
            "description": "List the CURRENT client's own posted projects with status and number of proposals received. Use for 'my projects', 'my job posts', 'how many proposals did I get'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "description": "Optional filter: open, in_progress, completed, cancelled"},
                    "limit": {"type": "integer", "default": 5},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_proposals_received",
            "description": "List proposals submitted by freelancers to the CURRENT client's projects, with freelancer name, bid amount and status. Use for 'who applied', 'show me proposals', 'review bids'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {"type": "integer", "description": "Optional: only proposals for this project"},
                    "limit": {"type": "integer", "default": 6},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_contracts",
            "description": "List the CURRENT client's contracts with the hired freelancer, amount and status. Use for 'my contracts', 'who am I working with', 'active hires'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "description": "Optional filter: active, pending, completed, disputed"},
                    "limit": {"type": "integer", "default": 6},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_wallet_summary",
            "description": "Get the CURRENT client's wallet balance and recent transactions. Use for 'my balance', 'payments', 'how much have I spent', 'transaction history'.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "propose_post_project",
            "description": "Draft a new project posting for the client and show a confirmation card. Use when the client wants you to post/create a job for them. Do NOT claim the project is posted — this only PROPOSES a draft; the client must click Confirm to actually publish it. Infer sensible values from the conversation and fill every field.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Short, clear project title"},
                    "description": {"type": "string", "description": "Detailed description of the work, deliverables and requirements"},
                    "category": {"type": "string", "description": "One of: Web Development, Mobile Development, Data Science & Analytics, Design & Creative, Writing & Content, Marketing & Sales, Video & Animation, Other"},
                    "budget_type": {"type": "string", "description": "Fixed or Hourly"},
                    "budget_min": {"type": "number", "description": "Minimum budget in USD"},
                    "budget_max": {"type": "number", "description": "Maximum budget in USD"},
                    "experience_level": {"type": "string", "description": "Entry, Intermediate, or Expert"},
                    "estimated_duration": {"type": "string", "description": "e.g. 'Less than 1 week', '1-4 weeks', '1-3 months', '3-6 months'"},
                    "skills": {"type": "string", "description": "Comma-separated required skills"},
                },
                "required": ["title", "description", "category", "budget_type"],
            },
        },
    },
]

FREELANCER_ACCOUNT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_account_overview",
            "description": "Get a snapshot of the CURRENT freelancer's account: active contracts, submitted proposals (and how many were accepted), and wallet/earnings balance. Use for any status question about their own account.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_proposals",
            "description": "List the CURRENT freelancer's submitted proposals with project title, bid amount and status. Use for 'my proposals', 'my bids', 'did I get accepted'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "description": "Optional filter: submitted, accepted, rejected, withdrawn"},
                    "limit": {"type": "integer", "default": 6},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_contracts",
            "description": "List the CURRENT freelancer's contracts with client, amount and status. Use for 'my contracts', 'my active work'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "description": "Optional filter: active, pending, completed, disputed"},
                    "limit": {"type": "integer", "default": 6},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_wallet_summary",
            "description": "Get the CURRENT freelancer's earnings balance and recent transactions. Use for 'my earnings', 'my balance', 'when do I get paid'.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
]

# ──────────────────────────────────────────────────────────────────────────────
# Action tools — let the assistant actually DO things on the user's behalf.
# Every write action only PROPOSES a draft + confirmation card; nothing is
# committed until the user presses Confirm (which hits a dedicated /actions/* endpoint).
# `navigate` is a pure UI control: it tells the widget to route the user somewhere.
# ──────────────────────────────────────────────────────────────────────────────

NAVIGATE_TOOL = {
    "type": "function",
    "function": {
        "name": "navigate",
        "description": "Take the user to a specific page in the app. Use when the user asks to 'open', 'go to', 'show me the page for', or after an action when the natural next step is a specific screen. Provide an in-app path starting with '/'.",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "In-app path, e.g. /client/post-job, /freelancer/jobs, /client/wallet, /freelancer/profile, /messages, /client/dashboard"},
                "label": {"type": "string", "description": "Short button label, e.g. 'Open Post a Job'"},
            },
            "required": ["path"],
        },
    },
}

UPDATE_PROFILE_TOOL = {
    "type": "function",
    "function": {
        "name": "update_my_profile",
        "description": "Draft an update to the CURRENT user's own profile and show a confirmation card. Use when the user asks to change/set/edit their bio, headline/title, hourly rate, skills, location, availability, or social links. Only include the fields the user actually wants to change. NEVER claim the profile is updated — it only changes after the user presses Confirm.",
        "parameters": {
            "type": "object",
            "properties": {
                "bio": {"type": "string", "description": "About / bio text"},
                "headline": {"type": "string", "description": "Professional headline/title"},
                "hourly_rate": {"type": "number", "description": "Hourly rate in USD"},
                "skills": {"type": "string", "description": "Comma-separated skills"},
                "location": {"type": "string"},
                "availability_status": {"type": "string", "description": "e.g. Available, Busy, Not available"},
                "languages": {"type": "string", "description": "Comma-separated languages"},
                "linkedin_url": {"type": "string"},
                "github_url": {"type": "string"},
                "website_url": {"type": "string"},
            },
        },
    },
}

SEARCH_PROJECTS_TOOL = {
    "type": "function",
    "function": {
        "name": "search_projects",
        "description": "Search open projects on the marketplace by skill/keyword and optional minimum budget. Use for 'find projects', 'what work is available', 'show me React jobs'.",
        "parameters": {
            "type": "object",
            "properties": {
                "skills": {"type": "string", "description": "Comma-separated skills or keywords"},
                "min_budget": {"type": "number", "description": "Minimum project budget in USD"},
                "limit": {"type": "integer", "default": 5},
            },
            "required": ["skills"],
        },
    },
}

SUBMIT_PROPOSAL_TOOL = {
    "type": "function",
    "function": {
        "name": "submit_proposal",
        "description": "Draft a proposal to a specific OPEN project and show a confirmation card. Use when a freelancer wants to apply/bid on a project. You must know the numeric project_id (use find_matching_projects/search_projects first if you don't). Write a strong, personalised cover letter. NEVER claim the proposal is submitted — it only sends after the user presses Confirm.",
        "parameters": {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "The numeric id of the project to apply to"},
                "project_title": {"type": "string", "description": "Title of the project (for display)"},
                "cover_letter": {"type": "string", "description": "Personalised proposal / cover letter"},
                "bid_amount": {"type": "number", "description": "Total bid amount in USD"},
                "estimated_hours": {"type": "number", "description": "Estimated hours (optional)"},
                "availability": {"type": "string", "description": "When the freelancer can start, e.g. 'Immediately', 'Next week'"},
            },
            "required": ["project_id", "cover_letter", "bid_amount"],
        },
    },
}

SHARED_ACTION_TOOLS = [NAVIGATE_TOOL, UPDATE_PROFILE_TOOL]

# Extend role toolsets with account-aware + action tools
CLIENT_TOOLS = CLIENT_TOOLS + CLIENT_ACCOUNT_TOOLS + SHARED_ACTION_TOOLS
FREELANCER_TOOLS = (
    FREELANCER_TOOLS + FREELANCER_ACCOUNT_TOOLS + SHARED_ACTION_TOOLS
    + [SEARCH_PROJECTS_TOOL, SUBMIT_PROPOSAL_TOOL]
)

# Guest toolset — safe, read-only, public capabilities only (no account data, no writes).
GUEST_TOOLS = [
    SEARCH_PROJECTS_TOOL,
    NAVIGATE_TOOL,
] + [t for t in CLIENT_TOOLS if t["function"]["name"] in (
    "search_freelancers", "estimate_project_cost", "get_market_rates",
    "plan_project_scope", "get_platform_guide",
)]

# Only these display types have dedicated rich renderers in the frontend widget.
# Other tool results are fed to the LLM, which summarizes them in the chat bubble.
def _as_float(value, default: float) -> float:
    """Coerce an LLM-provided arg to float. The model often sends numbers as
    strings (e.g. "50"), which broke direct numeric comparisons."""
    try:
        if value is None or value == "":
            return float(default)
        return float(value)
    except (TypeError, ValueError):
        return float(default)


def _as_int(value, default: int) -> int:
    try:
        if value is None or value == "":
            return int(default)
        return int(float(value))
    except (TypeError, ValueError):
        return int(default)


CARD_DISPLAY_TYPES = {
    "freelancer_cards", "cost_estimate", "market_rates", "scope_plan",
    "project_list",
    # account-aware cards
    "account_overview", "my_projects", "proposals_received", "my_proposals",
    "my_contracts", "wallet_summary",
    # guided / confirmable actions
    "confirm_post_project", "confirm_submit_proposal", "confirm_update_profile",
    # UI control
    "navigate",
}


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
        # ── Account-aware tools (scoped to current user) ──
        elif tool_name == "get_account_overview":
            return _tool_account_overview(user_id, role)
        elif tool_name == "get_my_projects":
            return _tool_my_projects(args, user_id)
        elif tool_name == "get_proposals_received":
            return _tool_proposals_received(args, user_id)
        elif tool_name == "get_my_contracts":
            return _tool_my_contracts(args, user_id, role)
        elif tool_name == "get_my_proposals":
            return _tool_my_proposals(args, user_id)
        elif tool_name == "get_wallet_summary":
            return _tool_wallet_summary(user_id, role)
        elif tool_name == "propose_post_project":
            return _tool_propose_post_project(args, role)
        # ── Action tools (propose-then-confirm + UI control) ──
        elif tool_name == "search_projects":
            return _tool_find_projects(args, user_id)
        elif tool_name == "submit_proposal":
            return _tool_propose_submit_proposal(args, role)
        elif tool_name == "update_my_profile":
            return _tool_propose_update_profile(args)
        elif tool_name == "navigate":
            return _tool_navigate(args, role)
        else:
            return {"error": f"Unknown tool: {tool_name}"}
    except Exception as e:
        logger.error(f"Tool {tool_name} failed: {e}")
        return {"error": str(e)}


def _tool_search_freelancers(args: dict) -> dict:
    skills = args.get("skills", "")
    max_rate = _as_float(args.get("max_hourly_rate"), 999)
    min_rating = _as_float(args.get("min_rating"), 0)
    limit = min(_as_int(args.get("limit"), 4), 8)

    skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    if not skill_list:
        return {"display_type": "freelancer_cards", "freelancers": []}

    # Freelancer data lives directly on the users table (there is no profiles
    # table); ratings come from the reviews table (reviewee_id).
    conditions = []
    params: list = []
    for sk in skill_list[:3]:
        conditions.append("(u.skills LIKE ? OR u.bio LIKE ? OR u.tagline LIKE ? OR u.name LIKE ?)")
        params.extend([f"%{sk}%", f"%{sk}%", f"%{sk}%", f"%{sk}%"])

    where = f"({' OR '.join(conditions)})" if conditions else "1=1"
    if max_rate < 999:
        where += " AND (u.hourly_rate IS NULL OR u.hourly_rate <= ?)"
        params.append(max_rate)
    # Over-fetch so we can apply the rating filter after computing avg rating.
    params.append(limit * 3)

    result = execute_query(f"""
        SELECT u.id, u.name,
               COALESCE(NULLIF(u.tagline, ''), NULLIF(u.headline, ''), 'Freelancer') AS title,
               u.hourly_rate, u.profile_image_url AS avatar_url, u.skills,
               (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviewee_id = u.id) AS rating
        FROM users u
        WHERE u.role = 'freelancer' AND {where}
        ORDER BY rating DESC, u.hourly_rate ASC
        LIMIT ?
    """, params)

    freelancers = []
    for r in parse_rows(result):
        rating = float(r["rating"]) if r["rating"] else None
        if min_rating and (rating or 0) < min_rating:
            continue
        freelancers.append({
            "id": r["id"], "full_name": r["name"], "title": r["title"],
            "hourly_rate": float(r["hourly_rate"]) if r["hourly_rate"] else None,
            "rating": rating,
            "avatar_url": r["avatar_url"],
        })
        if len(freelancers) >= limit:
            break

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
    limit = min(_as_int(args.get("limit"), 5), 10)
    min_budget = _as_float(args.get("min_budget"), 0)

    skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    conditions = []
    params = []
    if skill_list:
        for sk in skill_list[:3]:
            conditions.append("(p.skills LIKE ? OR p.title LIKE ? OR p.description LIKE ?)")
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
               p.skills, p.created_at, u.name AS posted_by
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        WHERE {where}
        ORDER BY p.created_at DESC
        LIMIT ?
    """, params)

    projects = []
    for r in parse_rows(result):
        full_desc = r["description"] or ""
        desc = full_desc[:150] + ("..." if len(full_desc) > 150 else "")
        projects.append({
            "id": r["id"], "title": r["title"], "description": desc,
            "budget_min": float(r["budget_min"]) if r["budget_min"] else None,
            "budget_max": float(r["budget_max"]) if r["budget_max"] else None,
            "skills": r["skills"], "posted_by": r["posted_by"], "created_at": r["created_at"],
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
# Account-aware tool implementations (scoped to the signed-in user)
# ──────────────────────────────────────────────────────────────────────────────

def _money(val) -> float:
    # Turso cells arrive unwrapped via parse_rows; coerce safely to a number.
    try:
        return round(float(val), 2)
    except (TypeError, ValueError):
        return 0.0


def _rows(query: str, params: list) -> list:
    """Run a query and return a list of dict rows (column-name keyed, unwrapped)."""
    return parse_rows(execute_query(query, params))


def _scalar(query: str, params: list) -> int:
    """Run a COUNT/scalar query and return the first integer value (0 on failure)."""
    rows = _rows(query, params)
    if rows:
        first = next(iter(rows[0].values()), 0)
        try:
            return int(first or 0)
        except (TypeError, ValueError):
            return 0
    return 0


def _user_balance(user_id: int) -> float:
    rows = _rows("SELECT account_balance FROM users WHERE id = ?", [user_id])
    return _money(rows[0]["account_balance"]) if rows else 0.0


def _tool_account_overview(user_id: int, role: str) -> dict:
    """Receptionist snapshot of the user's own account."""
    balance = _user_balance(user_id)

    if role == "freelancer":
        return {
            "display_type": "account_overview",
            "role": "freelancer",
            "active_contracts": _scalar(
                "SELECT COUNT(*) FROM contracts WHERE freelancer_id = ? AND status = 'active'", [user_id]),
            "proposals_submitted": _scalar(
                "SELECT COUNT(*) FROM proposals WHERE freelancer_id = ?", [user_id]),
            "proposals_accepted": _scalar(
                "SELECT COUNT(*) FROM proposals WHERE freelancer_id = ? AND status = 'accepted'", [user_id]),
            "balance": balance,
        }

    # Client
    return {
        "display_type": "account_overview",
        "role": "client",
        "open_projects": _scalar(
            "SELECT COUNT(*) FROM projects WHERE client_id = ? AND status = 'open'", [user_id]),
        "in_progress_projects": _scalar(
            "SELECT COUNT(*) FROM projects WHERE client_id = ? AND status = 'in_progress'", [user_id]),
        "proposals_received": _scalar(
            "SELECT COUNT(*) FROM proposals pr JOIN projects p ON pr.project_id = p.id WHERE p.client_id = ?", [user_id]),
        "active_contracts": _scalar(
            "SELECT COUNT(*) FROM contracts WHERE client_id = ? AND status = 'active'", [user_id]),
        "balance": balance,
    }


def _tool_my_projects(args: dict, user_id: int) -> dict:
    status = (args.get("status") or "").strip().lower()
    limit = min(int(args.get("limit", 5) or 5), 10)
    where = "p.client_id = ?"
    params: list = [user_id]
    if status:
        where += " AND p.status = ?"
        params.append(status)
    params.append(limit)
    rows = _rows(f"""
        SELECT p.id, p.title, p.status, p.budget_min, p.budget_max, p.proposals_count, p.created_at
        FROM projects p
        WHERE {where}
        ORDER BY p.created_at DESC
        LIMIT ?
    """, params)
    projects = [{
        "id": r["id"], "title": r["title"], "status": r["status"],
        "budget_min": _money(r["budget_min"]) if r["budget_min"] is not None else None,
        "budget_max": _money(r["budget_max"]) if r["budget_max"] is not None else None,
        "proposals_count": int(r["proposals_count"] or 0),
        "created_at": r["created_at"],
    } for r in rows]
    return {"display_type": "my_projects", "projects": projects, "total": len(projects)}


def _tool_proposals_received(args: dict, user_id: int) -> dict:
    project_id = args.get("project_id")
    limit = min(int(args.get("limit", 6) or 6), 12)
    where = "p.client_id = ?"
    params: list = [user_id]
    if project_id:
        where += " AND pr.project_id = ?"
        params.append(int(project_id))
    params.append(limit)
    rows = _rows(f"""
        SELECT pr.id, pr.project_id, p.title AS project_title, u.name AS freelancer_name,
               pr.bid_amount, pr.status, pr.created_at
        FROM proposals pr
        JOIN projects p ON pr.project_id = p.id
        LEFT JOIN users u ON pr.freelancer_id = u.id
        WHERE {where}
        ORDER BY pr.created_at DESC
        LIMIT ?
    """, params)
    proposals = [{
        "id": r["id"], "project_id": r["project_id"], "project_title": r["project_title"],
        "freelancer_name": r["freelancer_name"] or "Freelancer",
        "bid_amount": _money(r["bid_amount"]) if r["bid_amount"] is not None else None,
        "status": r["status"], "created_at": r["created_at"],
    } for r in rows]
    return {"display_type": "proposals_received", "proposals": proposals, "total": len(proposals)}


def _tool_my_proposals(args: dict, user_id: int) -> dict:
    status = (args.get("status") or "").strip().lower()
    limit = min(int(args.get("limit", 6) or 6), 12)
    where = "pr.freelancer_id = ?"
    params: list = [user_id]
    if status:
        where += " AND pr.status = ?"
        params.append(status)
    params.append(limit)
    rows = _rows(f"""
        SELECT pr.id, p.title AS project_title, pr.bid_amount, pr.status, pr.created_at
        FROM proposals pr
        LEFT JOIN projects p ON pr.project_id = p.id
        WHERE {where}
        ORDER BY pr.created_at DESC
        LIMIT ?
    """, params)
    proposals = [{
        "id": r["id"], "project_title": r["project_title"] or "Project",
        "bid_amount": _money(r["bid_amount"]) if r["bid_amount"] is not None else None,
        "status": r["status"], "created_at": r["created_at"],
    } for r in rows]
    return {"display_type": "my_proposals", "proposals": proposals, "total": len(proposals)}


def _tool_my_contracts(args: dict, user_id: int, role: str) -> dict:
    status = (args.get("status") or "").strip().lower()
    limit = min(int(args.get("limit", 6) or 6), 12)
    id_col = "freelancer_id" if role == "freelancer" else "client_id"
    other_col = "client_id" if role == "freelancer" else "freelancer_id"
    where = f"c.{id_col} = ?"
    params: list = [user_id]
    if status:
        where += " AND c.status = ?"
        params.append(status)
    params.append(limit)
    rows = _rows(f"""
        SELECT c.id, p.title AS project_title, u.name AS counterparty, c.amount, c.status, c.created_at
        FROM contracts c
        LEFT JOIN projects p ON c.project_id = p.id
        LEFT JOIN users u ON c.{other_col} = u.id
        WHERE {where}
        ORDER BY c.created_at DESC
        LIMIT ?
    """, params)
    contracts = [{
        "id": r["id"], "project_title": r["project_title"] or "Contract",
        "counterparty": r["counterparty"] or ("Client" if role == "freelancer" else "Freelancer"),
        "amount": _money(r["amount"]) if r["amount"] is not None else None,
        "status": r["status"], "created_at": r["created_at"],
    } for r in rows]
    return {"display_type": "my_contracts", "contracts": contracts, "total": len(contracts)}


def _tool_wallet_summary(user_id: int, role: str) -> dict:
    balance = _user_balance(user_id)
    txns = []
    try:
        rows = _rows("""
            SELECT id, type, amount, description, created_at
            FROM wallet_transactions WHERE user_id = ?
            ORDER BY created_at DESC LIMIT 5
        """, [user_id])
        txns = [{
            "id": r["id"], "type": r["type"],
            "amount": _money(r["amount"]) if r["amount"] is not None else None,
            "description": r["description"], "created_at": r["created_at"],
        } for r in rows]
    except Exception as e:
        logger.warning(f"wallet_summary txns failed: {e}")
    label = "Earnings balance" if role == "freelancer" else "Wallet balance"
    return {"display_type": "wallet_summary", "balance": balance, "label": label, "recent_transactions": txns}


# Allowed enum values for a project posting — keep in sync with the Project model.
_PROJECT_CATEGORIES = [
    "Web Development", "Mobile Development", "Data Science & Analytics",
    "Design & Creative", "Writing & Content", "Marketing & Sales",
    "Video & Animation", "Other",
]
_EXPERIENCE_LEVELS = ["Entry", "Intermediate", "Expert"]


def _normalize_project_draft(args: dict) -> dict:
    """Coerce LLM-provided project fields into valid, schema-safe values."""
    def _match(value: str, options: list, default: str) -> str:
        v = (value or "").strip().lower()
        for opt in options:
            if v == opt.lower():
                return opt
        for opt in options:
            if v and (v in opt.lower() or opt.lower() in v):
                return opt
        return default

    budget_type = (args.get("budget_type") or "Fixed").strip().capitalize()
    if budget_type not in ("Fixed", "Hourly"):
        budget_type = "Fixed"

    try:
        budget_min = float(args.get("budget_min") or 0)
    except (TypeError, ValueError):
        budget_min = 0.0
    try:
        budget_max = float(args.get("budget_max") or 0)
    except (TypeError, ValueError):
        budget_max = 0.0
    if budget_max and budget_min and budget_max < budget_min:
        budget_min, budget_max = budget_max, budget_min

    skills = args.get("skills") or ""
    if isinstance(skills, list):
        skills = ", ".join(str(s) for s in skills)

    return {
        "title": (args.get("title") or "Untitled Project").strip()[:255],
        "description": (args.get("description") or "").strip(),
        "category": _match(args.get("category", ""), _PROJECT_CATEGORIES, "Other"),
        "budget_type": budget_type,
        "budget_min": budget_min,
        "budget_max": budget_max,
        "experience_level": _match(args.get("experience_level", ""), _EXPERIENCE_LEVELS, "Intermediate"),
        "estimated_duration": (args.get("estimated_duration") or "1-4 weeks").strip()[:50],
        "skills": skills.strip(),
    }


def _tool_propose_post_project(args: dict, role: str) -> dict:
    """Build a project-posting confirmation card. Does NOT create anything —
    the client must confirm via the /actions/post-project endpoint."""
    if role != "client":
        return {"display_type": "text", "text": "Only client accounts can post projects."}
    draft = _normalize_project_draft(args)
    return {
        "display_type": "confirm_post_project",
        "draft": draft,
        "confirm_endpoint": "/ai/client-assistant/actions/post-project",
        "note": "Review the details below. Nothing is published until you press Confirm.",
    }


# Profile fields the assistant is allowed to draft an update for (a safe subset of
# the user-editable columns; must stay aligned with users.py _EDITABLE_PROFILE_FIELDS).
_PROFILE_EDITABLE_FIELDS = {
    "bio", "headline", "hourly_rate", "skills", "location",
    "availability_status", "languages",
    "linkedin_url", "github_url", "website_url",
}
_PROFILE_FIELD_LABELS = {
    "bio": "Bio / About", "headline": "Professional Headline", "hourly_rate": "Hourly Rate",
    "skills": "Skills", "location": "Location", "availability_status": "Availability",
    "languages": "Languages", "linkedin_url": "LinkedIn", "github_url": "GitHub",
    "website_url": "Website",
}


def _normalize_profile_draft(args: dict) -> dict:
    """Keep only whitelisted, non-empty profile fields with light coercion."""
    draft: dict = {}
    for key, value in (args or {}).items():
        if key not in _PROFILE_EDITABLE_FIELDS or value in (None, ""):
            continue
        if key == "hourly_rate":
            try:
                draft[key] = round(float(value), 2)
            except (TypeError, ValueError):
                continue
        elif isinstance(value, list):
            draft[key] = ", ".join(str(v).strip() for v in value if str(v).strip())
        else:
            draft[key] = str(value).strip()
    return draft


def _tool_propose_update_profile(args: dict) -> dict:
    """Build a profile-update confirmation card. Does NOT write anything."""
    draft = _normalize_profile_draft(args)
    if not draft:
        return {"display_type": "text", "text": "Tell me what you'd like to change on your profile — for example your bio, headline, hourly rate, skills, or location."}
    fields = [{"key": k, "label": _PROFILE_FIELD_LABELS.get(k, k), "value": str(v)} for k, v in draft.items()]
    return {
        "display_type": "confirm_update_profile",
        "draft": draft,
        "fields": fields,
        "confirm_endpoint": "/ai/client-assistant/actions/update-profile",
        "note": "Review the changes below. Your profile only updates after you press Confirm.",
    }


def _tool_propose_submit_proposal(args: dict, role: str) -> dict:
    """Build a proposal confirmation card for a freelancer. Does NOT submit anything."""
    if role != "freelancer":
        return {"display_type": "text", "text": "Only freelancer accounts can submit proposals to projects."}
    try:
        project_id = int(args.get("project_id"))
    except (TypeError, ValueError):
        return {"display_type": "text", "text": "I need to know which project to apply to. Ask me to find matching projects first, then tell me which one."}

    # Validate the project is real and open before offering to apply.
    rows = _rows("SELECT id, title, status, client_id FROM projects WHERE id = ?", [project_id])
    if not rows:
        return {"display_type": "text", "text": f"I couldn't find project #{project_id}. Let me search for open projects instead."}
    proj = rows[0]
    if (proj.get("status") or "").lower() != "open":
        return {"display_type": "text", "text": f"Project '{proj.get('title') or project_id}' is no longer open for proposals."}

    try:
        bid_amount = round(float(args.get("bid_amount") or 0), 2)
    except (TypeError, ValueError):
        bid_amount = 0.0
    try:
        estimated_hours = float(args.get("estimated_hours")) if args.get("estimated_hours") not in (None, "") else None
    except (TypeError, ValueError):
        estimated_hours = None

    draft = {
        "project_id": project_id,
        "project_title": args.get("project_title") or proj.get("title") or f"Project #{project_id}",
        "cover_letter": (args.get("cover_letter") or "").strip(),
        "bid_amount": bid_amount,
        "estimated_hours": estimated_hours,
        "availability": (args.get("availability") or "").strip(),
    }
    return {
        "display_type": "confirm_submit_proposal",
        "draft": draft,
        "confirm_endpoint": "/ai/client-assistant/actions/submit-proposal",
        "note": "Review your proposal below. It is only sent to the client after you press Confirm.",
    }


# Pages a guest may be routed to; signed-in users may go anywhere in-app.
_GUEST_NAV_ALLOW = {
    "/", "/projects", "/freelancers", "/signup", "/login", "/pricing",
    "/how-it-works", "/about", "/blog", "/contact", "/ai",
}


def _tool_navigate(args: dict, role: str) -> dict:
    """Return a UI navigation instruction for the widget to act on."""
    path = (args.get("path") or "").strip()
    if not path.startswith("/"):
        path = "/" + path
    label = (args.get("label") or "Open page").strip()[:40]
    return {"display_type": "navigate", "path": path, "label": label}


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


_MAX_TOOL_ROUNDS = 4  # how many times the agent may call tools before it must answer


async def _run_openai_chat(
    user_message: str,
    history: list,
    system_prompt: str,
    tools: list,
    user_id: int,
    role: str,
) -> dict:
    """OpenAI-compatible (DigitalOcean) tool-use chat with multi-round agentic
    tool calling. The model may call tools, see the results, then call more
    tools (e.g. find a project → draft a proposal) before composing its reply.
    """
    import httpx

    messages = [{"role": "system", "content": system_prompt}]
    for h in history[-8:]:
        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
    messages.append({"role": "user", "content": user_message})

    tool_results_for_frontend: list = []
    called_tools: list = []
    headers = {"Authorization": f"Bearer {llm_gateway.do_api_key}", "Content-Type": "application/json"}

    async def _complete(payload: dict, timeout: float) -> Optional[dict]:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                f"{llm_gateway.do_api_base}/chat/completions", headers=headers, json=payload,
            )
        if resp.status_code != 200:
            logger.error(f"DO LLM error {resp.status_code}: {resp.text[:200]}")
            return None
        return resp.json()

    try:
        final_content = ""
        for round_idx in range(_MAX_TOOL_ROUNDS):
            # On the last allowed round, drop tools so the model is forced to answer.
            offer_tools = round_idx < _MAX_TOOL_ROUNDS - 1
            payload: dict = {
                "model": llm_gateway.do_model,
                "messages": messages,
                "max_tokens": 1000,
                "temperature": 0.7,
            }
            if offer_tools:
                payload["tools"] = tools
                payload["tool_choice"] = "auto"

            data = await _complete(payload, 45.0)
            if data is None:
                return _fallback_response(user_message, role) if round_idx == 0 else {
                    "message": final_content or "I found relevant information for you. See the results above.",
                    "tool_results": tool_results_for_frontend,
                    "suggestions": _generate_suggestions(user_message, role, bool(tool_results_for_frontend)),
                    "action_buttons": _generate_action_buttons(user_message, role, tool_results_for_frontend, called_tools),
                }

            choice = data.get("choices", [{}])[0]
            assistant_msg = choice.get("message", {})
            finish_reason = choice.get("finish_reason", "stop")

            if finish_reason == "tool_calls" and assistant_msg.get("tool_calls"):
                messages.append(assistant_msg)
                for tc in assistant_msg["tool_calls"]:
                    fn = tc.get("function", {})
                    tool_name = fn.get("name", "")
                    try:
                        args = json.loads(fn.get("arguments", "{}"))
                    except json.JSONDecodeError:
                        args = {}
                    called_tools.append(tool_name)
                    result = _execute_tool(tool_name, args, user_id, role)
                    # Forward only results with a dedicated rich renderer; everything
                    # else is fed back to the model to summarise conversationally.
                    if result.get("display_type") in CARD_DISPLAY_TYPES:
                        tool_results_for_frontend.append({
                            "tool_name": tool_name,
                            "data": result,
                            "display_type": result.get("display_type", "text"),
                        })
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.get("id", ""),
                        "content": json.dumps(result),
                    })
                continue  # let the model react to the tool results

            # No (more) tool calls — this is the final answer.
            final_content = assistant_msg.get("content", "") or final_content
            break

        if not final_content:
            final_content = (
                "Here's what I found for you above." if tool_results_for_frontend
                else _fallback_response(user_message, role)["message"]
            )

        suggestions = _generate_suggestions(user_message, role, bool(tool_results_for_frontend))
        action_buttons = _generate_action_buttons(user_message, role, tool_results_for_frontend, called_tools)
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


def _generate_action_buttons(message: str, role: str, tool_results: list, called_tools: Optional[list] = None) -> list:
    """Build deep-link buttons routing the user to the right portal page.

    Account-aware: if the assistant looked up the user's projects/proposals/
    contracts/wallet, surface a button that jumps straight to that section.
    """
    called = set(called_tools or [])
    m = message.lower()
    is_freelancer = role == "freelancer"
    base = "/freelancer" if is_freelancer else "/client"

    buttons: list = []

    def add(label: str, href: str, variant: str = "primary"):
        if not any(b["href"] == href for b in buttons):
            buttons.append({"label": label, "href": href, "variant": variant})

    # 1) Account-aware navigation based on which data the agent fetched
    if "get_proposals_received" in called:
        add("Review Proposals", "/client/proposals")
    if "get_my_proposals" in called:
        add("My Proposals", "/freelancer/proposals")
    if "get_my_projects" in called:
        add("My Projects", "/client/projects", "secondary")
    if "get_my_contracts" in called:
        add("View Contracts", f"{base}/contracts", "secondary")
    if "get_wallet_summary" in called:
        add("Open Wallet", f"{base}/wallet", "secondary")
    if "get_account_overview" in called:
        add("Go to Dashboard", f"{base}/dashboard", "secondary")

    # 2) Card-driven navigation
    has_freelancers = any(tr.get("display_type") == "freelancer_cards" for tr in tool_results)
    if has_freelancers:
        add("Browse All Talent", "/client/search")
        add("Post a Project", "/client/post-job", "secondary")

    # 3) Intent-driven fallbacks (only if nothing else matched)
    if not buttons:
        if is_freelancer:
            if any(w in m for w in ["find work", "find project", "browse", "apply", "proposal"]):
                add("Browse Jobs", "/freelancer/jobs")
            elif any(w in m for w in ["profile", "portfolio", "improve"]):
                add("Edit My Profile", "/freelancer/profile")
        else:
            if any(w in m for w in ["hire", "post project", "find freelancer", "post a job"]):
                add("Post a Project", "/client/post-job")
            elif any(w in m for w in ["freelancer", "developer", "designer", "talent"]):
                add("Browse Freelancers", "/client/search")

    return buttons[:3]


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

    try:
        result = await asyncio.wait_for(
            _run_llm_chat(
                user_message=body.message,
                history=body.conversation_history,
                system_prompt=system_prompt,
                tools=tools,
                user_id=current_user.id,
                role=role,
            ),
            timeout=20.0,
        )
    except asyncio.TimeoutError:
        result = _fallback_response(body.message, role)
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


class PostProjectAction(BaseModel):
    title: str
    description: str = ""
    category: str = "Other"
    budget_type: str = "Fixed"
    budget_min: float = 0
    budget_max: float = 0
    experience_level: str = "Intermediate"
    estimated_duration: str = "1-4 weeks"
    skills: str = ""


@router.post("/client-assistant/actions/post-project")
async def action_post_project(body: PostProjectAction, current_user=Depends(get_current_user)):
    """Guided action: actually publish a project the assistant drafted.
    Only clients may post; the draft is re-normalized server-side for safety."""
    role = getattr(current_user, "role", None) or getattr(current_user, "user_type", "client")
    role = (role or "client").lower()
    if role != "client":
        raise HTTPException(status_code=403, detail="Only client accounts can post projects.")

    draft = _normalize_project_draft(body.model_dump())
    if not draft["title"] or not draft["description"]:
        raise HTTPException(status_code=400, detail="A title and description are required to post a project.")

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO projects (title, description, category, budget_type, budget_min, budget_max,
                  skills, estimated_duration, experience_level, status, client_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?)""",
        [
            draft["title"], draft["description"], draft["category"], draft["budget_type"],
            draft["budget_min"], draft["budget_max"], draft["skills"],
            draft["estimated_duration"], draft["experience_level"],
            current_user.id, now, now,
        ],
    )
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to post the project. Please try again.")

    id_result = execute_query(
        "SELECT id FROM projects WHERE client_id = ? AND title = ? ORDER BY id DESC LIMIT 1",
        [current_user.id, draft["title"]],
    )
    project_id = None
    if id_result and id_result.get("rows"):
        raw = id_result["rows"][0][0]
        if isinstance(raw, dict):
            raw = raw.get("value")
        project_id = int(raw) if raw else None

    return {
        "message": f"✅ Your project '{draft['title']}' is now live! Freelancers can start submitting proposals.",
        "project_id": project_id,
        "url": f"/client/projects/{project_id}" if project_id else "/client/projects",
    }


class SubmitProposalAction(BaseModel):
    project_id: int
    cover_letter: str
    bid_amount: float = 0
    estimated_hours: Optional[float] = None
    availability: Optional[str] = None


@router.post("/client-assistant/actions/submit-proposal")
async def action_submit_proposal(body: SubmitProposalAction, current_user=Depends(get_current_user)):
    """Guided action: actually submit a proposal the assistant drafted.
    Only freelancers may apply; reuses the validated proposals service."""
    from app.services.proposals_service import (
        project_exists, get_project_status, has_submitted_proposal, create_proposal,
    )

    role = getattr(current_user, "role", None) or getattr(current_user, "user_type", "freelancer")
    role = (role or "freelancer").lower()
    if role != "freelancer":
        raise HTTPException(status_code=403, detail="Only freelancer accounts can submit proposals.")

    if not body.cover_letter.strip():
        raise HTTPException(status_code=400, detail="A cover letter is required.")
    if not project_exists(body.project_id):
        raise HTTPException(status_code=404, detail="That project no longer exists.")
    if get_project_status(body.project_id) != "open":
        raise HTTPException(status_code=400, detail="This project is no longer accepting proposals.")
    if has_submitted_proposal(body.project_id, current_user.id):
        raise HTTPException(status_code=409, detail="You already submitted a proposal for this project.")

    proposal = create_proposal(current_user.id, {
        "project_id": body.project_id,
        "cover_letter": body.cover_letter.strip(),
        "bid_amount": body.bid_amount or 0,
        "estimated_hours": body.estimated_hours or 0,
        "availability": (body.availability or "").strip(),
    })
    if not proposal:
        raise HTTPException(status_code=500, detail="Failed to submit the proposal. Please try again.")

    return {
        "message": "✅ Your proposal has been submitted! You'll be notified when the client responds.",
        "proposal_id": proposal.get("id"),
        "url": "/freelancer/proposals",
    }


@router.post("/client-assistant/actions/update-profile")
async def action_update_profile(body: dict, current_user=Depends(get_current_user)):
    """Guided action: apply a profile update the assistant drafted. Whitelisted
    fields only; scoped to the signed-in user."""
    draft = _normalize_profile_draft(body or {})
    if not draft:
        raise HTTPException(status_code=400, detail="No valid profile fields to update.")

    now = datetime.now(timezone.utc).isoformat()
    updates = dict(draft)
    updates["updated_at"] = now
    set_parts = [f"{k} = ?" for k in updates]
    values = list(updates.values()) + [current_user.id]
    result = execute_query(f"UPDATE users SET {', '.join(set_parts)} WHERE id = ?", values)
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to update your profile. Please try again.")

    changed = ", ".join(_PROFILE_FIELD_LABELS.get(k, k) for k in draft)
    role = getattr(current_user, "role", None) or getattr(current_user, "user_type", "freelancer")
    role = (role or "freelancer").lower()
    return {
        "message": f"✅ Profile updated: {changed}.",
        "url": f"/{'freelancer' if role == 'freelancer' else 'client'}/profile",
    }


class AddPortfolioAction(BaseModel):
    title: str
    description: Optional[str] = ""
    skills: Optional[list] = []
    media: Optional[str] = ""


@router.post("/client-assistant/actions/add-portfolio")
async def action_add_portfolio(body: AddPortfolioAction, current_user=Depends(get_current_user)):
    """Guided action: save a portfolio piece the build_portfolio flow collected.
    Only freelancers may add portfolio items."""
    import json

    role = getattr(current_user, "role", None) or getattr(current_user, "user_type", "freelancer")
    role = (role or "freelancer").lower()
    if role not in ("freelancer",):
        raise HTTPException(status_code=403, detail="Only freelancer accounts can add portfolio items.")

    title = (body.title or "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="A portfolio title is required.")

    description = (body.description or "").strip()
    skills_list = [s.strip() for s in (body.skills or []) if str(s).strip()]
    skills_str = json.dumps(skills_list)

    media_url = (body.media or "").strip()
    image_url = media_url if media_url.startswith("http") else None
    project_url = media_url if media_url.startswith("http") else None

    now = datetime.now(timezone.utc).isoformat()
    result = execute_query(
        """INSERT INTO portfolio_items (user_id, title, description, image_url, project_url,
               category, skills, views, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'General', ?, 0, ?, ?)""",
        [current_user.id, title, description, image_url, project_url, skills_str, now, now],
    )
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to save the portfolio item. Please try again.")

    return {
        "message": f"🎉 Portfolio piece **'{title}'** added to your profile!",
        "url": "/freelancer/profile",
    }



@router.post("/client-assistant/guest-chat")
async def guest_chat(body: ChatRequest, request: Request = None):
    """Public, unauthenticated agent for visitors. Uses a safe read-only toolset
    (search projects/freelancers, estimates, market rates, guides, navigation) —
    no account access and no write actions. Rate-limited per IP."""
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    client_ip = request.client.host if request and request.client else "unknown"
    if not _check_guest_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Guest limit reached. Sign up for unlimited assistance!")

    system_prompt = _GUEST_SYSTEM
    if body.page_context:
        system_prompt += f"\n\nThe visitor is currently on page: {body.page_context}"

    try:
        result = await asyncio.wait_for(
            _run_llm_chat(
                user_message=body.message,
                history=body.conversation_history,
                system_prompt=system_prompt,
                tools=GUEST_TOOLS,
                user_id=0,
                role="guest",
            ),
            timeout=20.0,
        )
    except asyncio.TimeoutError:
        result = _fallback_response(body.message, "guest")
    result["guest_remaining"] = max(0, _GUEST_DAILY_LIMIT - len(_guest_usage.get(client_ip, [])))
    return result


@router.get("/client-assistant/suggestions")
async def get_suggestions(page: Optional[str] = None, current_user=Depends(get_current_user)):
    role = getattr(current_user, "role", None) or getattr(current_user, "user_type", "client")
    role = (role or "client").lower()
    suggestions = _generate_suggestions(page or "", role, False)
    return {"suggestions": suggestions, "role": role}
