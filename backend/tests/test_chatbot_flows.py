import pytest
import json
import re
from datetime import datetime, timezone
from app.services.ai_chatbot import get_chatbot_service, ChatIntent, SentimentLevel

# ---------------------------------------------------------------------------
# Mock Database and Mocks
# ---------------------------------------------------------------------------
mock_db = {
    "conversations": {},
    "projects": [],
    "portfolio_items": [],
}

def _fake_execute_query(sql: str, params=None):
    sql_upper = sql.strip().upper()
    params = params or []

    if sql_upper.startswith("SELECT * FROM Chatbot_conversations WHERE ID = ?".upper()):
        cid = params[0]
        conv = mock_db["conversations"].get(cid)
        if not conv:
            return {"columns": [], "rows": []}
        return {
            "columns": ["id", "user_id", "status", "escalated", "intents_detected", "sentiment_history", "context", "last_activity"],
            "rows": [[
                conv["id"],
                conv["user_id"],
                conv["status"],
                1 if conv["escalated"] else 0,
                json.dumps(conv["intents_detected"]),
                json.dumps(conv["sentiment_history"]),
                json.dumps(conv["context"]),
                conv["last_activity"]
            ]]
        }

    if sql_upper.startswith("UPDATE chatbot_conversations SET context = ?".upper()):
        ctx_data = json.loads(params[0])
        cid = params[1]
        if cid in mock_db["conversations"]:
            mock_db["conversations"][cid]["context"] = ctx_data
        return {"columns": [], "rows": []}

    if sql_upper.startswith("UPDATE chatbot_conversations SET last_activity = ?".upper()):
        last_act = params[0]
        intents = json.loads(params[1])
        sentiments = json.loads(params[2])
        cid = params[3]
        if cid in mock_db["conversations"]:
            mock_db["conversations"][cid]["last_activity"] = last_act
            mock_db["conversations"][cid]["intents_detected"] = intents
            mock_db["conversations"][cid]["sentiment_history"] = sentiments
        return {"columns": [], "rows": []}

    if sql_upper.startswith("INSERT INTO chatbot_messages".upper()):
        return {"columns": [], "rows": []}

    if sql_upper.startswith("INSERT INTO portfolio_items".upper()):
        mock_db["portfolio_items"].append({
            "user_id": params[0],
            "title": params[1],
            "description": params[2],
            "image_url": params[3],
            "project_url": params[4],
            "skills": params[5]
        })
        return {"columns": [], "rows": []}

    return {"columns": [], "rows": []}


def _fake_create_project(client_id, title, description, budget_min, budget_max, budget_type, category, timeline, skills, now):
    project = {
        "client_id": client_id,
        "title": title,
        "description": description,
        "budget_min": budget_min,
        "budget_max": budget_max,
        "budget_type": budget_type,
        "category": category,
        "timeline": timeline,
        "skills": skills
    }
    mock_db["projects"].append(project)
    return project


@pytest.fixture(autouse=True)
def setup_mocks(monkeypatch):
    # Patch execute_query in both database module and ai_chatbot service
    monkeypatch.setattr("app.services.ai_chatbot.execute_query", _fake_execute_query)
    monkeypatch.setattr("app.services.portal_service.create_project", _fake_create_project)
    
    # Reset mock database state
    mock_db["conversations"] = {}
    mock_db["projects"] = []
    mock_db["portfolio_items"] = []


# ---------------------------------------------------------------------------
# Test Cases
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_post_project_flow():
    chatbot = get_chatbot_service()
    cid = "test_conversation_123"
    uid = 42 # Mock client user ID
    
    # Initialize chatbot conversation in mock DB
    mock_db["conversations"][cid] = {
        "id": cid,
        "user_id": uid,
        "status": "active",
        "escalated": False,
        "intents_detected": [],
        "sentiment_history": [],
        "context": {},
        "last_activity": datetime.now(timezone.utc).isoformat()
    }

    # Step 0: Start project flow
    resp = await chatbot.send_message(
        conversation_id=cid,
        message="I want to post a new project",
        user_id=uid,
        user_context={"role": "client", "name": "Alice"}
    )
    assert "Category" in resp["response"]
    
    # Step 1: Send category
    resp = await chatbot.send_message(cid, "Web Development", user_id=uid)
    assert "title" in resp["response"].lower()

    # Step 2: Send title
    resp = await chatbot.send_message(cid, "Build FastAPI Backend", user_id=uid)
    assert "detail" in resp["response"].lower()

    # Step 3: Send description
    resp = await chatbot.send_message(cid, "We need a secure FastAPI REST API with Turso integration.", user_id=uid)
    assert "budget" in resp["response"].lower()

    # Step 4: Send budget
    resp = await chatbot.send_message(cid, "Hourly $40-$60/hr", user_id=uid)
    assert "completed" in resp["response"].lower()

    # Step 5: Send timeline (final step)
    resp = await chatbot.send_message(cid, "1 month", user_id=uid)
    
    # Assert flow completed successfully and project was inserted in database
    assert "Flow Completed!" in resp["response"]
    assert "Build FastAPI Backend" in resp["response"]
    
    assert len(mock_db["projects"]) == 1
    proj = mock_db["projects"][0]
    assert proj["title"] == "Build FastAPI Backend"
    assert proj["budget_min"] == 40.0
    assert proj["budget_max"] == 60.0
    assert proj["budget_type"] == "hourly"
    assert "fastapi" in proj["skills"]


@pytest.mark.asyncio
async def test_build_portfolio_flow():
    chatbot = get_chatbot_service()
    cid = "test_conversation_456"
    uid = 99 # Mock freelancer user ID
    
    # Initialize conversation
    mock_db["conversations"][cid] = {
        "id": cid,
        "user_id": uid,
        "status": "active",
        "escalated": False,
        "intents_detected": [],
        "sentiment_history": [],
        "context": {},
        "last_activity": datetime.now(timezone.utc).isoformat()
    }

    # Step 0: Start portfolio flow
    resp = await chatbot.send_message(
        conversation_id=cid,
        message="build portfolio",
        user_id=uid,
        user_context={"role": "freelancer", "name": "Bob"}
    )
    assert "Title" in resp["response"]

    # Step 1: Send title
    resp = await chatbot.send_message(cid, "My Next.js SaaS Website", user_id=uid)
    assert "Describe" in resp["response"]

    # Step 2: Send description
    resp = await chatbot.send_message(cid, "Created a full-stack SaaS with Next.js and Stripe", user_id=uid)
    assert "skills" in resp["response"].lower()

    # Step 3: Send skills
    resp = await chatbot.send_message(cid, "Next.js, React, Stripe", user_id=uid)
    assert "media" in resp["response"].lower()

    # Step 4: Send media URL (final step)
    resp = await chatbot.send_message(cid, "https://github.com/bob/saas", user_id=uid)
    
    # Assert flow completes and portfolio item is created
    assert "Flow Completed!" in resp["response"]
    assert "My Next.js SaaS Website" in resp["response"]
    
    assert len(mock_db["portfolio_items"]) == 1
    item = mock_db["portfolio_items"][0]
    assert item["title"] == "My Next.js SaaS Website"
    assert "stripe" in item["skills"].lower()
    assert item["project_url"] == "https://github.com/bob/saas"


@pytest.mark.asyncio
async def test_cancel_flow_midway():
    chatbot = get_chatbot_service()
    cid = "test_conversation_789"
    uid = 12
    
    # Initialize conversation
    mock_db["conversations"][cid] = {
        "id": cid,
        "user_id": uid,
        "status": "active",
        "escalated": False,
        "intents_detected": [],
        "sentiment_history": [],
        "context": {},
        "last_activity": datetime.now(timezone.utc).isoformat()
    }

    # Start project flow
    resp = await chatbot.send_message(cid, "I want to post a new project", user_id=uid)
    assert "Category" in resp["response"]

    # Send category
    resp = await chatbot.send_message(cid, "Web Development", user_id=uid)
    assert "title" in resp["response"].lower()

    # Cancel the flow
    resp = await chatbot.send_message(cid, "cancel", user_id=uid)
    
    # Assert flow is cancelled and conversation state reset
    assert "flow_state" not in mock_db["conversations"][cid]["context"]
    assert "help" in resp["response"].lower() or "how" in resp["response"].lower()
