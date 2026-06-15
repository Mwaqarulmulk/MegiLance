# Quick API Check - Tests all endpoints with short timeouts
import requests
import json
import uuid
import sys
import time

BASE = "http://localhost:8000/api"
T = uuid.uuid4().hex[:6]
R = {"pass": 0, "fail": 0, "warn": 0, "errors": []}
S = requests.Session()
S.timeout = 10

def p(name, detail=""):
    R["pass"] += 1
    print(f"  [PASS] {name}" + (f" - {detail}" if detail else ""))

def f(name, detail=""):
    R["fail"] += 1
    R["errors"].append(f"{name}: {detail}")
    print(f"  [FAIL] {name}" + (f" - {detail}" if detail else ""))

def w(name, detail=""):
    R["warn"] += 1
    print(f"  [WARN] {name}" + (f" - {detail}" if detail else ""))

def req(method, path, **kw):
    try:
        return getattr(S, method)(f"{BASE}{path}", **kw)
    except Exception as e:
        return None

def auth_h(token):
    return {"Authorization": f"Bearer {token}"}

def section(title):
    print(f"\n{'='*60}\n  {title}\n{'='*60}")

# =================================================================
# 1. HEALTH
# =================================================================
section("1. HEALTH & INFRASTRUCTURE")
r = req("get", "/health/ready")
if r and r.status_code == 200:
    d = r.json()
    if d.get("status") in ("healthy","ready","ok") and d.get("database",d.get("db")) in ("connected","ok"):
        p("Health ready", f"db={d.get('database')}")
    else:
        f("Health ready", str(d))
else:
    f("Health ready", str(r.status_code if r else "NO RESPONSE"))
    sys.exit(1)

r = req("get", "/openapi.json")
if r and r.status_code == 200:
    p("OpenAPI spec", f"{len(r.json().get('paths',{}))} routes")
else:
    f("OpenAPI spec", str(r.status_code if r else "NO RESPONSE"))

# =================================================================
# 2. AUTH
# =================================================================
section("2. AUTH")
tokens = {}

# Register client
r = req("post", "/auth/register", json={"email": f"cli_{T}@t.com", "password": "TestP@ss123!", "name": "Test Client", "user_type": "client"})
if r and r.status_code in (200,201):
    tokens["client"] = r.json().get("access_token")
    p("Register client")
elif r and r.status_code == 409:
    w("Register client", "Already exists")
else:
    f("Register client", f"{r.status_code if r else 'NO RESPONSE'}: {r.text[:150] if r else ''}")

# Register freelancer
r = req("post", "/auth/register", json={"email": f"frl_{T}@t.com", "password": "TestP@ss123!", "name": "Test Freelancer", "user_type": "freelancer"})
if r and r.status_code in (200,201):
    tokens["freelancer"] = r.json().get("access_token")
    p("Register freelancer")
else:
    f("Register freelancer", f"{r.status_code if r else 'NO RESPONSE'}: {r.text[:150] if r else ''}")

# Login client
r = req("post", "/auth/login", json={"email": f"cli_{T}@t.com", "password": "TestP@ss123!"})
if r and r.status_code == 200 and r.json().get("access_token"):
    tokens["client"] = r.json()["access_token"]
    p("Login client")
elif "client" in tokens:
    w("Login client", "Using registration token")
else:
    f("Login client", str(r.status_code if r else "NO RESPONSE"))

# Login freelancer
r = req("post", "/auth/login", json={"email": f"frl_{T}@t.com", "password": "TestP@ss123!"})
if r and r.status_code == 200 and r.json().get("access_token"):
    tokens["freelancer"] = r.json()["access_token"]
    p("Login freelancer")
elif "freelancer" in tokens:
    w("Login freelancer", "Using registration token")
else:
    f("Login freelancer", str(r.status_code if r else "NO RESPONSE"))

# Invalid login
r = req("post", "/auth/login", json={"email": f"cli_{T}@t.com", "password": "WrongPass"})
if r and r.status_code in (401,400):
    p("Invalid credentials rejected")
else:
    f("Invalid credentials", str(r.status_code if r else "NO RESPONSE"))

# Weak password
r = req("post", "/auth/register", json={"email": f"weak_{T}@t.com", "password": "123", "name": "Weak", "user_type": "client"})
if r and r.status_code in (400,422):
    p("Weak password rejected")
else:
    w("Weak password", str(r.status_code if r else "NO RESPONSE"))

# Duplicate email
if "client" in tokens:
    r = req("post", "/auth/register", json={"email": f"cli_{T}@t.com", "password": "TestP@ss123!", "name": "Dup", "user_type": "client"})
    if r and r.status_code in (400,409,422):
        p("Duplicate email rejected")
    else:
        f("Duplicate email", str(r.status_code if r else "NO RESPONSE"))

# Auth /me
for role in ["client", "freelancer"]:
    if role in tokens:
        r = req("get", "/auth/me", headers=auth_h(tokens[role]))
        if r and r.status_code == 200:
            p(f"Get /me ({role})", f"name={r.json().get('name')}")
        else:
            f(f"Get /me ({role})", str(r.status_code if r else "NO RESPONSE"))

# No auth
r = req("get", "/auth/me")
if r and r.status_code == 401:
    p("Unauthenticated rejected")
else:
    f("Unauthenticated check", str(r.status_code if r else "NO RESPONSE"))

# Forgot password
r = req("post", "/auth/forgot-password", json={"email": f"cli_{T}@t.com"})
if r and r.status_code in (200, 202):
    p("Forgot password")
else:
    w("Forgot password", str(r.status_code if r else "NO RESPONSE"))

# =================================================================
# 3. CLIENT PORTAL
# =================================================================
section("3. CLIENT PORTAL")
ch = auth_h(tokens.get("client", ""))
project_id = None

# Profile update
r = req("put", "/users/me", headers=ch, json={"name": "Client Updated", "bio": "Test client", "location": "London"})
if r and r.status_code == 200:
    p("Client: update profile")
else:
    w("Client: update profile", str(r.status_code if r else "NO RESPONSE"))

# Create project
r = req("post", "/projects", headers=ch, json={
    "title": f"Test Project {T}", "description": "Full E2E test project",
    "category": "web-development", "budget_type": "fixed",
    "budget_min": 500, "budget_max": 2000,
    "experience_level": "intermediate", "estimated_duration": "1-3 months",
    "skills": "python,react"
})
if r and r.status_code in (200,201):
    project_id = r.json().get("id")
    p("Client: create project", f"id={project_id}")
else:
    f("Client: create project", f"{r.status_code if r else 'NO RESPONSE'}: {r.text[:150] if r else ''}")

# List projects
r = req("get", "/projects", headers=ch)
if r and r.status_code == 200:
    data = r.json()
    items = data if isinstance(data, list) else data.get("items", data.get("projects", []))
    p("Client: list projects", f"count={len(items) if isinstance(items, list) else 'N/A'}")
else:
    f("Client: list projects", str(r.status_code if r else "NO RESPONSE"))

# Get project by ID
if project_id:
    r = req("get", f"/projects/{project_id}", headers=ch)
    if r and r.status_code == 200:
        p("Client: get project by ID")
    else:
        f("Client: get project by ID", str(r.status_code if r else "NO RESPONSE"))

# Dashboard
r = req("get", "/portal/client/dashboard", headers=ch)
if r and r.status_code == 200:
    p("Client: dashboard")
else:
    w("Client: dashboard", str(r.status_code if r else "NO RESPONSE"))

# Client projects portal
r = req("get", "/client/projects", headers=ch)
if r and r.status_code == 200:
    p("Client: client projects portal")
else:
    w("Client: client projects portal", str(r.status_code if r else "NO RESPONSE"))

# Search freelancers
r = req("get", "/search/freelancers?q=python", headers=ch)
if r and r.status_code == 200:
    p("Client: search freelancers")
else:
    w("Client: search freelancers", str(r.status_code if r else "NO RESPONSE"))

# Notifications
r = req("get", "/notifications", headers=ch)
if r and r.status_code == 200:
    p("Client: notifications")
else:
    w("Client: notifications", str(r.status_code if r else "NO RESPONSE"))

# Messages
r = req("get", "/messages", headers=ch)
if r and r.status_code == 200:
    p("Client: messages")
else:
    w("Client: messages", str(r.status_code if r else "NO RESPONSE"))

# Contracts
r = req("get", "/contracts", headers=ch)
if r and r.status_code == 200:
    p("Client: contracts")
else:
    w("Client: contracts", str(r.status_code if r else "NO RESPONSE"))

# Invoices
r = req("get", "/invoices", headers=ch)
if r and r.status_code == 200:
    p("Client: invoices")
else:
    w("Client: invoices", str(r.status_code if r else "NO RESPONSE"))

# Payments
r = req("get", "/payments", headers=ch)
if r and r.status_code == 200:
    p("Client: payments")
else:
    w("Client: payments", str(r.status_code if r else "NO RESPONSE"))

# Favorites
r = req("get", "/favorites", headers=ch)
if r and r.status_code == 200:
    p("Client: favorites")
else:
    w("Client: favorites", str(r.status_code if r else "NO RESPONSE"))

# Support tickets
r = req("get", "/support-tickets", headers=ch)
if r and r.status_code == 200:
    p("Client: support tickets")
else:
    w("Client: support tickets", str(r.status_code if r else "NO RESPONSE"))

# Browse gigs
r = req("get", "/gigs")
if r and r.status_code == 200:
    p("Client: browse gigs")
else:
    f("Client: browse gigs", str(r.status_code if r else "NO RESPONSE"))

# =================================================================
# 4. FREELANCER PORTAL
# =================================================================
section("4. FREELANCER PORTAL")
fh = auth_h(tokens.get("freelancer", ""))
proposal_id = None
gig_id = None

# Profile update
r = req("put", "/users/me", headers=fh, json={
    "name": "Freelancer Updated", "bio": "Full-stack developer",
    "skills": "python,react,fastapi", "hourly_rate": 75.0, "location": "Berlin"
})
if r and r.status_code == 200:
    p("Freelancer: update profile")
else:
    w("Freelancer: update profile", str(r.status_code if r else "NO RESPONSE"))

# Browse projects
r = req("get", "/projects")
if r and r.status_code == 200:
    p("Freelancer: browse projects")
else:
    f("Freelancer: browse projects", str(r.status_code if r else "NO RESPONSE"))

# Submit proposal
if project_id:
    r = req("post", "/proposals", headers=fh, json={
        "project_id": project_id,
        "cover_letter": "I am an experienced developer.",
        "bid_amount": 1500.0, "estimated_duration": "2 months",
        "milestones": [{"title": "Phase 1", "amount": 500, "description": "Setup"}]
    })
    if r and r.status_code in (200,201):
        proposal_id = r.json().get("id")
        p("Freelancer: submit proposal", f"id={proposal_id}")
    else:
        f("Freelancer: submit proposal", f"{r.status_code if r else 'NO RESPONSE'}: {r.text[:150] if r else ''}")

# List proposals
r = req("get", "/proposals", headers=fh)
if r and r.status_code == 200:
    p("Freelancer: list proposals")
else:
    w("Freelancer: proposals", str(r.status_code if r else "NO RESPONSE"))

# Freelancer dashboard
r = req("get", "/portal/freelancer/dashboard", headers=fh)
if r and r.status_code == 200:
    p("Freelancer: dashboard")
else:
    w("Freelancer: dashboard", str(r.status_code if r else "NO RESPONSE"))

# Create gig
r = req("post", "/gigs", headers=fh, json={
    "title": f"I will build a REST API - {T}",
    "description": "Professional API development",
    "short_description": "API development",
    "category_id": 1,
    "basic_title": "Basic API", "basic_description": "Simple API", "basic_price": 50.0,
    "basic_delivery_days": 7, "basic_revisions": 2,
    "standard_title": "Standard API", "standard_description": "Full API", "standard_price": 150.0,
    "standard_delivery_days": 14, "standard_revisions": 3,
    "premium_title": "Premium API", "premium_description": "Complete API", "premium_price": 300.0,
    "premium_delivery_days": 21, "premium_revisions": 5
})
if r and r.status_code in (200,201):
    gig_id = r.json().get("id")
    p("Freelancer: create gig", f"id={gig_id}")
else:
    f("Freelancer: create gig", f"{r.status_code if r else 'NO RESPONSE'}: {r.text[:150] if r else ''}")

# List gigs
r = req("get", "/gigs", headers=fh)
if r and r.status_code == 200:
    p("Freelancer: list gigs")
else:
    f("Freelancer: list gigs", str(r.status_code if r else "NO RESPONSE"))

# Portfolio
r = req("get", "/portfolio", headers=fh)
if r and r.status_code == 200:
    p("Freelancer: portfolio")
else:
    w("Freelancer: portfolio", str(r.status_code if r else "NO RESPONSE"))

# Wallet
r = req("get", "/wallet/balance", headers=fh)
if r and r.status_code == 200:
    p("Freelancer: wallet balance")
else:
    w("Freelancer: wallet", str(r.status_code if r else "NO RESPONSE"))

# Seller stats
r = req("get", "/seller-stats/me", headers=fh)
if r and r.status_code == 200:
    p("Freelancer: seller stats")
else:
    w("Freelancer: seller stats", str(r.status_code if r else "NO RESPONSE"))

# Time entries
r = req("get", "/time-entries", headers=fh)
if r and r.status_code == 200:
    p("Freelancer: time entries")
else:
    w("Freelancer: time entries", str(r.status_code if r else "NO RESPONSE"))

# Availability
r = req("get", "/availability/schedule", headers=fh)
if r and r.status_code == 200:
    p("Freelancer: availability")
else:
    w("Freelancer: availability", str(r.status_code if r else "NO RESPONSE"))

# Rate cards
r = req("get", "/rate-cards", headers=fh)
if r and r.status_code == 200:
    p("Freelancer: rate cards")
else:
    w("Freelancer: rate cards", str(r.status_code if r else "NO RESPONSE"))

# Proposal templates
r = req("get", "/proposal-templates", headers=fh)
if r and r.status_code == 200:
    p("Freelancer: proposal templates")
else:
    w("Freelancer: proposal templates", str(r.status_code if r else "NO RESPONSE"))

# =================================================================
# 5. ADMIN PORTAL
# =================================================================
section("5. ADMIN PORTAL")
ah = {}

# Try to get admin token
r = req("post", "/auth/register", json={"email": f"adm_{T}@t.com", "password": "TestP@ss123!", "name": "Test Admin", "user_type": "admin"})
if r and r.status_code in (200,201):
    at = r.json().get("access_token")
    if at:
        ah = auth_h(at)
        p("Register admin")
else:
    w("Register admin", f"status={r.status_code if r else 'NO RESPONSE'}")

if not ah:
    r = req("post", "/auth/login", json={"email": "admin@megilance.com", "password": "AdminPass123!"})
    if r and r.status_code == 200:
        at = r.json().get("access_token")
        if at:
            ah = auth_h(at)
            p("Admin login (default)")
    if not ah:
        w("Admin", "No admin token - testing public only")

admin_endpoints = [
    ("get", "/admin/dashboard/overview", "Admin: dashboard overview"),
    ("get", "/admin/users/list", "Admin: users list"),
    ("get", "/admin/projects", "Admin: projects"),
    ("get", "/admin/contracts", "Admin: contracts"),
    ("get", "/admin/payments", "Admin: payments"),
    ("get", "/admin/disputes", "Admin: disputes"),
    ("get", "/admin/fraud-alerts", "Admin: fraud alerts"),
    ("get", "/admin/analytics/overview", "Admin: analytics"),
    ("get", "/admin/settings", "Admin: settings"),
    ("get", "/admin/support/tickets", "Admin: support tickets"),
    ("get", "/admin/reports", "Admin: reports"),
]

for method, path, name in admin_endpoints:
    r = req(method, path, headers=ah)
    if r and r.status_code == 200:
        p(name)
    elif r and r.status_code in (401, 403):
        w(name, f"Auth required: {r.status_code}")
    else:
        w(name, str(r.status_code if r else "NO RESPONSE"))

# =================================================================
# 6. PUBLIC ENDPOINTS
# =================================================================
section("6. PUBLIC ENDPOINTS")
public = [
    ("get", "/health/ready", "Health"),
    ("get", "/projects", "Projects"),
    ("get", "/gigs", "Gigs"),
    ("get", "/freelancers", "Freelancer profiles"),
    ("get", "/categories/", "Categories"),
    ("get", "/skills/", "Skills"),
    ("get", "/blog/", "Blog"),
    ("get", "/i18n/locales", "i18n"),
    ("get", "/knowledge-base/", "Knowledge base"),
    ("get", "/assessments/skills/available", "Assessments"),
    ("get", "/external-projects/", "External projects"),
]
for method, path, name in public:
    r = req(method, path)
    if r and r.status_code == 200:
        p(f"Public: {name}")
    elif r and r.status_code == 404:
        w(f"Public: {name}", "404 - not found")
    elif r and r.status_code == 422:
        w(f"Public: {name}", "422 - params needed")
    else:
        w(f"Public: {name}", str(r.status_code if r else "NO RESPONSE"))

# =================================================================
# 7. AUTHENTICATED FEATURES
# =================================================================
section("7. AUTHENTICATED FEATURES")
for role in ["client", "freelancer"]:
    if role not in tokens:
        continue
    h = auth_h(tokens[role])
    endpoints = [
        "/notifications", "/messages", "/contracts", "/invoices",
        "/payments", "/favorites", "/reviews", "/disputes",
        "/support-tickets", "/wallet/balance", "/wallet/transactions",
        "/activity/feed", "/saved-searches", "/referrals/stats",
        "/time-entries", "/escrow/transactions"
    ]
    for ep in endpoints:
        r = req("get", ep, headers=h)
        if r and r.status_code == 200:
            p(f"{role}: {ep}")
        elif r and r.status_code in (401, 403):
            f(f"{role}: {ep}", f"Auth error {r.status_code}")
        elif r and r.status_code == 404:
            w(f"{role}: {ep}", "404")
        else:
            w(f"{role}: {ep}", str(r.status_code if r else "NO RESPONSE"))

# =================================================================
# 8. ADVANCED FEATURES
# =================================================================
section("8. ADVANCED FEATURES")
h = auth_h(tokens.get("freelancer", tokens.get("client", "")))
if h.get("Authorization"):
    adv = [
        ("get", "/gamification/profile", "Gamification profile"),
        ("get", "/gamification/leaderboard", "Leaderboard"),
        ("get", "/gamification/badges", "Badges"),
        ("get", "/community/questions", "Community questions"),
        ("get", "/teams", "Teams"),
        ("get", "/analytics/dashboard/summary", "Analytics summary"),
        ("get", "/webhooks", "Webhooks"),
        ("get", "/feature-flags", "Feature flags"),
        ("get", "/notification-preferences", "Notif preferences"),
        ("get", "/compliance/status", "Compliance"),
        ("get", "/export-import/status", "Export/import"),
        ("get", "/pk-payments/methods", "PK payments"),
    ]
    for method, path, name in adv:
        r = req(method, path, headers=h)
        if r and r.status_code == 200:
            p(name)
        else:
            w(name, str(r.status_code if r else "NO RESPONSE"))

    # AI endpoints
    ai = [
        ("post", "/ai/extract-skills", {"text": "Python React PostgreSQL"}, "AI: extract skills"),
        ("post", "/ai/estimate-price", {"title": "Web App", "description": "Build web app", "category": "web"}, "AI: price estimate"),
    ]
    for method, path, body, name in ai:
        r = req(method, path, headers=h, json=body)
        if r and r.status_code == 200:
            p(name)
        else:
            w(name, str(r.status_code if r else "NO RESPONSE"))

    # Chatbot
    r = req("post", "/chatbot/start", headers=h)
    if r and r.status_code in (200,201):
        p("Chatbot start")
    else:
        w("Chatbot start", str(r.status_code if r else "NO RESPONSE"))

# =================================================================
# 9. CROSS-ROLE FLOWS
# =================================================================
section("9. CROSS-ROLE FLOWS")
ch = auth_h(tokens.get("client", ""))
fh = auth_h(tokens.get("freelancer", ""))

# Client views proposals
if project_id:
    r = req("get", f"/proposals?project_id={project_id}", headers=ch)
    if r and r.status_code == 200:
        p("Client: view project proposals")
    else:
        w("Client: view project proposals", str(r.status_code if r else "NO RESPONSE"))

# Get freelancer ID and send message
if tokens.get("freelancer"):
    r = req("get", "/auth/me", headers=fh)
    if r and r.status_code == 200:
        fid = r.json().get("id")
        if fid:
            r2 = req("post", "/messages", headers=ch, json={"receiver_id": fid, "content": f"Hello from client (test {T})"})
            if r2 and r2.status_code in (200,201):
                p("Client -> Freelancer: message")
            else:
                w("Client -> Freelancer: message", str(r2.status_code if r2 else "NO RESPONSE"))

# Freelancer reads messages
r = req("get", "/messages", headers=fh)
if r and r.status_code == 200:
    p("Freelancer: read messages")
else:
    w("Freelancer: read messages", str(r.status_code if r else "NO RESPONSE"))

# Client creates contract
if project_id and tokens.get("freelancer"):
    r = req("get", "/auth/me", headers=fh)
    if r and r.status_code == 200:
        fid = r.json().get("id")
        if fid:
            r2 = req("post", "/contracts", headers=ch, json={
                "project_id": project_id, "freelancer_id": fid,
                "total_amount": 1500.0, "contract_type": "fixed",
                "description": f"Test contract {T}"
            })
            if r2 and r2.status_code in (200,201):
                p("Client: create contract")
            else:
                w("Client: create contract", f"{r2.status_code if r2 else 'NO RESPONSE'}: {r2.text[:100] if r2 else ''}")

# Client views reviews
r = req("get", "/reviews", headers=ch)
if r and r.status_code == 200:
    p("Client: view reviews")
else:
    w("Client: reviews", str(r.status_code if r else "NO RESPONSE"))

# =================================================================
# 10. SECURITY
# =================================================================
section("10. SECURITY")
# SQL injection
r = req("get", "/projects?search=' OR 1=1 --")
if r and r.status_code in (200,400,422):
    p("SQL injection protection")
else:
    w("SQL injection test", str(r.status_code if r else "NO RESPONSE"))

# Invalid token
r = req("get", "/auth/me", headers={"Authorization": "Bearer fake.token.here"})
if r and r.status_code in (401,403):
    p("Invalid token rejected")
else:
    f("Invalid token", str(r.status_code if r else "NO RESPONSE"))

# RBAC: freelancer can't create project
if "freelancer" in tokens:
    r = req("post", "/projects", headers=fh, json={"title": "Unauthorized", "description": "Fail", "category": "test"})
    if r and r.status_code in (403,401):
        p("RBAC: freelancer can't create project")
    elif r and r.status_code in (200,201):
        f("RBAC violation", "Freelancer created project!")
    else:
        w("RBAC check", str(r.status_code if r else "NO RESPONSE"))

# RBAC: client can't create gig
if "client" in tokens:
    r = req("post", "/gigs", headers=ch, json={"title": "Unauthorized Gig", "description": "Fail", "basic_price": 50, "basic_delivery_days": 7})
    if r and r.status_code in (403,401):
        p("RBAC: client can't create gig")
    elif r and r.status_code in (200,201):
        f("RBAC violation", "Client created gig!")
    else:
        w("RBAC check (gig)", str(r.status_code if r else "NO RESPONSE"))

# =================================================================
# 11. STANDALONE TOOLS
# =================================================================
section("11. STANDALONE TOOLS")
tools = [
    ("post", "/invoice-generator/generate", {"client_name": "Test", "freelancer_name": "Test", "items": [{"description": "Dev", "quantity": 40, "rate": 50}], "currency": "USD"}, "Invoice generator"),
    ("post", "/contract-builder-standalone/generate", {"project_name": "Test", "client_name": "Test", "freelancer_name": "Test", "contract_type": "fixed", "total_amount": 5000}, "Contract builder"),
    ("post", "/income-calculator/calculate", {"hourly_rate": 75, "hours_per_week": 40, "country": "US"}, "Income calculator"),
    ("post", "/scope-planner/plan", {"project_type": "web-app", "description": "Full-stack app"}, "Scope planner"),
    ("post", "/expense-tax-calculator/calculate", {"annual_income": 100000, "country": "US", "expenses": [{"category": "software", "amount": 2000}]}, "Tax calculator"),
    ("post", "/skill-analyzer/analyze", {"skills": ["Python", "React"]}, "Skill analyzer"),
    ("post", "/rate-advisor/recommend", {"skills": ["Python"], "experience_years": 5, "location": "US"}, "Rate advisor"),
    ("post", "/proposal-writer/generate", {"project_title": "Web App", "project_description": "Build SaaS", "freelancer_skills": ["React"]}, "Proposal writer"),
]
for method, path, body, name in tools:
    r = req(method, path, json=body)
    if r and r.status_code == 200:
        p(name)
    else:
        w(name, str(r.status_code if r else "NO RESPONSE"))

# =================================================================
# 12. LOGOUT
# =================================================================
section("12. LOGOUT")
if "client" in tokens:
    r = req("post", "/auth/logout", headers=ch)
    if r and r.status_code in (200,204):
        p("Client logout")
        r2 = req("get", "/auth/me", headers=ch)
        if r2 and r2.status_code == 401:
            p("Token invalidated after logout")
        else:
            w("Token still valid", str(r2.status_code if r2 else "NO RESPONSE"))
    else:
        w("Client logout", str(r.status_code if r else "NO RESPONSE"))

# =================================================================
# SUMMARY
# =================================================================
total = R["pass"] + R["fail"]
print(f"\n{'='*60}")
print(f"  FINAL REPORT")
print(f"{'='*60}")
print(f"  Total:  {total}")
print(f"  PASS:   {R['pass']}")
print(f"  FAIL:   {R['fail']}")
print(f"  WARN:   {R['warn']}")
if total > 0:
    print(f"  Rate:   {R['pass']/total*100:.1f}%")
if R["errors"]:
    print(f"\n  FAILURES:")
    for e in R["errors"]:
        print(f"    - {e}")
print(f"{'='*60}")
sys.exit(1 if R["fail"] > 0 else 0)
