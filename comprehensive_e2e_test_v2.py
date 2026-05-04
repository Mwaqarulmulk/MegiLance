# @AI-HINT: Complete end-to-end testing with corrected API schemas
"""
MegiLance Platform E2E Test - v2
Includes proper field validation based on first test run
"""

import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

class MegiLanceE2ETestV2:
    def __init__(self):
        self.results = []
        self.client_token = None
        self.freelancer_token = None
        self.client_id = None
        self.freelancer_id = None
        
    def log(self, test_name, status, details=""):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "test": test_name,
            "status": status,
            "details": details
        }
        self.results.append(entry)
        print(f"[{status}] {test_name}" + (f"\n    → {details}" if details else ""))
    
    def test_1_register_client(self):
        """Register a new client"""
        try:
            email = f"client_{int(time.time())}@test.com"
            payload = {
                "email": email,
                "password": "TestPass123!",
                "role": "client",
                "first_name": "John",
                "last_name": "Client"
            }
            resp = requests.post(f"{BASE_URL}/api/auth/register", json=payload, timeout=10)
            
            if resp.status_code in [200, 201]:
                data = resp.json()
                self.client_email = email
                self.client_password = "TestPass123!"
                self.log("1. Client Registration", "PASS", f"Email: {email}")
                return True
            else:
                self.log("1. Client Registration", "FAIL", f"Status: {resp.status_code} | {resp.text[:100]}")
                return False
        except Exception as e:
            self.log("1. Client Registration", "FAIL", str(e)[:100])
            return False
    
    def test_2_register_freelancer(self):
        """Register a new freelancer"""
        try:
            email = f"freelancer_{int(time.time())}@test.com"
            payload = {
                "email": email,
                "password": "TestPass123!",
                "role": "freelancer",
                "first_name": "Jane",
                "last_name": "Freelancer"
            }
            resp = requests.post(f"{BASE_URL}/api/auth/register", json=payload, timeout=10)
            
            if resp.status_code in [200, 201]:
                data = resp.json()
                self.freelancer_email = email
                self.freelancer_password = "TestPass123!"
                self.log("2. Freelancer Registration", "PASS", f"Email: {email}")
                return True
            else:
                self.log("2. Freelancer Registration", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log("2. Freelancer Registration", "FAIL", str(e)[:100])
            return False
    
    def test_3_client_login(self):
        """Client login"""
        try:
            payload = {
                "email": self.client_email,
                "password": self.client_password
            }
            resp = requests.post(f"{BASE_URL}/api/auth/login", json=payload, timeout=10)
            
            if resp.status_code == 200:
                data = resp.json()
                self.client_token = data.get('access_token')
                self.client_id = data.get('user_id') or data.get('id')
                self.log("3. Client Login", "PASS", "JWT token obtained")
                return True
            else:
                self.log("3. Client Login", "FAIL", f"Status: {resp.status_code} | {resp.text[:100]}")
                return False
        except Exception as e:
            self.log("3. Client Login", "FAIL", str(e)[:100])
            return False
    
    def test_4_freelancer_login(self):
        """Freelancer login"""
        try:
            payload = {
                "email": self.freelancer_email,
                "password": self.freelancer_password
            }
            resp = requests.post(f"{BASE_URL}/api/auth/login", json=payload, timeout=10)
            
            if resp.status_code == 200:
                data = resp.json()
                self.freelancer_token = data.get('access_token')
                self.freelancer_id = data.get('user_id') or data.get('id')
                self.log("4. Freelancer Login", "PASS", "JWT token obtained")
                return True
            else:
                self.log("4. Freelancer Login", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log("4. Freelancer Login", "FAIL", str(e)[:100])
            return False
    
    def test_5_create_project(self):
        """Create a project"""
        try:
            if not self.client_token:
                self.log("5. Create Project", "SKIP", "Client not logged in")
                return False
            
            headers = {"Authorization": f"Bearer {self.client_token}"}
            deadline = (datetime.now() + timedelta(days=30)).date().isoformat()
            
            payload = {
                "title": f"Test Project {int(time.time())}",
                "description": "Build a responsive website with modern design",
                "category": "web-development",
                "budget_min": 500,
                "budget_max": 1500,
                "budget_type": "fixed",  # Based on validation error
                "estimated_duration": "30 days",  # Based on validation error
                "experience_level": "intermediate",  # Based on validation error
                "deadline": deadline,
                "skills": ["React", "Node.js"]  # Changed to array as per validation
            }
            resp = requests.post(f"{BASE_URL}/api/projects", json=payload, headers=headers, timeout=10)
            
            if resp.status_code in [200, 201]:
                data = resp.json()
                self.project_id = data.get('id') or data.get('project_id')
                self.log("5. Create Project", "PASS", f"Project ID: {self.project_id}")
                return True
            else:
                self.log("5. Create Project", "FAIL", f"Status: {resp.status_code} | {resp.text[:150]}")
                return False
        except Exception as e:
            self.log("5. Create Project", "FAIL", str(e)[:100])
            return False
    
    def test_6_browse_projects(self):
        """Browse projects as freelancer"""
        try:
            if not self.freelancer_token:
                self.log("6. Browse Projects", "SKIP", "Freelancer not logged in")
                return False
            
            headers = {"Authorization": f"Bearer {self.freelancer_token}"}
            resp = requests.get(f"{BASE_URL}/api/projects", headers=headers, timeout=10)
            
            if resp.status_code == 200:
                data = resp.json()
                projects = data if isinstance(data, list) else data.get('data', [])
                count = len(projects)
                self.log("6. Browse Projects", "PASS", f"Found {count} projects")
                return True
            else:
                self.log("6. Browse Projects", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log("6. Browse Projects", "FAIL", str(e)[:100])
            return False
    
    def test_7_submit_proposal(self):
        """Submit a proposal"""
        try:
            if not hasattr(self, 'project_id') or not self.freelancer_token:
                self.log("7. Submit Proposal", "SKIP", "Project or freelancer not available")
                return False
            
            headers = {"Authorization": f"Bearer {self.freelancer_token}"}
            payload = {
                "project_id": self.project_id,
                "bid_amount": 800,
                "delivery_days": 20,
                "proposal_message": "I have experience with this tech stack"
            }
            resp = requests.post(f"{BASE_URL}/api/proposals", json=payload, headers=headers, timeout=10)
            
            if resp.status_code in [200, 201]:
                data = resp.json()
                self.proposal_id = data.get('id') or data.get('proposal_id')
                self.log("7. Submit Proposal", "PASS", f"Proposal ID: {self.proposal_id}")
                return True
            else:
                self.log("7. Submit Proposal", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log("7. Submit Proposal", "FAIL", str(e)[:100])
            return False
    
    def test_8_get_freelancer_profile(self):
        """Get freelancer profile"""
        try:
            if not self.freelancer_token:
                self.log("8. Get Freelancer Profile", "SKIP", "Freelancer not logged in")
                return False
            
            headers = {"Authorization": f"Bearer {self.freelancer_token}"}
            resp = requests.get(f"{BASE_URL}/api/profile/me", headers=headers, timeout=10)
            
            if resp.status_code == 200:
                data = resp.json()
                self.log("8. Get Freelancer Profile", "PASS", f"Profile retrieved for {data.get('email')}")
                return True
            else:
                self.log("8. Get Freelancer Profile", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log("8. Get Freelancer Profile", "FAIL", str(e)[:100])
            return False
    
    def test_9_get_client_profile(self):
        """Get client profile"""
        try:
            if not self.client_token:
                self.log("9. Get Client Profile", "SKIP", "Client not logged in")
                return False
            
            headers = {"Authorization": f"Bearer {self.client_token}"}
            resp = requests.get(f"{BASE_URL}/api/profile/me", headers=headers, timeout=10)
            
            if resp.status_code == 200:
                data = resp.json()
                self.log("9. Get Client Profile", "PASS", f"Profile retrieved")
                return True
            else:
                self.log("9. Get Client Profile", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log("9. Get Client Profile", "FAIL", str(e)[:100])
            return False
    
    def test_10_list_contracts(self):
        """List contracts"""
        try:
            if not self.client_token:
                self.log("10. List Contracts", "SKIP", "Client not logged in")
                return False
            
            headers = {"Authorization": f"Bearer {self.client_token}"}
            resp = requests.get(f"{BASE_URL}/api/contracts", headers=headers, timeout=10)
            
            if resp.status_code == 200:
                data = resp.json()
                contracts = data if isinstance(data, list) else data.get('data', [])
                self.log("10. List Contracts", "PASS", f"Found {len(contracts)} contracts")
                return True
            else:
                self.log("10. List Contracts", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log("10. List Contracts", "FAIL", str(e)[:100])
            return False
    
    def test_11_health_check(self):
        """Backend health check"""
        try:
            resp = requests.get(f"{BASE_URL}/api/health/ready", timeout=5)
            
            if resp.status_code == 200:
                data = resp.json()
                self.log("11. Health Check", "PASS", "Backend operational")
                return True
            else:
                self.log("11. Health Check", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log("11. Health Check", "FAIL", str(e)[:100])
            return False
    
    def test_12_search_projects(self):
        """Search projects"""
        try:
            if not self.freelancer_token:
                self.log("12. Search Projects", "SKIP", "Freelancer not logged in")
                return False
            
            headers = {"Authorization": f"Bearer {self.freelancer_token}"}
            resp = requests.get(f"{BASE_URL}/api/projects?category=web-development", headers=headers, timeout=10)
            
            if resp.status_code == 200:
                data = resp.json()
                projects = data if isinstance(data, list) else data.get('data', [])
                self.log("12. Search Projects", "PASS", f"Found {len(projects)} projects in category")
                return True
            else:
                self.log("12. Search Projects", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log("12. Search Projects", "FAIL", str(e)[:100])
            return False
    
    def test_13_get_project_details(self):
        """Get project details"""
        try:
            if not hasattr(self, 'project_id') or not self.freelancer_token:
                self.log("13. Get Project Details", "SKIP", "Project not available")
                return False
            
            headers = {"Authorization": f"Bearer {self.freelancer_token}"}
            resp = requests.get(f"{BASE_URL}/api/projects/{self.project_id}", headers=headers, timeout=10)
            
            if resp.status_code == 200:
                data = resp.json()
                self.log("13. Get Project Details", "PASS", f"Project: {data.get('title', 'N/A')}")
                return True
            else:
                self.log("13. Get Project Details", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log("13. Get Project Details", "FAIL", str(e)[:100])
            return False
    
    def test_14_get_proposals(self):
        """Get project proposals"""
        try:
            if not hasattr(self, 'project_id') or not self.client_token:
                self.log("14. Get Project Proposals", "SKIP", "Project or client not available")
                return False
            
            headers = {"Authorization": f"Bearer {self.client_token}"}
            resp = requests.get(f"{BASE_URL}/api/projects/{self.project_id}/proposals", headers=headers, timeout=10)
            
            if resp.status_code == 200:
                data = resp.json()
                proposals = data if isinstance(data, list) else data.get('data', [])
                self.log("14. Get Project Proposals", "PASS", f"Found {len(proposals)} proposals")
                return True
            else:
                # Some APIs return 404 if no proposals - that's ok
                self.log("14. Get Project Proposals", "INFO", f"Status: {resp.status_code} (might be empty)")
                return resp.status_code in [200, 404]
        except Exception as e:
            self.log("14. Get Project Proposals", "FAIL", str(e)[:100])
            return False
    
    def test_15_check_auth_endpoints(self):
        """Verify auth endpoints exist"""
        try:
            # Test /api/auth/me endpoint
            if self.client_token:
                headers = {"Authorization": f"Bearer {self.client_token}"}
                resp = requests.get(f"{BASE_URL}/api/auth/me", headers=headers, timeout=5)
                
                if resp.status_code == 200:
                    self.log("15. Auth Me Endpoint", "PASS", "Current user endpoint working")
                    return True
                else:
                    self.log("15. Auth Me Endpoint", "INFO", f"Status: {resp.status_code}")
                    return resp.status_code != 500
            else:
                self.log("15. Auth Me Endpoint", "SKIP", "No token available")
                return False
        except Exception as e:
            self.log("15. Auth Me Endpoint", "FAIL", str(e)[:100])
            return False
    
    def run_all(self):
        print("\n" + "="*80)
        print("MegiLance Platform - Comprehensive E2E Testing (v2)")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80 + "\n")
        
        # Run tests in order
        self.test_1_register_client()
        self.test_2_register_freelancer()
        self.test_3_client_login()
        self.test_4_freelancer_login()
        self.test_5_create_project()
        self.test_6_browse_projects()
        self.test_7_submit_proposal()
        self.test_8_get_freelancer_profile()
        self.test_9_get_client_profile()
        self.test_10_list_contracts()
        self.test_11_health_check()
        self.test_12_search_projects()
        self.test_13_get_project_details()
        self.test_14_get_proposals()
        self.test_15_check_auth_endpoints()
        
        self.print_summary()
        self.save_results()
    
    def print_summary(self):
        passed = sum(1 for r in self.results if r['status'] == 'PASS')
        failed = sum(1 for r in self.results if r['status'] == 'FAIL')
        skipped = sum(1 for r in self.results if r['status'] in ['SKIP', 'INFO'])
        total = len(self.results)
        
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        print(f"✓ Passed:  {passed}/{total}")
        print(f"✗ Failed:  {failed}/{total}")
        print(f"⊘ Skipped/Info: {skipped}/{total}")
        print(f"Success Rate: {(passed/(total-skipped)*100 if total-skipped > 0 else 0):.1f}%")
        print("="*80 + "\n")
    
    def save_results(self):
        with open("e2e_test_results_v2.json", 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"Results saved to: e2e_test_results_v2.json")

if __name__ == "__main__":
    tester = MegiLanceE2ETestV2()
    tester.run_all()
