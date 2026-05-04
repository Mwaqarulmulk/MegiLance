import requests
import json
import time
import sys

BASE_URL = "http://localhost:8000"

def log(test_name, status, details=""):
    icon = {"PASS": "✅", "FAIL": "❌", "INFO": "ℹ️"}.get(status, "❓")
    print(f"[{icon}] {test_name}: {details}")

def run_client_feature_tests():
    print("\n🚀 STARTING CLIENT ROLE FEATURE TESTS")
    print("=" * 50)
    
    # Credentials
    email = "client1@example.com"
    password = "Client@123" # Standard test password from documentation
    
    # 1. Login
    try:
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": password
        }, timeout=10)
        
        if resp.status_code == 200:
            token = resp.json().get('access_token')
            headers = {"Authorization": f"Bearer {token}"}
            log("Client Login", "PASS", f"Authenticated as {email}")
        else:
            log("Client Login", "FAIL", f"Status {resp.status_code}: {resp.text}")
            return
    except Exception as e:
        log("Client Login", "FAIL", str(e))
        return

    # 2. Get Profile
    try:
        resp = requests.get(f"{BASE_URL}/api/users/me", headers=headers, timeout=10)
        if resp.status_code == 200:
            log("Get Profile", "PASS", "Profile data retrieved successfully")
        else:
            log("Get Profile", "FAIL", f"Status {resp.status_code}")
    except Exception as e:
        log("Get Profile", "FAIL", str(e))

    # 3. List Projects
    try:
        resp = requests.get(f"{BASE_URL}/api/projects", headers=headers, timeout=10)
        if resp.status_code == 200:
            projects = resp.json()
            log("List Projects", "PASS", f"Found {len(projects)} projects")
        else:
            log("List Projects", "FAIL", f"Status {resp.status_code}")
    except Exception as e:
        log("List Projects", "FAIL", str(e))

    # 4. Create New Project
    project_id = None
    try:
        project_data = {
            "title": f"Test Project {int(time.time())}",
            "description": "Verification project created via automated testing suite.",
            "category": "Web Development",
            "budget_type": "fixed",
            "budget_min": 100,
            "budget_max": 500,
            "experience_level": "intermediate",
            "estimated_duration": "1 month",
            "skills": ["Python", "FastAPI", "Testing"]
        }
        resp = requests.post(f"{BASE_URL}/api/projects", json=project_data, headers=headers, timeout=10)
        if resp.status_code in [200, 201]:
            project_id = resp.json().get("id")
            log("Create Project", "PASS", f"Created project ID: {project_id}")
        else:
            log("Create Project", "FAIL", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log("Create Project", "FAIL", str(e))

    # 5. Check Project Details
    if project_id:
        try:
            resp = requests.get(f"{BASE_URL}/api/projects/{project_id}", headers=headers, timeout=10)
            if resp.status_code == 200:
                log("Get Project Details", "PASS", "Successfully retrieved created project details")
            else:
                log("Get Project Details", "FAIL", f"Status {resp.status_code}")
        except Exception as e:
            log("Get Project Details", "FAIL", str(e))

    # 6. Delete Project (Cleanup)
    if project_id:
        try:
            resp = requests.delete(f"{BASE_URL}/api/projects/{project_id}", headers=headers, timeout=10)
            if resp.status_code in [200, 204]:
                log("Delete Project", "PASS", "Cleaned up test project")
            else:
                log("Delete Project", "FAIL", f"Status {resp.status_code}")
        except Exception as e:
            log("Delete Project", "FAIL", str(e))

    print("\n🏁 CLIENT ROLE TESTS COMPLETED")
    print("=" * 50)

if __name__ == "__main__":
    run_client_feature_tests()
