# MegiLance - Final Year Project Complete Report

> **Session 2022-2026** | Department of Computer Science | COMSATS University Islamabad, Lahore Campus

---

## Abstract

The global gig economy, while a vital source of economic growth, is fundamentally hindered by systemic issues within centralized platforms, including excessive transaction fees, restricted payment gateway access, and opaque reputation systems. This financial friction and lack of trust disproportionately impact local freelancers, impeding their ability to compete globally and secure fair compensation.

To mitigate these issues, the **MegiLance** project proposes a novel, hybrid decentralized platform that strategically integrates:
- **Artificial Intelligence (AI)** for enhanced intelligence and objectivity
- **Blockchain technology** for secure, trustless transactions

### Primary Objectives
1. Implement a **Smart Contract-Based Escrow** system to guarantee low-cost, trustless payments
2. Deploy **AI modules** for objective freelancer ranking, review sentiment analysis, and price forecasting

### Technology Stack
Utilizing a modern stack of **Next.js 16**, **FastAPI**, and **Solidity**, the project delivers a secure, transparent, and equitable marketplace.

### Expected Outcomes
- Significantly reduced transaction costs
- Increased financial security
- A more merit-based system for talent discovery

---

## Table of Contents

1. [Introduction](#introduction)
2. [Problem Statement](#problem-statement)
3. [Proposed Solution](#proposed-solution)
4. [Technical Implementation](#technical-implementation)
5. [Main Objectives](#main-objectives)
6. [Requirements Analysis](#requirements-analysis)
7. [System Design](#system-design)
8. [Implementation Details](#implementation-details)
9. [System Testing](#system-testing)
10. [Team & Acknowledgements](#team--acknowledgements)

---

## Introduction

The gig economy around the world has changed how people work, opening new doors for talented individuals to team up with customers across continents. In countries such as Pakistan, this shift hits harder - many young, tech-literate folks are ready to sell their talents abroad.

### The Global Gig Economy and Pakistan's Role

- The global gig economy is forecast to surpass **$455 billion**
- Pakistan has established itself as a major participant with freelance exports contributing **hundreds of millions of dollars annually**
- The nation's demographic dividend (large, young, educated populace) ideally positions it to capitalize on this trend

### Current Platform Problems

| Issue | Description |
|-------|-------------|
| **High Fees** | Major platforms charge 10-20% commission |
| **Payment Friction** | Traditional banks cause delays, fees, and poor exchange rates |
| **Limited Access** | Pakistani freelancers can't use PayPal, forced to use slower alternatives |
| **Opaque Rankings** | Rating systems don't always reflect real skill |

### Why MegiLance Exists

MegiLance tackles these issues head-on by building a fresh kind of freelance platform, mixing smart automation with blockchain trust, aiming for speed without sacrificing fairness or safety.

**Central Innovation**: A hybrid architecture utilizing:
- **Web2 technologies** (Next.js and FastAPI) for the user interface and core business logic
- **Web3 technologies** (Blockchain) for critical financial and reputation-based transactions

---

## Problem Statement

The freelancing market, particularly for professionals in Pakistan, is characterized by three critical, interconnected problems:

### 1. Financial Inefficiency and High Transaction Costs

- Big platforms take 10-20% from freelancers (stings more in lower-income countries)
- Pakistani freelancers can't use fast global payment options (PayPal not available)
- Fall back on methods like Payoneer or wire transfers with steep costs
- Payments delayed for days due to bank processing times

### 2. Trust Deficit

- Centralized platforms hold ultimate authority over funds and disputes
- Proprietary, opaque algorithms for talent ranking and dispute resolution
- Freelancers lack control over their reputation and earnings

### 3. Market Opacity and Pricing Uncertainty

- New freelancers often underprice their work due to lack of market intelligence
- "Race to the bottom" on price reduces earnings for everyone
- Clients struggle to efficiently filter and discover the best talent
- Reliance on basic keyword searches rather than sophisticated metrics

---

## Proposed Solution

MegiLance proposes a **Hybrid Decentralized Freelancing Hub** that directly tackles financial inefficiency, trust deficit, and market opacity.

### Core Solution: Hybrid Architecture

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Web2** | FastAPI + Next.js | Speed, ease, room to grow (profiles, projects, messages) |
| **Web3** | Solidity + Blockchain | Trust-critical operations (payments, escrow, contracts) |

### AI-Driven Intelligence and Objectivity

#### AI-Powered Talent Ranking
Machine learning model analyzes:
- Skills and expertise
- Project completion rate
- Communication metrics
- Verified reviews

Generates an **objective, transparent AI Ranking Score** more reliable than simple star ratings.

#### Review Sentiment Analysis
NLP model analyzes client review sentiment to:
- Flag potentially malicious or biased feedback
- Protect freelancer reputation from unfair attacks
- Provide quantifiable measure of emotional tone

#### Price Prediction and Guidance
AI model analyzes market data to provide:
- Data-driven **Price Forecast Range**
- Competitive pricing guidance for new freelancers
- Accurate budgeting help for clients

---

## Technical Implementation

### Frontend (Next.js 16 & TypeScript)

| Feature | Benefit |
|---------|---------|
| App Router | Modern routing with layouts |
| SSR + SSG | Fast page loads, better SEO |
| TypeScript | Type safety, fewer runtime bugs |
| CSS Modules | Scoped styling (3-file pattern) |

### Backend (FastAPI & Python)

| Feature | Benefit |
|---------|---------|
| Async/Await | Handle many users concurrently |
| Pydantic | Automatic data validation |
| Auto-docs | OpenAPI/Swagger generated |
| Dependency Injection | Clean, testable code |

### Database (Turso/libSQL)

| Feature | Benefit |
|---------|---------|
| Edge distribution | Low latency worldwide |
| Fast deployment | Quick iteration |
| SQL compatible | Future PostgreSQL migration path |

### Blockchain (Solidity Smart Contracts)

| Component | Function |
|-----------|----------|
| Escrow Contract | Lock funds until work approved |
| Release Logic | Automatic payment on milestone completion |
| Dispute Handling | On-chain arbitration records |

---

## Main Objectives

### Core Development Objectives
1. Build full web app with different user types (admin, client, freelancer) using Next.js 16 + TypeScript
2. Build fast backend using FastAPI to handle CRUD actions on Projects, Proposals, Reviews
3. Build safe login setup with JWT + bcrypt password protection
4. Set up database layout using SQLAlchemy + Turso

### Trust and Security Objectives
1. Design Smart Contract Escrow System using Solidity
2. Set up API routes for Web3 integration (contract uploads, fund releases)
3. Protect against SQL Injection, XSS using ORMs + Pydantic validation

### Intelligence and Scalability Objectives
1. Build AI service for ranking, sentiment analysis, price prediction
2. Build full UML documentation (Use Case, Activity, Sequence, Class, ERD, Collaboration)
3. Write testing strategy covering 30+ test cases

---

## Requirements Analysis

### Stakeholders

| Stakeholder | Role | Interest |
|-------------|------|----------|
| **Client** | Project poster | Find quality freelancers, secure payments |
| **Freelancer** | Service provider | Fair pay, transparent reputation, low fees |
| **Admin** | Platform operator | System health, dispute resolution |
| **Investor** | Future stakeholder | Technical rigor, scalability |

### Functional Requirements

#### Authentication & User Management (FR1-FR10)
- User registration with email verification
- JWT-based authentication with refresh tokens
- Role-based access control
- Profile management for all user types
- Password reset functionality

#### Project & Proposal Management (FR6-FR10)
- Project creation with AI price estimation
- Proposal submission and management
- Project filtering and search
- Milestone-based project tracking

#### Contract, Payment & Review (FR11-FR15)
- Smart contract escrow creation
- Milestone approval and payment release
- Review and rating system
- Dispute initiation and resolution

#### AI & Intelligence Features (FR16-FR20)
- AI-powered freelancer ranking
- Review sentiment analysis
- Price prediction engine
- Intelligent job matching

### Non-Functional Requirements

#### Performance (NFR1-NFR5)
- API response time < 750ms (P99)
- Page load time < 2 seconds
- Support 1000+ concurrent users
- 99% uptime target

#### Security (NFR6-NFR10)
- OWASP Top 10 compliance
- Encrypted data at rest and in transit
- Rate limiting on all endpoints
- Input validation on all forms

#### Usability (NFR11-NFR14)
- Mobile-responsive design
- WCAG 2.1 accessibility compliance
- Dark/Light theme support
- Multi-language ready

---

## System Design

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js 16    │    │    FastAPI      │    │   Turso DB      │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (libSQL)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌───────────┐   ┌───────────┐   ┌───────────┐
       │ AI Service│   │ Blockchain│   │   File    │
       │  (Python) │   │  Network  │   │  Storage  │
       └───────────┘   └───────────┘   └───────────┘
```

### Use Cases

#### UC1: Post a Project
- **Actor**: Client
- **Precondition**: Client is logged in
- **Flow**: Enter details → Get AI price forecast → Submit → Project published
- **Postcondition**: Project visible to freelancers

#### UC2: Submit a Proposal
- **Actor**: Freelancer
- **Precondition**: Freelancer is logged in, project is open
- **Flow**: View project → Write proposal → Set price/timeline → Submit
- **Postcondition**: Proposal visible to client

#### UC3: Accept Proposal and Initiate Contract
- **Actor**: Client
- **Precondition**: Proposals received
- **Flow**: Review proposals → Accept one → Fund escrow → Contract created
- **Postcondition**: Contract active, funds locked

#### UC4: Submit Work and Approve Payment
- **Actor**: Freelancer submits, Client approves
- **Precondition**: Contract active
- **Flow**: Submit deliverable → Client reviews → Approve → Funds released
- **Postcondition**: Payment complete, contract closed

#### UC5: Submit Review and Update Ranking
- **Actor**: Client or Freelancer
- **Precondition**: Contract completed
- **Flow**: Write review → Submit → AI analyzes sentiment → Update ranking
- **Postcondition**: Review visible, AI rank updated

#### UC6: Admin User Management
- **Actor**: Admin
- **Precondition**: Admin is logged in
- **Flow**: View users → Take action (suspend/verify/etc.) → Log action
- **Postcondition**: User status updated

### Database Schema

#### Core Entities
- **USER**: id, email, password_hash, role, created_at, ai_rank_score
- **PROJECT**: id, client_id, title, description, budget, status, ai_price_estimate
- **PROPOSAL**: id, project_id, freelancer_id, cover_letter, price, duration
- **CONTRACT**: id, project_id, proposal_id, escrow_address, status
- **REVIEW**: id, contract_id, rating, comment, sentiment_score
- **SMART_CONTRACT**: id, contract_id, blockchain_tx, status

---

## Implementation Details

### Core API Implementation (FastAPI)

#### Authentication Module
```python
# JWT Token Generation
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

#### Pydantic Schemas
All data ingress and egress controlled by Pydantic models ensuring:
- Data validation at API boundary
- Security against malformed requests
- Type safety throughout the application

### AI Service Implementation

#### Sentiment Analysis Endpoint
```python
# Backend call to AI Service
review_text = "The freelancer delivered excellent work."
response = requests.post(
    "http://ai-service:8001/api/ai/sentiment",
    json={"text": review_text}
)
sentiment_score = response.json().get("score")
# Expected response: {"score": 0.92, "sentiment": "Positive"}
```

#### Ranking Update Trigger
Designed as asynchronous, non-blocking call to prevent main application from waiting for ML processing.

### Smart Contract Escrow (Solidity)

```solidity
// Conceptual Smart Contract Structure
contract FreelanceEscrow {
    address public client;
    address public freelancer;
    uint256 public amount;
    bool public workApproved;
    
    function fundEscrow() external payable;
    function approveWork() external;
    function releaseFunds() internal;
    function initiateDispute() external;
}
```

---

## System Testing

### Test Categories

| Category | Count | Focus |
|----------|-------|-------|
| Core Functional | 15 | Authentication, CRUD, workflows |
| AI & Blockchain | 6 | Integration with specialized services |
| Non-Functional | 7 | Performance, security, usability |

### Core Functional Test Cases (TC-001 to TC-015)

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| TC-001 | User Registration | Account created, email sent |
| TC-002 | User Login | JWT tokens issued |
| TC-003 | Password Reset | Reset email sent |
| TC-004 | Profile Update | Changes persisted |
| TC-005 | Project Creation | Project published |
| TC-006 | AI Price Estimation | Price range returned |
| TC-007 | Proposal Submission | Proposal visible to client |
| TC-008 | Proposal Acceptance | Contract created |
| TC-009 | Escrow Funding | Funds locked |
| TC-010 | Work Submission | Deliverable uploaded |
| TC-011 | Work Approval | Funds released |
| TC-012 | Review Submission | Review published |
| TC-013 | Sentiment Analysis | Score calculated |
| TC-014 | Search/Filter | Correct results |
| TC-015 | Admin Actions | User status updated |

### AI & Blockchain Test Cases (TC-016 to TC-021)

| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| TC-016 | AI Matching | Relevant freelancers returned |
| TC-017 | Ranking Calculation | Score updated |
| TC-018 | Smart Contract Deploy | Contract address returned |
| TC-019 | Escrow Lock | Funds visible on-chain |
| TC-020 | Payment Release | Transaction confirmed |
| TC-021 | Dispute Logging | Record on blockchain |

### Testing Approach

#### Unit Testing
- **Scope**: Individual functions, methods, classes
- **Tools**: Pytest for FastAPI backend
- **Coverage**: Password hashing, JWT generation, Pydantic validation

#### Integration Testing
- **Scope**: Component interactions
- **Focus**: Frontend ↔ Backend, Backend ↔ Database, Backend ↔ AI/Web3

#### Acceptance Testing
- **System**: All test cases pass
- **User**: Dev team acts as users to verify complete workflows

---

## Team & Acknowledgements

### Team Roles and Responsibilities

| Role | Responsibilities |
|------|------------------|
| **Team Lead** | Architecture design, AI integration, documentation |
| **Backend Developer** | FastAPI implementation, database design, API security |
| **Frontend Developer** | Next.js UI, responsive design, theme implementation |

### Tools and Technologies

| Tool | Purpose |
|------|---------|
| Next.js 16 | Frontend framework |
| FastAPI | Backend framework |
| TypeScript | Type-safe JavaScript |
| Python 3.11 | Backend & AI language |
| Turso (libSQL) | Edge database |
| SQLAlchemy | ORM |
| Docker | Containerization |
| Git/GitHub | Version control |
| Figma | UI/UX design |
| VS Code | Development IDE |

### Acknowledgements

Thanks to everyone who helped during this Final Year Project:

- **Supervisor**: Dr. Junaid - for solid advice, honest feedback, and pushing when things got tough
- **Department**: Computer Science at COMSATS University Islamabad, Lahore Campus - for tools and learning environment
- **Team Members**: Muhammad Waqar Ul Mulk and Mujtaba - for sticking through every hurdle together
- **Family & Friends**: For constant support throughout the project

---

## Assumptions & Constraints

### Assumptions
1. Users possess basic technical literacy for web apps and crypto wallets
2. External services (Circle API, Ethereum testnet) are available
3. Sufficient training data can be acquired for AI models post-FYP
4. Turso database is scalable for prototype and initial launch

### Constraints
1. **Time**: 15-month academic timeline prioritized core Web2 marketplace
2. **Budget**: Minimal budget required cost-effective solutions
3. **Scope**: AI and Blockchain limited to design and API stub phase
4. **Team Size**: Small team limited parallel development capacity

---

## Scope Definition

### In-Scope Functionality
- ✅ User registration, profiles, dashboards
- ✅ Project posting and proposal submission
- ✅ Secure JWT authentication with role-based access
- ✅ Responsive UI with dark/light themes
- ✅ Full REST API with FastAPI
- ✅ Complete UML documentation
- ✅ Test cases for core functionality

### Out of Scope (Future Phases)
- ❌ Full AI model training and deployment
- ❌ Live blockchain smart contract deployment
- ❌ Real-time WebSocket chat
- ❌ Full CI/CD pipeline
- ❌ Native mobile applications

---

## Development Methodology

### Agile/Scrum Implementation

| Sprint | Focus | Deliverables |
|--------|-------|--------------|
| 1-2 | Project Setup | Repo, tooling, architecture docs |
| 3-4 | Core Backend | Auth, user CRUD, database models |
| 5-6 | Frontend Foundation | Components, routing, themes |
| 7-8 | Marketplace Features | Projects, proposals, contracts |
| 9-10 | AI Integration | Service stubs, API contracts |
| 11-12 | Testing & Polish | Test cases, bug fixes, documentation |
| 13-14 | Final Integration | End-to-end testing, deployment prep |
| 15 | Submission | Final report, presentation |

### Why Agile?
- **Flexibility**: Requirements could shift as AI/Blockchain scope became clear
- **Rapid Feedback**: Short sprints allowed quick iteration on UI/UX
- **Small Team**: Two-week sprints matched team capacity

---

## References

1. Upwork Annual Report - Platform commission and marketplace analysis
2. Fiverr Business Model - Gig-based marketplace study
3. Ethereum Smart Contracts - Solidity documentation
4. FastAPI Documentation - https://fastapi.tiangolo.com/
5. Next.js Documentation - https://nextjs.org/docs
6. Turso Database - https://turso.tech/
7. OWASP Top 10 - Security best practices
8. Pakistan Freelance Exports Report - Economic impact study
9. Global Gig Economy Forecast - Market size projections

---

## Appendices

### Appendix A: Turnitin Report
*Plagiarism check submitted separately*

### Appendix B: AI Detection Report
*AI content analysis submitted separately*

---

> **Document Version**: 1.0  
> **Last Updated**: December 2025  
> **Project Status**: FYP-I Complete
