"""Ad-hoc cross-portal endpoint probe against live Turso. Not part of the app."""
import json
from dotenv import load_dotenv
load_dotenv(".env")

from fastapi.testclient import TestClient
import app.core.security as security
from main import app

CLIENT_ID, FREELANCER_ID, ADMIN_ID = 3, 2, 1

def impersonate(uid):
    return lambda: security.get_user_by_id(uid)

client = TestClient(app, raise_server_exceptions=False)

# Corrected to REAL route paths
CLIENT = [
    "/projects/my-projects", "/contracts", "/wallet", "/wallet/transactions",
    "/conversations", "/portal/client/proposals", "/disputes",
    "/notifications", "/invoices",
]
FREELANCER = [
    "/projects?status=open&limit=5", "/contracts", "/wallet",
    "/portal/freelancer/proposals", "/portal/freelancer/earnings",
    "/seller-stats/me", "/portfolio", "/job-alerts", "/conversations",
]
ADMIN = [
    "/admin/stats", "/admin/users?page=1", "/admin/fraud-alerts",
    "/analytics/dashboard/summary", "/analytics/revenue/stats?days=30",
    "/analytics/growth/summary",
]
PUBLIC = [
    "/freelancers", "/gigs", "/categories", "/blog",
    "/freelancers/id/2", "/users/2",
]

def run(label, uid, paths, auth=True):
    if auth:
        app.dependency_overrides[security.get_current_user] = impersonate(uid)
    out = []
    for p in paths:
        try:
            r = client.get("/api/v1" + p)
            code = r.status_code
            empty = ""
            if code == 200:
                try:
                    b = r.json()
                    if b in ([], {}, None): empty = " EMPTY"
                    elif isinstance(b, dict):
                        for k in ("items","data","results","transactions","proposals","projects","contracts","disputes"):
                            if k in b and b[k] in ([], None): empty = f" EMPTY[{k}]"; break
                except Exception: empty = " (non-json)"
            flag = "OK  " if code==200 and not empty else ("WARN" if code==200 else "FAIL")
            detail = ""
            if code != 200:
                try: detail = " :: " + json.dumps(r.json())[:120]
                except Exception: detail = " :: " + r.text[:120]
            out.append(f"  [{flag}] {code}{empty} {p}{detail}")
        except Exception as e:
            out.append(f"  [EXC ] {p} :: {type(e).__name__}: {str(e)[:100]}")
    app.dependency_overrides.clear()
    print(f"\n=== {label} ===\n" + "\n".join(out))

run("CLIENT", CLIENT_ID, CLIENT)
run("FREELANCER", FREELANCER_ID, FREELANCER)
run("ADMIN", ADMIN_ID, ADMIN)
run("PUBLIC", None, PUBLIC, auth=False)
print("\nDONE")
