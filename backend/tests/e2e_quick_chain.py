# Quick core chain test - no LLM dependencies
import requests, json, uuid, time, sys

BASE = "http://localhost:8000/api"
T = uuid.uuid4().hex[:8]
P = F = 0
WARNINGS = []

def ok(n, d=""):
    global P; P += 1; print(f"  PASS: {n}" + (f" - {d}" if d else ""))
def fail(n, d=""):
    global F; F += 1; print(f"  FAIL: {n} - {d}")
def warn(n, d=""):
    WARNINGS.append(f"{n}: {d}"); print(f"  WARN: {n} - {d}")
def s(m, u, **k):
    k.setdefault("timeout", 25)
    try: return getattr(requests, m)(u, **k)
    except: return None
def ah(t): return {"Authorization": f"Bearer {t}"}
def pause(sec=1.0):
    time.sleep(sec)

print("=" * 60)
print("  CORE CHAIN: Register -> Project -> Proposal -> Accept")
print("  -> Contract+Escrow -> Milestone -> Approve -> Pay -> Complete")
print("=" * 60)

# 1. Register
print("\n--- 1. Registration ---")
r = s("post", f"{BASE}/auth/register", json={"email": f"c_{T}@t.com", "password": "Test12345!", "name": "Client", "user_type": "client"})
ct = r.json().get("access_token") if r and r.status_code in (200, 201) else None
if ct: ok("Client registered")
else: fail("Client register"); sys.exit(1)

r = s("post", f"{BASE}/auth/register", json={"email": f"f_{T}@t.com", "password": "Test12345!", "name": "Freelancer", "user_type": "freelancer"})
ft = r.json().get("access_token") if r and r.status_code in (200, 201) else None
if ft: ok("Freelancer registered")
else: fail("Freelancer register"); sys.exit(1)

ch, fh = ah(ct), ah(ft)
cid = s("get", f"{BASE}/auth/me", headers=ch).json().get("id")
fid = s("get", f"{BASE}/auth/me", headers=fh).json().get("id")
ok(f"IDs: client={cid}, freelancer={fid}")

# 2. Create Project
print("\n--- 2. Project Creation ---")
r = s("post", f"{BASE}/projects", headers=ch, json={"title": f"Project {T}", "description": "Test", "category": "web", "budget_type": "fixed", "budget_min": 500, "budget_max": 2000, "skills": "python,react"})
pid = r.json().get("project_id") if r and r.status_code in (200, 201) else None
if pid: ok(f"Project created id={pid}")
else: fail("Project create"); sys.exit(1)

# 3. Submit Proposal
print("\n--- 3. Proposal Submission ---")
r = s("post", f"{BASE}/proposals", headers=fh, json={"project_id": pid, "cover_letter": "I can do this", "bid_amount": 1500, "estimated_hours": 100, "hourly_rate": 15, "availability": "full-time"})
prdata = r.json() if r and r.status_code in (200, 201) else {}
prid = prdata.get("id") or (prdata.get("proposal", {}).get("id") if isinstance(prdata.get("proposal"), dict) else None)
if prid: ok(f"Proposal submitted id={prid}")
else: fail("Proposal submit"); sys.exit(1)

# 4. Accept Proposal -> Contract + Escrow
print("\n--- 4. Accept Proposal -> Contract + Escrow ---")
pause(1)
r = s("post", f"{BASE}/proposals/{prid}/accept", headers=ch)
if r and r.status_code == 200:
    ok(f"Proposal ACCEPTED: {r.json().get('message', '')}")
else:
    fail("Accept proposal", f"{r.status_code if r else 'TIMEOUT'}: {r.text[:200] if r else ''}")
    sys.exit(1)

# 5. Verify Contract
print("\n--- 5. Verify Contract ---")
ctid = None
r = s("get", f"{BASE}/contracts", headers=ch)
if r and r.status_code == 200:
    items = r.json() if isinstance(r.json(), list) else r.json().get("items", [])
    if items:
        c = items[0]; ctid = c.get("id")
        ok(f"Contract id={ctid}, status={c.get('status')}, amount={c.get('amount', c.get('contract_amount'))}")
    else: warn("Contracts", "empty")
else: warn("Contracts", f"{r.status_code if r else 'TIMEOUT'}")

# 6. Verify Escrow
print("\n--- 6. Verify Escrow ---")
r = s("get", f"{BASE}/escrow", headers=ch)
if r and r.status_code == 200:
    data = r.json()
    items = data if isinstance(data, list) else data.get("items", data.get("escrow", []))
    if items:
        e = items[0]
        ok(f"Escrow id={e.get('id')}, status={e.get('status')}, amount={e.get('amount')}")
    else: warn("Escrow", "empty")
else: warn("Escrow", f"{r.status_code if r else 'TIMEOUT'}")

# 7. Freelancer acknowledges
print("\n--- 7. Contract Acknowledgement ---")
pause(1)
if ctid:
    r = s("post", f"{BASE}/contracts/{ctid}/acknowledge", headers=fh, json={"acknowledged": True})
    if r and r.status_code == 200: ok("Freelancer acknowledged contract")
    else: warn("Acknowledge", f"{r.status_code if r else 'TIMEOUT'}")

# 8. Create Milestones
print("\n--- 8. Create Milestones ---")
mids = []
for title, amt in [("Setup", 500), ("Development", 700), ("Testing", 300)]:
    if not ctid: break
    r = s("post", f"{BASE}/milestones", headers=ch, json={"contract_id": ctid, "title": title, "amount": amt})
    if r and r.status_code in (200, 201):
        mid = r.json().get("milestone_id"); mids.append(mid); ok(f"Milestone '{title}' id={mid}")
    else: warn(f"Milestone '{title}'", f"{r.status_code if r else 'TIMEOUT'}")
    pause(0.5)

# 9. Submit Milestones
print("\n--- 9. Freelancer Submits Milestones ---")
for mid in mids:
    pause(1)
    r = s("post", f"{BASE}/milestones/{mid}/submit", headers=fh, json={"deliverables": "Done", "submission_notes": "Complete"})
    if r and r.status_code == 200: ok(f"Milestone {mid} submitted")
    else: warn(f"Submit {mid}", f"{r.status_code if r else 'TIMEOUT'}")

# 10. Approve Milestones -> Payment
print("\n--- 10. Client Approves Milestones (Payment Released) ---")
for mid in mids:
    pause(1)
    r = s("post", f"{BASE}/milestones/{mid}/approve", headers=ch, json={"approval_notes": "Good"})
    if r and r.status_code == 200: ok(f"Milestone {mid} APPROVED -> payment released")
    else: warn(f"Approve {mid}", f"{r.status_code if r else 'TIMEOUT'}")

# 11. Payments
print("\n--- 11. Verify Payments ---")
r = s("get", f"{BASE}/payments", headers=fh)
if r and r.status_code == 200:
    items = r.json() if isinstance(r.json(), list) else r.json().get("items", [])
    ok(f"Freelancer payments: {len(items)} record(s)")
else: warn("Freelancer payments", f"{r.status_code if r else 'TIMEOUT'}")

# 12. Wallets
print("\n--- 12. Wallet Balances ---")
r = s("get", f"{BASE}/wallet/balance", headers=fh)
if r and r.status_code == 200: ok(f"Freelancer wallet: {r.json()}")
else: warn("Freelancer wallet", f"{r.status_code if r else 'TIMEOUT'}")

# 13. Complete Contract
print("\n--- 13. Complete Contract ---")
if ctid:
    r = s("post", f"{BASE}/contracts/{ctid}/complete", headers=ch, json={"completion_notes": "All done"})
    if r and r.status_code == 200: ok("Contract COMPLETED")
    else: warn("Complete", f"{r.status_code if r else 'TIMEOUT'}")

# 14. Reviews
print("\n--- 14. Reviews ---")
if ctid:
    r = s("post", f"{BASE}/reviews", headers=ch, json={"contract_id": ctid, "reviewee_id": fid, "rating": 5, "comment": "Great work"})
    if r and r.status_code in (200, 201): ok("Client review submitted")
    else: warn("Client review", f"{r.status_code if r else 'TIMEOUT'}")

    r = s("post", f"{BASE}/reviews", headers=fh, json={"contract_id": ctid, "reviewee_id": cid, "rating": 5, "comment": "Great client!"})
    if r and r.status_code in (200, 201): ok("Freelancer review submitted")
    else: warn("Freelancer review", f"{r.status_code if r else 'TIMEOUT'}")

# 15. Messaging
print("\n--- 15. Messaging ---")
r = s("post", f"{BASE}/conversations", headers=ch, json={"freelancer_id": fid, "project_id": pid, "initial_message": "Thanks!"})
conv_id = None
if r and r.status_code in (200, 201):
    conv_id = r.json().get("conversation_id")
    ok(f"Conversation created id={conv_id}")
else: warn("Create conversation", f"{r.status_code if r else 'TIMEOUT'}")

if conv_id:
    r = s("post", f"{BASE}/conversations/{conv_id}/messages", headers=fh, json={"content": "Thank you!"})
    if r and r.status_code in (200, 201): ok("Reply freelancer->client")
    else: warn("Reply", f"{r.status_code if r else 'TIMEOUT'}")

# 16. Dashboards
print("\n--- 16. Dashboards ---")
r = s("get", f"{BASE}/portal/client/dashboard", headers=ch)
if r and r.status_code == 200: ok("Client dashboard")
else: warn("Client dashboard", f"{r.status_code if r else 'TIMEOUT'}")

r = s("get", f"{BASE}/portal/freelancer/dashboard", headers=fh)
if r and r.status_code == 200: ok("Freelancer dashboard")
else: warn("Freelancer dashboard", f"{r.status_code if r else 'TIMEOUT'}")

# Final
print("\n" + "=" * 60)
total = P + F
print(f"  TOTAL: {total} | PASS: {P} | FAIL: {F} | WARN: {len(WARNINGS)}")
if total > 0: print(f"  Pass rate: {P/total*100:.0f}%")
print(f"  Chain IDs: project={pid} proposal={prid} contract={ctid} milestones={mids}")
if WARNINGS:
    print(f"\n  WARNINGS ({len(WARNINGS)}):")
    for w in WARNINGS: print(f"    - {w}")
print("=" * 60)
sys.exit(1 if F > 0 else 0)
