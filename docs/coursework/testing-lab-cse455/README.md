# CSE-455 Software Testing Lab
## User Profile Management Module Testing

**Course:** CSE-455 Software Testing Lab  
**Project:** MegiLance - User Profile Management Module  
**Methodology:** Scrum  
**Team:** Waqar Ul Mulk (Backend Lead)

---

## 📁 Directory Structure

```
testing-lab-cse455/
├── README.md (this file)
├── 01_Introduction_and_Objectives.md
├── 02_STLC_Documentation.md
├── 03_Black_Box_Testing.md
├── 04_Test_Cases_Detailed.md
├── 05_Bug_Reports.md
└── jira-import/
    ├── test-cases-import.csv
    ├── user-stories-import.csv
    └── bugs-import.csv
```

---

## 🎯 Lab Manual Coverage (Pages 0-25)

✅ **PAGE 0-2:** Course Information  
✅ **PAGE 3-4:** Lab Objectives & Outcomes  
✅ **PAGE 5-6:** Introduction to Software Testing  
✅ **PAGE 7-8:** Verification & Validation  
✅ **PAGE 9-11:** Software Testing Life Cycle (STLC)  
✅ **PAGE 12-15:** Black-Box Testing  
✅ **PAGE 16-18:** Equivalence Class Partitioning (ECP)  
✅ **PAGE 19-21:** Boundary Value Analysis (BVA)  
✅ **PAGE 22-23:** Test Case Design Format  
✅ **PAGE 24-25:** Bug Reporting Basics

---

## 🏗️ Module Under Test: User Profile Management

### Features Covered:
1. User Registration
2. User Login/Authentication
3. Profile Update (Name, Email, Skills, Bio)
4. Avatar Upload
5. Password Change
6. Account Settings
7. Profile Visibility Controls

### Testing Scope:
- **Black-Box Testing:** ECP, BVA, Decision Tables
- **Test Case Design:** 50+ test cases
- **Bug Tracking:** Severity & Priority classification
- **STLC Application:** Complete lifecycle documentation

---

## 📊 Jira Project Setup

### Project Configuration:
- **Project Name:** MegiLance User Profile Testing
- **Project Key:** MPUT
- **Project Type:** Scrum
- **Board:** Sprint Planning Board

### Jira Components:
1. Authentication
2. Profile Management
3. Settings
4. Security
5. File Upload

---

## 📥 Import Instructions

### Step 1: Create Jira Project
1. Go to Jira → Create Project
2. Select **Scrum** template
3. Name: `MegiLance User Profile Testing`
4. Key: `MPUT`

### Step 2: Import Test Cases
1. Go to Project Settings → Import
2. Select CSV import
3. Upload: `jira-import/test-cases-import.csv`
4. Map fields: Summary, Description, Issue Type, Priority

### Step 3: Import User Stories
1. Backlog → Import issues
2. Upload: `jira-import/user-stories-import.csv`

### Step 4: Import Bugs
1. Create Sprint → Import issues
2. Upload: `jira-import/bugs-import.csv`

---

## 🔄 Testing Workflow

```
Requirements → Test Planning → Test Design → Environment Setup → Execution → Closure
     ↓              ↓              ↓              ↓                ↓          ↓
  Analyze      Create Plan    Write Cases    Setup Tools      Run Tests   Report
```

---

## 📝 Deliverables

### Lab Submission Checklist:
- [x] STLC Diagram
- [x] Black-Box Test Cases (ECP & BVA)
- [x] Test Case Design Document
- [x] Bug Report Templates
- [x] Verification vs Validation Comparison
- [x] Jira Integration Files

---

## 🎓 Viva Questions Preparation

**Q1:** What is difference between Verification and Validation?  
**A1:** Verification: "Are we building it right?" (static), Validation: "Are we building right product?" (dynamic)

**Q2:** Explain STLC phases?  
**A2:** 6 phases - Requirement Analysis, Test Planning, Test Design, Environment Setup, Execution, Closure

**Q3:** What is Boundary Value Analysis?  
**A3:** Testing technique focusing on values at boundaries where errors commonly occur (min, min+1, max-1, max)

**Q4:** Difference between Error, Defect, and Failure?  
**A4:** Error (human mistake) → Defect (code bug) → Failure (system crash)

---

## 📞 Support

For questions or clarifications:
- Check individual documentation files
- Review Jira imported issues
- Refer to MegiLance backend test suite: `backend/tests/`

---

**Lab Status:** ✅ COMPLETE - Ready for Submission & Viva
