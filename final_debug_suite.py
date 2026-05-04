#!/usr/bin/env python3
"""
@AI-HINT: COMPREHENSIVE MEGILANCE DEBUGGING & VERIFICATION SUITE
Tests all APIs, CRUD operations, AI services, input validation, and error handling
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

class MegiLanceDebugger:
    def __init__(self):
        self.access_token = None
        self.user_id = None
        self.email = None
        self.password = None
        self.test_log = []
        self.stats = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "skipped": 0,
            "errors": []
        }
    
    def log(self, level, msg):
        entry = f"[{level}] {msg}"
        self.test_log.append(entry)
        print(entry)
    
    def get_all_endpoints(self):
        """Fetch all endpoints from OpenAPI"""
        try:
            resp = requests.get(f"{BASE_URL}/api/openapi.json", timeout=5)
            if resp.status_code == 200:
                schema = resp.json()
                return schema.get("paths", {})
            return {}
        except:
            return {}
    
    def test_health_check(self):
        """Test 1: Health & Readiness Checks"""
        self.log("INFO", "\n" + "="*80)
        self.log("INFO", "TEST 1: HEALTH & READINESS CHECKS")
        self.log("INFO", "="*80)
        
        endpoints = [
            ("/api/health/", "Health"),
            ("/api/health/ready", "Readiness"),
            ("/api/health/live", "Liveness"),
        ]
        
        for ep, name in endpoints:
            self.stats["total_tests"] += 1
            try:
                resp = requests.get(f"{BASE_URL}{ep}", timeout=5)
                if resp.status_code == 200:
                    self.log("PASS", f"✓ {name}: {resp.status_code}")
                    self.stats["passed"] += 1
                else:
                    self.log("FAIL", f"✗ {name}: {resp.status_code}")
                    self.stats["failed"] += 1
            except Exception as e:
                self.log("ERROR", f"✗ {name}: {e}")
                self.stats["errors"].append(f"{name}: {e}")
    
    def test_authentication(self):
        """Test 2: Authentication Flow"""
        self.log("INFO", "\n" + "="*80)
        self.log("INFO", "TEST 2: AUTHENTICATION FLOW")
        self.log("INFO", "="*80)
        
        # Registration
        self.stats["total_tests"] += 1
        self.email = f"testuser_{int(time.time())}@debug.com"
        self.password = "TestPass123!"
        
        reg_payload = {
            "email": self.email,
            "password": self.password,
            "name": "Debug Tester",
            "user_type": "client"
        }
        
        try:
            resp = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload, timeout=5)
            if resp.status_code in [200, 201]:
                self.log("PASS", f"✓ Registration: {resp.status_code}")
                self.stats["passed"] += 1
            else:
                self.log("FAIL", f"✗ Registration: {resp.status_code}")
                self.stats["failed"] += 1
                self.log("DEBUG", f"Response: {resp.text[:300]}")
        except Exception as e:
            self.log("ERROR", f"✗ Registration: {e}")
            self.stats["errors"].append(f"Registration: {e}")
        
        # Login
        self.stats["total_tests"] += 1
        login_payload = {"email": self.email, "password": self.password}
        
        try:
            resp = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                self.access_token = data.get("access_token")
                self.log("PASS", f"✓ Login: {resp.status_code}")
                self.stats["passed"] += 1
            else:
                self.log("FAIL", f"✗ Login: {resp.status_code}")
                self.stats["failed"] += 1
        except Exception as e:
            self.log("ERROR", f"✗ Login: {e}")
            self.stats["errors"].append(f"Login: {e}")
        
        # Get Current User
        if self.access_token:
            self.stats["total_tests"] += 1
            headers = {"Authorization": f"Bearer {self.access_token}"}
            try:
                resp = requests.get(f"{BASE_URL}/api/auth/me", headers=headers, timeout=5)
                if resp.status_code == 200:
                    user = resp.json()
                    self.user_id = user.get("id")
                    self.log("PASS", f"✓ GET /me: {resp.status_code} (User: {self.user_id})")
                    self.stats["passed"] += 1
                else:
                    self.log("FAIL", f"✗ GET /me: {resp.status_code}")
                    self.stats["failed"] += 1
            except Exception as e:
                self.log("ERROR", f"✗ GET /me: {e}")
                self.stats["errors"].append(f"GET /me: {e}")
    
    def test_crud_operations(self):
        """Test 3: CRUD Operations"""
        self.log("INFO", "\n" + "="*80)
        self.log("INFO", "TEST 3: CRUD OPERATIONS")
        self.log("INFO", "="*80)
        
        if not self.access_token:
            self.log("SKIP", "Skipping CRUD tests - no access token")
            self.stats["skipped"] += 1
            return
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # CREATE: Project
        self.stats["total_tests"] += 1
        project_payload = {
            "title": f"Debug Test Project {int(time.time())}",
            "description": "Testing CRUD operations",
            "category": "development",
            "experience_level": "beginner",
            "estimated_duration": "1-3 weeks",
            "budget": 500.0,
            "budget_type": "fixed"
        }
        
        project_id = None
        try:
            resp = requests.post(f"{BASE_URL}/api/projects", json=project_payload, headers=headers, timeout=5)
            if resp.status_code in [200, 201]:
                data = resp.json()
                project_id = data.get("id")
                self.log("PASS", f"✓ CREATE project: {resp.status_code}")
                self.stats["passed"] += 1
            else:
                self.log("FAIL", f"✗ CREATE project: {resp.status_code}")
                self.stats["failed"] += 1
                self.log("DEBUG", f"Response: {resp.text[:300]}")
        except Exception as e:
            self.log("ERROR", f"✗ CREATE project: {e}")
            self.stats["errors"].append(f"CREATE project: {e}")
        
        # READ: Project
        if project_id:
            self.stats["total_tests"] += 1
            try:
                resp = requests.get(f"{BASE_URL}/api/projects/{project_id}", headers=headers, timeout=5)
                if resp.status_code == 200:
                    self.log("PASS", f"✓ READ project: {resp.status_code}")
                    self.stats["passed"] += 1
                else:
                    self.log("FAIL", f"✗ READ project: {resp.status_code}")
                    self.stats["failed"] += 1
            except Exception as e:
                self.log("ERROR", f"✗ READ project: {e}")
                self.stats["errors"].append(f"READ project: {e}")
            
            # UPDATE: Project
            self.stats["total_tests"] += 1
            update_payload = {"title": f"Updated Project {int(time.time())}"}
            try:
                resp = requests.patch(f"{BASE_URL}/api/projects/{project_id}", json=update_payload, headers=headers, timeout=5)
                if resp.status_code in [200, 204]:
                    self.log("PASS", f"✓ UPDATE project: {resp.status_code}")
                    self.stats["passed"] += 1
                else:
                    self.log("FAIL", f"✗ UPDATE project: {resp.status_code}")
                    self.stats["failed"] += 1
            except Exception as e:
                self.log("ERROR", f"✗ UPDATE project: {e}")
                self.stats["errors"].append(f"UPDATE project: {e}")
            
            # DELETE: Project (if endpoint exists)
            self.stats["total_tests"] += 1
            try:
                resp = requests.delete(f"{BASE_URL}/api/projects/{project_id}", headers=headers, timeout=5)
                if resp.status_code in [200, 204]:
                    self.log("PASS", f"✓ DELETE project: {resp.status_code}")
                    self.stats["passed"] += 1
                else:
                    self.log("FAIL", f"✗ DELETE project: {resp.status_code}")
                    self.stats["failed"] += 1
            except Exception as e:
                self.log("ERROR", f"✗ DELETE project: {e}")
                self.stats["errors"].append(f"DELETE project: {e}")
    
    def test_ai_endpoints(self):
        """Test 4: AI Endpoints"""
        self.log("INFO", "\n" + "="*80)
        self.log("INFO", "TEST 4: AI SERVICES ENDPOINTS")
        self.log("INFO", "="*80)
        
        if not self.access_token:
            self.log("SKIP", "Skipping AI tests - no access token")
            self.stats["skipped"] += 1
            return
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Get all endpoints
        paths = self.get_all_endpoints()
        ai_paths = sorted([p for p in paths.keys() if "ai" in p.lower()])
        
        self.log("INFO", f"Found {len(ai_paths)} AI endpoints")
        
        # Test a few key AI endpoints
        test_ai = [
            ("/api/ai-advanced/model-stats", "GET", None),
            ("/api/skill-analyzer", "POST", {"text": "Python, JavaScript, React"}),
            ("/api/ai-advanced/assess-quality", "POST", {"proposal_text": "I can help with your project"}),
        ]
        
        for endpoint, method, payload in test_ai:
            self.stats["total_tests"] += 1
            try:
                if method == "GET":
                    resp = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=5)
                else:
                    resp = requests.post(f"{BASE_URL}{endpoint}", json=payload, headers=headers, timeout=5)
                
                if resp.status_code < 500:
                    status = "PASS" if resp.status_code < 400 else "FAIL"
                    self.log(status, f"✓ {method} {endpoint}: {resp.status_code}")
                    if resp.status_code < 400:
                        self.stats["passed"] += 1
                    else:
                        self.stats["failed"] += 1
                else:
                    self.log("FAIL", f"✗ {method} {endpoint}: {resp.status_code}")
                    self.stats["failed"] += 1
            except Exception as e:
                self.log("ERROR", f"✗ {method} {endpoint}: {e}")
                self.stats["errors"].append(f"{endpoint}: {e}")
    
    def test_input_validation(self):
        """Test 5: Input Validation & Error Handling"""
        self.log("INFO", "\n" + "="*80)
        self.log("INFO", "TEST 5: INPUT VALIDATION & ERROR HANDLING")
        self.log("INFO", "="*80)
        
        validation_tests = [
            ("Empty payload", "/api/auth/register", "POST", {}),
            ("Missing fields", "/api/auth/register", "POST", {"email": "test@test.com"}),
            ("Invalid email", "/api/auth/register", "POST", 
             {"email": "notanemail", "password": "Pass123!", "name": "Test", "user_type": "client"}),
            ("Invalid data type", "/api/auth/register", "POST", 
             {"email": "test@test.com", "password": 12345, "name": "Test", "user_type": "client"}),
        ]
        
        for test_name, endpoint, method, payload in validation_tests:
            self.stats["total_tests"] += 1
            try:
                if method == "POST":
                    resp = requests.post(f"{BASE_URL}{endpoint}", json=payload, timeout=5)
                
                if resp.status_code >= 400:
                    self.log("PASS", f"✓ {test_name}: {resp.status_code} (properly rejected)")
                    self.stats["passed"] += 1
                else:
                    self.log("FAIL", f"✗ {test_name}: {resp.status_code} (should reject)")
                    self.stats["failed"] += 1
            except Exception as e:
                self.log("ERROR", f"✗ {test_name}: {e}")
                self.stats["errors"].append(f"{test_name}: {e}")
    
    def test_openapi_docs(self):
        """Test 6: OpenAPI Documentation"""
        self.log("INFO", "\n" + "="*80)
        self.log("INFO", "TEST 6: OPENAPI DOCUMENTATION")
        self.log("INFO", "="*80)
        
        docs = [
            ("/api/docs", "Swagger UI"),
            ("/api/redoc", "ReDoc"),
            ("/api/openapi.json", "OpenAPI Schema"),
        ]
        
        for endpoint, name in docs:
            self.stats["total_tests"] += 1
            try:
                resp = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
                if resp.status_code == 200:
                    self.log("PASS", f"✓ {name}: {resp.status_code}")
                    self.stats["passed"] += 1
                else:
                    self.log("FAIL", f"✗ {name}: {resp.status_code}")
                    self.stats["failed"] += 1
            except Exception as e:
                self.log("ERROR", f"✗ {name}: {e}")
                self.stats["errors"].append(f"{name}: {e}")
    
    def generate_report(self):
        """Generate final debugging report"""
        self.log("INFO", "\n" + "="*80)
        self.log("INFO", "FINAL DEBUGGING REPORT")
        self.log("INFO", "="*80)
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "backend_url": BASE_URL,
            "statistics": {
                "total_tests": self.stats["total_tests"],
                "passed": self.stats["passed"],
                "failed": self.stats["failed"],
                "skipped": self.stats["skipped"],
                "pass_rate": f"{(self.stats['passed']/max(1, self.stats['total_tests']))*100:.1f}%"
            },
            "errors": self.stats["errors"],
            "endpoints": {
                "total_endpoints": len(self.get_all_endpoints()),
                "ai_endpoints": len([p for p in self.get_all_endpoints().keys() if "ai" in p.lower()])
            },
            "test_log": self.test_log
        }
        
        # Print summary
        print("\n" + "█"*80)
        print("█" + " "*78 + "█")
        print("█" + f"SUMMARY: {self.stats['passed']}/{self.stats['total_tests']} TESTS PASSED".center(78) + "█")
        print("█" + " "*78 + "█")
        print("█"*80)
        
        print(f"\n✓ Passed:  {self.stats['passed']}")
        print(f"✗ Failed:  {self.stats['failed']}")
        print(f"⊘ Skipped: {self.stats['skipped']}")
        print(f"Errors:    {len(self.stats['errors'])}")
        print(f"\nTotal API Endpoints: {report['endpoints']['total_endpoints']}")
        print(f"AI Endpoints: {report['endpoints']['ai_endpoints']}")
        
        # Save report
        report_path = "e:\\MegiLance\\final_debug_report.json"
        with open(report_path, "w") as f:
            json.dump(report, f, indent=2)
        
        print(f"\n✓ Report saved to: {report_path}")
        
        return report
    
    def run_all_tests(self):
        """Execute complete test suite"""
        print("\n" + "█"*80)
        print("█" + " "*78 + "█")
        print("█" + "MEGILANCE COMPREHENSIVE API DEBUGGING SUITE".center(78) + "█")
        print("█" + " "*78 + "█")
        print("█"*80)
        
        self.test_health_check()
        self.test_authentication()
        self.test_crud_operations()
        self.test_ai_endpoints()
        self.test_input_validation()
        self.test_openapi_docs()
        
        report = self.generate_report()
        
        return report

def main():
    debugger = MegiLanceDebugger()
    debugger.run_all_tests()

if __name__ == "__main__":
    main()
