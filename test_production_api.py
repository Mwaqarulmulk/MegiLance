#!/usr/bin/env python3
"""
MegiLance Production API Testing Suite
Tests all critical endpoints on live production environment
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "https://megilance.site/api"
TEST_EMAIL = f"testuser_{int(time.time())}@megilance.test"
TEST_PASSWORD = "TestPassword123!@#"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_test(name, status, details=""):
    icon = f"{Colors.GREEN}✓{Colors.END}" if status else f"{Colors.RED}✗{Colors.END}"
    print(f"{icon} {name}")
    if details:
        print(f"  {details}")

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health/ready", timeout=10)
        log_test("Health Check", response.status_code == 200, f"Status: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        log_test("Health Check", False, str(e))
        return False

def test_register():
    """Test user registration"""
    try:
        payload = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "full_name": "Test User",
            "role": "freelancer"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        success = response.status_code in [200, 201]
        log_test("User Registration", success, f"Status: {response.status_code}")
        
        if success:
            data = response.json()
            return data.get("access_token"), TEST_EMAIL
        return None, None
    except Exception as e:
        log_test("User Registration", False, str(e))
        return None, None

def test_login(email, password):
    """Test user login"""
    try:
        payload = {"email": email, "password": password}
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        success = response.status_code in [200, 201]
        log_test("User Login", success, f"Status: {response.status_code}")
        
        if success:
            data = response.json()
            return data.get("access_token")
        return None
    except Exception as e:
        log_test("User Login", False, str(e))
        return None

def test_get_me(token):
    """Test get current user"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        success = response.status_code == 200
        log_test("Get Current User", success, f"Status: {response.status_code}")
        
        if success:
            data = response.json()
            return data.get("id")
        return None
    except Exception as e:
        log_test("Get Current User", False, str(e))
        return None

def test_refresh_token(token):
    """Test token refresh"""
    try:
        payload = {"refresh_token": token}
        response = requests.post(f"{BASE_URL}/auth/refresh", json=payload, timeout=10)
        success = response.status_code == 200
        log_test("Token Refresh", success, f"Status: {response.status_code}")
        
        if success:
            data = response.json()
            return data.get("access_token")
        return None
    except Exception as e:
        log_test("Token Refresh", False, str(e))
        return None

def test_create_project(token):
    """Test create project"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "title": "Test Project - React Dashboard",
            "description": "Need a modern dashboard for analytics",
            "budget": 5000,
            "budget_type": "fixed",
            "skills_required": ["React", "TypeScript"],
            "deadline": "2026-06-04"
        }
        response = requests.post(f"{BASE_URL}/projects", json=payload, headers=headers, timeout=10)
        success = response.status_code in [200, 201]
        log_test("Create Project", success, f"Status: {response.status_code}")
        
        if success:
            data = response.json()
            return data.get("id")
        return None
    except Exception as e:
        log_test("Create Project", False, str(e))
        return None

def test_list_projects(token):
    """Test list projects"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/projects?skip=0&limit=10", headers=headers, timeout=10)
        success = response.status_code == 200
        log_test("List Projects", success, f"Status: {response.status_code}, Count: {len(response.json()) if response.status_code == 200 else 'N/A'}")
        return success
    except Exception as e:
        log_test("List Projects", False, str(e))
        return False

def test_get_profile(token, user_id):
    """Test get profile"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/users/{user_id}/profile", headers=headers, timeout=10)
        success = response.status_code in [200, 404]  # 404 is OK if profile not yet created
        log_test("Get Profile", success, f"Status: {response.status_code}")
        return success
    except Exception as e:
        log_test("Get Profile", False, str(e))
        return False

def test_update_profile(token, user_id):
    """Test update profile"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "bio": "Experienced full-stack developer",
            "title": "Senior Developer",
            "skills": ["React", "Node.js", "TypeScript"],
            "hourly_rate": 50
        }
        response = requests.put(f"{BASE_URL}/users/{user_id}/profile", json=payload, headers=headers, timeout=10)
        success = response.status_code in [200, 201]
        log_test("Update Profile", success, f"Status: {response.status_code}")
        return success
    except Exception as e:
        log_test("Update Profile", False, str(e))
        return False

def test_send_message(token, recipient_id):
    """Test send message"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "recipient_id": recipient_id,
            "content": "Hello! Interested in collaboration?"
        }
        response = requests.post(f"{BASE_URL}/messages", json=payload, headers=headers, timeout=10)
        success = response.status_code in [200, 201]
        log_test("Send Message", success, f"Status: {response.status_code}")
        return success
    except Exception as e:
        log_test("Send Message", False, str(e))
        return False

def test_get_messages(token):
    """Test get messages"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/messages?skip=0&limit=20", headers=headers, timeout=10)
        success = response.status_code == 200
        log_test("Get Messages", success, f"Status: {response.status_code}, Count: {len(response.json()) if response.status_code == 200 else 'N/A'}")
        return success
    except Exception as e:
        log_test("Get Messages", False, str(e))
        return False

def test_unauthorized():
    """Test unauthorized access"""
    try:
        response = requests.get(f"{BASE_URL}/auth/me", timeout=10)
        success = response.status_code == 401
        log_test("Unauthorized Protection", success, f"Status: {response.status_code} (expected 401)")
        return success
    except Exception as e:
        log_test("Unauthorized Protection", False, str(e))
        return False

def main():
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}MegiLance Production API Testing Suite{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    print(f"Environment: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}\n")
    
    results = {
        "total": 0,
        "passed": 0,
        "failed": 0,
        "tests": []
    }
    
    # Test 1: Health
    print(f"{Colors.YELLOW}1. HEALTH CHECK{Colors.END}")
    health_ok = test_health()
    results["total"] += 1
    if health_ok:
        results["passed"] += 1
    else:
        results["failed"] += 1
    results["tests"].append(("Health Check", health_ok))
    print()
    
    if not health_ok:
        print(f"{Colors.RED}✗ Backend is not responding. Stopping tests.{Colors.END}\n")
        return
    
    # Test 2: Authorization
    print(f"{Colors.YELLOW}2. AUTHORIZATION{Colors.END}")
    auth_ok = test_unauthorized()
    results["total"] += 1
    if auth_ok:
        results["passed"] += 1
    else:
        results["failed"] += 1
    results["tests"].append(("Unauthorized Protection", auth_ok))
    print()
    
    # Test 3: Authentication
    print(f"{Colors.YELLOW}3. AUTHENTICATION{Colors.END}")
    token, email = test_register()
    results["total"] += 1
    if token:
        results["passed"] += 1
    else:
        results["failed"] += 1
    results["tests"].append(("User Registration", token is not None))
    
    if token:
        user_id = test_get_me(token)
        results["total"] += 1
        if user_id:
            results["passed"] += 1
        else:
            results["failed"] += 1
        results["tests"].append(("Get Current User", user_id is not None))
    print()
    
    if token and email:
        # Test 4: Projects
        print(f"{Colors.YELLOW}4. PROJECT MANAGEMENT{Colors.END}")
        project_id = test_create_project(token)
        results["total"] += 1
        if project_id:
            results["passed"] += 1
        else:
            results["failed"] += 1
        results["tests"].append(("Create Project", project_id is not None))
        
        list_ok = test_list_projects(token)
        results["total"] += 1
        if list_ok:
            results["passed"] += 1
        else:
            results["failed"] += 1
        results["tests"].append(("List Projects", list_ok))
        print()
        
        # Test 5: Profile
        print(f"{Colors.YELLOW}5. USER PROFILE{Colors.END}")
        if user_id:
            profile_ok = test_get_profile(token, user_id)
            results["total"] += 1
            if profile_ok:
                results["passed"] += 1
            else:
                results["failed"] += 1
            results["tests"].append(("Get Profile", profile_ok))
            
            update_ok = test_update_profile(token, user_id)
            results["total"] += 1
            if update_ok:
                results["passed"] += 1
            else:
                results["failed"] += 1
            results["tests"].append(("Update Profile", update_ok))
        print()
        
        # Test 6: Messaging
        print(f"{Colors.YELLOW}6. MESSAGING{Colors.END}")
        messages_ok = test_get_messages(token)
        results["total"] += 1
        if messages_ok:
            results["passed"] += 1
        else:
            results["failed"] += 1
        results["tests"].append(("Get Messages", messages_ok))
        print()
    
    # Summary
    print(f"{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}TEST SUMMARY{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    print(f"Total Tests: {results['total']}")
    print(f"{Colors.GREEN}Passed: {results['passed']}{Colors.END}")
    print(f"{Colors.RED}Failed: {results['failed']}{Colors.END}")
    print(f"Success Rate: {(results['passed']/results['total']*100):.1f}%\n")
    
    print(f"{Colors.BLUE}Detailed Results:{Colors.END}")
    for test_name, passed in results["tests"]:
        status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed else f"{Colors.RED}✗ FAIL{Colors.END}"
        print(f"  {status} - {test_name}")
    
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}\n")

if __name__ == "__main__":
    main()
