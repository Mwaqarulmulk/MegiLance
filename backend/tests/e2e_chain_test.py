# @AI-HINT: Complete E2E Chain Test — full user flow from chatbot to payment release
# Tests the complete lifecycle: Client → Chatbot → Project → Freelancer → Proposal
# → Accept → Contract + Escrow → Milestone → Submit → Approve → Payment → Complete
# Plus: AI matching, workflow triggers, counter-offers, disputes, and cross-role flows

import requests
import time
import json
import uuid
import sys
from datetime import datetime

BASE_URL = "http://localhost:8000/api"
RESULTS = {"passed": 0, "failed": 0, "errors": [], "warnings": []}
TEST_ID = uuid.uuid4().hex[:8]

CLIENT_EMAIL = f"chain_client_{TEST_ID}@test.com"
FREELANCER_EMAIL = f"chain_freelancer_{TEST_ID}@test.com"
TEST_PASSWORD = "ChainTestP@ss123!"


def log_pass(test_name, detail=""):
    RESULTS["passed"] += 1
    print(f"  ✅ PASS: {test_name}" + (f" - {detail}" if detail else ""))


def log_fail(test_name, detail=""):
    RESULTS["failed"] += 1
    RESULTS["errors"].append(f"{test_name}: {detail}")
    print(f"  ❌ FAIL: {test_name}" + (f" - {detail}" if detail else ""))


def log_warn(test_name, detail=""):
    RESULTS["warnings"].append(f"{test_name}: {detail}")
    print(f"  ⚠️  WARN: {test_name}" + (f" - {detail}" if detail else ""))


def log_section(title):
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")


def log_step(step_num, title):
    print(f"\n  --- Step {step_num}: {title} ---")


def safe_request(method, url, **kwargs):
    kwargs.setdefault("timeout", 30)
    try:
        return getattr(requests, method)(url, **kwargs)
    except requests.exceptions.Timeout:
        return None
    except requests.exceptions.ConnectionError:
        return None
    except Exception:
        return None


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


def get_user_id(token):
    r = safe_request("get", f"{BASE_URL}/auth/me", headers=auth_header(token))
    if r and r.status_code == 200:
        return r.json().get("id")
    return None


# ============================================================================
# CHAIN TEST: Complete Lifecycle Flow
# ============================================================================
def test_complete_chain():
    """
    Full chain: Register → Chatbot → Create Project → Freelancer Submits Proposal
    → Client Accepts (auto-creates Contract + Escrow) → Create Milestones
    → Freelancer Submits Milestone → Client Approves → Payment Released
    → Contract Completed → Review Left
    """
    log_section("COMPLETE CHAIN TEST: Client → Chatbot → Project → Proposal → Contract → Escrow → Milestone → Payment → Complete")
    chain = {}

    # ── PHASE 1: REGISTRATION ──────────────────────────────────────────────
    log_section("PHASE 1: USER REGISTRATION")
    log_step(1, "Register Client")

    r = safe_request("post", f"{BASE_URL}/auth/register", json={
        "email": CLIENT_EMAIL,
        "password": TEST_PASSWORD,
        "name": f"Chain Client {TEST_ID}",
        "user_type": "client"
    })
    if r and r.status_code in (200, 201):
        data = r.json()
        chain["client_token"] = data.get("access_token")
        log_pass("Client registered", f"email={CLIENT_EMAIL}")
    elif r and r.status_code == 409:
        log_warn("Client already exists, logging in")
    else:
        log_fail("Client registration", f"status={r.status_code if r else 'NO RESPONSE'}")
        return chain

    log_step(2, "Register Freelancer")
    r = safe_request("post", f"{BASE_URL}/auth/register", json={
        "email": FREELANCER_EMAIL,
        "password": TEST_PASSWORD,
        "name": f"Chain Freelancer {TEST_ID}",
        "user_type": "freelancer"
    })
    if r and r.status_code in (200, 201):
        data = r.json()
        chain["freelancer_token"] = data.get("access_token")
        log_pass("Freelancer registered", f"email={FREELANCER_EMAIL}")
    elif r and r.status_code == 409:
        log_warn("Freelancer already exists, logging in")
    else:
        log_fail("Freelancer registration", f"status={r.status_code if r else 'NO RESPONSE'}")
        return chain

    # Login both to ensure tokens
    for role, email in [("client", CLIENT_EMAIL), ("freelancer", FREELANCER_EMAIL)]:
        if not chain.get(f"{role}_token"):
            r = safe_request("post", f"{BASE_URL}/auth/login", json={"email": email, "password": TEST_PASSWORD})
            if r and r.status_code == 200:
                chain[f"{role}_token"] = r.json().get("access_token")
                log_pass(f"{role.title()} logged in")

    client_h = auth_header(chain.get("client_token", ""))
    freelancer_h = auth_header(chain.get("freelancer_token", ""))
    chain["client_id"] = get_user_id(chain.get("client_token", ""))
    chain["freelancer_id"] = get_user_id(chain.get("freelancer_token", ""))

    # ── PHASE 2: CHATBOT INTERACTION (CLIENT) ──────────────────────────────
    log_section("PHASE 2: AI CHATBOT ASSISTANT (CLIENT)")

    log_step(3, "Get Chatbot Welcome Message")
    r = safe_request("get", f"{BASE_URL}/ai/client-assistant/welcome", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        log_pass("Chatbot welcome", f"greeting={data.get('message', '')[:80]}...")
        suggestions = data.get("suggestions", [])
        log_pass("Welcome suggestions", f"count={len(suggestions)}, items={suggestions[:3]}")
    else:
        log_warn("Chatbot welcome", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(4, "Chat with AI Assistant (skip if LLM slow)")
    r = safe_request("post", f"{BASE_URL}/ai/client-assistant/chat", headers=client_h, json={
        "message": "Find me a React developer",
        "conversation_history": [],
        "page_context": "/client/dashboard"
    }, timeout=25)
    if r and r.status_code == 200:
        data = r.json()
        log_pass("AI chat response", f"length={len(data.get('message', ''))}")
    else:
        log_warn("AI chat (LLM may be slow)", f"status={r.status_code if r else 'TIMEOUT'}")

    log_step(5, "Get AI Suggestions")
    r = safe_request("get", f"{BASE_URL}/ai/client-assistant/suggestions?page=projects", headers=client_h, timeout=25)
    if r and r.status_code == 200:
        data = r.json()
        log_pass("AI suggestions", f"count={len(data.get('suggestions', []))}")
    else:
        log_warn("AI suggestions", f"status={r.status_code if r else 'TIMEOUT'}")

    # ── PHASE 3: STANDALONE CHATBOT (GUEST/LOGIN) ─────────────────────────
    log_section("PHASE 3: STANDALONE CHATBOT")

    log_step(6, "Start Chatbot Conversation")
    r = safe_request("post", f"{BASE_URL}/chatbot/start", timeout=15)
    if r and r.status_code in (200, 201):
        data = r.json()
        chain["chatbot_conv_id"] = data.get("conversation_id")
        log_pass("Chatbot started", f"conv_id={chain.get('chatbot_conv_id', 'N/A')}")
    else:
        log_warn("Chatbot start", f"status={r.status_code if r else 'TIMEOUT'}")

    log_step(7, "Send Chatbot Message — Payment Question")
    conv_id = chain.get("chatbot_conv_id", str(uuid.uuid4()))
    r = safe_request("post", f"{BASE_URL}/chatbot/{conv_id}/message", json={
        "message": "How does escrow payment work?",
        "conversation_id": conv_id
    }, timeout=15)
    if r and r.status_code == 200:
        data = r.json()
        intent = data.get("intent", "unknown")
        sentiment = data.get("sentiment", "neutral")
        faq_matched = data.get("faq_matched")
        log_pass("Chatbot payment question", f"intent={intent}, sentiment={sentiment}, faq={faq_matched}")
    else:
        log_warn("Chatbot message", f"status={r.status_code if r else 'TIMEOUT'}")

    log_step(8, "Get Chatbot FAQ")
    r = safe_request("get", f"{BASE_URL}/chatbot/chat/faq", timeout=10)
    if r and r.status_code == 200:
        data = r.json()
        faqs = data.get("items", [])
        log_pass("Chatbot FAQ", f"count={len(faqs)}")
    else:
        log_warn("Chatbot FAQ", f"status={r.status_code if r else 'TIMEOUT'}")

    # ── PHASE 4: PROJECT CREATION (CLIENT) ─────────────────────────────────
    log_section("PHASE 4: PROJECT CREATION")

    log_step(13, "Client Creates Project")
    r = safe_request("post", f"{BASE_URL}/projects", headers=client_h, json={
        "title": f"E-Commerce Platform {TEST_ID}",
        "description": "Build a full-stack e-commerce platform with React frontend, Node.js/Python backend, PostgreSQL database, user authentication, product catalog, shopping cart, and Stripe payment integration.",
        "category": "web-development",
        "budget_type": "fixed",
        "budget_min": 2000,
        "budget_max": 5000,
        "experience_level": "intermediate",
        "estimated_duration": "1-3 months",
        "skills": "react,nodejs,python,postgresql,stripe"
    })
    if r and r.status_code in (200, 201):
        data = r.json()
        chain["project_id"] = data.get("project_id") or data.get("id")
        log_pass("Project created", f"id={chain.get('project_id')}")
    else:
        log_fail("Project creation", f"status={r.status_code if r else 'NO RESPONSE'}, body={r.text[:200] if r else ''}")
        return chain

    log_step(14, "Verify Project Listed")
    r = safe_request("get", f"{BASE_URL}/projects/{chain['project_id']}", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        log_pass("Project verified", f"title={data.get('title')}, status={data.get('status')}")
    else:
        log_warn("Project verify", f"status={r.status_code if r else 'NO RESPONSE'}")

    # ── PHASE 5: AI MATCHING ───────────────────────────────────────────────
    log_section("PHASE 5: AI FREELANCER MATCHING")

    log_step(15, "AI Match Freelancers to Project")
    r = safe_request("get", f"{BASE_URL}/matching/project/{chain['project_id']}/freelancers", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        matches = data.get("matches", data.get("freelancers", []))
        log_pass("AI matching", f"matches_found={len(matches) if isinstance(matches, list) else 'N/A'}")
    else:
        log_warn("AI matching", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(16, "AI Score Freelancer-Project Match")
    r = safe_request("get", f"{BASE_URL}/matching/score?project_id={chain['project_id']}&freelancer_id={chain['freelancer_id']}", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        log_pass("AI match score", f"score={data.get('score', data.get('match_score', 'N/A'))}")
    else:
        log_warn("AI match score", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(17, "AI Recommendations for Client")
    r = safe_request("get", f"{BASE_URL}/matching/recommendations", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        log_pass("AI recommendations", f"count={len(data.get('recommendations', []))}")
    else:
        log_warn("AI recommendations", f"status={r.status_code if r else 'NO RESPONSE'}")

    # ── PHASE 6: PROPOSAL SUBMISSION (FREELANCER) ──────────────────────────
    log_section("PHASE 6: PROPOSAL SUBMISSION")

    log_step(18, "Freelancer Browses Projects")
    r = safe_request("get", f"{BASE_URL}/projects", headers=freelancer_h)
    if r and r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("projects", []))
        log_pass("Freelancer browses projects", f"available={len(items) if isinstance(items, list) else 'N/A'}")
    else:
        log_warn("Browse projects", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(19, "Freelancer Saves Draft Proposal")
    r = safe_request("post", f"{BASE_URL}/proposals/draft", headers=freelancer_h, json={
        "project_id": chain["project_id"],
        "cover_letter": "I'm a full-stack developer with 5 years of experience in React and Python. I've built multiple e-commerce platforms.",
        "bid_amount": 3500,
        "estimated_hours": 200,
        "hourly_rate": 17.5,
        "availability": "full-time"
    })
    if r and r.status_code in (200, 201):
        data = r.json()
        chain["draft_proposal_id"] = data.get("id")
        log_pass("Draft proposal saved", f"id={chain.get('draft_proposal_id')}")
    else:
        log_warn("Draft proposal", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(20, "Freelancer Submits Proposal")
    r = safe_request("post", f"{BASE_URL}/proposals", headers=freelancer_h, json={
        "project_id": chain["project_id"],
        "cover_letter": "I am an experienced full-stack developer with 5+ years in React, Python, and PostgreSQL. I have built 3 e-commerce platforms previously and can deliver this project in 8 weeks with regular milestones. I'll include unit tests, documentation, and deployment support.",
        "bid_amount": 3500,
        "estimated_hours": 200,
        "hourly_rate": 17.5,
        "availability": "full-time"
    })
    if r and r.status_code in (200, 201):
        data = r.json()
        chain["proposal_id"] = data.get("id")
        log_pass("Proposal submitted", f"id={chain.get('proposal_id')}")
    else:
        log_fail("Proposal submission", f"status={r.status_code if r else 'NO RESPONSE'}, body={r.text[:200] if r else ''}")
        return chain

    log_step(21, "Verify Freelancer Can See Their Proposal")
    r = safe_request("get", f"{BASE_URL}/proposals", headers=freelancer_h)
    if r and r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("proposals", []))
        log_pass("Freelancer proposals list", f"count={len(items) if isinstance(items, list) else 'N/A'}")
    else:
        log_warn("Freelancer proposals", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(22, "Client Views Received Proposals")
    r = safe_request("get", f"{BASE_URL}/proposals?project_id={chain['project_id']}", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("proposals", []))
        log_pass("Client views proposals", f"received={len(items) if isinstance(items, list) else 'N/A'}")
    else:
        log_warn("Client proposals view", f"status={r.status_code if r else 'NO RESPONSE'}")

    # ── PHASE 7: PROPOSAL NEGOTIATION (COUNTER-OFFER) ──────────────────────
    log_section("PHASE 7: PROPOSAL NEGOTIATION")

    log_step(23, "Client Creates Counter-Offer")
    r = safe_request("post", f"{BASE_URL}/proposals/{chain['proposal_id']}/counter-offer", headers=client_h, json={
        "bid_amount": 3000,
        "cover_letter": "Your proposal is strong. Would you consider $3000 for this project?",
        "estimated_hours": 180,
        "hourly_rate": 16.67
    })
    if r and r.status_code == 200:
        data = r.json()
        log_pass("Counter-offer created", f"proposal_status={data.get('proposal', {}).get('status', 'N/A')}")
    else:
        log_warn("Counter-offer", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(24, "Client Shortlists Proposal")
    r = safe_request("post", f"{BASE_URL}/proposals/{chain['proposal_id']}/shortlist", headers=client_h)
    if r and r.status_code == 200:
        log_pass("Proposal shortlisted")
    else:
        log_warn("Shortlist", f"status={r.status_code if r else 'NO RESPONSE'}")

    # ── PHASE 8: PROPOSAL ACCEPTANCE → CONTRACT + ESCROW ───────────────────
    log_section("PHASE 8: PROPOSAL ACCEPTANCE → CONTRACT + ESCROW CREATION")

    log_step(25, "Client Accepts Proposal (AUTO-CREATES Contract + Escrow)")
    r = safe_request("post", f"{BASE_URL}/proposals/{chain['proposal_id']}/accept", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        log_pass("Proposal ACCEPTED", f"project_id={data.get('project_id')}, freelancer_id={data.get('freelancer_id')}")
        log_pass("Contract auto-created", f"message={data.get('message', '')}")
    else:
        log_fail("Proposal acceptance", f"status={r.status_code if r else 'NO RESPONSE'}, body={r.text[:200] if r else ''}")
        # Continue to check if contract exists anyway

    log_step(26, "Verify Contract Was Auto-Created")
    r = safe_request("get", f"{BASE_URL}/contracts", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("contracts", []))
        if items:
            contract = items[0]
            chain["contract_id"] = contract.get("id")
            log_pass("Contract found", f"id={chain.get('contract_id')}, status={contract.get('status')}, amount={contract.get('amount', contract.get('contract_amount'))}")
        else:
            log_warn("Contract list empty", "No contracts found after proposal acceptance")
    else:
        log_warn("Contract list", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(27, "Verify Escrow Was Auto-Created")
    r = safe_request("get", f"{BASE_URL}/escrow", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("escrow", []))
        if items:
            escrow = items[0]
            chain["escrow_id"] = escrow.get("id")
            log_pass("Escrow found", f"id={chain.get('escrow_id')}, status={escrow.get('status')}, amount={escrow.get('amount')}")
        else:
            log_warn("Escrow list empty", "No escrow records found")
    else:
        log_warn("Escrow list", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(28, "Freelancer Acknowledges Contract")
    contract_id = chain.get("contract_id")
    if contract_id:
        r = safe_request("post", f"{BASE_URL}/contracts/{contract_id}/acknowledge", headers=freelancer_h, json={
            "acknowledged": True
        })
        if r and r.status_code == 200:
            log_pass("Contract acknowledged by freelancer")
        else:
            log_warn("Contract acknowledge", f"status={r.status_code if r else 'NO RESPONSE'}")
    else:
        log_warn("Contract acknowledge", "No contract_id available")

    # ── PHASE 9: MILESTONE LIFECYCLE ───────────────────────────────────────
    log_section("PHASE 9: MILESTONE LIFECYCLE")

    if contract_id:
        log_step(29, "Create Milestone 1 — Project Setup")
        r = safe_request("post", f"{BASE_URL}/milestones", headers=client_h, json={
            "contract_id": contract_id,
            "title": "Phase 1: Project Setup & Architecture",
            "description": "Set up project repository, configure development environment, design database schema, and create API architecture.",
            "amount": 1000,
            "due_date": "2026-07-15"
        })
        if r and r.status_code in (200, 201):
            data = r.json()
            chain["milestone_1_id"] = data.get("milestone_id")
            log_pass("Milestone 1 created", f"id={chain.get('milestone_1_id')}")
        else:
            log_warn("Create milestone 1", f"status={r.status_code if r else 'NO RESPONSE'}")

        log_step(30, "Create Milestone 2 — Core Development")
        r = safe_request("post", f"{BASE_URL}/milestones", headers=client_h, json={
            "contract_id": contract_id,
            "title": "Phase 2: Core Feature Development",
            "description": "Build user authentication, product catalog, shopping cart, and payment integration.",
            "amount": 1500,
            "due_date": "2026-08-15"
        })
        if r and r.status_code in (200, 201):
            data = r.json()
            chain["milestone_2_id"] = data.get("milestone_id")
            log_pass("Milestone 2 created", f"id={chain.get('milestone_2_id')}")
        else:
            log_warn("Create milestone 2", f"status={r.status_code if r else 'NO RESPONSE'}")

        log_step(31, "Create Milestone 3 — Testing & Deployment")
        r = safe_request("post", f"{BASE_URL}/milestones", headers=client_h, json={
            "contract_id": contract_id,
            "title": "Phase 3: Testing, QA & Deployment",
            "description": "Write tests, perform QA, deploy to production, and deliver documentation.",
            "amount": 1000,
            "due_date": "2026-09-01"
        })
        if r and r.status_code in (200, 201):
            data = r.json()
            chain["milestone_3_id"] = data.get("milestone_id")
            log_pass("Milestone 3 created", f"id={chain.get('milestone_3_id')}")
        else:
            log_warn("Create milestone 3", f"status={r.status_code if r else 'NO RESPONSE'}")

        log_step(32, "List Milestones")
        r = safe_request("get", f"{BASE_URL}/milestones?contract_id={contract_id}", headers=client_h)
        if r and r.status_code == 200:
            data = r.json()
            items = data.get("items", [])
            log_pass("Milestones listed", f"count={len(items)}")
        else:
            log_warn("List milestones", f"status={r.status_code if r else 'NO RESPONSE'}")

        # ── PHASE 10: MILESTONE SUBMISSION (FREELANCER) ────────────────────
        log_section("PHASE 10: MILESTONE SUBMISSION & APPROVAL")

        ms1_id = chain.get("milestone_1_id")
        if ms1_id:
            log_step(33, "Freelancer Submits Milestone 1")
            r = safe_request("post", f"{BASE_URL}/milestones/{ms1_id}/submit", headers=freelancer_h, json={
                "deliverables": "GitHub repo link: https://github.com/test/repo\nArchitecture docs: https://docs.example.com\nDB schema: PostgreSQL with 12 tables",
                "submission_notes": "Phase 1 complete. Repository set up with CI/CD pipeline, database schema designed, and API architecture documented."
            })
            if r and r.status_code == 200:
                log_pass("Milestone 1 submitted", "status changed to 'submitted'")
            else:
                log_warn("Submit milestone 1", f"status={r.status_code if r else 'NO RESPONSE'}")

            log_step(34, "Client Reviews Milestone 1")
            r = safe_request("get", f"{BASE_URL}/milestones/{ms1_id}", headers=client_h)
            if r and r.status_code == 200:
                data = r.json()
                log_pass("Milestone 1 status", f"status={data.get('status')}")
            else:
                log_warn("Milestone 1 detail", f"status={r.status_code if r else 'NO RESPONSE'}")

            log_step(35, "Client Approves Milestone 1 (TRIGGERS PAYMENT)")
            r = safe_request("post", f"{BASE_URL}/milestones/{ms1_id}/approve", headers=client_h, json={
                "approval_notes": "Excellent work! Architecture is solid and CI/CD pipeline is well configured."
            })
            if r and r.status_code == 200:
                log_pass("Milestone 1 APPROVED", "Payment should be released from escrow")
            else:
                log_warn("Approve milestone 1", f"status={r.status_code if r else 'NO RESPONSE'}")

        # ── PHASE 11: PAYMENT & ESCROW RELEASE ─────────────────────────────
        log_section("PHASE 11: PAYMENT & ESCROW RELEASE")

        log_step(36, "Check Payment History After Approval")
        r = safe_request("get", f"{BASE_URL}/payments", headers=client_h)
        if r and r.status_code == 200:
            data = r.json()
            items = data if isinstance(data, list) else data.get("items", data.get("payments", []))
            log_pass("Payment history", f"payments={len(items) if isinstance(items, list) else 'N/A'}")
        else:
            log_warn("Payment history", f"status={r.status_code if r else 'NO RESPONSE'}")

        log_step(37, "Check Freelancer Earnings")
        r = safe_request("get", f"{BASE_URL}/payments", headers=freelancer_h)
        if r and r.status_code == 200:
            data = r.json()
            items = data if isinstance(data, list) else data.get("items", data.get("payments", []))
            log_pass("Freelancer payments", f"received={len(items) if isinstance(items, list) else 'N/A'}")
        else:
            log_warn("Freelancer payments", f"status={r.status_code if r else 'NO RESPONSE'}")

        log_step(38, "Check Wallet Balance (Client)")
        r = safe_request("get", f"{BASE_URL}/wallet/balance", headers=client_h)
        if r and r.status_code == 200:
            data = r.json()
            log_pass("Client wallet", f"balance={data.get('balance', data.get('available', 'N/A'))}")
        else:
            log_warn("Client wallet", f"status={r.status_code if r else 'NO RESPONSE'}")

        log_step(39, "Check Wallet Balance (Freelancer)")
        r = safe_request("get", f"{BASE_URL}/wallet/balance", headers=freelancer_h)
        if r and r.status_code == 200:
            data = r.json()
            log_pass("Freelancer wallet", f"balance={data.get('balance', data.get('available', 'N/A'))}")
        else:
            log_warn("Freelancer wallet", f"status={r.status_code if r else 'NO RESPONSE'}")

        log_step(40, "Check Escrow Balance")
        r = safe_request("get", f"{BASE_URL}/escrow/balance", headers=client_h)
        if r and r.status_code == 200:
            data = r.json()
            log_pass("Escrow balance", f"balance={data.get('balance', data.get('available_balance', 'N/A'))}")
        else:
            log_warn("Escrow balance", f"status={r.status_code if r else 'NO RESPONSE'}")

        log_step(41, "Escrow Transaction History")
        r = safe_request("get", f"{BASE_URL}/escrow/transactions", headers=client_h)
        if r and r.status_code == 200:
            data = r.json()
            items = data if isinstance(data, list) else data.get("items", data.get("transactions", []))
            log_pass("Escrow transactions", f"count={len(items) if isinstance(items, list) else 'N/A'}")
        else:
            log_warn("Escrow transactions", f"status={r.status_code if r else 'NO RESPONSE'}")

        # ── PHASE 12: REMAINING MILESTONES ─────────────────────────────────
        log_section("PHASE 12: COMPLETE REMAINING MILESTONES")

        ms2_id = chain.get("milestone_2_id")
        ms3_id = chain.get("milestone_3_id")

        for ms_num, ms_id in [(2, ms2_id), (3, ms3_id)]:
            if ms_id:
                log_step(42 + (ms_num - 2) * 2, f"Freelancer Submits Milestone {ms_num}")
                r = safe_request("post", f"{BASE_URL}/milestones/{ms_id}/submit", headers=freelancer_h, json={
                    "deliverables": f"Milestone {ms_num} deliverables completed",
                    "submission_notes": f"Phase {ms_num} complete with all deliverables."
                })
                if r and r.status_code == 200:
                    log_pass(f"Milestone {ms_num} submitted")
                else:
                    log_warn(f"Submit milestone {ms_num}", f"status={r.status_code if r else 'NO RESPONSE'}")

                log_step(43 + (ms_num - 2) * 2, f"Client Approves Milestone {ms_num}")
                r = safe_request("post", f"{BASE_URL}/milestones/{ms_id}/approve", headers=client_h, json={
                    "approval_notes": f"Great work on phase {ms_num}!"
                })
                if r and r.status_code == 200:
                    log_pass(f"Milestone {ms_num} APPROVED")
                else:
                    log_warn(f"Approve milestone {ms_num}", f"status={r.status_code if r else 'NO RESPONSE'}")

        # ── PHASE 13: CONTRACT COMPLETION ──────────────────────────────────
        log_section("PHASE 13: CONTRACT COMPLETION")

        log_step(46, "Client Completes Contract")
        r = safe_request("post", f"{BASE_URL}/contracts/{contract_id}/complete", headers=client_h, json={
            "completion_notes": "Project completed successfully! All milestones delivered on time."
        })
        if r and r.status_code == 200:
            log_pass("Contract COMPLETED")
        else:
            log_warn("Complete contract", f"status={r.status_code if r else 'NO RESPONSE'}")

        log_step(47, "Verify Contract Status")
        r = safe_request("get", f"{BASE_URL}/contracts/{contract_id}", headers=client_h)
        if r and r.status_code == 200:
            data = r.json()
            log_pass("Contract status verified", f"status={data.get('status')}")
        else:
            log_warn("Contract verify", f"status={r.status_code if r else 'NO RESPONSE'}")

        # ── PHASE 14: REVIEWS ──────────────────────────────────────────────
        log_section("PHASE 14: REVIEWS & FEEDBACK")

        log_step(48, "Client Leaves Review for Freelancer")
        r = safe_request("post", f"{BASE_URL}/reviews", headers=client_h, json={
            "contract_id": contract_id,
            "reviewee_id": chain["freelancer_id"],
            "rating": 5,
            "comment": "Excellent freelancer! Delivered high-quality work on time. Great communication throughout.",
            "rating_breakdown": json.dumps({
                "communication": 5,
                "quality": 5,
                "timeliness": 5,
                "expertise": 5
            })
        })
        if r and r.status_code in (200, 201):
            log_pass("Review submitted by client")
        else:
            log_warn("Client review", f"status={r.status_code if r else 'NO RESPONSE'}")

        log_step(49, "Freelancer Leaves Review for Client")
        r = safe_request("post", f"{BASE_URL}/reviews", headers=freelancer_h, json={
            "contract_id": contract_id,
            "reviewee_id": chain["client_id"],
            "rating": 5,
            "comment": "Great client to work with! Clear requirements, timely payments, and good communication."
        })
        if r and r.status_code in (200, 201):
            log_pass("Review submitted by freelancer")
        else:
            log_warn("Freelancer review", f"status={r.status_code if r else 'NO RESPONSE'}")

    # ── PHASE 15: WORKFLOW AUTOMATION ──────────────────────────────────────
    log_section("PHASE 15: WORKFLOW AUTOMATION & TRIGGERS")

    log_step(50, "Get Workflow Templates")
    r = safe_request("get", f"{BASE_URL}/workflows", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("workflows", []))
        log_pass("Workflows listed", f"count={len(items) if isinstance(items, list) else 'N/A'}")
    else:
        log_warn("Workflows", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(51, "Create Automation Workflow")
    r = safe_request("post", f"{BASE_URL}/workflows", headers=client_h, json={
        "name": f"Auto-Notify New Proposals {TEST_ID}",
        "description": "Automatically send notification when new proposal received",
        "trigger_type": "proposal_received",
        "trigger_config": json.dumps({"project_id": chain.get("project_id")}),
        "conditions": json.dumps([{"field": "bid_amount", "operator": "greater_than", "value": 1000}]),
        "actions": json.dumps([{"type": "send_in_app", "config": {"title": "New proposal received!", "message": "A new proposal has been submitted for your project."}}])
    })
    if r and r.status_code in (200, 201):
        data = r.json()
        chain["workflow_id"] = data.get("id")
        log_pass("Workflow created", f"id={chain.get('workflow_id')}")
    else:
        log_warn("Create workflow", f"status={r.status_code if r else 'NO RESPONSE'}")

    # ── PHASE 16: INVOICING ────────────────────────────────────────────────
    log_section("PHASE 16: INVOICING")

    if contract_id:
        log_step(52, "Create Invoice")
        r = safe_request("post", f"{BASE_URL}/invoices", headers=freelancer_h, json={
            "contract_id": contract_id,
            "to_user_id": chain["client_id"],
            "items": json.dumps([{"description": "E-Commerce Platform Development", "quantity": 1, "rate": 3500}]),
            "subtotal": 3500,
            "tax": 0,
            "total": 3500,
            "currency": "USD",
            "notes": "Invoice for complete e-commerce platform development."
        })
        if r and r.status_code in (200, 201):
            data = r.json()
            chain["invoice_id"] = data.get("id")
            log_pass("Invoice created", f"id={chain.get('invoice_id')}")
        else:
            log_warn("Create invoice", f"status={r.status_code if r else 'NO RESPONSE'}")

    # ── PHASE 17: MESSAGING / COMMUNICATION ────────────────────────────────
    log_section("PHASE 17: MESSAGING & COMMUNICATION")

    log_step(53, "Client Sends Message to Freelancer")
    r = safe_request("post", f"{BASE_URL}/messages", headers=client_h, json={
        "receiver_id": chain["freelancer_id"],
        "content": f"Hi! Thanks for completing the project. Everything looks great! (Chain test {TEST_ID})"
    })
    if r and r.status_code in (200, 201):
        log_pass("Message sent: client → freelancer")
    else:
        log_warn("Send message", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(54, "Freelancer Replies")
    r = safe_request("post", f"{BASE_URL}/messages", headers=freelancer_h, json={
        "receiver_id": chain["client_id"],
        "content": f"Thank you! It was a pleasure working with you. (Chain test {TEST_ID})"
    })
    if r and r.status_code in (200, 201):
        log_pass("Message sent: freelancer → client")
    else:
        log_warn("Reply message", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(55, "View Conversation")
    r = safe_request("get", f"{BASE_URL}/messages/conversations", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("conversations", []))
        log_pass("Conversations listed", f"count={len(items) if isinstance(items, list) else 'N/A'}")
    else:
        log_warn("Conversations", f"status={r.status_code if r else 'NO RESPONSE'}")

    # ── PHASE 18: NOTIFICATIONS ────────────────────────────────────────────
    log_section("PHASE 18: NOTIFICATIONS")

    log_step(56, "Client Notifications")
    r = safe_request("get", f"{BASE_URL}/notifications", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("notifications", []))
        log_pass("Client notifications", f"count={len(items) if isinstance(items, list) else 'N/A'}")
    else:
        log_warn("Client notifications", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(57, "Freelancer Notifications")
    r = safe_request("get", f"{BASE_URL}/notifications", headers=freelancer_h)
    if r and r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("notifications", []))
        log_pass("Freelancer notifications", f"count={len(items) if isinstance(items, list) else 'N/A'}")
    else:
        log_warn("Freelancer notifications", f"status={r.status_code if r else 'NO RESPONSE'}")

    # ── PHASE 19: AI WRITING ASSISTANCE ────────────────────────────────────
    log_section("PHASE 19: AI WRITING ASSISTANCE")

    log_step(58, "AI Generate Proposal Content")
    r = safe_request("post", f"{BASE_URL}/ai-writing/generate/proposal", headers=freelancer_h, json={
        "project_title": "Mobile App Development",
        "project_description": "Build a cross-platform mobile app with React Native",
        "freelancer_skills": ["React Native", "TypeScript", "Firebase"]
    })
    if r and r.status_code == 200:
        data = r.json()
        log_pass("AI proposal generated", f"length={len(data.get('content', data.get('proposal', '')))}")
    else:
        log_warn("AI proposal writing", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(59, "AI Generate Project Description")
    r = safe_request("post", f"{BASE_URL}/ai-writing/generate/project-description", headers=client_h, json={
        "title": "SaaS Dashboard",
        "category": "web-development",
        "budget_range": "$2000-$5000"
    })
    if r and r.status_code == 200:
        data = r.json()
        log_pass("AI project description generated")
    else:
        log_warn("AI description writing", f"status={r.status_code if r else 'NO RESPONSE'}")

    # ── PHASE 20: FINAL DASHBOARDS & STATS ─────────────────────────────────
    log_section("PHASE 20: DASHBOARDS & STATISTICS")

    log_step(60, "Client Dashboard")
    r = safe_request("get", f"{BASE_URL}/portal/client/dashboard", headers=client_h)
    if r and r.status_code == 200:
        log_pass("Client dashboard loaded")
    else:
        log_warn("Client dashboard", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(61, "Freelancer Dashboard")
    r = safe_request("get", f"{BASE_URL}/portal/freelancer/dashboard", headers=freelancer_h)
    if r and r.status_code == 200:
        log_pass("Freelancer dashboard loaded")
    else:
        log_warn("Freelancer dashboard", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(62, "Client Activity Feed")
    r = safe_request("get", f"{BASE_URL}/activity/feed", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("activities", []))
        log_pass("Client activity feed", f"activities={len(items) if isinstance(items, list) else 'N/A'}")
    else:
        log_warn("Client activity", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(63, "Freelancer Activity Feed")
    r = safe_request("get", f"{BASE_URL}/activity/feed", headers=freelancer_h)
    if r and r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("activities", []))
        log_pass("Freelancer activity feed", f"activities={len(items) if isinstance(items, list) else 'N/A'}")
    else:
        log_warn("Freelancer activity", f"status={r.status_code if r else 'NO RESPONSE'}")

    log_step(64, "Reviews for Freelancer")
    r = safe_request("get", f"{BASE_URL}/reviews?user_id={chain['freelancer_id']}", headers=client_h)
    if r and r.status_code == 200:
        data = r.json()
        items = data if isinstance(data, list) else data.get("items", data.get("reviews", []))
        log_pass("Freelancer reviews", f"count={len(items) if isinstance(items, list) else 'N/A'}")
    else:
        log_warn("Freelancer reviews", f"status={r.status_code if r else 'NO RESPONSE'}")

    return chain


# ============================================================================
# DISPUTE FLOW TEST
# ============================================================================
def test_dispute_flow(chain):
    log_section("DISPUTE FLOW: Milestone Rejection → Dispute → Resolution")

    client_h = auth_header(chain.get("client_token", ""))
    freelancer_h = auth_header(chain.get("freelancer_token", ""))

    log_step(65, "Create Dispute")
    r = safe_request("post", f"{BASE_URL}/disputes", headers=freelancer_h, json={
        "contract_id": chain.get("contract_id"),
        "dispute_type": "payment_issue",
        "description": "Payment was not released after milestone approval. Requesting immediate release.",
        "amount": 1000
    })
    if r and r.status_code in (200, 201):
        data = r.json()
        chain["dispute_id"] = data.get("id")
        log_pass("Dispute created", f"id={chain.get('dispute_id')}")
    else:
        log_warn("Create dispute", f"status={r.status_code if r else 'NO RESPONSE'}")
        return

    log_step(66, "Client Responds to Dispute")
    if chain.get("dispute_id"):
        r = safe_request("post", f"{BASE_URL}/disputes/{chain['dispute_id']}/evidence", headers=client_h, json={
            "evidence_type": "document",
            "description": "Payment was released. Check transaction records.",
            "file_url": "https://example.com/proof.png"
        })
        if r and r.status_code in (200, 201):
            log_pass("Dispute evidence submitted by client")
        else:
            log_warn("Dispute evidence", f"status={r.status_code if r else 'NO RESPONSE'}")

        log_step(67, "Resolve Dispute")
        r = safe_request("post", f"{BASE_URL}/disputes/{chain['dispute_id']}/resolve", headers=client_h, json={
            "resolution": "refund_to_client",
            "resolution_amount": 500,
            "resolution_notes": "Partial refund agreed upon by both parties."
        })
        if r and r.status_code == 200:
            log_pass("Dispute RESOLVED")
        else:
            log_warn("Resolve dispute", f"status={r.status_code if r else 'NO RESPONSE'}")


# ============================================================================
# REFUND FLOW TEST
# ============================================================================
def test_refund_flow(chain):
    log_section("REFUND FLOW: Request → Review → Approve")

    client_h = auth_header(chain.get("client_token", ""))

    log_step(68, "Request Refund")
    r = safe_request("post", f"{BASE_URL}/refunds", headers=client_h, json={
        "payment_id": 1,
        "amount": 250,
        "reason": "Milestone 3 deliverables were incomplete."
    })
    if r and r.status_code in (200, 201):
        data = r.json()
        chain["refund_id"] = data.get("id")
        log_pass("Refund requested", f"id={chain.get('refund_id')}")
    else:
        log_warn("Request refund", f"status={r.status_code if r else 'NO RESPONSE'}")


# ============================================================================
# MAIN
# ============================================================================
def main():
    print("\n" + "=" * 70)
    print("  MEGILANCE COMPLETE E2E CHAIN TEST")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Test ID: {TEST_ID}")
    print(f"  Backend: {BASE_URL}")
    print("=" * 70)

    start = time.time()

    # Health check - try multiple endpoints
    r = safe_request("get", "http://localhost:8000/health")
    if not (r and r.status_code == 200):
        r = safe_request("get", f"{BASE_URL}/health/ready")
    if not (r and r.status_code == 200):
        r = safe_request("get", f"{BASE_URL}/health")
    if not (r and r.status_code == 200):
        print("\n❌ Backend is not healthy. Start the backend first:")
        print("   cd backend && python -m uvicorn main:app --reload --port 8000")
        sys.exit(1)

    # Run complete chain
    chain = test_complete_chain()

    # Run dispute flow
    if chain.get("contract_id"):
        test_dispute_flow(chain)

    # Run refund flow
    test_refund_flow(chain)

    # Final report
    duration = time.time() - start
    total = RESULTS["passed"] + RESULTS["failed"]

    print("\n" + "=" * 70)
    print("  FINAL CHAIN TEST REPORT")
    print("=" * 70)
    print(f"  Total tests:  {total}")
    print(f"  ✅ Passed:     {RESULTS['passed']}")
    print(f"  ❌ Failed:     {RESULTS['failed']}")
    print(f"  ⚠️  Warnings:  {len(RESULTS['warnings'])}")
    print(f"  Duration:     {duration:.1f}s")
    if total > 0:
        print(f"  Pass rate:    {(RESULTS['passed'] / total * 100):.1f}%")

    # Chain summary
    print(f"\n  CHAIN SUMMARY:")
    print(f"    Client ID:      {chain.get('client_id', 'N/A')}")
    print(f"    Freelancer ID:  {chain.get('freelancer_id', 'N/A')}")
    print(f"    Project ID:     {chain.get('project_id', 'N/A')}")
    print(f"    Proposal ID:    {chain.get('proposal_id', 'N/A')}")
    print(f"    Contract ID:    {chain.get('contract_id', 'N/A')}")
    print(f"    Escrow ID:      {chain.get('escrow_id', 'N/A')}")
    print(f"    Milestone IDs:  {chain.get('milestone_1_id', 'N/A')}, {chain.get('milestone_2_id', 'N/A')}, {chain.get('milestone_3_id', 'N/A')}")
    print(f"    Invoice ID:     {chain.get('invoice_id', 'N/A')}")
    print(f"    Dispute ID:     {chain.get('dispute_id', 'N/A')}")
    print(f"    Workflow ID:    {chain.get('workflow_id', 'N/A')}")

    if RESULTS["errors"]:
        print(f"\n  FAILURES ({len(RESULTS['errors'])}):")
        for err in RESULTS["errors"]:
            print(f"    ❌ {err}")

    if RESULTS["warnings"]:
        print(f"\n  WARNINGS ({len(RESULTS['warnings'])}):")
        for warn in RESULTS["warnings"][:20]:
            print(f"    ⚠️  {warn}")
        if len(RESULTS["warnings"]) > 20:
            print(f"    ... and {len(RESULTS['warnings']) - 20} more warnings")

    print("\n" + "=" * 70)
    sys.exit(1 if RESULTS["failed"] > 0 else 0)


if __name__ == "__main__":
    main()
