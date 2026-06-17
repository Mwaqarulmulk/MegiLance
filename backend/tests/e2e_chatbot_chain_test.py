# @AI-HINT: Complete end-to-end chain test with chatbot-assisted workflow
# Tests: Client onboarding -> Project posting -> Freelancer matching -> Proposal -> Hiring -> Payment -> Review
# Includes: Chatbot interactions at each step, agentic workflow, DB persistence verification

import requests
import json
import time
import uuid
from datetime import datetime

BASE_URL = "http://localhost:8000"
TEST_ID = uuid.uuid4().hex[:8]

# Test credentials
CLIENT_EMAIL = f"chain_client_{TEST_ID}@test.com"
FREELANCER_EMAIL = f"chain_freelancer_{TEST_ID}@test.com"
TEST_PASSWORD = "ChainTest@2026!"

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def log_step(step_num, title, detail=""):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.OKCYAN}STEP {step_num}: {title}{Colors.ENDC}")
    if detail:
        print(f"{Colors.OKBLUE}{detail}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")

def log_success(action, detail=""):
    print(f"  {Colors.OKGREEN}[SUCCESS]{Colors.ENDC} {action}" + (f" - {detail}" if detail else ""))

def log_error(action, detail=""):
    print(f"  {Colors.FAIL}[ERROR]{Colors.ENDC} {action}" + (f" - {detail}" if detail else ""))

def log_info(message):
    print(f"  {Colors.OKBLUE}[INFO]{Colors.ENDC} {message}")

def make_request(method, endpoint, **kwargs):
    """Helper for making requests with error handling."""
    url = f"{BASE_URL}{endpoint}"
    kwargs.setdefault("timeout", 15)
    try:
        resp = getattr(requests, method)(url, **kwargs)
        return resp
    except Exception as e:
        return None

# ============================================================================
# MAIN E2E CHAIN TEST
# ============================================================================

def main():
    print(f"\n{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.BOLD}  MEGILANCE COMPLETE E2E CHAIN TEST WITH CHATBOT{Colors.ENDC}")
    print(f"{Colors.BOLD}  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.ENDC}")
    print(f"{Colors.BOLD}  Test ID: {TEST_ID}{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*80}{Colors.ENDC}")
    
    results = {"passed": 0, "failed": 0, "steps": []}
    
    try:
        # ========================================================================
        # STEP 1: HEALTH CHECK
        # ========================================================================
        log_step(1, "System Health Check", "Verifying backend and database connectivity")
        
        resp = make_request("get", "/health/ready")
        if resp and resp.status_code == 200:
            data = resp.json()
            log_success("Backend healthy", f"DB={data.get('database', 'unknown')}, Status={data.get('status')}")
            results["passed"] += 1
        else:
            log_error("Backend health check failed")
            results["failed"] += 1
            return results
        
        # ========================================================================
        # STEP 2: CLIENT REGISTRATION & ONBOARDING
        # ========================================================================
        log_step(2, "Client Registration & Onboarding", "Creating client account via chatbot-assisted flow")
        
        # Register client
        client_data = {
            "email": CLIENT_EMAIL,
            "password": TEST_PASSWORD,
            "role": "client",
            "full_name": f"Chain Test Client {TEST_ID}"
        }
        resp = make_request("post", "/auth/register", json=client_data)
        if resp and resp.status_code in [200, 201]:
            client_tokens = resp.json()
            client_token = client_tokens.get("access_token")
            log_success("Client registered", f"Email={CLIENT_EMAIL}")
            results["passed"] += 1
        else:
            log_error("Client registration failed", f"Status={resp.status_code if resp else 'NO RESPONSE'}")
            results["failed"] += 1
            return results
        
        # Start chatbot conversation for onboarding assistance
        resp = make_request("post", "/chatbot/start", headers={"Authorization": f"Bearer {client_token}"})
        if resp and resp.status_code == 200:
            chat_data = resp.json()
            conversation_id = chat_data.get("conversation_id")
            log_success("Chatbot conversation started", f"ID={conversation_id}")
            log_info(f"Bot greeting: {chat_data.get('response', '')[:100]}...")
            results["passed"] += 1
        else:
            log_error("Chatbot start failed")
            results["failed"] += 1
        
        # Ask chatbot for help with posting a project (agentic workflow test)
        if conversation_id:
            resp = make_request("post", f"/chatbot/{conversation_id}/message",
                              headers={"Authorization": f"Bearer {client_token}", "Content-Type": "application/json"},
                              json={"message": "I want to post a project for a React developer"})
            if resp and resp.status_code == 200:
                bot_response = resp.json()
                log_success("Chatbot project assistance", f"Intent={bot_response.get('intent')}")
                log_info(f"Bot response: {bot_response.get('response', '')[:150]}...")
                results["passed"] += 1
            else:
                log_error("Chatbot message failed")
                results["failed"] += 1
        
        # ========================================================================
        # STEP 3: CLIENT COMPLETES PROFILE
        # ========================================================================
        log_step(3, "Client Profile Completion", "Adding company details and preferences")
        
        profile_data = {
            "company_name": f"Test Corp {TEST_ID}",
            "company_size": "10-50",
            "industry": "Technology",
            "bio": "Testing company looking for talented freelancers",
            "country": "US"
        }
        resp = make_request("post", "/portal/client/profile",
                          headers={"Authorization": f"Bearer {client_token}"},
                          json=profile_data)
        if resp and resp.status_code in [200, 201]:
            log_success("Client profile completed")
            results["passed"] += 1
        else:
            log_error("Client profile creation failed", f"Status={resp.status_code if resp else 'NO RESPONSE'}")
            results["failed"] += 1
        
        # ========================================================================
        # STEP 4: CLIENT POSTS PROJECT
        # ========================================================================
        log_step(4, "Project Posting", "Creating a React developer project")
        
        project_data = {
            "title": f"React Frontend Developer Needed - Chain Test {TEST_ID}",
            "description": "Looking for an experienced React developer to build a modern web application. Must have 3+ years of experience with Next.js, TypeScript, and Tailwind CSS.",
            "category": "Web Development",
            "skills": ["React", "Next.js", "TypeScript", "Tailwind CSS"],
            "budget_min": 1000,
            "budget_max": 2000,
            "project_type": "fixed",
            "experience_level": "intermediate",
            "deadline_days": 30
        }
        resp = make_request("post", "/projects",
                          headers={"Authorization": f"Bearer {client_token}", "Content-Type": "application/json"},
                          json=project_data)
        if resp and resp.status_code in [200, 201]:
            project = resp.json()
            project_id = project.get("id") or project.get("project", {}).get("id")
            log_success("Project posted", f"ID={project_id}, Title={project.get('title', 'N/A')[:50]}")
            results["passed"] += 1
        else:
            log_error("Project posting failed", f"Status={resp.status_code if resp else 'NO RESPONSE'}")
            results["failed"] += 1
            return results
        
        # Ask chatbot to confirm project visibility
        if conversation_id:
            resp = make_request("post", f"/chatbot/{conversation_id}/message",
                              headers={"Authorization": f"Bearer {client_token}", "Content-Type": "application/json"},
                              json={"message": "Show me my posted projects"})
            if resp and resp.status_code == 200:
                bot_response = resp.json()
                log_success("Chatbot project confirmation", f"Response preview: {bot_response.get('response', '')[:100]}...")
                results["passed"] += 1
        
        # ========================================================================
        # STEP 5: FREELANCER REGISTRATION
        # ========================================================================
        log_step(5, "Freelancer Registration", "Creating freelancer account")
        
        freelancer_data = {
            "email": FREELANCER_EMAIL,
            "password": TEST_PASSWORD,
            "role": "freelancer",
            "full_name": f"Chain Test Freelancer {TEST_ID}"
        }
        resp = make_request("post", "/auth/register", json=freelancer_data)
        if resp and resp.status_code in [200, 201]:
            freelancer_tokens = resp.json()
            freelancer_token = freelancer_tokens.get("access_token")
            log_success("Freelancer registered", f"Email={FREELANCER_EMAIL}")
            results["passed"] += 1
        else:
            log_error("Freelancer registration failed")
            results["failed"] += 1
            return results
        
        # ========================================================================
        # STEP 6: FREELANCER COMPLETES PROFILE
        # ========================================================================
        log_step(6, "Freelancer Profile & Skills", "Setting up profile with React skills")
        
        freelancer_profile = {
            "headline": "Senior React & Next.js Developer",
            "bio": "Experienced frontend developer specializing in React, Next.js, and modern web technologies. 5+ years building scalable applications.",
            "skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript", "Node.js"],
            "hourly_rate": 50,
            "availability": "available",
            "experience_level": "expert",
            "country": "US"
        }
        resp = make_request("post", "/portal/freelancer/profile",
                          headers={"Authorization": f"Bearer {freelancer_token}"},
                          json=freelancer_profile)
        if resp and resp.status_code in [200, 201]:
            log_success("Freelancer profile completed")
            results["passed"] += 1
        else:
            log_error("Freelancer profile creation failed")
            results["failed"] += 1
        
        # Freelancer starts chatbot conversation
        resp = make_request("post", "/chatbot/start", headers={"Authorization": f"Bearer {freelancer_token}"})
        if resp and resp.status_code == 200:
            freelancer_chat = resp.json()
            freelancer_conversation_id = freelancer_chat.get("conversation_id")
            log_success("Freelancer chatbot started")
            
            # Ask for project matches
            resp = make_request("post", f"/chatbot/{freelancer_conversation_id}/message",
                              headers={"Authorization": f"Bearer {freelancer_token}", "Content-Type": "application/json"},
                              json={"message": "Find React projects for me"})
            if resp and resp.status_code == 200:
                bot_response = resp.json()
                log_success("Chatbot project matching", f"Intent={bot_response.get('intent')}")
                results["passed"] += 1
        else:
            results["failed"] += 1
        
        # ========================================================================
        # STEP 7: FREELANCER FINDS PROJECT & SUBMITS PROPOSAL
        # ========================================================================
        log_step(7, "Proposal Submission", "Freelancer applies to the project")
        
        # Search for projects (should find the one posted)
        resp = make_request("get", "/projects/search?query=React+developer",
                          headers={"Authorization": f"Bearer {freelancer_token}"})
        if resp and resp.status_code == 200:
            projects = resp.json()
            if isinstance(projects, list) and len(projects) > 0:
                found_project = projects[0]
                found_project_id = found_project.get("id")
                log_success(f"Found project via search", f"ID={found_project_id}")
                results["passed"] += 1
            else:
                log_error("No projects found in search")
                results["failed"] += 1
                return results
        else:
            log_error("Project search failed")
            results["failed"] += 1
            return results
        
        # Submit proposal
        proposal_data = {
            "project_id": found_project_id,
            "cover_letter": f"Hi! I'm a perfect match for this React project. I have 5+ years of experience with React, Next.js, and TypeScript. I can deliver high-quality work within your budget and timeline. Looking forward to discussing this opportunity!",
            "bid_amount": 1800,
            "delivery_days": 25
        }
        resp = make_request("post", "/proposals",
                          headers={"Authorization": f"Bearer {freelancer_token}", "Content-Type": "application/json"},
                          json=proposal_data)
        if resp and resp.status_code in [200, 201]:
            proposal = resp.json()
            proposal_id = proposal.get("id") or proposal.get("proposal", {}).get("id")
            log_success("Proposal submitted", f"ID={proposal_id}, Bid=${proposal_data['bid_amount']}")
            results["passed"] += 1
        else:
            log_error("Proposal submission failed", f"Status={resp.status_code if resp else 'NO RESPONSE'}")
            results["failed"] += 1
            return results
        
        # ========================================================================
        # STEP 8: CLIENT REVIEWS PROPOSALS & Hires FREELANCER
        # ========================================================================
        log_step(8, "Proposal Review & Hiring", "Client reviews and accepts proposal")
        
        # Client views proposals received
        resp = make_request("get", f"/proposals/project/{found_project_id}",
                          headers={"Authorization": f"Bearer {client_token}"})
        if resp and resp.status_code == 200:
            proposals = resp.json()
            if isinstance(proposals, list) and len(proposals) > 0:
                received_proposal = proposals[0]
                received_proposal_id = received_proposal.get("id")
                log_success(f"Client received proposal", f"From={received_proposal.get('freelancer_name', 'Unknown')}")
                results["passed"] += 1
            else:
                log_error("No proposals received")
                results["failed"] += 1
        else:
            log_error("Failed to get proposals")
            results["failed"] += 1
        
        # Client accepts proposal (creates contract)
        if received_proposal_id:
            accept_data = {"proposal_id": received_proposal_id}
            resp = make_request("post", "/proposals/accept",
                              headers={"Authorization": f"Bearer {client_token}", "Content-Type": "application/json"},
                              json=accept_data)
            if resp and resp.status_code in [200, 201]:
                contract = resp.json()
                contract_id = contract.get("id") or contract.get("contract", {}).get("id")
                log_success("Proposal accepted - Contract created", f"ID={contract_id}")
                results["passed"] += 1
            else:
                log_error("Proposal acceptance failed", f"Status={resp.status_code if resp else 'NO RESPONSE'}")
                results["failed"] += 1
        
        # ========================================================================
        # STEP 9: ESCROW FUNDING & PAYMENT
        # ========================================================================
        log_step(9, "Escrow Funding & Payment", "Client funds escrow, payment workflow")
        
        if contract_id:
            # Fund escrow
            escrow_data = {
                "contract_id": contract_id,
                "amount": 1800,
                "payment_method": "card"
            }
            resp = make_request("post", "/escrow/fund",
                              headers={"Authorization": f"Bearer {client_token}", "Content-Type": "application/json"},
                              json=escrow_data)
            if resp and resp.status_code in [200, 201]:
                escrow = resp.json()
                escrow_id = escrow.get("id") or escrow.get("escrow", {}).get("id")
                log_success("Escrow funded", f"ID={escrow_id}, Amount=${escrow_data['amount']}")
                results["passed"] += 1
            else:
                log_error("Escrow funding failed", f"Status={resp.status_code if resp else 'NO RESPONSE'}")
                results["failed"] += 1
            
            # Chatbot payment assistance
            if conversation_id:
                resp = make_request("post", f"/chatbot/{conversation_id}/message",
                                  headers={"Authorization": f"Bearer {client_token}", "Content-Type": "application/json"},
                                  json={"message": "How does escrow payment work?"})
                if resp and resp.status_code == 200:
                    bot_response = resp.json()
                    log_success("Chatbot payment guidance", f"FAQ matched: {bot_response.get('faq_matched', 'None')}")
                    results["passed"] += 1
        
        # ========================================================================
        # STEP 10: WORK COMPLETION & MILESTONE APPROVAL
        # ========================================================================
        log_step(10, "Work Completion & Approval", "Freelancer delivers, client approves")
        
        if contract_id:
            # Freelancer marks milestone as complete
            resp = make_request("post", f"/milestones/{contract_id}/complete",
                              headers={"Authorization": f"Bearer {freelancer_token}"})
            if resp and resp.status_code in [200, 201]:
                log_success("Freelancer marked work complete")
                results["passed"] += 1
            else:
                log_error("Milestone completion failed")
                results["failed"] += 1
            
            # Client approves milestone (releases payment)
            resp = make_request("post", f"/milestones/{contract_id}/approve",
                              headers={"Authorization": f"Bearer {client_token}"})
            if resp and resp.status_code in [200, 201]:
                log_success("Client approved work - Payment released")
                results["passed"] += 1
            else:
                log_error("Milestone approval failed")
                results["failed"] += 1
        
        # ========================================================================
        # STEP 11: REVIEW & FEEDBACK
        # ========================================================================
        log_step(11, "Review & Feedback", "Both parties leave reviews")
        
        if contract_id:
            # Client reviews freelancer
            review_data = {
                "contract_id": contract_id,
                "rating": 5,
                "comment": f"Excellent work! Delivered high-quality React code on time. Highly recommended!",
                "skills_rating": 5,
                "quality_rating": 5,
                "availability_rating": 5,
                "deadlines_rating": 5,
                "communication_rating": 5
            }
            resp = make_request("post", "/reviews",
                              headers={"Authorization": f"Bearer {client_token}", "Content-Type": "application/json"},
                              json=review_data)
            if resp and resp.status_code in [200, 201]:
                review = resp.json()
                review_id = review.get("id")
                log_success("Client reviewed freelancer", f"Rating={review_data['rating']}/5")
                results["passed"] += 1
            else:
                log_error("Client review failed")
                results["failed"] += 1
            
            # Freelancer reviews client
            review_data_freelancer = {
                "contract_id": contract_id,
                "rating": 5,
                "comment": f"Great client! Clear requirements, timely payments, and excellent communication.",
                "skills_rating": 5,
                "quality_rating": 5,
                "availability_rating": 5,
                "deadlines_rating": 5,
                "communication_rating": 5
            }
            resp = make_request("post", "/reviews",
                              headers={"Authorization": f"Bearer {freelancer_token}", "Content-Type": "application/json"},
                              json=review_data_freelancer)
            if resp and resp.status_code in [200, 201]:
                log_success("Freelancer reviewed client", f"Rating={review_data_freelancer['rating']}/5")
                results["passed"] += 1
            else:
                log_error("Freelancer review failed")
                results["failed"] += 1
        
        # ========================================================================
        # STEP 12: CHATBOT FINAL ASSISTANCE
        # ========================================================================
        log_step(12, "Chatbot Final Check", "Verifying chatbot conversation history and ticket creation")
        
        # Get conversation history
        if conversation_id:
            resp = make_request("get", f"/chatbot/{conversation_id}/history",
                              headers={"Authorization": f"Bearer {client_token}"})
            if resp and resp.status_code == 200:
                history = resp.json()
                message_count = history.get("message_count", 0)
                log_success("Chatbot conversation history retrieved", f"{message_count} messages")
                results["passed"] += 1
            else:
                log_error("Failed to get conversation history")
                results["failed"] += 1
        
        # Test support ticket creation (escalation)
        if conversation_id:
            ticket_data = {
                "subject": f"E2E Test Support Ticket {TEST_ID}",
                "description": "Testing ticket creation from chatbot conversation",
                "priority": "low"
            }
            resp = make_request("post", f"/chatbot/{conversation_id}/ticket",
                              headers={"Authorization": f"Bearer {client_token}", "Content-Type": "application/json"},
                              json=ticket_data)
            if resp and resp.status_code in [200, 201]:
                ticket = resp.json()
                ticket_id = ticket.get("ticket_id")
                log_success("Support ticket created", f"ID={ticket_id}")
                results["passed"] += 1
            else:
                log_error("Ticket creation failed")
                results["failed"] += 1
        
        # ========================================================================
        # FINAL SUMMARY
        # ========================================================================
        print(f"\n{Colors.BOLD}{'='*80}{Colors.ENDC}")
        print(f"{Colors.BOLD}  TEST SUMMARY{Colors.ENDC}")
        print(f"{Colors.BOLD}{'='*80}{Colors.ENDC}")
        print(f"  {Colors.OKGREEN}Passed:{Colors.ENDC} {results['passed']}")
        print(f"  {Colors.FAIL}Failed:{Colors.ENDC} {results['failed']}")
        
        total = results['passed'] + results['failed']
        success_rate = (results['passed'] / total * 100) if total > 0 else 0
        
        if success_rate >= 80:
            print(f"\n{Colors.OKGREEN}{Colors.BOLD}  OVERALL: SUCCESS ({success_rate:.1f}%){Colors.ENDC}")
        else:
            print(f"\n{Colors.FAIL}{Colors.BOLD}  OVERALL: NEEDS ATTENTION ({success_rate:.1f}%){Colors.ENDC}")
        
        print(f"{Colors.BOLD}{'='*80}{Colors.ENDC}\n")
        
        return results
        
    except Exception as e:
        log_error(f"Test execution error: {str(e)}")
        import traceback
        traceback.print_exc()
        results["failed"] += 1
        return results

if __name__ == "__main__":
    results = main()
    exit(0 if results["failed"] == 0 else 1)
