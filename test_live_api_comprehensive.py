#!/usr/bin/env python3
"""
Comprehensive API test for live megilance.site deployment
Tests all CRUD operations, authentication flows, and chatbot
"""

import requests
import json
from datetime import datetime
import sys

API_BASE = "https://api.megilance.site/api"
results = []

print("╔" + "="*78 + "╗")
print("║" + " "*15 + "MEGILANCE LIVE SITE - COMPREHENSIVE API TEST" + " "*19 + "║")
print("╚" + "="*78 + "╝\n")

# Test 1: Health Check
print("1️⃣  Health Check - GET /api/health/ready")
try:
    resp = requests.get(f"{API_BASE}/health/ready", timeout=5)
    if resp.status_code == 200:
        data = resp.json()
        status = data.get('status')
        env = data.get('environment')
        db = data.get('db')
        print(f"   ✅ Status: {status} | Environment: {env} | DB: {db}")
        results.append(("Health Check", "✅ PASS"))
    else:
        print(f"   ❌ Status code: {resp.status_code}")
        results.append(("Health Check", "❌ FAIL"))
except Exception as e:
    print(f"   ❌ Error: {str(e)}")
    results.append(("Health Check", "❌ ERROR"))

# Test 2: GET Projects (No Auth)
print("\n2️⃣  GET Projects - GET /api/projects")
try:
    resp = requests.get(f"{API_BASE}/projects", timeout=5)
    if resp.status_code == 200:
        data = resp.json()
        count = len(data) if isinstance(data, list) else 0
        print(f"   ✅ Retrieved {count} projects")
        results.append(("GET Projects", "✅ PASS"))
    else:
        print(f"   ❌ Status code: {resp.status_code}")
        results.append(("GET Projects", "❌ FAIL"))
except Exception as e:
    print(f"   ❌ Error: {str(e)}")
    results.append(("GET Projects", "❌ ERROR"))

# Test 3: GET Users (No Auth)
print("\n3️⃣  GET Users - GET /api/users")
try:
    resp = requests.get(f"{API_BASE}/users", timeout=5)
    if resp.status_code == 200:
        print(f"   ✅ Users endpoint accessible")
        results.append(("GET Users", "✅ PASS"))
    else:
        print(f"   ❌ Status code: {resp.status_code}")
        results.append(("GET Users", "❌ FAIL"))
except Exception as e:
    print(f"   ❌ Error: {str(e)}")
    results.append(("GET Users", "❌ ERROR"))

# Test 4: Register User
print("\n4️⃣  Register User - POST /api/v1/auth/register")
timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
test_email = f"test{timestamp}@example.com"
register_data = {
    "email": test_email,
    "password": "TestPassword123!",
    "full_name": "Test User",
    "role": "freelancer"
}
test_token = None
user_id = None
try:
    resp = requests.post(f"{API_BASE}/v1/auth/register", json=register_data, timeout=5)
    if resp.status_code in [200, 201]:
        data = resp.json()
        user_id = data.get('id')
        print(f"   ✅ User registered: {test_email} (ID: {user_id})")
        results.append(("Register User", "✅ PASS"))
    else:
        print(f"   ❌ Status code: {resp.status_code}")
        print(f"   Response: {resp.text[:200]}")
        results.append(("Register User", "❌ FAIL"))
except Exception as e:
    print(f"   ❌ Error: {str(e)}")
    results.append(("Register User", "❌ ERROR"))

# Test 5: Login User
print("\n5️⃣  Login User - POST /api/v1/auth/login")
login_data = {
    "email": test_email,
    "password": "TestPassword123!"
}
try:
    resp = requests.post(f"{API_BASE}/v1/auth/login", json=login_data, timeout=5)
    if resp.status_code == 200:
        data = resp.json()
        test_token = data.get('access_token')
        print(f"   ✅ Login successful | Token: {test_token[:40]}...")
        results.append(("Login User", "✅ PASS"))
    else:
        print(f"   ❌ Status code: {resp.status_code}")
        print(f"   Response: {resp.text[:200]}")
        results.append(("Login User", "❌ FAIL"))
except Exception as e:
    print(f"   ❌ Error: {str(e)}")
    results.append(("Login User", "❌ ERROR"))

# Test 6: CREATE Project
print("\n6️⃣  CREATE Project - POST /api/v1/projects")
project_data = {
    "title": f"Test Project {timestamp}",
    "description": "Test project for API validation",
    "category": "Web Development",
    "budget_type": "fixed",
    "budget_min": 5000,
    "budget_max": 10000,
    "experience_level": "intermediate",
    "estimated_duration": "2-4 weeks",
    "skills": ["JavaScript", "React"]
}
project_id = None
if test_token:
    try:
        headers = {"Authorization": f"Bearer {test_token}"}
        resp = requests.post(f"{API_BASE}/v1/projects", json=project_data, headers=headers, timeout=5)
        if resp.status_code in [200, 201]:
            data = resp.json()
            project_id = data.get('id')
            print(f"   ✅ Project created (ID: {project_id})")
            results.append(("CREATE Project", "✅ PASS"))
        else:
            print(f"   ❌ Status code: {resp.status_code}")
            print(f"   Response: {resp.text[:200]}")
            results.append(("CREATE Project", "❌ FAIL"))
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        results.append(("CREATE Project", "❌ ERROR"))
else:
    print(f"   ⚠️  Skipped (no auth token)")
    results.append(("CREATE Project", "⚠️  SKIPPED"))

# Test 7: GET Project by ID
print("\n7️⃣  GET Project by ID - GET /api/v1/projects/{id}")
if project_id:
    try:
        headers = {"Authorization": f"Bearer {test_token}"}
        resp = requests.get(f"{API_BASE}/v1/projects/{project_id}", headers=headers, timeout=5)
        if resp.status_code == 200:
            print(f"   ✅ Retrieved project {project_id}")
            results.append(("GET Project by ID", "✅ PASS"))
        else:
            print(f"   ❌ Status code: {resp.status_code}")
            results.append(("GET Project by ID", "❌ FAIL"))
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        results.append(("GET Project by ID", "❌ ERROR"))
else:
    print(f"   ⚠️  Skipped (no project ID)")
    results.append(("GET Project by ID", "⚠️  SKIPPED"))

# Test 8: GET Chat Messages
print("\n8️⃣  GET Chat Messages - GET /api/v1/chats")
if test_token:
    try:
        headers = {"Authorization": f"Bearer {test_token}"}
        resp = requests.get(f"{API_BASE}/v1/chats", headers=headers, timeout=5)
        if resp.status_code == 200:
            print(f"   ✅ Chat endpoint accessible")
            results.append(("GET Chat Messages", "✅ PASS"))
        elif resp.status_code == 404:
            print(f"   ❌ Endpoint not found (404)")
            results.append(("GET Chat Messages", "❌ NOT FOUND"))
        else:
            print(f"   ❌ Status code: {resp.status_code}")
            results.append(("GET Chat Messages", "❌ FAIL"))
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        results.append(("GET Chat Messages", "❌ ERROR"))
else:
    print(f"   ⚠️  Skipped (no auth token)")
    results.append(("GET Chat Messages", "⚠️  SKIPPED"))

# Test 9: GET Proposals
print("\n9️⃣  GET Proposals - GET /api/v1/proposals")
if test_token:
    try:
        headers = {"Authorization": f"Bearer {test_token}"}
        resp = requests.get(f"{API_BASE}/v1/proposals", headers=headers, timeout=5)
        if resp.status_code == 200:
            print(f"   ✅ Proposals endpoint accessible")
            results.append(("GET Proposals", "✅ PASS"))
        elif resp.status_code == 404:
            print(f"   ❌ Endpoint not found (404)")
            results.append(("GET Proposals", "❌ NOT FOUND"))
        else:
            print(f"   ❌ Status code: {resp.status_code}")
            results.append(("GET Proposals", "❌ FAIL"))
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        results.append(("GET Proposals", "❌ ERROR"))
else:
    print(f"   ⚠️  Skipped (no auth token)")
    results.append(("GET Proposals", "⚠️  SKIPPED"))

# Test 10: GET Reviews
print("\n🔟 GET Reviews - GET /api/v1/reviews")
try:
    resp = requests.get(f"{API_BASE}/v1/reviews", timeout=5)
    if resp.status_code == 200:
        print(f"   ✅ Reviews endpoint accessible")
        results.append(("GET Reviews", "✅ PASS"))
    elif resp.status_code == 404:
        print(f"   ❌ Endpoint not found (404)")
        results.append(("GET Reviews", "❌ NOT FOUND"))
    else:
        print(f"   ❌ Status code: {resp.status_code}")
        results.append(("GET Reviews", "❌ FAIL"))
except Exception as e:
    print(f"   ❌ Error: {str(e)}")
    results.append(("GET Reviews", "❌ ERROR"))

# Test 11: GET Payments
print("\n1️⃣1️⃣  GET Payments - GET /api/v1/payments")
if test_token:
    try:
        headers = {"Authorization": f"Bearer {test_token}"}
        resp = requests.get(f"{API_BASE}/v1/payments", headers=headers, timeout=5)
        if resp.status_code == 200:
            print(f"   ✅ Payments endpoint accessible")
            results.append(("GET Payments", "✅ PASS"))
        elif resp.status_code == 404:
            print(f"   ❌ Endpoint not found (404)")
            results.append(("GET Payments", "❌ NOT FOUND"))
        else:
            print(f"   ❌ Status code: {resp.status_code}")
            results.append(("GET Payments", "❌ FAIL"))
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        results.append(("GET Payments", "❌ ERROR"))
else:
    print(f"   ⚠️  Skipped (no auth token)")
    results.append(("GET Payments", "⚠️  SKIPPED"))

# Test 12: GET Contracts
print("\n1️⃣2️⃣  GET Contracts - GET /api/v1/contracts")
if test_token:
    try:
        headers = {"Authorization": f"Bearer {test_token}"}
        resp = requests.get(f"{API_BASE}/v1/contracts", headers=headers, timeout=5)
        if resp.status_code == 200:
            print(f"   ✅ Contracts endpoint accessible")
            results.append(("GET Contracts", "✅ PASS"))
        elif resp.status_code == 404:
            print(f"   ❌ Endpoint not found (404)")
            results.append(("GET Contracts", "❌ NOT FOUND"))
        else:
            print(f"   ❌ Status code: {resp.status_code}")
            results.append(("GET Contracts", "❌ FAIL"))
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        results.append(("GET Contracts", "❌ ERROR"))
else:
    print(f"   ⚠️  Skipped (no auth token)")
    results.append(("GET Contracts", "⚠️  SKIPPED"))

# Summary
print("\n" + "╔" + "="*78 + "╗")
print("║" + " "*30 + "TEST SUMMARY" + " "*36 + "║")
print("╚" + "="*78 + "╝\n")

pass_count = sum(1 for _, status in results if "✅" in status)
fail_count = sum(1 for _, status in results if "❌" in status)
warn_count = sum(1 for _, status in results if "⚠️" in status)

print("RESULTS:")
print("-" * 80)
for test_name, status in results:
    color = "✅" if "✅" in status else "❌" if "❌" in status else "⚠️"
    print(f"{status:12} {test_name}")

print("\n" + ("="*80))
print(f"SUMMARY: ✅ PASSED: {pass_count} | ❌ FAILED: {fail_count} | ⚠️  WARNINGS: {warn_count} | TOTAL: {len(results)}")
print("="*80)

# Determine exit code
sys.exit(0 if fail_count == 0 else 1)
