"""End-to-End automated test suite for AI Assistant, Hiring Concierge, and Pricing Intelligence.

Covers:
1. Natural requirement extraction via /ai/client-assistant/chat & /guest-chat
   with tool calls (search_freelancers, estimate_project_cost, propose_post_project).
2. Role-specific welcome messages & quick actions via GET /ai/client-assistant/welcome.
3. Project creation confirmation action via POST /ai/client-assistant/actions/post-project.
4. Market rate & price estimation endpoints (/ai/estimate-rate, /price-estimator/estimate, /ai/estimate-price).
"""

import json
from types import SimpleNamespace
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient

from main import app
from app.api.v1.ai import client_assistant
from app.api.v1.ai import ai_services
from app.api.v1.core_domain import price_estimator


# ---------------------------------------------------------------------------
# Test Helpers & Fixtures
# ---------------------------------------------------------------------------

def _mock_db_result(columns=(), rows=(), *, last_id=None, affected=0):
    return {
        "cols": [{"name": c} for c in columns],
        "rows": [[{"type": "text", "value": val} for val in row] for row in rows],
        "last_insert_rowid": last_id,
        "rows_affected": affected,
    }


@pytest.fixture
def test_client():
    return TestClient(app)


# ---------------------------------------------------------------------------
# 1. Welcome Message Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_welcome_for_client_role():
    """Client role receives hiring-focused welcome message and action suggestions."""
    client_user = SimpleNamespace(id=1, name="Alice Client", role="client", user_type="client")
    res = await client_assistant.get_welcome(current_user=client_user)

    assert "Megi" in res["message"]
    assert "hiring" in res["message"].lower() or "find" in res["message"].lower()
    assert isinstance(res["suggestions"], list)
    assert len(res["suggestions"]) >= 2
    assert isinstance(res["action_buttons"], list)
    assert len(res["action_buttons"]) >= 1
    assert any(b["href"] == "/client/projects/create" for b in res["action_buttons"])


@pytest.mark.asyncio
async def test_get_welcome_for_freelancer_role():
    """Freelancer role receives career-focused welcome message and suggestions."""
    freelancer_user = SimpleNamespace(id=2, name="Bob Coder", role="freelancer", user_type="freelancer")
    res = await client_assistant.get_welcome(current_user=freelancer_user)

    assert "Megi" in res["message"]
    assert "career" in res["message"].lower() or "projects" in res["message"].lower()
    assert any("project" in s.lower() or "rate" in s.lower() or "proposal" in s.lower() for s in res["suggestions"])
    assert isinstance(res["action_buttons"], list)


@pytest.mark.asyncio
async def test_get_welcome_for_admin_role():
    """Admin role receives platform intelligence welcome message."""
    admin_user = SimpleNamespace(id=3, name="Admin Lead", role="admin", user_type="admin")
    res = await client_assistant.get_welcome(current_user=admin_user)

    assert "Megi" in res["message"]
    assert "platform" in res["message"].lower() or "analytics" in res["message"].lower()
    assert isinstance(res["action_buttons"], list)


# ---------------------------------------------------------------------------
# 2. Natural Requirement Extraction & Tool Calling Tests
# ---------------------------------------------------------------------------

def test_tool_search_freelancers_execution(monkeypatch):
    """search_freelancers queries talent directory and returns structured cards."""
    fake_freelancers = [
        [10, "Dev One", "Senior React Dev", 65.0, "https://example.com/a.jpg", "React, TypeScript, Node.js", 4.9],
        [11, "Dev Two", "Python Backend Pro", 55.0, None, "Python, FastAPI, Docker", 4.8],
    ]

    def mock_execute(sql, params=None):
        if "FROM users" in sql:
            return _mock_db_result(
                ["id", "name", "title", "hourly_rate", "avatar_url", "skills", "rating"],
                fake_freelancers,
            )
        return _mock_db_result()

    monkeypatch.setattr(client_assistant, "execute_query", mock_execute)

    result = client_assistant._tool_search_freelancers({"skills": "React, Python", "limit": 4})

    assert result["display_type"] == "freelancer_cards"
    assert len(result["freelancers"]) == 2
    assert result["freelancers"][0]["full_name"] == "Dev One"
    assert result["freelancers"][0]["hourly_rate"] == 65.0
    assert result["freelancers"][0]["rating"] == 4.9
    assert "React" in result["freelancers"][0]["skills"]


def test_tool_estimate_cost_execution():
    """estimate_project_cost calculates budget ranges and timeline milestones."""
    result = client_assistant._tool_estimate_cost({"project_type": "web_app", "complexity": "medium"})

    assert result["display_type"] == "cost_estimate"
    assert result["total_min"] >= 2000
    assert result["total_max"] >= result["total_min"]
    assert "estimated_timeline" in result
    assert "phases" in result


def test_tool_propose_post_project_execution():
    """propose_post_project returns an interactive confirmation draft."""
    draft_args = {
        "title": "Build AI MVP",
        "description": "Full-stack Next.js and FastAPI application with Turso database",
        "category": "Web Development",
        "budget_min": 1500,
        "budget_max": 3000,
        "skills": "React, Python, FastAPI",
    }
    result = client_assistant._tool_propose_post_project(draft_args, role="client")

    assert result["display_type"] == "confirm_post_project"
    assert result["confirm_endpoint"] == "/ai/client-assistant/actions/post-project"
    assert result["draft"]["title"] == "Build AI MVP"
    assert result["draft"]["budget_min"] == 1500


@pytest.mark.asyncio
async def test_client_assistant_chat_end_to_end(monkeypatch):
    """POST /ai/client-assistant/chat processes client request, executes tools, and generates action buttons."""
    fake_freelancers = [
        [101, "Sarah Connor", "Full Stack AI Dev", 70.0, None, "React, FastAPI, Python", 5.0],
    ]

    def mock_execute(sql, params=None):
        if "FROM users" in sql:
            return _mock_db_result(
                ["id", "name", "title", "hourly_rate", "avatar_url", "skills", "rating"],
                fake_freelancers,
            )
        return _mock_db_result()

    monkeypatch.setattr(client_assistant, "execute_query", mock_execute)

    # Test tool invocation via fallback execution
    req = client_assistant.ChatRequest(
        message="I need a React and Python developer for a 2-month fintech web app with $4000 budget",
        conversation_history=[],
    )
    client_user = SimpleNamespace(id=5, name="John Doe", role="client", user_type="client")

    resp = await client_assistant.chat(
        body=req,
        current_user=client_user,
    )

    # Verify response structure (supports both direct dict or pydantic response)
    reply_text = resp.get("reply") or resp.get("message") if isinstance(resp, dict) else getattr(resp, "reply", None)
    assert reply_text is not None

    action_buttons = resp.get("action_buttons") if isinstance(resp, dict) else getattr(resp, "action_buttons", [])
    assert isinstance(action_buttons, list)
    # Action buttons must use valid client portal routes
    for btn in action_buttons:
        assert btn["href"].startswith("/")
        assert "/client/post-job" not in btn["href"]
        assert "/client/proposals" not in btn["href"]


@pytest.mark.asyncio
async def test_guest_chat_endpoint():
    """POST /ai/client-assistant/guest-chat works for unauthenticated guests."""
    req = client_assistant.ChatRequest(
        message="What is the hourly rate for a React developer?",
        conversation_history=[],
    )

    resp = await client_assistant.guest_chat(body=req)

    reply_text = resp.get("reply") or resp.get("message") if isinstance(resp, dict) else getattr(resp, "reply", None)
    assert reply_text is not None

    suggestions = resp.get("suggestions") if isinstance(resp, dict) else getattr(resp, "suggestions", [])
    assert isinstance(suggestions, list)


# ---------------------------------------------------------------------------
# 3. Project Creation Confirmation Action Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_post_project_action_creates_project(monkeypatch):
    """POST /ai/client-assistant/actions/post-project inserts project and returns URL."""
    inserted = {}

    def mock_execute(sql, params=None):
        params = params or []
        if "INSERT INTO projects" in sql:
            inserted["sql"] = sql
            inserted["params"] = params
            return _mock_db_result(last_id=777, affected=1)
        if "SELECT id FROM projects" in sql:
            return _mock_db_result(["id"], [[777]])
        return _mock_db_result()

    monkeypatch.setattr(client_assistant, "execute_query", mock_execute)

    draft = {
        "title": "Healthcare Management System",
        "description": "Full-stack patient portal with appointment booking and secure records.",
        "category": "Web Development",
        "budget_type": "fixed",
        "budget_min": 2500,
        "budget_max": 5000,
        "skills": "React, Node.js, PostgreSQL",
        "experience_level": "intermediate",
        "estimated_duration": "4 weeks",
    }

    client_user = SimpleNamespace(id=12, name="Med Corp", role="client", user_type="client")
    res = await client_assistant.action_post_project(
        body=client_assistant.PostProjectAction(**draft),
        current_user=client_user,
    )

    assert res["project_id"] == 777
    assert res["url"] == "/client/projects/777"
    assert "Healthcare Management System" in res["message"]


@pytest.mark.asyncio
async def test_post_project_action_rejects_freelancer_role():
    """Freelancers cannot execute post-project client action."""
    draft = {
        "title": "Invalid Job",
        "description": "This should fail because role is freelancer",
    }
    freelancer_user = SimpleNamespace(id=20, name="Sam", role="freelancer", user_type="freelancer")

    with pytest.raises(client_assistant.HTTPException) as exc:
        await client_assistant.action_post_project(
            body=client_assistant.PostProjectAction(**draft),
            current_user=freelancer_user,
        )

    assert exc.value.status_code == 403


# ---------------------------------------------------------------------------
# 4. Market Rate and Price Estimation Endpoint Tests
# ---------------------------------------------------------------------------

def test_estimate_rate_endpoint(monkeypatch):
    """POST /ai/estimate-rate calculates real market rate and sample confidence."""
    def mock_execute(sql, params=None):
        return _mock_db_result(
            ["hourly_rate", "experience_level", "seller_level", "skills"],
            [[50.0, "intermediate", "top", "react, node"], [70.0, "expert", "top", "react, python"]],
        )

    monkeypatch.setattr(ai_services, "execute_query", mock_execute)

    req = ai_services.RateEstimateRequest(skills=["react"], experience_level="intermediate")
    res = ai_services.estimate_rate(req)

    assert res["estimated_rate"] >= 50.0
    assert "range" in res
    assert res["range"]["min"] <= res["range"]["max"]
    assert res["confidence"] > 0.0


def test_estimate_project_price_endpoint(monkeypatch):
    """POST /ai/estimate-price returns compatible price payload matching frontend schema."""
    def mock_execute(sql, params=None):
        return _mock_db_result(["avg_rate", "min_rate", "max_rate"], [[60.0, 30.0, 100.0]])

    monkeypatch.setattr(ai_services, "execute_query", mock_execute)

    req = ai_services.ProjectPriceEstimateRequest(
        category="Web Development",
        skills_required=["React", "FastAPI"],
        description="Build an e-commerce platform with catalog, cart, and stripe payments",
        complexity="medium",
        estimated_hours=80,
    )
    res = ai_services.estimate_project_price(req)

    assert res["estimated_hourly_rate"] > 0
    assert res["estimated_total"] == round(res["estimated_hourly_rate"] * 80, 2)
    assert res["estimated_hours"] == 80
    assert res["low_estimate"] < res["high_estimate"]
    assert res["complexity"] == "medium"
    assert res["category"] == "Web Development"
    assert isinstance(res["factors"], list)
    assert len(res["factors"]) >= 3


def test_price_estimator_engine_endpoint():
    """POST /price-estimator/estimate generates comprehensive pricing models."""
    body = price_estimator.EstimateRequest(
        service_type="web_application",
        category="software_development",
        scope="medium",
        quality_tier="standard",
        urgency="standard",
        experience_level="intermediate",
        estimated_hours=100,
    )

    res = price_estimator.estimate_price(body)

    assert "estimate" in res
    assert res["estimate"]["hourly_rate"] > 0
    assert res["estimate"]["total_hours"] >= 100
    assert res["estimate"]["total_estimate"] > 0
    assert "breakdown" in res
    assert len(res["breakdown"]) >= 3
    assert "confidence" in res
    assert "factors" in res
