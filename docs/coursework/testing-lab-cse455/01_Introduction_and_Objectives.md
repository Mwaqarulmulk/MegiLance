# 📘 LAB MANUAL PAGES 0-8: INTRODUCTION & FUNDAMENTALS

---

## PAGE 0-2: COURSE INFORMATION

**Course Title:** Software Testing Lab  
**Course Code:** CSE-455  
**Credit Hours:** 1(0+1)  
**Semester:** Spring 2024  
**Version:** 2.0  
**Institution:** COMSATS University Islamabad  
**Department:** Computer Science  
**Lab Duration:** 3 hours/week

**Instructor Details:**  
Name: [To be filled]  
Email: [To be filled]  
Office Hours: [To be filled]

---

## PAGE 3-4: LAB OBJECTIVES & COURSE OUTCOMES

### 🎯 Lab Objectives

1. **Understand Software Testing Fundamentals**
   - Learn basic testing concepts and terminology
   - Understand importance of testing in SDLC

2. **Apply Testing Techniques**
   - Master black-box testing methods
   - Learn white-box testing basics
   - Practice automation fundamentals

3. **Develop Test Cases**
   - Write comprehensive test cases
   - Use industry-standard formats
   - Document test results effectively

4. **Identify and Report Bugs**
   - Detect software defects
   - Document bugs systematically
   - Classify severity and priority

### 📊 Course Learning Outcomes (CLOs)

| CLO | Description | Bloom's Level | Assessment |
|-----|-------------|---------------|------------|
| **CO1** | Understand testing concepts and STLC | Knowledge | Quiz, Viva |
| **CO2** | Apply black-box testing techniques | Application | Lab Tasks |
| **CO3** | Apply white-box testing techniques | Application | Lab Tasks |
| **CO4** | Learn automation testing basics | Application | Final Project |

### 🎓 Mapping to Program Outcomes (PLOs)

- **PLO-3:** Design/Development of Solutions
- **PLO-5:** Modern Tool Usage
- **PLO-6:** Engineering and Society

---

## PAGE 5-6: INTRODUCTION TO SOFTWARE TESTING

### 🔍 What is Software Testing?

**Definition:**  
Software Testing is the process of evaluating a software application to find differences between expected and actual behavior. It ensures the software product is defect-free and meets requirements.

### ❓ Why Testing is Required?

1. **Identify Defects:** Find bugs before users do
2. **Quality Assurance:** Ensure product meets standards
3. **Customer Satisfaction:** Deliver reliable software
4. **Cost Reduction:** Fix bugs early (cheaper than post-release)
5. **Security:** Identify vulnerabilities
6. **Compliance:** Meet regulatory requirements

### 📈 Cost of Bug Fixing

| Phase | Cost Factor |
|-------|-------------|
| Requirements | 1x |
| Design | 5x |
| Development | 10x |
| Testing | 15x |
| Production | 100x |

> **Key Insight:** Earlier detection = Lower cost

### 🔄 Testing vs Debugging

| Testing | Debugging |
|---------|-----------|
| Finding defects | Fixing defects |
| Performed by testers | Performed by developers |
| Planned activity | Reactive activity |
| Proves software has bugs | Removes bugs |
| Verification & Validation | Correction activity |

---

## PAGE 6: IMPORTANT TERMINOLOGY

### 🔑 Key Definitions

1. **Error (Mistake)**
   - Definition: Human action that produces incorrect result
   - Example: Developer writes wrong logic
   - Cause: Lack of knowledge, miscommunication

2. **Defect (Bug/Fault)**
   - Definition: Flaw in code that causes incorrect behavior
   - Example: Wrong condition in if statement
   - Location: In source code or design documents

3. **Failure**
   - Definition: Deviation of software from expected behavior
   - Example: Application crashes or wrong output
   - Result: Visible to end user

### 🔗 Relationship

```
Error (Human Mistake)
   ↓
Defect (Code Bug)
   ↓
Failure (Software Crash)
```

### 📝 Real-World Example: MegiLance User Profile

**Error:** Developer misunderstands requirement  
→ Thinks password must be minimum 6 characters

**Defect:** Code written with wrong validation  
```python
if len(password) < 6:  # Wrong! Should be 8
    return "Password too short"
```

**Failure:** User enters 7-character password  
→ System accepts it (security risk!)  
→ Account gets hacked due to weak password

---

## PAGE 7-8: VERIFICATION & VALIDATION

### ✅ Verification

**Question:** "Are we building the product **right**?"

**Characteristics:**
- Static testing (no code execution)
- Reviews, inspections, walkthroughs
- Done before validation
- Checks if specifications are met

**Activities:**
1. Requirements review
2. Design review
3. Code review
4. Test case review

**Example in MegiLance:**
- Review user registration API design
- Check if password hashing is in design
- Verify JWT token specs match requirements

### ✅ Validation

**Question:** "Are we building the **right** product?"

**Characteristics:**
- Dynamic testing (code execution required)
- Actual testing of software
- Done after verification
- Checks if user needs are met

**Activities:**
1. Unit testing
2. Integration testing
3. System testing
4. User acceptance testing (UAT)

**Example in MegiLance:**
- Test user registration API endpoint
- Verify password is actually hashed in database
- Check JWT tokens work correctly

### 📊 Comparison Table

| Aspect | Verification | Validation |
|--------|-------------|------------|
| **Focus** | Process | Product |
| **Question** | Built right? | Right product? |
| **Type** | Static | Dynamic |
| **Execution** | No | Yes |
| **When** | Before coding | After coding |
| **Who** | Reviewers | Testers |
| **Cost** | Low | High |
| **Methods** | Reviews, Inspections | Testing |

### 🎯 Applied to MegiLance User Profile Module

#### Verification Activities:
- ✅ Review user model schema design
- ✅ Inspect authentication logic code
- ✅ Walkthrough profile update flow
- ✅ Check API documentation completeness

#### Validation Activities:
- ✅ Test user registration endpoint
- ✅ Verify login with correct/wrong credentials
- ✅ Update profile fields and check database
- ✅ Upload avatar and verify file storage
- ✅ Change password and test new credentials

---

## 📝 Lab Exercise Answers (Pages 5-8)

### Q1: Define Error, Defect, and Failure with examples

**Answer:**
- **Error:** Programmer's mistake (typo, wrong logic)
  - Example: Writing `<` instead of `<=` in age validation
  
- **Defect:** Bug in code or design
  - Example: Function returns wrong data type
  
- **Failure:** System misbehaves
  - Example: App crashes when clicking "Save Profile"

### Q2: Why is testing important?

**Answer:**
1. Prevents user-facing bugs (better UX)
2. Reduces maintenance costs (fix early = cheaper)
3. Ensures security (no vulnerabilities)
4. Builds customer trust (reliable product)
5. Meets compliance requirements

### Q3: Difference between Testing and Debugging?

**Answer:**
- **Testing:** Find bugs → done by testers → planned
- **Debugging:** Fix bugs → done by developers → reactive

### Q4: Verification vs Validation with example

**Answer:**

**Verification (Static):**
- Check design doc says "password must be 8+ chars"
- Review code: `if len(password) < 8: raise Error`
- Confirm specs match implementation

**Validation (Dynamic):**
- Test: Enter 7-char password → Should reject ✅
- Test: Enter 8-char password → Should accept ✅
- Test: Enter 50-char password → Should accept ✅

---

## 🎓 Viva Preparation Tips

### Common Questions:

1. **"What is software testing?"**
   - Process of finding defects to ensure quality

2. **"Explain error, defect, failure chain"**
   - Error (human) → Defect (code) → Failure (crash)

3. **"Give real example from your project"**
   - Registration bug: Wrong regex → invalid emails accepted → users can't login

4. **"Verification vs Validation in one line?"**
   - Verification = Static review, Validation = Dynamic execution

5. **"Why test early?"**
   - Cost: 1x at requirements, 100x in production

---

**Status:** ✅ COMPLETE - Ready for Lab Submission

**Next:** Continue to STLC Documentation (Pages 9-11)
