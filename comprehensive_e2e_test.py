# @AI-HINT: Comprehensive end-to-end testing script for MegiLance platform
"""
Complete workflow testing:
1. Client registration & authentication
2. Freelancer registration & authentication
3. Project creation by client
4. Freelancer browsing & proposal submission
5. Messaging system (direct + chatbot)
6. Contract creation & delivery
7. Payment processing
8. Reviews & ratings
9. Admin moderation
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

class MegiLanceE2ETest:
    def __init__(self):
        self.client_session = requests.Session()
        self.freelancer_session = requests.Session()
        self.admin_session = requests.Session()
        self.results = []
        self.client_token = None
        self.freelancer_token = None
        self.admin_token = None
        
    def log_test(self, test_name, status, details=""):
        """Log test result"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "test": test_name,
            "status": status,
            "details": details
        }
        self.results.append(entry)
        print(f"\n[{status}] {test_name}")
        if details:
            print(f"    → {details}")
            
    def test_backend_health(self):
        """Test 1: Backend health check"""
        try:
            resp = requests.get(f"{BASE_URL}/api/health/ready", timeout=5)
            if resp.status_code == 200:
                self.log_test("Backend Health Check", "PASS", "Backend is running")
                return True
            else:
                self.log_test("Backend Health Check", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log_test("Backend Health Check", "FAIL", str(e))
            return False
    
    def test_client_registration(self):
        """Test 2: Client registration"""
        try:
            payload = {
                "email": f"client_{int(time.time())}@test.com",
                "password": "TestPass123!",
                "role": "client",
                "first_name": "John",
                "last_name": "Client"
            }
            resp = self.client_session.post(f"{BASE_URL}/api/auth/register", json=payload)
            
            if resp.status_code == 201:
                data = resp.json()
                self.log_test("Client Registration", "PASS", f"User ID: {data.get('user_id')}")
                return True
            else:
                self.log_test("Client Registration", "FAIL", f"Status: {resp.status_code}, Response: {resp.text}")
                return False
        except Exception as e:
            self.log_test("Client Registration", "FAIL", str(e))
            return False
    
    def test_client_login(self):
        """Test 3: Client login and token generation"""
        try:
            payload = {
                "email": "client_test@example.com",
                "password": "TestPass123!"
            }
            resp = self.client_session.post(f"{BASE_URL}/api/auth/login", json=payload)
            
            if resp.status_code == 200:
                data = resp.json()
                self.client_token = data.get('access_token')
                self.client_session.headers.update({"Authorization": f"Bearer {self.client_token}"})
                self.log_test("Client Login", "PASS", "JWT token received")
                return True
            else:
                self.log_test("Client Login", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log_test("Client Login", "FAIL", str(e))
            return False
    
    def test_freelancer_registration(self):
        """Test 4: Freelancer registration"""
        try:
            payload = {
                "email": f"freelancer_{int(time.time())}@test.com",
                "password": "TestPass123!",
                "role": "freelancer",
                "first_name": "Jane",
                "last_name": "Freelancer"
            }
            resp = self.freelancer_session.post(f"{BASE_URL}/api/auth/register", json=payload)
            
            if resp.status_code == 201:
                data = resp.json()
                self.log_test("Freelancer Registration", "PASS", f"User ID: {data.get('user_id')}")
                return True
            else:
                self.log_test("Freelancer Registration", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log_test("Freelancer Registration", "FAIL", str(e))
            return False
    
    def test_freelancer_login(self):
        """Test 5: Freelancer login"""
        try:
            payload = {
                "email": "freelancer_test@example.com",
                "password": "TestPass123!"
            }
            resp = self.freelancer_session.post(f"{BASE_URL}/api/auth/login", json=payload)
            
            if resp.status_code == 200:
                data = resp.json()
                self.freelancer_token = data.get('access_token')
                self.freelancer_session.headers.update({"Authorization": f"Bearer {self.freelancer_token}"})
                self.log_test("Freelancer Login", "PASS", "JWT token received")
                return True
            else:
                self.log_test("Freelancer Login", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log_test("Freelancer Login", "FAIL", str(e))
            return False
    
    def test_project_creation(self):
        """Test 6: Client creates a project"""
        try:
            payload = {
                "title": f"Test Web Development Project {int(time.time())}",
                "description": "Build a responsive website with modern design",
                "category": "web-development",
                "budget_min": 500,
                "budget_max": 1500,
                "deadline": "2026-06-04",
                "skills_required": ["React", "Node.js", "MongoDB"]
            }
            resp = self.client_session.post(f"{BASE_URL}/api/projects", json=payload)
            
            if resp.status_code in [200, 201]:
                data = resp.json()
                self.project_id = data.get('id') or data.get('project_id')
                self.log_test("Project Creation", "PASS", f"Project ID: {self.project_id}")
                return True
            else:
                self.log_test("Project Creation", "FAIL", f"Status: {resp.status_code}, Response: {resp.text}")
                return False
        except Exception as e:
            self.log_test("Project Creation", "FAIL", str(e))
            return False
    
    def test_get_projects_list(self):
        """Test 7: Freelancer browses available projects"""
        try:
            resp = self.freelancer_session.get(f"{BASE_URL}/api/projects")
            
            if resp.status_code == 200:
                data = resp.json()
                projects_count = len(data) if isinstance(data, list) else data.get('total', 0)
                self.log_test("Browse Projects", "PASS", f"Found {projects_count} projects")
                return True
            else:
                self.log_test("Browse Projects", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log_test("Browse Projects", "FAIL", str(e))
            return False
    
    def test_proposal_submission(self):
        """Test 8: Freelancer submits a proposal"""
        try:
            if not hasattr(self, 'project_id'):
                self.log_test("Submit Proposal", "SKIP", "No project ID available")
                return False
            
            payload = {
                "project_id": self.project_id,
                "bid_amount": 800,
                "delivery_days": 14,
                "proposal_message": "I am an experienced React and Node.js developer. I can complete this project efficiently."
            }
            resp = self.freelancer_session.post(f"{BASE_URL}/api/proposals", json=payload)
            
            if resp.status_code in [200, 201]:
                data = resp.json()
                self.proposal_id = data.get('id') or data.get('proposal_id')
                self.log_test("Submit Proposal", "PASS", f"Proposal ID: {self.proposal_id}")
                return True
            else:
                self.log_test("Submit Proposal", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log_test("Submit Proposal", "FAIL", str(e))
            return False
    
    def test_messaging_system(self):
        """Test 9: Direct messaging between client and freelancer"""
        try:
            if not hasattr(self, 'freelancer_token'):
                self.log_test("Direct Messaging", "SKIP", "Freelancer not logged in")
                return False
            
            payload = {
                "recipient_id": 2,  # Assume freelancer ID
                "message": "Hi! I'm interested in discussing your proposal for the web project.",
                "project_id": self.project_id if hasattr(self, 'project_id') else None
            }
            resp = self.client_session.post(f"{BASE_URL}/api/messages", json=payload)
            
            if resp.status_code in [200, 201]:
                self.log_test("Direct Messaging", "PASS", "Message sent successfully")
                return True
            else:
                self.log_test("Direct Messaging", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log_test("Direct Messaging", "FAIL", str(e))
            return False
    
    def test_chatbot_interaction(self):
        """Test 10: AI Chatbot for platform assistance"""
        try:
            payload = {
                "message": "How do I post a new project on MegiLance?",
                "context": "platform_help"
            }
            resp = self.client_session.post(f"{BASE_URL}/api/chat/message", json=payload)
            
            if resp.status_code in [200, 201]:
                data = resp.json()
                chatbot_response = data.get('response') or data.get('message')
                self.log_test("Chatbot Interaction", "PASS", f"Response received: {chatbot_response[:50]}...")
                return True
            else:
                self.log_test("Chatbot Interaction", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log_test("Chatbot Interaction", "FAIL", str(e))
            return False
    
    def test_contract_creation(self):
        """Test 11: Create contract from accepted proposal"""
        try:
            if not hasattr(self, 'proposal_id'):
                self.log_test("Contract Creation", "SKIP", "No proposal ID available")
                return False
            
            payload = {
                "proposal_id": self.proposal_id,
                "terms": "Full payment upon completion. Includes 2 rounds of revisions.",
                "start_date": "2026-05-05"
            }
            resp = self.client_session.post(f"{BASE_URL}/api/contracts", json=payload)
            
            if resp.status_code in [200, 201]:
                data = resp.json()
                self.contract_id = data.get('id') or data.get('contract_id')
                self.log_test("Contract Creation", "PASS", f"Contract ID: {self.contract_id}")
                return True
            else:
                self.log_test("Contract Creation", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log_test("Contract Creation", "FAIL", str(e))
            return False
    
    def test_payment_initiation(self):
        """Test 12: Initiate payment for completed work"""
        try:
            payload = {
                "contract_id": self.contract_id if hasattr(self, 'contract_id') else "test",
                "amount": 800,
                "payment_method": "card"
            }
            resp = self.client_session.post(f"{BASE_URL}/api/payments/initiate", json=payload)
            
            if resp.status_code in [200, 201]:
                self.log_test("Payment Initiation", "PASS", "Payment flow initiated")
                return True
            else:
                self.log_test("Payment Initiation", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log_test("Payment Initiation", "FAIL", str(e))
            return False
    
    def test_review_system(self):
        """Test 13: Client leaves review for freelancer"""
        try:
            payload = {
                "freelancer_id": 2,
                "rating": 5,
                "review_text": "Excellent work! Very professional and responsive.",
                "project_id": self.project_id if hasattr(self, 'project_id') else "test"
            }
            resp = self.client_session.post(f"{BASE_URL}/api/reviews", json=payload)
            
            if resp.status_code in [200, 201]:
                self.log_test("Review Submission", "PASS", "Review posted successfully")
                return True
            else:
                self.log_test("Review Submission", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log_test("Review Submission", "FAIL", str(e))
            return False
    
    def test_profile_completeness(self):
        """Test 14: Check profile data completeness"""
        try:
            resp = self.client_session.get(f"{BASE_URL}/api/profile/me")
            
            if resp.status_code == 200:
                data = resp.json()
                required_fields = ['email', 'first_name', 'last_name', 'role']
                missing = [f for f in required_fields if f not in data]
                
                if not missing:
                    self.log_test("Profile Completeness", "PASS", "All required fields present")
                    return True
                else:
                    self.log_test("Profile Completeness", "FAIL", f"Missing fields: {missing}")
                    return False
            else:
                self.log_test("Profile Completeness", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log_test("Profile Completeness", "FAIL", str(e))
            return False
    
    def test_matching_system(self):
        """Test 15: Test project-freelancer matching algorithm"""
        try:
            resp = self.freelancer_session.get(f"{BASE_URL}/api/projects/matches")
            
            if resp.status_code == 200:
                data = resp.json()
                matches_count = len(data) if isinstance(data, list) else data.get('count', 0)
                self.log_test("Matching System", "PASS", f"Found {matches_count} matched projects")
                return True
            else:
                self.log_test("Matching System", "FAIL", f"Status: {resp.status_code}")
                return False
        except Exception as e:
            self.log_test("Matching System", "FAIL", str(e))
            return False
    
    def run_all_tests(self):
        """Execute all tests"""
        print("\n" + "="*70)
        print("MegiLance Platform - Comprehensive E2E Testing")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*70)
        
        # Run tests in logical order
        self.test_backend_health()
        self.test_client_registration()
        self.test_client_login()
        self.test_freelancer_registration()
        self.test_freelancer_login()
        self.test_project_creation()
        self.test_get_projects_list()
        self.test_proposal_submission()
        self.test_messaging_system()
        self.test_chatbot_interaction()
        self.test_contract_creation()
        self.test_payment_initiation()
        self.test_review_system()
        self.test_profile_completeness()
        self.test_matching_system()
        
        # Print summary
        self.print_summary()
        self.save_results()
    
    def print_summary(self):
        """Print test summary"""
        passed = sum(1 for r in self.results if r['status'] == 'PASS')
        failed = sum(1 for r in self.results if r['status'] == 'FAIL')
        skipped = sum(1 for r in self.results if r['status'] == 'SKIP')
        total = len(self.results)
        
        print("\n" + "="*70)
        print("TEST SUMMARY")
        print("="*70)
        print(f"✓ Passed:  {passed}/{total}")
        print(f"✗ Failed:  {failed}/{total}")
        print(f"⊘ Skipped: {skipped}/{total}")
        print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "N/A")
        print("="*70 + "\n")
    
    def save_results(self):
        """Save results to JSON file"""
        output_file = "e2e_test_results.json"
        with open(output_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"Results saved to: {output_file}")

if __name__ == "__main__":
    tester = MegiLanceE2ETest()
    tester.run_all_tests()
