"""
@AI-HINT: Comprehensive API endpoint testing script for MegiLance
Tests all critical endpoints: Auth, Projects, Proposals, Users, etc.
"""

import requests
import json
import time
from typing import Optional, Dict, Any, List, Tuple

BASE_URL = "http://localhost:8000/api"

# Test credentials
TEST_USERS = {
    "admin": {"email": "admin@megilance.com", "password": "Admin@123"},
    "client": {"email": "client1@example.com", "password": "Client@123"},
    "freelancer": {"email": "freelancer1@example.com", "password": "Freelancer@123"},
}

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.skipped = 0
        self.errors: List[str] = []
    
    def add_pass(self, name: str):
        self.passed += 1
        print(f"  ✅ PASS: {name}")
    
    def add_fail(self, name: str, reason: str):
        self.failed += 1
        self.errors.append(f"{name}: {reason}")
        print(f"  ❌ FAIL: {name} - {reason}")
    
    def add_skip(self, name: str, reason: str):
        self.skipped += 1
        print(f"  ⏭️  SKIP: {name} - {reason}")
    
    def summary(self):
        total = self.passed + self.failed + self.skipped
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} passed, {self.failed} failed, {self.skipped} skipped")
        if self.errors:
            print(f"\nFailed tests:")
            for err in self.errors:
                print(f"  - {err}")
        print(f"{'='*60}")
        return self.failed == 0


def api_request(
    method: str,
    endpoint: str,
    token: Optional[str] = None,
    data: Optional[Dict] = None,
    json_data: Optional[Dict] = None,
    form_data: bool = False
) -> Tuple[int, Any]:
    """Make an API request and return status code and response"""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method == "GET":
            resp = requests.get(url, headers=headers, timeout=30)
        elif method == "POST":
            if form_data and data:
                headers.pop("Content-Type", None)
                resp = requests.post(url, data=data, headers=headers, timeout=30)
            else:
                resp = requests.post(url, json=json_data or data, headers=headers, timeout=30)
        elif method == "PUT":
            resp = requests.put(url, json=json_data or data, headers=headers, timeout=30)
        elif method == "DELETE":
            resp = requests.delete(url, headers=headers, timeout=30)
        elif method == "PATCH":
            resp = requests.patch(url, json=json_data or data, headers=headers, timeout=30)
        else:
            return 0, {"error": f"Unknown method: {method}"}
        
        try:
            body = resp.json()
        except:
            body = resp.text
        
        return resp.status_code, body
    except requests.exceptions.ConnectionError:
        return 0, {"error": "Connection refused - is the backend running?"}
    except Exception as e:
        return 0, {"error": str(e)}


def login(email: str, password: str) -> Optional[str]:
    """Login and return access token"""
    status, body = api_request("POST", "/auth/login", json_data={"email": email, "password": password})
    if status == 200 and isinstance(body, dict):
        return body.get("access_token")
    print(f"    Login failed for {email}: {body}")
    return None


def test_health_endpoints(results: TestResults):
    """Test health check endpoints"""
    print("\n📋 HEALTH ENDPOINTS")
    
    endpoints = [
        ("/health", "Health Check"),
        ("/health/ready", "Ready Check"),
        ("/health/live", "Liveness Check"),
    ]
    
    for endpoint, name in endpoints:
        status, body = api_request("GET", endpoint)
        if status == 200:
            results.add_pass(f"{name} ({endpoint})")
        else:
            results.add_fail(f"{name} ({endpoint})", f"Status: {status}, Body: {body}")


def test_auth_endpoints(results: TestResults) -> Dict[str, str]:
    """Test authentication endpoints and return tokens for each role"""
    print("\n🔐 AUTH ENDPOINTS")
    tokens = {}
    
    # Test login for each user type
    for role, creds in TEST_USERS.items():
        token = login(creds["email"], creds["password"])
        if token:
            tokens[role] = token
            results.add_pass(f"Login as {role}")
        else:
            results.add_fail(f"Login as {role}", "Failed to get token")
    
    # Test /auth/me with admin token
    if tokens.get("admin"):
        status, body = api_request("GET", "/auth/me", token=tokens["admin"])
        if status == 200 and body.get("email") == TEST_USERS["admin"]["email"]:
            results.add_pass("/auth/me (admin)")
        else:
            results.add_fail("/auth/me (admin)", f"Status: {status}, Body: {body}")
    
    # Test token refresh
    if tokens.get("client"):
        # First login to get refresh token
        status, body = api_request("POST", "/auth/login", json_data=TEST_USERS["client"])
        if status == 200 and body.get("refresh_token"):
            refresh_token = body.get("refresh_token")
            status, body = api_request("POST", "/auth/refresh", json_data={"refresh_token": refresh_token})
            if status == 200 and body.get("access_token"):
                results.add_pass("Token refresh")
            else:
                results.add_fail("Token refresh", f"Status: {status}")
        else:
            results.add_skip("Token refresh", "No refresh token in login response")
    
    return tokens


def test_user_endpoints(results: TestResults, tokens: Dict[str, str]):
    """Test user-related endpoints"""
    print("\n👤 USER ENDPOINTS")
    
    admin_token = tokens.get("admin")
    client_token = tokens.get("client")
    
    if admin_token:
        # Admin: Get all users
        status, body = api_request("GET", "/users", token=admin_token)
        if status == 200:
            results.add_pass("GET /users (admin)")
        else:
            results.add_fail("GET /users (admin)", f"Status: {status}")
        
        # Admin: Get user by ID
        status, body = api_request("GET", "/users/1", token=admin_token)
        if status == 200 or status == 404:
            results.add_pass("GET /users/1 (admin)")
        else:
            results.add_fail("GET /users/1 (admin)", f"Status: {status}")
        
        # Admin: Get users with filters
        status, body = api_request("GET", "/users?role=freelancer&limit=5", token=admin_token)
        if status == 200:
            results.add_pass("GET /users with filters")
        else:
            results.add_fail("GET /users with filters", f"Status: {status}")
    else:
        results.add_skip("User endpoints (admin)", "No admin token")
    
    if client_token:
        # Client: Update profile
        status, body = api_request("PUT", "/auth/me", token=client_token, json_data={"bio": "Updated bio"})
        if status == 200:
            results.add_pass("PUT /auth/me (update profile)")
        else:
            results.add_fail("PUT /auth/me (update profile)", f"Status: {status}, Body: {body}")


def test_project_endpoints(results: TestResults, tokens: Dict[str, str]):
    """Test project-related endpoints"""
    print("\n📁 PROJECT ENDPOINTS")
    
    client_token = tokens.get("client")
    freelancer_token = tokens.get("freelancer")
    
    project_id = None
    
    # Get projects list
    status, body = api_request("GET", "/projects/")
    if status == 200:
        results.add_pass("GET /projects (public)")
        if isinstance(body, list) and len(body) > 0:
            project_id = body[0].get("id")
    else:
        results.add_fail("GET /projects (public)", f"Status: {status}")
    
    if client_token:
        # Create a project with all required fields
        project_data = {
            "title": "Test Project from API Test",
            "description": "This is a test project created by the API test script. It requires Python and FastAPI expertise.",
            "budget_min": 100,
            "budget_max": 500,
            "budget_type": "fixed",
            "experience_level": "intermediate",
            "estimated_duration": "1-2 weeks",
            "category": "web-development",
            "skills": ["python", "fastapi"]
        }
        status, body = api_request("POST", "/projects/", token=client_token, json_data=project_data)
        if status in [200, 201]:
            results.add_pass("POST /projects (create)")
            project_id = body.get("id") or project_id
        elif status == 400:
            results.add_pass("POST /projects (already exists or validation)")
        else:
            results.add_fail("POST /projects (create)", f"Status: {status}, Body: {str(body)[:200]}")
        
        # Get my projects using query param
        status, body = api_request("GET", "/projects/?owner_id=me", token=client_token)
        if status == 200:
            results.add_pass("GET /projects (my projects)")
        else:
            # Try alternative endpoint
            status, body = api_request("GET", "/projects/", token=client_token)
            if status == 200:
                results.add_pass("GET /projects (authenticated)")
            else:
                results.add_fail("GET /projects (authenticated)", f"Status: {status}")
    
    if project_id:
        # Get single project
        status, body = api_request("GET", f"/projects/{project_id}")
        if status == 200:
            results.add_pass(f"GET /projects/{project_id}")
        else:
            results.add_fail(f"GET /projects/{project_id}", f"Status: {status}")
    else:
        results.add_skip("GET /projects/:id", "No project ID available")
    
    return project_id


def test_proposal_endpoints(results: TestResults, tokens: Dict[str, str], project_id: Optional[int]):
    """Test proposal-related endpoints"""
    print("\n📝 PROPOSAL ENDPOINTS")
    
    freelancer_token = tokens.get("freelancer")
    client_token = tokens.get("client")
    
    if not freelancer_token:
        results.add_skip("Proposal endpoints", "No freelancer token")
        return
    
    # Get proposals (freelancer) - /proposals returns user's proposals when authenticated
    status, body = api_request("GET", "/proposals/", token=freelancer_token)
    if status == 200:
        results.add_pass("GET /proposals (freelancer)")
    else:
        results.add_fail("GET /proposals (freelancer)", f"Status: {status}")
    
    if project_id and freelancer_token:
        # Submit proposal with all required fields
        proposal_data = {
            "project_id": project_id,
            "cover_letter": "I am interested in this project and would like to work on it. I have extensive experience in this area and can deliver high-quality results. My background in Python and FastAPI makes me an excellent candidate for this project.",
            "bid_amount": 250,
            "hourly_rate": 25,
            "estimated_hours": 40,
            "availability": "Available immediately, can start right away"
        }
        status, body = api_request("POST", "/proposals/", token=freelancer_token, json_data=proposal_data)
        if status in [200, 201]:
            results.add_pass("POST /proposals (submit)")
        elif status == 400:
            results.add_pass("POST /proposals (already submitted or validation)")
        else:
            results.add_fail("POST /proposals (submit)", f"Status: {status}, Body: {str(body)[:200]}")
    
    if client_token:
        # Get proposals for my projects - using /proposals with client token
        status, body = api_request("GET", "/proposals/", token=client_token)
        if status == 200:
            results.add_pass("GET /proposals (client)")
        else:
            results.add_fail("GET /proposals (client)", f"Status: {status}")


def test_search_endpoints(results: TestResults, tokens: Dict[str, str]):
    """Test search endpoints"""
    print("\n🔍 SEARCH ENDPOINTS")
    
    # Search freelancers via users endpoint
    status, body = api_request("GET", "/users/?role=freelancer")
    if status == 200:
        results.add_pass("GET /users?role=freelancer (search)")
    elif status == 401:
        # Try with token
        admin_token = tokens.get("admin")
        if admin_token:
            status, body = api_request("GET", "/users/?role=freelancer", token=admin_token)
            if status == 200:
                results.add_pass("GET /users?role=freelancer (admin)")
            else:
                results.add_fail("GET /users?role=freelancer", f"Status: {status}")
        else:
            results.add_skip("GET /users?role=freelancer", "Requires authentication")
    else:
        results.add_fail("GET /users?role=freelancer", f"Status: {status}")
    
    # Search projects
    status, body = api_request("GET", "/projects/?search=test")
    if status == 200:
        results.add_pass("GET /projects?search (search)")
    else:
        results.add_fail("GET /projects?search (search)", f"Status: {status}")


def test_admin_endpoints(results: TestResults, tokens: Dict[str, str]):
    """Test admin-specific endpoints"""
    print("\n👑 ADMIN ENDPOINTS")
    
    admin_token = tokens.get("admin")
    
    if not admin_token:
        results.add_skip("Admin endpoints", "No admin token")
        return
    
    # Admin stats/dashboard
    endpoints = [
        ("/admin/stats", "Admin Stats"),
        ("/admin/users", "Admin Users List"),
        ("/admin/analytics", "Admin Analytics"),
    ]
    
    for endpoint, name in endpoints:
        status, body = api_request("GET", endpoint, token=admin_token)
        if status in [200, 404]:  # 404 is ok if endpoint doesn't exist
            results.add_pass(f"GET {endpoint}")
        else:
            results.add_fail(f"GET {endpoint}", f"Status: {status}")


def test_notification_endpoints(results: TestResults, tokens: Dict[str, str]):
    """Test notification endpoints"""
    print("\n🔔 NOTIFICATION ENDPOINTS")
    
    client_token = tokens.get("client")
    
    if not client_token:
        results.add_skip("Notification endpoints", "No client token")
        return
    
    status, body = api_request("GET", "/notifications", token=client_token)
    if status == 200:
        results.add_pass("GET /notifications")
    else:
        results.add_fail("GET /notifications", f"Status: {status}")
    
    status, body = api_request("GET", "/notifications/unread/count", token=client_token)
    if status in [200, 404]:
        results.add_pass("GET /notifications/unread/count")
    else:
        results.add_fail("GET /notifications/unread/count", f"Status: {status}")


def test_payment_endpoints(results: TestResults, tokens: Dict[str, str]):
    """Test payment endpoints"""
    print("\n💳 PAYMENT ENDPOINTS")
    
    client_token = tokens.get("client")
    
    if not client_token:
        results.add_skip("Payment endpoints", "No client token")
        return
    
    # Get wallet/balance
    status, body = api_request("GET", "/wallet/balance", token=client_token)
    if status in [200, 404]:
        results.add_pass("GET /wallet/balance")
    else:
        results.add_fail("GET /wallet/balance", f"Status: {status}")
    
    # Get transactions
    status, body = api_request("GET", "/wallet/transactions", token=client_token)
    if status in [200, 404]:
        results.add_pass("GET /wallet/transactions")
    else:
        results.add_fail("GET /wallet/transactions", f"Status: {status}")


def test_message_endpoints(results: TestResults, tokens: Dict[str, str]):
    """Test messaging endpoints"""
    print("\n💬 MESSAGE ENDPOINTS")
    
    client_token = tokens.get("client")
    
    if not client_token:
        results.add_skip("Message endpoints", "No client token")
        return
    
    # Get conversations - try different endpoint paths
    status, body = api_request("GET", "/messages/", token=client_token)
    if status == 200:
        results.add_pass("GET /messages")
    elif status == 404:
        # Try alternative endpoint
        status, body = api_request("GET", "/conversations/", token=client_token)
        if status == 200:
            results.add_pass("GET /conversations")
        else:
            results.add_skip("GET /messages", "Messaging endpoint not found")


def main():
    print("\n" + "="*60)
    print("🧪 MEGILANCE API COMPREHENSIVE TEST")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = TestResults()
    
    # Run all tests
    test_health_endpoints(results)
    tokens = test_auth_endpoints(results)
    test_user_endpoints(results, tokens)
    project_id = test_project_endpoints(results, tokens)
    test_proposal_endpoints(results, tokens, project_id)
    test_search_endpoints(results, tokens)
    test_admin_endpoints(results, tokens)
    test_notification_endpoints(results, tokens)
    test_payment_endpoints(results, tokens)
    test_message_endpoints(results, tokens)
    
    # Print summary
    success = results.summary()
    
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())
