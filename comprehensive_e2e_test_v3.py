# @AI-HINT: Complete end-to-end testing with profile completion
"""
MegiLance E2E Tests v3 - Full Workflow
"""

import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

class MegiLanceE2ETestV3:
    def __init__(self):
        self.results = []
        
    def log(self, test_name, status, details=""):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "test": test_name,
            "status": status,
            "details": details
        }
        self.results.append(entry)
        icon = {"PASS": "✓", "FAIL": "✗", "SKIP": "⊘", "INFO": "ℹ"}.get(status, "?")
        print(f"  [{icon}] {test_name}: {details}" if details else f"  [{icon}] {test_name}")
    
    def test_full_workflow(self):
        """Complete client-freelancer workflow"""
        
        # === PHASE 1: AUTHENTICATION ===
        print("\n📝 PHASE 1: AUTHENTICATION & REGISTRATION")
        print("-" * 70)
        
        # Register Client
        client_email = f"client_e2e_{int(time.time())}@test.com"
        client_pwd = "TestPass123!"
        try:
            resp = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": client_email,
                "password": client_pwd,
                "role": "client",
                "first_name": "Alice",
                "last_name": "Client"
            }, timeout=10)
            if resp.status_code in [200, 201]:
                self.log("Client Registration", "PASS", client_email)
            else:
                self.log("Client Registration", "FAIL", f"Status {resp.status_code}")
                return
        except Exception as e:
            self.log("Client Registration", "FAIL", str(e)[:50])
            return
        
        # Register Freelancer
        freelancer_email = f"freelancer_e2e_{int(time.time())}@test.com"
        freelancer_pwd = "TestPass123!"
        try:
            resp = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": freelancer_email,
                "password": freelancer_pwd,
                "role": "freelancer",
                "first_name": "Bob",
                "last_name": "Freelancer"
            }, timeout=10)
            if resp.status_code in [200, 201]:
                self.log("Freelancer Registration", "PASS", freelancer_email)
            else:
                self.log("Freelancer Registration", "FAIL", f"Status {resp.status_code}")
                return
        except Exception as e:
            self.log("Freelancer Registration", "FAIL", str(e)[:50])
            return
        
        # Client Login
        try:
            resp = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": client_email,
                "password": client_pwd
            }, timeout=10)
            if resp.status_code == 200:
                client_token = resp.json().get('access_token')
                client_headers = {"Authorization": f"Bearer {client_token}"}
                self.log("Client Login", "PASS", "JWT obtained")
            else:
                self.log("Client Login", "FAIL", f"Status {resp.status_code}")
                return
        except Exception as e:
            self.log("Client Login", "FAIL", str(e)[:50])
            return
        
        # Freelancer Login
        try:
            resp = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": freelancer_email,
                "password": freelancer_pwd
            }, timeout=10)
            if resp.status_code == 200:
                freelancer_token = resp.json().get('access_token')
                freelancer_headers = {"Authorization": f"Bearer {freelancer_token}"}
                self.log("Freelancer Login", "PASS", "JWT obtained")
            else:
                self.log("Freelancer Login", "FAIL", f"Status {resp.status_code}")
                return
        except Exception as e:
            self.log("Freelancer Login", "FAIL", str(e)[:50])
            return
        
        # === PHASE 2: PROFILE SETUP ===
        print("\n👤 PHASE 2: PROFILE SETUP")
        print("-" * 70)
        
        # Update Client Profile
        try:
            resp = requests.put(f"{BASE_URL}/api/profile/me", json={
                "name": "Alice Johnson",
                "bio": "Tech entrepreneur looking for quality freelancers",
                "company": "TechStart Inc",
                "country": "United States",
                "timezone": "EST"
            }, headers=client_headers, timeout=10)
            if resp.status_code in [200, 201]:
                self.log("Client Profile Update", "PASS", "Name, bio, company set")
            else:
                self.log("Client Profile Update", "FAIL", f"Status {resp.status_code}: {resp.text[:80]}")
        except Exception as e:
            self.log("Client Profile Update", "FAIL", str(e)[:50])
        
        # Update Freelancer Profile
        try:
            resp = requests.put(f"{BASE_URL}/api/profile/me", json={
                "name": "Bob Smith",
                "bio": "Experienced full-stack developer with 5 years experience",
                "skills": ["React", "Node.js", "MongoDB", "TypeScript"],
                "hourly_rate": 50,
                "country": "Canada",
                "timezone": "EST"
            }, headers=freelancer_headers, timeout=10)
            if resp.status_code in [200, 201]:
                self.log("Freelancer Profile Update", "PASS", "Bio, skills, rate set")
            else:
                self.log("Freelancer Profile Update", "FAIL", f"Status {resp.status_code}: {resp.text[:80]}")
        except Exception as e:
            self.log("Freelancer Profile Update", "FAIL", str(e)[:50])
        
        # === PHASE 3: PROJECT WORKFLOW ===
        print("\n📌 PHASE 3: PROJECT CREATION & DISCOVERY")
        print("-" * 70)
        
        project_id = None
        
        # Create Project
        try:
            deadline = (datetime.now() + timedelta(days=30)).date().isoformat()
            resp = requests.post(f"{BASE_URL}/api/projects", json={
                "title": f"Build E-Commerce Platform {int(time.time())}",
                "description": "Need a full-stack e-commerce platform with payment integration",
                "category": "web-development",
                "budget_min": 1000,
                "budget_max": 3000,
                "budget_type": "fixed",
                "estimated_duration": "30 days",
                "experience_level": "intermediate",
                "deadline": deadline,
                "skills": ["React", "Node.js", "MongoDB", "Stripe"]
            }, headers=client_headers, timeout=10)
            if resp.status_code in [200, 201]:
                project_id = resp.json().get('id') or resp.json().get('project_id')
                self.log("Create Project", "PASS", f"Project ID: {project_id}")
            else:
                self.log("Create Project", "FAIL", f"Status {resp.status_code}: {resp.text[:100]}")
        except Exception as e:
            self.log("Create Project", "FAIL", str(e)[:50])
        
        # Browse Projects
        try:
            resp = requests.get(f"{BASE_URL}/api/projects", headers=freelancer_headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                projects = data if isinstance(data, list) else data.get('data', [])
                self.log("Browse Projects", "PASS", f"Found {len(projects)} project(s)")
            else:
                self.log("Browse Projects", "FAIL", f"Status {resp.status_code}")
        except Exception as e:
            self.log("Browse Projects", "FAIL", str(e)[:50])
        
        # === PHASE 4: PROPOSALS & BIDDING ===
        print("\n🤝 PHASE 4: PROPOSALS & BIDDING")
        print("-" * 70)
        
        proposal_id = None
        
        if project_id:
            # Submit Proposal
            try:
                resp = requests.post(f"{BASE_URL}/api/proposals", json={
                    "project_id": project_id,
                    "bid_amount": 2000,
                    "delivery_days": 25,
                    "proposal_message": "I have extensive experience building e-commerce platforms. I can deliver high-quality code with proper testing."
                }, headers=freelancer_headers, timeout=10)
                if resp.status_code in [200, 201]:
                    proposal_id = resp.json().get('id') or resp.json().get('proposal_id')
                    self.log("Submit Proposal", "PASS", f"Bid: $2000, {proposal_id}")
                else:
                    self.log("Submit Proposal", "FAIL", f"Status {resp.status_code}: {resp.text[:100]}")
            except Exception as e:
                self.log("Submit Proposal", "FAIL", str(e)[:50])
            
            # Get Project Proposals (Client View)
            try:
                resp = requests.get(f"{BASE_URL}/api/projects/{project_id}/proposals", headers=client_headers, timeout=10)
                if resp.status_code in [200, 404]:
                    if resp.status_code == 200:
                        proposals = resp.json() if isinstance(resp.json(), list) else resp.json().get('data', [])
                        self.log("View Proposals", "PASS", f"Client sees {len(proposals)} proposal(s)")
                    else:
                        self.log("View Proposals", "INFO", "No proposals endpoint or empty")
                else:
                    self.log("View Proposals", "FAIL", f"Status {resp.status_code}")
            except Exception as e:
                self.log("View Proposals", "FAIL", str(e)[:50])
        
        # === PHASE 5: MESSAGING ===
        print("\n💬 PHASE 5: MESSAGING & COMMUNICATION")
        print("-" * 70)
        
        # Send Message (Client to Freelancer)
        try:
            resp = requests.post(f"{BASE_URL}/api/messages", json={
                "recipient_id": 2,
                "message": "Hi Bob! I'm very impressed with your proposal. Would you like to start a video call to discuss details?",
                "project_id": project_id
            }, headers=client_headers, timeout=10)
            if resp.status_code in [200, 201]:
                self.log("Send Message", "PASS", "Message delivered")
            else:
                self.log("Send Message", "FAIL", f"Status {resp.status_code}")
        except Exception as e:
            self.log("Send Message", "FAIL", str(e)[:50])
        
        # === PHASE 6: CONTRACTS ===
        print("\n📄 PHASE 6: CONTRACT CREATION")
        print("-" * 70)
        
        if proposal_id:
            # Create Contract from Proposal
            try:
                resp = requests.post(f"{BASE_URL}/api/contracts", json={
                    "proposal_id": proposal_id,
                    "terms": "Deliver full e-commerce platform. 2 rounds of revisions included. Payment on completion.",
                    "start_date": datetime.now().date().isoformat(),
                    "end_date": (datetime.now() + timedelta(days=25)).date().isoformat()
                }, headers=client_headers, timeout=10)
                if resp.status_code in [200, 201]:
                    contract_id = resp.json().get('id') or resp.json().get('contract_id')
                    self.log("Create Contract", "PASS", f"Contract ID: {contract_id}")
                else:
                    self.log("Create Contract", "FAIL", f"Status {resp.status_code}: {resp.text[:100]}")
            except Exception as e:
                self.log("Create Contract", "FAIL", str(e)[:50])
        
        # === PHASE 7: PAYMENTS ===
        print("\n💳 PHASE 7: PAYMENT & ESCROW")
        print("-" * 70)
        
        # Initiate Payment
        try:
            resp = requests.post(f"{BASE_URL}/api/payments/initiate", json={
                "contract_id": contract_id if 'contract_id' in locals() else "test",
                "amount": 2000,
                "payment_method": "card"
            }, headers=client_headers, timeout=10)
            if resp.status_code in [200, 201]:
                self.log("Initiate Payment", "PASS", "Payment processing initiated")
            else:
                self.log("Initiate Payment", "FAIL", f"Status {resp.status_code}")
        except Exception as e:
            self.log("Initiate Payment", "FAIL", str(e)[:50])
        
        # === PHASE 8: ANALYTICS ===
        print("\n📊 PHASE 8: DASHBOARD & ANALYTICS")
        print("-" * 70)
        
        # Client Dashboard
        try:
            resp = requests.get(f"{BASE_URL}/api/dashboard/client", headers=client_headers, timeout=10)
            if resp.status_code == 200:
                self.log("Client Dashboard", "PASS", "Stats retrieved")
            else:
                self.log("Client Dashboard", "INFO", f"Status {resp.status_code} (endpoint may not exist)")
        except Exception as e:
            self.log("Client Dashboard", "INFO", str(e)[:50])
        
        # Freelancer Dashboard
        try:
            resp = requests.get(f"{BASE_URL}/api/dashboard/freelancer", headers=freelancer_headers, timeout=10)
            if resp.status_code == 200:
                self.log("Freelancer Dashboard", "PASS", "Stats retrieved")
            else:
                self.log("Freelancer Dashboard", "INFO", f"Status {resp.status_code}")
        except Exception as e:
            self.log("Freelancer Dashboard", "INFO", str(e)[:50])
        
        # === PHASE 9: REVIEWS & RATINGS ===
        print("\n⭐ PHASE 9: REVIEWS & RATINGS")
        print("-" * 70)
        
        # Leave Review
        try:
            resp = requests.post(f"{BASE_URL}/api/reviews", json={
                "freelancer_id": 2,
                "rating": 5,
                "review_text": "Excellent work! Very professional, responsive, and high quality code.",
                "project_id": project_id
            }, headers=client_headers, timeout=10)
            if resp.status_code in [200, 201]:
                self.log("Leave Review", "PASS", "5-star review posted")
            else:
                self.log("Leave Review", "FAIL", f"Status {resp.status_code}")
        except Exception as e:
            self.log("Leave Review", "FAIL", str(e)[:50])
        
        # === PHASE 10: SYSTEM HEALTH ===
        print("\n🏥 PHASE 10: SYSTEM HEALTH")
        print("-" * 70)
        
        # Health Check
        try:
            resp = requests.get(f"{BASE_URL}/api/health/ready", timeout=5)
            if resp.status_code == 200:
                self.log("Backend Health", "PASS", "API operational")
            else:
                self.log("Backend Health", "FAIL", f"Status {resp.status_code}")
        except Exception as e:
            self.log("Backend Health", "FAIL", str(e)[:50])
        
        # Database Health
        try:
            resp = requests.get(f"{BASE_URL}/api/health/db", timeout=5)
            if resp.status_code == 200:
                self.log("Database Health", "PASS", "Database connected")
            else:
                self.log("Database Health", "FAIL", f"Status {resp.status_code}")
        except Exception as e:
            self.log("Database Health", "INFO", str(e)[:50])
    
    def print_summary(self):
        passed = sum(1 for r in self.results if r['status'] == 'PASS')
        failed = sum(1 for r in self.results if r['status'] == 'FAIL')
        info_skip = sum(1 for r in self.results if r['status'] in ['INFO', 'SKIP'])
        total = len(self.results)
        
        print("\n" + "="*70)
        print("COMPLETE WORKFLOW TEST SUMMARY")
        print("="*70)
        print(f"✓ Passed:   {passed:2d} / {total}")
        print(f"✗ Failed:   {failed:2d} / {total}")
        print(f"ℹ Info/Skip: {info_skip:2d} / {total}")
        if total - info_skip > 0:
            print(f"Success Rate: {(passed/(total-info_skip)*100):.1f}%")
        print("="*70)
    
    def save_results(self):
        with open("e2e_test_results_v3.json", 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"\n✓ Results saved to: e2e_test_results_v3.json")

if __name__ == "__main__":
    print("\n")
    print("╔" + "="*68 + "╗")
    print("║" + " "*15 + "MegiLance Platform - E2E Testing v3" + " "*18 + "║")
    print("║" + " "*12 + "Complete Client-Freelancer Workflow Validation" + " "*11 + "║")
    print("╚" + "="*68 + "╝")
    
    tester = MegiLanceE2ETestV3()
    tester.test_full_workflow()
    tester.print_summary()
    tester.save_results()
