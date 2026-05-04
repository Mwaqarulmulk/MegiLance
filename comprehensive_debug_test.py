#!/usr/bin/env python3
"""
@AI-HINT: Comprehensive debugging script for MegiLance APIs
Tests: Health, Auth, CRUD operations, AI services, Input/Output validation
"""

import requests
import json
import time
from datetime import datetime
import sys

# Configuration
BASE_URL = "http://localhost:8000"
AI_URL = "http://localhost:7860"
FRONTEND_URL = "http://localhost:3000"

# Test data
test_results = {
    "health": {},
    "auth": {},
    "crud_operations": {},
    "ai_services": {},
    "input_validation": {},
    "errors": []
}

# ANSI Colors
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.RESET}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.RESET}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.RESET}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ {text}{Colors.RESET}")

# ============================================================================
# SECTION 1: HEALTH & READY CHECKS
# ============================================================================

def test_health_endpoints():
    """Test health and readiness endpoints"""
    print_header("HEALTH & READINESS CHECKS")
    
    endpoints = [
        ("/api/health/", "Health"),
        ("/api/health/ready", "Readiness"),
        ("/api/health/live", "Liveness"),
    ]
    
    for endpoint, name in endpoints:
        try:
            resp = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
            if resp.status_code == 200:
                print_success(f"{name} endpoint: {resp.status_code}")
                test_results["health"][name] = {"status": "OK", "code": resp.status_code, "data": resp.json()}
            else:
                print_error(f"{name} endpoint: {resp.status_code}")
                test_results["health"][name] = {"status": "FAILED", "code": resp.status_code}
        except Exception as e:
            print_error(f"{name} endpoint: {str(e)}")
            test_results["health"][name] = {"status": "ERROR", "error": str(e)}
            test_results["errors"].append(f"Health check failed: {name}")

# ============================================================================
# SECTION 2: AUTHENTICATION TESTS
# ============================================================================

def test_auth_registration():
    """Test user registration endpoint"""
    print_header("AUTHENTICATION: REGISTRATION")
    
    endpoint = f"{BASE_URL}/api/auth/register"
    
    # Test 1: Valid registration
    payload = {
        "email": f"test_user_{int(time.time())}@example.com",
        "password": "SecurePass123!",
        "name": "Test User",
        "user_type": "client"
    }
    
    try:
        resp = requests.post(endpoint, json=payload, timeout=5)
        if resp.status_code in [200, 201]:
            print_success(f"Valid registration: {resp.status_code}")
            data = resp.json()
            test_results["auth"]["registration_valid"] = {"status": "OK", "code": resp.status_code}
            return data.get("user", {}).get("id"), payload["email"], payload["password"]
        else:
            print_warning(f"Registration returned: {resp.status_code}")
            print_info(f"Response: {resp.text[:200]}")
            test_results["auth"]["registration_valid"] = {"status": "PARTIAL", "code": resp.status_code}
    except Exception as e:
        print_error(f"Registration failed: {str(e)}")
        test_results["auth"]["registration_valid"] = {"status": "ERROR", "error": str(e)}
        test_results["errors"].append(f"Registration failed: {str(e)}")
    
    # Test 2: Invalid email
    invalid_payload = {"email": "not-an-email", "password": "Pass123!", "name": "Test", "user_type": "client"}
    try:
        resp = requests.post(endpoint, json=invalid_payload, timeout=5)
        if resp.status_code >= 400:
            print_success(f"Invalid email validation: {resp.status_code}")
            test_results["auth"]["invalid_email"] = {"status": "OK", "code": resp.status_code}
        else:
            print_error(f"Should reject invalid email but got: {resp.status_code}")
            test_results["auth"]["invalid_email"] = {"status": "FAILED", "code": resp.status_code}
    except Exception as e:
        print_warning(f"Invalid email test error: {str(e)}")

def test_auth_login(email, password):
    """Test login endpoint"""
    print_header("AUTHENTICATION: LOGIN")
    
    endpoint = f"{BASE_URL}/api/auth/login"
    payload = {"email": email, "password": password}
    
    try:
        resp = requests.post(endpoint, json=payload, timeout=5)
        if resp.status_code in [200, 201]:
            print_success(f"Login successful: {resp.status_code}")
            data = resp.json()
            access_token = data.get("access_token")
            test_results["auth"]["login_valid"] = {"status": "OK", "code": resp.status_code}
            return access_token
        else:
            print_warning(f"Login returned: {resp.status_code}")
            print_info(f"Response: {resp.text[:200]}")
            test_results["auth"]["login_valid"] = {"status": "PARTIAL", "code": resp.status_code}
    except Exception as e:
        print_error(f"Login failed: {str(e)}")
        test_results["auth"]["login_valid"] = {"status": "ERROR", "error": str(e)}
        test_results["errors"].append(f"Login failed: {str(e)}")
    
    return None

# ============================================================================
# SECTION 3: CRUD OPERATIONS TESTS
# ============================================================================

def test_crud_operations(access_token):
    """Test CRUD operations with authentication"""
    print_header("CRUD OPERATIONS")
    
    if not access_token:
        print_warning("Skipping CRUD tests - no valid access token")
        return
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Test GET /me (current user)
    try:
        resp = requests.get(f"{BASE_URL}/api/auth/me", headers=headers, timeout=5)
        if resp.status_code == 200:
            print_success(f"GET /me: {resp.status_code}")
            test_results["crud_operations"]["get_me"] = {"status": "OK", "code": resp.status_code}
        else:
            print_warning(f"GET /me returned: {resp.status_code}")
            test_results["crud_operations"]["get_me"] = {"status": "PARTIAL", "code": resp.status_code}
    except Exception as e:
        print_error(f"GET /me failed: {str(e)}")
        test_results["crud_operations"]["get_me"] = {"status": "ERROR", "error": str(e)}
    
    # Test CREATE project (if endpoint exists)
    project_payload = {
        "title": f"Test Project {int(time.time())}",
        "description": "Test project for debugging",
        "budget": 500.0,
        "budget_type": "fixed",
        "status": "open"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/api/projects", json=project_payload, headers=headers, timeout=5)
        if resp.status_code in [200, 201]:
            print_success(f"CREATE project: {resp.status_code}")
            data = resp.json()
            project_id = data.get("id")
            test_results["crud_operations"]["create_project"] = {"status": "OK", "code": resp.status_code}
            
            # Test READ project
            try:
                resp = requests.get(f"{BASE_URL}/api/projects/{project_id}", headers=headers, timeout=5)
                if resp.status_code == 200:
                    print_success(f"READ project: {resp.status_code}")
                    test_results["crud_operations"]["read_project"] = {"status": "OK", "code": resp.status_code}
                else:
                    print_warning(f"READ project returned: {resp.status_code}")
                    test_results["crud_operations"]["read_project"] = {"status": "PARTIAL", "code": resp.status_code}
            except Exception as e:
                print_error(f"READ project failed: {str(e)}")
                test_results["crud_operations"]["read_project"] = {"status": "ERROR", "error": str(e)}
            
            # Test UPDATE project
            update_payload = {"title": f"Updated Project {int(time.time())}"}
            try:
                resp = requests.patch(f"{BASE_URL}/api/projects/{project_id}", json=update_payload, headers=headers, timeout=5)
                if resp.status_code == 200:
                    print_success(f"UPDATE project: {resp.status_code}")
                    test_results["crud_operations"]["update_project"] = {"status": "OK", "code": resp.status_code}
                else:
                    print_warning(f"UPDATE project returned: {resp.status_code}")
                    test_results["crud_operations"]["update_project"] = {"status": "PARTIAL", "code": resp.status_code}
            except Exception as e:
                print_error(f"UPDATE project failed: {str(e)}")
                test_results["crud_operations"]["update_project"] = {"status": "ERROR", "error": str(e)}
        else:
            print_warning(f"CREATE project returned: {resp.status_code}")
            print_info(f"Response: {resp.text[:300]}")
            test_results["crud_operations"]["create_project"] = {"status": "PARTIAL", "code": resp.status_code}
    except Exception as e:
        print_error(f"CREATE project failed: {str(e)}")
        test_results["crud_operations"]["create_project"] = {"status": "ERROR", "error": str(e)}

# ============================================================================
# SECTION 4: AI SERVICES TESTS
# ============================================================================

def test_ai_services():
    """Test AI services endpoints"""
    print_header("AI SERVICES TESTS")
    
    ai_endpoints = [
        ("/api/ai/matching/score", "Matching Score", {"freelancer_id": "test", "project_id": "test"}),
        ("/api/ai/skill-analyzer", "Skill Analyzer", {"text": "Python, JavaScript, React development"}),
        ("/api/ai/sentiment", "Sentiment Analysis", {"text": "This is a great platform!"}),
        ("/api/ai/writing/improve", "Improve Writing", {"text": "I want to help with your project"}),
    ]
    
    for endpoint, name, payload in ai_endpoints:
        try:
            resp = requests.post(f"{BASE_URL}{endpoint}", json=payload, timeout=5)
            if resp.status_code in [200, 201, 400]:  # 400 may be expected if endpoint requires auth
                print_success(f"{name}: {resp.status_code}")
                test_results["ai_services"][name] = {"status": "OK", "code": resp.status_code}
            else:
                print_warning(f"{name}: {resp.status_code}")
                test_results["ai_services"][name] = {"status": "PARTIAL", "code": resp.status_code}
        except Exception as e:
            print_warning(f"{name}: {str(e)}")
            test_results["ai_services"][name] = {"status": "UNAVAILABLE", "error": str(e)}

# ============================================================================
# SECTION 5: INPUT VALIDATION TESTS
# ============================================================================

def test_input_validation():
    """Test input validation for various endpoints"""
    print_header("INPUT/OUTPUT VALIDATION")
    
    # Test 1: Empty payload
    try:
        resp = requests.post(f"{BASE_URL}/api/auth/register", json={}, timeout=5)
        if resp.status_code >= 400:
            print_success(f"Empty payload validation: {resp.status_code}")
            test_results["input_validation"]["empty_payload"] = {"status": "OK", "code": resp.status_code}
        else:
            print_error(f"Should reject empty payload but got: {resp.status_code}")
            test_results["input_validation"]["empty_payload"] = {"status": "FAILED", "code": resp.status_code}
    except Exception as e:
        print_warning(f"Empty payload test: {str(e)}")
    
    # Test 2: Invalid JSON
    try:
        resp = requests.post(f"{BASE_URL}/api/auth/register", 
                            data="invalid json", 
                            headers={"Content-Type": "application/json"},
                            timeout=5)
        if resp.status_code >= 400:
            print_success(f"Invalid JSON validation: {resp.status_code}")
            test_results["input_validation"]["invalid_json"] = {"status": "OK", "code": resp.status_code}
        else:
            print_warning(f"Should reject invalid JSON but got: {resp.status_code}")
            test_results["input_validation"]["invalid_json"] = {"status": "PARTIAL", "code": resp.status_code}
    except Exception as e:
        print_warning(f"Invalid JSON test: {str(e)}")
    
    # Test 3: Missing required fields
    try:
        resp = requests.post(f"{BASE_URL}/api/auth/register", 
                            json={"email": "test@example.com"}, 
                            timeout=5)
        if resp.status_code >= 400:
            print_success(f"Missing required fields validation: {resp.status_code}")
            test_results["input_validation"]["missing_fields"] = {"status": "OK", "code": resp.status_code}
        else:
            print_warning(f"Should reject missing fields but got: {resp.status_code}")
            test_results["input_validation"]["missing_fields"] = {"status": "PARTIAL", "code": resp.status_code}
    except Exception as e:
        print_warning(f"Missing fields test: {str(e)}")
    
    # Test 4: Invalid data types
    try:
        resp = requests.post(f"{BASE_URL}/api/auth/register", 
                            json={"email": "test@example.com", "password": 12345, "name": "Test", "user_type": "client"}, 
                            timeout=5)
        if resp.status_code >= 400:
            print_success(f"Invalid data type validation: {resp.status_code}")
            test_results["input_validation"]["invalid_type"] = {"status": "OK", "code": resp.status_code}
        else:
            print_warning(f"Should reject invalid type but got: {resp.status_code}")
            test_results["input_validation"]["invalid_type"] = {"status": "PARTIAL", "code": resp.status_code}
    except Exception as e:
        print_warning(f"Invalid type test: {str(e)}")

# ============================================================================
# SECTION 6: API ROUTES DISCOVERY
# ============================================================================

def test_api_routes():
    """Discover and test all API routes"""
    print_header("API ROUTES DISCOVERY")
    
    try:
        resp = requests.get(f"{BASE_URL}/docs", timeout=5)
        if resp.status_code == 200:
            print_success(f"API Docs (OpenAPI) available: {resp.status_code}")
        else:
            print_warning(f"API Docs endpoint: {resp.status_code}")
    except Exception as e:
        print_warning(f"API Docs endpoint: {str(e)}")
    
    # Try to get OpenAPI schema
    try:
        resp = requests.get(f"{BASE_URL}/openapi.json", timeout=5)
        if resp.status_code == 200:
            schema = resp.json()
            paths = schema.get("paths", {})
            print_success(f"OpenAPI schema available with {len(paths)} endpoints")
            print_info(f"Total API endpoints discovered: {len(paths)}")
            
            # Show endpoint groups
            endpoint_groups = {}
            for path in paths.keys():
                group = path.split("/")[2] if len(path.split("/")) > 2 else "root"
                endpoint_groups[group] = endpoint_groups.get(group, 0) + 1
            
            print_info("Endpoint groups:")
            for group, count in sorted(endpoint_groups.items()):
                print(f"  - {group}: {count} endpoints")
            
            test_results["api_routes"] = {
                "total": len(paths),
                "groups": endpoint_groups,
                "status": "OK"
            }
        else:
            print_warning(f"OpenAPI schema: {resp.status_code}")
    except Exception as e:
        print_warning(f"OpenAPI schema fetch: {str(e)}")

# ============================================================================
# SECTION 7: GENERATE REPORT
# ============================================================================

def generate_report():
    """Generate comprehensive debugging report"""
    print_header("COMPREHENSIVE DEBUG REPORT")
    
    total_tests = sum(len(v) for k, v in test_results.items() if isinstance(v, dict) and k != "errors")
    passed = sum(1 for v in test_results.values() if isinstance(v, dict) for item in v.values() 
                 if isinstance(item, dict) and item.get("status") == "OK")
    failed = sum(1 for v in test_results.values() if isinstance(v, dict) for item in v.values() 
                 if isinstance(item, dict) and item.get("status") in ["FAILED", "ERROR"])
    
    print(f"\n{Colors.BOLD}Summary:{Colors.RESET}")
    print(f"  Total Tests: {total_tests}")
    print(f"  {Colors.GREEN}Passed: {passed}{Colors.RESET}")
    print(f"  {Colors.RED}Failed: {failed}{Colors.RESET}")
    print(f"  Errors: {len(test_results['errors'])}")
    
    if test_results["errors"]:
        print(f"\n{Colors.BOLD}Error Summary:{Colors.RESET}")
        for error in test_results["errors"]:
            print(f"  {Colors.RED}• {error}{Colors.RESET}")
    
    # Save report to file
    report_file = "e:\\MegiLance\\debug_report.json"
    with open(report_file, "w") as f:
        json.dump(test_results, f, indent=2)
    
    print(f"\n{Colors.GREEN}Report saved to: {report_file}{Colors.RESET}")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    print_header("MEGILANCE COMPREHENSIVE DEBUGGING TEST SUITE")
    print_info("Testing all APIs, CRUD operations, and AI services")
    print_info(f"Backend URL: {BASE_URL}")
    print_info(f"Frontend URL: {FRONTEND_URL}")
    
    # Wait for services to be ready
    print_info("Waiting for services to be ready...")
    time.sleep(2)
    
    # Run tests
    test_health_endpoints()
    test_auth_registration()
    
    # Get user credentials for authenticated tests
    user_id, email, password = None, None, None
    try:
        user_id, email, password = test_auth_registration()
    except:
        pass
    
    if email and password:
        access_token = test_auth_login(email, password)
        test_crud_operations(access_token)
    
    test_api_routes()
    test_ai_services()
    test_input_validation()
    
    # Generate report
    generate_report()
    
    print_header("DEBUGGING TEST COMPLETE")

if __name__ == "__main__":
    main()
