"""Tests for chatbot multi-step flow: post_project and build_portfolio.

These tests exercise the full flow from intent detection → step-by-step
questions → final DB record creation, all via mocked execute_query and
create_project helpers.
"""
import pytest
import json
from datetime import datetime, timezone
from app.services.ai_chatbot import get_chatbot_service

# ---------------------------------------------------------------------------
# Mock Database and Helpers
# ---------------------------------------------------------------------------
mock_db: dict = {
    "conversations": {},
    "projects": [],
    "portfolio_items": [],
}


def _cell(val):
    if val is None:
        return {"type": "null", "value": None}
    return {"type": "text", "value": str(val) if not isinstance(val, (int, float)) else val}


def format_res(columns: list, rows: list) -> dict:
    cols = [{"name": col} for col in columns]
    formatted_rows = [[_cell(v) for v in row] for row in rows]
    return {"cols": cols, "rows": formatted_rows}


def _fake_execute_query(sql: str, params=None):
    sql_upper = sql.strip().upper()
    params = params or []

    # ── SELECT conversation ─────────────────────────────────────────────────
    if "SELECT * FROM CHATBOT_CONVERSATIONS WHERE ID = ?" in sql_upper:
        cid = params[0]
        conv = mock_db["conversations"].get(cid)
        if not conv:
            return format_res([], [])
        return format_res(
            ["id", "user_id", "state", "escalated", "intents_detected",
             "sentiment_history", "context", "last_activity"],
            [[
                conv["id"],
                conv.get("user_id"),
                conv.get("state", "active"),
                1 if conv.get("escalated") else 0,
                json.dumps(conv.get("intents_detected", [])),
                json.dumps(conv.get("sentiment_history", [])),
                json.dumps(conv.get("context", {})),
                conv.get("last_activity", ""),
            ]]
        )

    # ── UPDATE conversation context ─────────────────────────────────────────
    if ("UPDATE CHATBOT_CONVERSATIONS" in sql_upper and "CONTEXT = ?" in sql_upper
            and "LAST_ACTIVITY" not in sql_upper):
        ctx_data = json.loads(params[0])
        cid = params[1]
        if cid in mock_db["conversations"]:
            mock_db["conversations"][cid]["context"] = ctx_data
        return format_res([], [])

    # ── UPDATE conversation activity/intents ────────────────────────────────
    if ("UPDATE CHATBOT_CONVERSATIONS" in sql_upper and "LAST_ACTIVITY = ?" in sql_upper):
        cid = params[3]
        if cid in mock_db["conversations"]:
            mock_db["conversations"][cid]["last_activity"] = params[0]
            mock_db["conversations"][cid]["intents_detected"] = json.loads(params[1])
            mock_db["conversations"][cid]["sentiment_history"] = json.loads(params[2])
        return format_res([], [])

    # ── UPDATE escalation ───────────────────────────────────────────────────
    if "UPDATE CHATBOT_CONVERSATIONS" in sql_upper and "ESCALATED" in sql_upper:
        return format_res([], [])

    # ── INSERT chatbot messages ─────────────────────────────────────────────
    if "INSERT INTO CHATBOT_MESSAGES" in sql_upper:
        return format_res([], [])

    # ── SELECT user profile ─────────────────────────────────────────────────
    if "FROM USERS WHERE ID = ?" in sql_upper:
        return format_res(
            ["name", "bio", "skills", "hourly_rate", "profile_image_url",
             "location", "headline", "certifications", "education"],
            [["Bob", "Freelancer bio", "python, fastapi", 50.0,
              "http://example.com/avatar.jpg", "USA", "Python Developer", None, None]]
        )

    # ── SELECT portfolio count ──────────────────────────────────────────────
    if "SELECT COUNT(*)" in sql_upper and "PORTFOLIO_ITEMS" in sql_upper:
        user_id = params[0] if params else None
        count = sum(1 for p in mock_db["portfolio_items"] if p.get("user_id") == user_id)
        return format_res(["cnt"], [[count]])

    # ── INSERT portfolio_items ──────────────────────────────────────────────
    if "INSERT INTO PORTFOLIO_ITEMS" in sql_upper:
        # params: [user_id, title, description, image_url, project_url, skills_str, now_str, now_str]
        mock_db["portfolio_items"].append({
            "user_id": params[0],
            "title": params[1],
            "description": params[2],
            "image_url": params[3],
            "project_url": params[4],
            "skills": params[5],  # skills_str at index 5
        })
        return format_res([], [])

    # Default: return empty result
    return format_res([], [])


def _fake_create_project(client_id, title, description, budget_min, budget_max,
                         budget_type, category, timeline, skills, now):
    project = {
        "client_id": client_id, "title": title, "description": description,
        "budget_min": budget_min, "budget_max": budget_max, "budget_type": budget_type,
        "category": category, "timeline": timeline, "skills": skills,
    }
    mock_db["projects"].append(project)
    return project


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def setup_mocks(monkeypatch):
    monkeypatch.setattr("app.services.ai_chatbot.execute_query", _fake_execute_query)
    monkeypatch.setattr("app.services.ai_chatbot.parse_rows",
                        __import__("app.db.turso_http", fromlist=["parse_rows"]).parse_rows)
    monkeypatch.setattr("app.services.portal_service.create_project", _fake_create_project)

    # Reset mock state between tests
    mock_db["conversations"] = {}
    mock_db["projects"] = []
    mock_db["portfolio_items"] = []


def _seed_conv(cid: str, uid: int) -> None:
    """Seed a fresh active conversation in the mock DB."""
    mock_db["conversations"][cid] = {
        "id": cid,
        "user_id": uid,
        "state": "active",
        "escalated": False,
        "intents_detected": [],
        "sentiment_history": [],
        "context": {},
        "last_activity": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Test Cases
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_post_project_flow():
    """Full 5-step post_project flow creates a project in the DB."""
    chatbot = get_chatbot_service()
    cid = "test_conv_post_project"
    uid = 42
    _seed_conv(cid, uid)

    # --- Trigger flow: bot should prompt for category
    resp = await chatbot.send_message(
        conversation_id=cid,
        message="I want to post a new project",
        user_id=uid,
        user_context={"role": "client", "name": "Alice"},
    )
    assert "category" in resp["response"].lower(), f"Expected category prompt, got: {resp['response']}"

    # --- Step 1: Provide category → bot asks for title
    resp = await chatbot.send_message(cid, "Web Development", user_id=uid)
    assert "title" in resp["response"].lower(), f"Expected title prompt, got: {resp['response']}"

    # --- Step 2: Provide title → bot asks for description
    resp = await chatbot.send_message(cid, "Build FastAPI Backend", user_id=uid)
    assert any(word in resp["response"].lower() for word in ["describe", "detail", "description"]), \
        f"Expected description prompt, got: {resp['response']}"

    # --- Step 3: Provide description → bot asks for budget
    resp = await chatbot.send_message(
        cid, "We need a secure FastAPI REST API with Turso integration.", user_id=uid
    )
    assert "budget" in resp["response"].lower(), f"Expected budget prompt, got: {resp['response']}"

    # --- Step 4: Provide budget → bot asks for timeline
    resp = await chatbot.send_message(cid, "Hourly $40-$60/hr", user_id=uid)
    assert "timeline" in resp["response"].lower() or "when" in resp["response"].lower(), \
        f"Expected timeline prompt, got: {resp['response']}"

    # --- Step 5: Provide timeline → flow completes, project is created
    resp = await chatbot.send_message(cid, "1 month", user_id=uid)
    assert "Flow Completed!" in resp["response"], f"Expected completion message, got: {resp['response']}"
    assert "Build FastAPI Backend" in resp["response"]

    assert len(mock_db["projects"]) == 1, "Expected one project to be created"
    proj = mock_db["projects"][0]
    assert proj["title"] == "Build FastAPI Backend"
    assert proj["budget_min"] == 40.0
    assert proj["budget_max"] == 60.0
    assert proj["budget_type"] == "hourly"
    assert "fastapi" in proj["skills"]


@pytest.mark.asyncio
async def test_build_portfolio_flow():
    """Full 4-step build_portfolio flow creates a portfolio item in the DB."""
    chatbot = get_chatbot_service()
    cid = "test_conv_portfolio"
    uid = 99
    _seed_conv(cid, uid)

    # --- Trigger flow: bot prompts for title
    resp = await chatbot.send_message(
        conversation_id=cid,
        message="build portfolio",
        user_id=uid,
        user_context={"role": "freelancer", "name": "Bob"},
    )
    assert "title" in resp["response"].lower(), f"Expected title prompt, got: {resp['response']}"

    # --- Step 1: Provide title → bot asks for description
    resp = await chatbot.send_message(cid, "My Next.js SaaS Website", user_id=uid)
    assert any(word in resp["response"].lower() for word in ["describe", "detail", "description", "project"]), \
        f"Expected description prompt, got: {resp['response']}"

    # --- Step 2: Provide description → bot asks for skills
    resp = await chatbot.send_message(
        cid, "Created a full-stack SaaS with Next.js and Stripe", user_id=uid
    )
    assert "skills" in resp["response"].lower(), f"Expected skills prompt, got: {resp['response']}"

    # --- Step 3: Provide skills → bot asks for media/URL
    resp = await chatbot.send_message(cid, "Next.js, React, Stripe", user_id=uid)
    assert any(word in resp["response"].lower() for word in ["media", "url", "link", "image", "upload"]), \
        f"Expected media prompt, got: {resp['response']}"

    # --- Step 4 (final): Provide media URL → flow completes, portfolio item created
    resp = await chatbot.send_message(cid, "https://github.com/bob/saas", user_id=uid)
    assert "Flow Completed!" in resp["response"], f"Expected completion message, got: {resp['response']}"
    assert "My Next.js SaaS Website" in resp["response"]

    assert len(mock_db["portfolio_items"]) == 1, "Expected one portfolio item to be created"
    item = mock_db["portfolio_items"][0]
    assert item["title"] == "My Next.js SaaS Website"
    assert "stripe" in item["skills"].lower()
    assert item["project_url"] == "https://github.com/bob/saas"


@pytest.mark.asyncio
async def test_cancel_flow_midway():
    """User can cancel an active flow at any step."""
    chatbot = get_chatbot_service()
    cid = "test_conv_cancel"
    uid = 12
    _seed_conv(cid, uid)

    # Start project flow
    resp = await chatbot.send_message(cid, "I want to post a new project", user_id=uid)
    assert "category" in resp["response"].lower()

    # Step 1: provide category
    resp = await chatbot.send_message(cid, "Web Development", user_id=uid)
    assert "title" in resp["response"].lower()

    # Cancel the flow
    resp = await chatbot.send_message(cid, "cancel", user_id=uid)

    # Flow state should be cleared from the conversation context
    assert "flow_state" not in mock_db["conversations"][cid]["context"]

    # Bot should respond with a helpful fallback (not a flow prompt)
    assert resp.get("response"), "Expected a response after cancel"


@pytest.mark.asyncio
async def test_post_project_flow_no_user_id():
    """Without a user_id the chatbot should prompt sign-in rather than start flow."""
    chatbot = get_chatbot_service()
    cid = "test_conv_no_user"
    _seed_conv(cid, None)

    resp = await chatbot.send_message(
        conversation_id=cid,
        message="I want to post a new project",
        user_id=None,
    )
    # Should mention login/sign-in, not start the flow
    resp_lower = resp["response"].lower()
    assert any(word in resp_lower for word in ["sign in", "log in", "login", "account"]), \
        f"Expected sign-in prompt for unauthenticated user, got: {resp['response']}"
    assert "flow_state" not in mock_db["conversations"][cid].get("context", {})
