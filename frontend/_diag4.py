from dotenv import load_dotenv; load_dotenv()
from fastapi.testclient import TestClient
from app.core.security import get_current_user
import main
app = main.app

class U:
    def __init__(s, i, t): s.id=i; s.user_type=t; s.email="x@y.com"; s.name="T"

client = TestClient(app, raise_server_exceptions=False)

def run(uid, utype, paths):
    app.dependency_overrides[get_current_user] = lambda: U(uid, utype)
    for p in paths:
        try:
            r = client.get(p)
            print(f"[{r.status_code}] ({utype}{uid}) {p}  -> {r.text[:120]}")
        except Exception as e:
            print(f"[ERR] {p}: {e}")

print("==== CLIENT 3 ====")
run(3,"client",[
 "/api/v1/contracts","/api/v1/invoices","/api/v1/payments",
 "/api/v1/portal/client/wallet","/api/v1/portal/client/payments",
 "/api/v1/reviews","/api/v1/reviews/me",
])
print("\n==== FREELANCER 2 ====")
run(2,"freelancer",[
 "/api/v1/contracts","/api/v1/invoices","/api/v1/payments",
 "/api/v1/portal/freelancer/wallet","/api/v1/portal/freelancer/earnings",
 "/api/v1/portal/freelancer/payments","/api/v1/portal/freelancer/projects",
])
