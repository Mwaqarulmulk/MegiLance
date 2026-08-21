# @AI-HINT: Comprehensive test suite for Milestone 1: Instant Match API, NLP Brief Extraction, 9-Factor Ranking, Trust Signals Serialization, and Two-Sided Referrals ($20/$50) with Escrow Release Hooks.

import json
import pytest
from types import SimpleNamespace
from fastapi.testclient import TestClient

from main import app
from app.api.v1.ai.instant_match import (
    InstantMatchRequest,
    _extract_brief_heuristic,
    instant_match,
)
from app.services.matching_engine import get_matching_service
from app.services.referrals_service import (
    ensure_referrals_tables,
    process_registration_referral,
    qualify_referral_on_milestone,
    get_referral_stats,
    list_referrals,
)
from app.api.v1.core_domain.public_profiles import _build_trust_signals as build_public_trust_signals
from app.api.v1.projects_domain.freelancers import _build_trust_signals as build_freelancer_trust_signals
from app.core.security import create_access_token


# ---------------------------------------------------------------------------
# Helper: Turso-style result builder for unit and integration testing
# ---------------------------------------------------------------------------

def _turso_result(columns=(), rows=(), *, last_id=None, affected=0):
    return {
        "cols": [{"name": col} for col in columns],
        "rows": [[{"type": "text", "value": val} for val in row] for row in rows],
        "last_insert_rowid": last_id,
        "rows_affected": affected,
    }


# ===========================================================================
# Group 1: Guest & Authenticated Instant Match API
# ===========================================================================

@pytest.mark.asyncio
async def test_instant_match_endpoint_guest_user(monkeypatch):
    """Guest visitors can call instant-match with zero auth and receive matches + brief."""
    client = TestClient(app)
    
    response = client.post(
        "/api/v1/ai/instant-match",
        json={
            "prompt": "Build a Next.js SaaS app with Stripe payments and Tailwind CSS",
        },
    )
    
    assert response.status_code == 200, response.text
    data = response.json()
    
    # Verify extracted brief
    assert "extracted_brief" in data
    brief = data["extracted_brief"]
    assert "Next.js" in brief["skills"] or "React" in brief["skills"]
    assert "Stripe" in brief["skills"]
    assert brief["category"] == "WEB_DEVELOPMENT"
    assert brief["budget_min"] > 0
    assert brief["budget_max"] >= brief["budget_min"]
    assert brief["budget_type"] == "fixed"
    assert brief["estimated_days"] > 0
    
    # Verify matched candidates
    assert "matches" in data
    assert len(data["matches"]) >= 1
    top_candidate = data["matches"][0]
    assert "freelancer_id" in top_candidate
    assert "name" in top_candidate
    assert "match_score" in top_candidate
    assert top_candidate["match_score"] >= 60
    assert top_candidate["match_quality"] in ["excellent", "strong", "good", "fair"]
    assert "why_good_fit" in top_candidate
    assert len(top_candidate["why_good_fit"]) > 10
    
    # Verify trust signals on candidate
    assert "trust_signals" in top_candidate
    trust = top_candidate["trust_signals"]
    assert trust["escrow_protected"] is True
    assert trust["client_fee_rate"] == 0.0
    assert trust["identity_verified"] is True
    assert trust["payment_verified"] is True
    assert 85 <= trust["jss_score"] <= 100
    assert isinstance(trust["verified_badge"], str)


@pytest.mark.asyncio
async def test_instant_match_endpoint_authenticated_client(monkeypatch):
    """Authenticated client can provide budget hint and category for instant matching."""
    token = create_access_token(
        subject="client@megilance.site",
        custom_claims={"user_id": 42, "role": "client", "user_type": "client", "name": "Alice Client"},
    )
    
    client = TestClient(app)
    response = client.post(
        "/api/v1/ai/instant-match",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "prompt": "Create an automated machine learning classification model with Python and FastAPI",
            "category": "AI_AND_MACHINE_LEARNING",
            "budget_hint": 3500.0,
        },
    )
    
    assert response.status_code == 200
    data = response.json()
    brief = data["extracted_brief"]
    assert brief["category"] == "AI_AND_MACHINE_LEARNING"
    assert "Python" in brief["skills"]
    assert "FastAPI" in brief["skills"]
    assert brief["budget_min"] >= 2000.0
    assert brief["budget_max"] >= 3500.0


@pytest.mark.asyncio
async def test_instant_match_empty_prompt_rejected():
    """Empty or whitespace prompt returns 400 Bad Request."""
    client = TestClient(app)
    response = client.post("/api/v1/ai/instant-match", json={"prompt": "   "})
    assert response.status_code == 400


# ===========================================================================
# Group 2: NLP Brief Extraction Heuristics & Multi-Domain Classification
# ===========================================================================

def test_nlp_brief_extraction_web_development():
    brief = _extract_brief_heuristic("Build a modern web dashboard with React, TypeScript, and Tailwind CSS budget $1500")
    assert brief.category == "WEB_DEVELOPMENT"
    assert "React" in brief.skills
    assert "TypeScript" in brief.skills
    assert "Tailwind CSS" in brief.skills
    assert brief.budget_min <= 1500 <= brief.budget_max
    assert brief.budget_type == "fixed"
    assert "Dashboard" in brief.title or "React" in brief.title


def test_nlp_brief_extraction_mobile_development():
    brief = _extract_brief_heuristic("Need an iOS and Android mobile app built with Flutter and Firebase")
    assert brief.category == "MOBILE_DEVELOPMENT"
    assert "Flutter" in brief.skills
    assert brief.duration in ["less_than_1_month", "1_to_3_months"]
    assert "Mobile" in brief.title or "Flutter" in brief.title


def test_nlp_brief_extraction_ai_machine_learning():
    brief = _extract_brief_heuristic("Develop an LLM chatbot using Python, OpenAI and PyTorch with 2500 USD budget")
    assert brief.category == "AI_AND_MACHINE_LEARNING"
    assert "Python" in brief.skills
    assert any(s in brief.skills for s in ["Artificial Intelligence", "PyTorch", "LLM"])
    assert brief.budget_min <= 2500 <= brief.budget_max


def test_nlp_brief_extraction_design_and_creative():
    brief = _extract_brief_heuristic("Design modern Figma UI/UX prototype and mobile screens for fintech product")
    assert brief.category == "DESIGN_AND_CREATIVE"
    assert "Figma" in brief.skills
    assert "UI/UX" in brief.skills


def test_nlp_brief_extraction_devops_cloud():
    brief = _extract_brief_heuristic("Deploy Docker containers to Kubernetes on AWS with Terraform CI/CD")
    assert brief.category == "DEVOPS_AND_CLOUD"
    assert "Docker" in brief.skills
    assert "Kubernetes" in brief.skills
    assert "AWS" in brief.skills


# ===========================================================================
# Group 3: 9-Factor Multi-Dimensional Ranking & Trust Signals
# ===========================================================================

def test_9_factor_matching_engine_skill_and_budget_scoring():
    engine = get_matching_service()
    
    project = {
        "title": "Next.js & Stripe Full-Stack Portal",
        "description": "Full stack development with Next.js, React, Stripe, and TypeScript",
        "category": "WEB_DEVELOPMENT",
        "skills": ["Next.js", "React", "Stripe", "TypeScript"],
        "budget_min": 1000,
        "budget_max": 2500,
        "budget_type": "fixed",
        "experience_level": "expert",
    }
    
    # Highly qualified candidate
    top_freelancer = {
        "id": 101,
        "name": "Sarah Jenkins",
        "skills": ["Next.js", "React", "TypeScript", "Stripe", "Tailwind CSS"],
        "hourly_rate": 65.0,
        "experience_level": "expert",
    }
    
    # Partial match candidate
    partial_freelancer = {
        "id": 102,
        "name": "Bob Coder",
        "skills": ["PHP", "WordPress", "HTML"],
        "hourly_rate": 30.0,
        "experience_level": "entry",
    }
    
    score_top = engine.calculate_match_score(project, top_freelancer)
    score_partial = engine.calculate_match_score(project, partial_freelancer)
    
    assert score_top["score"] > score_partial["score"]
    assert score_top["score"] >= 0.60
    assert "skill_match" in score_top["factors"]
    assert "budget_match" in score_top["factors"]
    assert "success_rate" in score_top["factors"]
    assert len(score_top["skill_details"]["exact_matches"]) >= 3


# ===========================================================================
# Group 4: Two-Sided Referral System ($20 Referee / $50 Referrer Escrow Hook)
# ===========================================================================

def test_two_sided_referrals_registration_and_milestone_qualification(monkeypatch):
    """
    Test full 2-sided referral lifecycle:
    1. Referee signs up with referral code -> awarded $20 welcome credit voucher.
    2. Escrow milestone is released -> referrer awarded $50 milestone project credit.
    """
    db_store = {
        "users": {
            1: {"id": 1, "name": "Referrer Roy", "email": "roy@example.com", "referral_code": "REF-ROY-777", "account_balance": 0.0},
            2: {"id": 2, "name": "Referee Rita", "email": "rita@example.com", "referral_code": None, "account_balance": 0.0},
        },
        "referrals": [],
        "referral_credits": [],
        "wallet_transactions": [],
        "next_ref_id": 1,
    }
    
    def fake_execute(sql, params=None):
        sql_u = sql.strip().upper()
        p = params or []
        
        # User lookup by referral_code
        if "WHERE REFERRAL_CODE = ?" in sql_u:
            code = p[0]
            matched = [u for u in db_store["users"].values() if u["referral_code"] == code]
            if matched:
                return _turso_result(["id", "name", "email"], [[matched[0]["id"], matched[0]["name"], matched[0]["email"]]])
            return _turso_result()
        
        # Check existing referral
        if "FROM REFERRALS" in sql_u and "WHERE REFERRER_ID = ?" in sql_u:
            ref_id = p[0]
            email = p[1]
            matched = [r for r in db_store["referrals"] if r["referrer_id"] == ref_id and r["referred_email"] == email]
            if matched:
                return _turso_result(["id", "referrer_id", "referred_user_id"], [[matched[0]["id"], matched[0]["referrer_id"], matched[0]["referred_user_id"]]])
            return _turso_result()
        
        # Find pending referral by referred_user_id for milestone release
        if "FROM REFERRALS" in sql_u and "WHERE (R.REFERRED_USER_ID = ?" in sql_u:
            uid = p[0]
            matched = [r for r in db_store["referrals"] if (r["referred_user_id"] == uid or r["referred_email"] == "rita@example.com") and r["status"] == "pending"]
            if matched:
                r = matched[0]
                return _turso_result(
                    ["id", "referrer_id", "referred_user_id", "referee_reward_amount", "reward_amount", "referral_code"],
                    [[r["id"], r["referrer_id"], r["referred_user_id"], r["referee_reward_amount"], r["reward_amount"], r["referral_code"]]],
                )
            return _turso_result()
        
        # INSERT INTO referrals
        if "INSERT INTO REFERRALS" in sql_u:
            rid = db_store["next_ref_id"]
            db_store["next_ref_id"] += 1
            db_store["referrals"].append({
                "id": rid,
                "referrer_id": p[0],
                "referred_user_id": p[1],
                "referred_email": p[2],
                "referral_code": p[3],
                "status": p[4],
                "referee_reward_amount": p[5],
                "reward_amount": p[6],
                "is_paid": p[7],
            })
            return {"last_insert_rowid": rid, "rows_affected": 1}
        
        # UPDATE users SET account_balance
        if "UPDATE USERS SET ACCOUNT_BALANCE" in sql_u:
            delta = float(p[0])
            uid = int(p[1])
            if uid in db_store["users"]:
                db_store["users"][uid]["account_balance"] += delta
            return {"rows_affected": 1}
        
        # UPDATE referrals SET status = 'completed'
        if "UPDATE REFERRALS SET STATUS = 'COMPLETED'" in sql_u:
            ref_id = int(p[2])
            for r in db_store["referrals"]:
                if r["id"] == ref_id:
                    r["status"] = "completed"
                    r["is_paid"] = 1
            return {"rows_affected": 1}
        
        # Wallet transactions / referral credits insert
        if "INSERT INTO WALLET_TRANSACTIONS" in sql_u or "INSERT INTO REFERRAL_CREDITS" in sql_u:
            return {"last_insert_rowid": 1, "rows_affected": 1}
        
        return _turso_result()
    
    # Mock Turso execution in referrals_service
    import app.services.referrals_service as ref_svc
    monkeypatch.setattr(ref_svc, "execute_query", fake_execute)
    
    # 1. Step 1: Process referee registration with referral code
    reg_result = process_registration_referral(
        new_user_id=2,
        new_user_email="rita@example.com",
        referral_code="REF-ROY-777",
    )
    
    assert reg_result is not None
    assert reg_result["welcome_credit"] == 20.0
    assert reg_result["referrer_id"] == 1
    assert reg_result["referee_user_id"] == 2
    assert db_store["users"][2]["account_balance"] == 20.0  # Referee credited $20.00
    
    # 2. Step 2: Client releases milestone escrow -> qualifies referral
    qual_result = qualify_referral_on_milestone(
        client_id=2,
        contract_id=105,
        milestone_id=205,
    )
    
    assert qual_result is not None
    assert qual_result["status"] == "completed"
    assert qual_result["reward_amount"] == 50.0
    assert qual_result["referrer_id"] == 1
    assert db_store["users"][1]["account_balance"] == 50.0  # Referrer credited $50.00


# ===========================================================================
# Group 5: Public Profile & Freelancers Trust Signals Serialization
# ===========================================================================

def test_public_profile_trust_signals_builder():
    profile = {
        "id": 88,
        "name": "Marcus Vance",
        "is_verified": 1,
        "seller_level": "Top Rated Plus",
        "skills": "Next.js, React, TypeScript, GraphQL",
    }
    
    trust = build_public_trust_signals(profile, 88)
    assert trust["is_id_verified"] is True
    assert trust["identity_verified"] is True
    assert trust["payment_verified"] is True
    assert trust["escrow_protected"] is True
    assert trust["client_fee_rate"] == 0.0
    assert trust["seller_level"] == "Top Rated Plus"
    assert trust["verified_badge"] == "Top Rated Plus"
    assert "Next.js" in trust["verified_skill_badges"]


def test_freelancer_router_trust_signals_builder():
    freelancer = {
        "id": 99,
        "name": "Elena Torres",
        "is_verified": 1,
        "seller_level": "level_2",
        "skills": ["Python", "FastAPI", "Docker", "PostgreSQL"],
    }
    
    trust = build_freelancer_trust_signals(freelancer, 99)
    assert trust["is_id_verified"] is True
    assert trust["identity_verified"] is True
    assert trust["payment_verified"] is True
    assert trust["escrow_protected"] is True
    assert trust["client_fee_rate"] == 0.0
    assert trust["verified_badge"] == "Level 2"
    assert "Python" in trust["verified_skill_badges"]
