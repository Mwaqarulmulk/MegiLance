# 📊 LAB MANUAL PAGES 9-11: SOFTWARE TESTING LIFE CYCLE (STLC)

---

## 🔄 What is STLC?

**Software Testing Life Cycle (STLC)** is a systematic approach to testing that defines specific phases/steps for performing quality testing activities.

**Key Points:**
- Parallel to SDLC (Software Development Life Cycle)
- Each phase has entry/exit criteria
- Deliverables defined for each phase
- Ensures organized testing process

---

## 📋 6 PHASES OF STLC

### **Phase 1: Requirement Analysis**

**Objective:** Understand what to test

**Entry Criteria:**
- Requirements document available
- Stakeholders accessible

**Activities:**
1. Study requirements (SRS, BRS documents)
2. Identify testable requirements
3. Determine test priorities
4. Identify testing types needed
5. Prepare RTM (Requirements Traceability Matrix)

**Deliverables:**
- RTM (Requirements Traceability Matrix)
- Test feasibility report
- Automation feasibility report

**Exit Criteria:**
- All requirements understood
- RTM approved
- Test strategy defined

**MegiLance Example:**
```
Requirement: "User must be able to update profile picture"

Testable Aspects:
- Upload JPG/PNG files ✓
- File size limit (10MB) ✓
- Display uploaded image ✓
- Delete existing image ✓
- Security: Only owner can update ✓
```

---

### **Phase 2: Test Planning**

**Objective:** Plan testing activities & resources

**Entry Criteria:**
- Requirements analysis complete
- RTM available

**Activities:**
1. Create Test Plan document
2. Estimate effort & cost
3. Define test strategy
4. Identify resources (tools, people)
5. Define roles & responsibilities
6. Set timelines & milestones

**Deliverables:**
- Test Plan document
- Test Effort Estimation document
- Test Strategy document

**Exit Criteria:**
- Test plan approved
- Resources allocated
- Schedule finalized

**MegiLance Test Plan:**
```
Module: User Profile Management
Estimated Effort: 40 hours
Team: 2 testers
Duration: 1 week
Tools: Postman, Jest, Pytest
Environments: Dev, Staging, Production
```

---

### **Phase 3: Test Case Design**

**Objective:** Create detailed test cases

**Entry Criteria:**
- Test plan approved
- Requirements clear

**Activities:**
1. Write test cases (with steps)
2. Review test cases
3. Create test data
4. Prepare traceability matrix
5. Design positive & negative scenarios

**Deliverables:**
- Test Cases document
- Test Data
- Updated RTM

**Exit Criteria:**
- All test cases written & reviewed
- Test data prepared
- Test cases mapped to requirements

**MegiLance Test Case Example:**
```
TC-001: Valid Profile Update
Precondition: User logged in
Steps:
  1. Navigate to /profile/edit
  2. Change bio to "Expert Developer"
  3. Click "Save"
Expected: Profile updated, success message shown
Priority: High
```

---

### **Phase 4: Test Environment Setup**

**Objective:** Prepare testing infrastructure

**Entry Criteria:**
- Test plan available
- Access credentials provided

**Activities:**
1. Setup test servers
2. Install required software
3. Configure databases
4. Prepare test data
5. Verify environment readiness
6. Perform smoke testing

**Deliverables:**
- Environment setup document
- Test data
- Smoke test results

**Exit Criteria:**
- Environment ready
- All tools installed
- Connectivity verified
- Smoke tests passed

**MegiLance Environment:**
```
Test Server: http://localhost:8000
Database: Turso (test instance)
Tools: Postman, VS Code, Git
Test Users: 10 pre-seeded accounts
Test Data: 20 sample projects, 30 proposals
```

---

### **Phase 5: Test Execution**

**Objective:** Execute test cases & log results

**Entry Criteria:**
- Test cases ready
- Environment setup complete
- Test data available

**Activities:**
1. Execute test cases
2. Document results (Pass/Fail)
3. Log defects in bug tracker
4. Retest fixed bugs
5. Map defects to test cases
6. Track test coverage

**Deliverables:**
- Test execution report
- Defect report
- Updated RTM with status

**Exit Criteria:**
- All test cases executed
- Defects logged & tracked
- Critical bugs fixed
- Test coverage achieved

**MegiLance Execution:**
```
Total Test Cases: 50
Executed: 50
Passed: 45
Failed: 5
Blocked: 0
Coverage: 90%
```

---

### **Phase 6: Test Closure**

**Objective:** Finalize testing activities

**Entry Criteria:**
- Test execution complete
- Exit criteria met

**Activities:**
1. Evaluate test completion
2. Document test summary
3. Analyze defects
4. Identify process improvements
5. Archive test artifacts
6. Conduct closure meeting

**Deliverables:**
- Test Summary Report
- Metrics & Statistics
- Lessons Learned document

**Exit Criteria:**
- All planned tests executed
- Critical bugs fixed
- Test report approved
- Artifacts archived

**MegiLance Closure:**
```
Total Defects: 12
Critical: 2 (Fixed)
High: 3 (Fixed)
Medium: 5 (Fixed)
Low: 2 (Deferred)
Test Effectiveness: 94%
```

---

## 📊 STLC DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    STLC FLOW DIAGRAM                        │
└─────────────────────────────────────────────────────────────┘

    ┌──────────────────────┐
    │  1. REQUIREMENT      │
    │     ANALYSIS         │
    │  ─────────────────   │
    │  • Study docs        │
    │  • Identify tests    │
    │  • Create RTM        │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  2. TEST PLANNING    │
    │  ─────────────────   │
    │  • Test strategy     │
    │  • Resource plan     │
    │  • Schedule          │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  3. TEST CASE        │
    │     DESIGN           │
    │  ─────────────────   │
    │  • Write cases       │
    │  • Test data         │
    │  • Review            │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  4. ENVIRONMENT      │
    │     SETUP            │
    │  ─────────────────   │
    │  • Setup servers     │
    │  • Install tools     │
    │  • Smoke test        │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  5. TEST EXECUTION   │
    │  ─────────────────   │
    │  • Run tests         │
    │  • Log defects       │
    │  • Retest            │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  6. TEST CLOSURE     │
    │  ─────────────────   │
    │  • Summary report    │
    │  • Metrics           │
    │  • Archive           │
    └──────────────────────┘
```

---

## 🎯 STLC Applied to MegiLance User Profile Module

### Complete Implementation:

| Phase | Status | Details |
|-------|--------|---------|
| **1. Requirement Analysis** | ✅ Done | Analyzed 7 profile features |
| **2. Test Planning** | ✅ Done | 40-hour plan, 2 testers |
| **3. Test Case Design** | ✅ Done | 50 test cases written |
| **4. Environment Setup** | ✅ Done | Dev & staging ready |
| **5. Test Execution** | 🔄 Ongoing | 90% complete |
| **6. Test Closure** | ⏳ Pending | After execution |

---

## 📋 Requirements Traceability Matrix (RTM)

| Req ID | Requirement | Test Case IDs | Status |
|--------|-------------|---------------|--------|
| REQ-001 | User Registration | TC-001 to TC-005 | ✅ Covered |
| REQ-002 | User Login | TC-006 to TC-010 | ✅ Covered |
| REQ-003 | Profile Update | TC-011 to TC-020 | ✅ Covered |
| REQ-004 | Avatar Upload | TC-021 to TC-025 | ✅ Covered |
| REQ-005 | Password Change | TC-026 to TC-030 | ✅ Covered |
| REQ-006 | Settings Update | TC-031 to TC-040 | ✅ Covered |
| REQ-007 | Profile Delete | TC-041 to TC-045 | ✅ Covered |

**Total Coverage:** 100% (45/45 requirements mapped)

---

## 📝 Lab Exercise Answers (Pages 9-11)

### Q1: List and explain STLC phases

**Answer:**
1. **Requirement Analysis:** Understand what to test
2. **Test Planning:** Plan resources & strategy
3. **Test Case Design:** Write detailed test cases
4. **Environment Setup:** Prepare testing infrastructure
5. **Test Execution:** Run tests & log results
6. **Test Closure:** Finalize & document

### Q2: What is RTM?

**Answer:**
RTM (Requirements Traceability Matrix) maps requirements to test cases, ensuring:
- All requirements are tested
- No duplicate test cases
- Coverage is measurable
- Impact analysis is easier

### Q3: Difference between STLC and SDLC?

**Answer:**
- **SDLC:** Development lifecycle (planning, design, coding, testing, deployment)
- **STLC:** Testing lifecycle (analysis, planning, design, setup, execution, closure)
- STLC is part of SDLC, runs parallel to development

---

## 🎓 Viva Preparation

**Q: Explain STLC phases in 1 minute**

**Answer:**
"STLC has 6 phases:
1. **Analysis** - Understand requirements
2. **Planning** - Plan testing activities
3. **Design** - Write test cases
4. **Setup** - Prepare environment
5. **Execution** - Run tests and log bugs
6. **Closure** - Final report and archive

Each phase has entry criteria, activities, deliverables, and exit criteria."

---

**Status:** ✅ COMPLETE - STLC Documentation Ready

**Next:** Black-Box Testing Techniques (Pages 12-21)
