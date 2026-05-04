import requests
import json
import time

BASE_URL = "http://localhost:8000"

def log(test_name, status, details=""):
    icon = {"PASS": "✅", "FAIL": "❌", "INFO": "ℹ️"}.get(status, "❓")
    print(f"[{icon}] {test_name}: {details}")

def run_freelancer_feature_tests():
    print("\n🚀 STARTING FREELANCER ROLE FEATURE TESTS")
    print("=" * 50)
    
    # Credentials
    email = "freelancer1@example.com"
    password = "Freelancer@123"
    
    # 1. Login
    try:
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": password
        }, timeout=10)
        
        if resp.status_code == 200:
            token = resp.json().get('access_token')
            headers = {"Authorization": f"Bearer {token}"}
            log("Freelancer Login", "PASS", f"Authenticated as {email}")
        else:
            log("Freelancer Login", "FAIL", f"Status {resp.status_code}: {resp.text}")
            return
    except Exception as e:
        log("Freelancer Login", "FAIL", str(e))
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

    # 3. Browse Projects (Marketplace)
    try:
        resp = requests.get(f"{BASE_URL}/api/projects", headers=headers, timeout=10)
        if resp.status_code == 200:
            projects = resp.json()
            log("Browse Marketplace", "PASS", f"Found {len(projects)} projects available")
        else:
            log("Browse Marketplace", "FAIL", f"Status {resp.status_code}")
    except Exception as e:
        log("Browse Marketplace", "FAIL", str(e))

    # 4. Check Wallet / Earnings
    try:
        resp = requests.get(f"{BASE_URL}/api/wallet/balance", headers=headers, timeout=10)
        if resp.status_code == 200:
            log("Check Wallet Balance", "PASS", "Wallet balance retrieved")
        else:
            log("Check Wallet Balance", "FAIL", f"Status {resp.status_code}")
    except Exception as e:
        log("Check Wallet Balance", "FAIL", str(e))

    # 5. Get Skills
    try:
        resp = requests.get(f"{BASE_URL}/api/skills/", headers=headers, timeout=10)
        if resp.status_code == 200:
            log("List Skills", "PASS", f"Skill tags retrieved: {len(resp.json())} items")
        else:
            log("List Skills", "FAIL", f"Status {resp.status_code}")
    except Exception as e:
        log("List Skills", "FAIL", str(e))

    print("\n🏁 FREELANCER ROLE TESTS COMPLETED")
    print("=" * 50)

if __name__ == "__main__":
    run_freelancer_feature_tests()
