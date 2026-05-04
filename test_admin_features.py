import requests
import json
import time

BASE_URL = "http://localhost:8000"

def log(test_name, status, details=""):
    icon = {"PASS": "✅", "FAIL": "❌", "INFO": "ℹ️"}.get(status, "❓")
    print(f"[{icon}] {test_name}: {details}")

def run_admin_feature_tests():
    print("\n🚀 STARTING ADMIN ROLE FEATURE TESTS")
    print("=" * 50)
    
    # Credentials
    email = "admin@megilance.com"
    password = "Admin@123"
    
    # 1. Login
    try:
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": password
        }, timeout=10)
        
        if resp.status_code == 200:
            token = resp.json().get('access_token')
            headers = {"Authorization": f"Bearer {token}"}
            log("Admin Login", "PASS", f"Authenticated as {email}")
        else:
            log("Admin Login", "FAIL", f"Status {resp.status_code}: {resp.text}")
            return
    except Exception as e:
        log("Admin Login", "FAIL", str(e))
        return

    # 2. Get Dashboard Stats
    try:
        resp = requests.get(f"{BASE_URL}/api/admin/dashboard/stats", headers=headers, timeout=10)
        if resp.status_code == 200:
            stats = resp.json()
            log("Dashboard Stats", "PASS", f"System monitoring active. Total users: {stats.get('total_users')}")
        else:
            log("Dashboard Stats", "FAIL", f"Status {resp.status_code}")
    except Exception as e:
        log("Dashboard Stats", "FAIL", str(e))

    # 3. List All Users (Admin Feature)
    try:
        resp = requests.get(f"{BASE_URL}/api/admin/users/list", headers=headers, timeout=10)
        if resp.status_code == 200:
            users = resp.json()
            user_count = len(users.get('users', [])) if isinstance(users, dict) else len(users)
            log("User Management", "PASS", f"Can view all {user_count} users")
        else:
            log("User Management", "FAIL", f"Status {resp.status_code}")
    except Exception as e:
        log("User Management", "FAIL", str(e))

    # 4. Check Financial Metrics
    try:
        resp = requests.get(f"{BASE_URL}/api/admin/dashboard/financial-metrics", headers=headers, timeout=10)
        if resp.status_code == 200:
            log("Financial Metrics", "PASS", "Revenue tracking accessible")
        else:
            log("Financial Metrics", "FAIL", f"Status {resp.status_code}")
    except Exception as e:
        log("Financial Metrics", "FAIL", str(e))

    print("\n🏁 ADMIN ROLE TESTS COMPLETED")
    print("=" * 50)

if __name__ == "__main__":
    run_admin_feature_tests()
