# MegiLance System Test Cases

> **Source**: Final Year Project Report - Chapter 4 (System Testing)
> **Status**: Acceptance Criteria for FYP-I

This document lists the core test cases defined for the MegiLance platform, covering functional, AI/Blockchain, and non-functional requirements.

## 1. Core Functional Test Cases (TC-001 to TC-015)

| TC ID | Test Case Description | Pre-Condition | Expected Result |
|-------|-----------------------|---------------|-----------------|
| TC-001 | User Registration (Client) | User is on Sign Up page | Account created, redirected to dashboard |
| TC-002 | User Registration (Freelancer) | User is on Sign Up page | Account created, redirected to profile setup |
| TC-003 | User Login (Valid) | Registered user exists | Login successful, JWT token issued |
| TC-004 | User Login (Invalid) | User exists | Error message displayed, access denied |
| TC-005 | Post a Project | Client logged in | Project listed in marketplace |
| TC-006 | Search Projects | Projects exist | Relevant projects displayed based on query |
| TC-007 | Submit Proposal | Freelancer logged in, Project open | Proposal submitted successfully |
| TC-008 | View Proposals | Client logged in, Project has proposals | List of proposals displayed |
| TC-009 | Accept Proposal | Client logged in, Proposal exists | Contract created, status updated to 'Active' |
| TC-010 | Submit Work | Freelancer logged in, Contract active | Work submission recorded |
| TC-011 | Approve Work | Client logged in, Work submitted | Contract completed, payment released (simulated) |
| TC-012 | Leave Review | Contract completed | Review saved, rating updated |
| TC-013 | View Profile | User logged in | Profile details displayed correctly |
| TC-014 | Edit Profile | User logged in | Profile updates saved |
| TC-015 | Admin User Management | Admin logged in | User list displayed, can deactivate users |

## 2. AI and Blockchain Test Cases (TC-016 to TC-021)

| TC ID | Test Case Description | Pre-Condition | Expected Result |
|-------|-----------------------|---------------|-----------------|
| TC-016 | AI Price Prediction | Client creating project | Estimated price range displayed based on skills |
| TC-017 | AI Sentiment Analysis | Client submitting review | Sentiment score calculated (Positive/Negative) |
| TC-018 | AI Ranking Calculation | Freelancer has history | Rank score updated based on metrics |
| TC-019 | Smart Contract Deployment | Blockchain network active | Contract address returned |
| TC-020 | Escrow Funding (Simulated) | Contract initiated | Funds locked in smart contract (mock/testnet) |
| TC-021 | Escrow Release (Simulated) | Work approved | Funds transferred to freelancer (mock/testnet) |

## 3. Non-Functional Test Cases (TC-022 to TC-028)

| TC ID | Test Case Description | Metric/Constraint | Expected Result |
|-------|-----------------------|-------------------|-----------------|
| TC-022 | API Response Time | Performance | < 200ms for core endpoints |
| TC-023 | Concurrent Users | Scalability | System handles 50+ concurrent users without crash |
| TC-024 | Password Security | Security | Passwords hashed with bcrypt |
| TC-025 | Token Expiry | Security | Access token expires after 30 mins |
| TC-026 | Mobile Responsiveness | Usability | UI adapts to mobile screen sizes |
| TC-027 | Cross-Browser Compatibility | Usability | Functions correctly on Chrome, Firefox, Edge |
| TC-028 | Database Integrity | Reliability | No data corruption during concurrent writes |
