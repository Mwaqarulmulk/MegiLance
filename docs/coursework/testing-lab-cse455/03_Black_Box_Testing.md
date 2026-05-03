# 🎯 LAB MANUAL PAGES 12-21: BLACK-BOX TESTING TECHNIQUES

---

## 📚 PAGE 12-15: BLACK-BOX TESTING OVERVIEW

### 🔍 What is Black-Box Testing?

**Definition:**  
Testing technique where the internal structure/code is **NOT known** to the tester. Focus is on **inputs and outputs** only.

**Also called:**
- Functional Testing
- Behavioral Testing
- Specification-based Testing

### 🎯 Characteristics

✅ **No Code Knowledge Required**
- Tester doesn't see implementation
- Focus on requirements & specifications
- Based on user perspective

✅ **Input-Output Focused**
- Provide inputs
- Observe outputs
- Compare with expected results

### 📊 Black-Box Testing Techniques

1. **Equivalence Class Partitioning (ECP)**
2. **Boundary Value Analysis (BVA)**
3. **Decision Table Testing**
4. **State Transition Testing**
5. **Use Case Testing**
6. **Error Guessing**

> **Lab Focus:** ECP and BVA (Most important for CSE-455)

---

## 📋 PAGES 16-18: EQUIVALENCE CLASS PARTITIONING (ECP)

### 🎯 What is ECP?

**Definition:**  
Divide input data into **equivalent classes** (partitions) where all values in a class are expected to behave similarly.

**Key Principle:**  
Test **one value** from each class instead of testing all possible values.

### 🔧 How to Apply ECP

**Step 1:** Identify input conditions  
**Step 2:** Divide into valid and invalid classes  
**Step 3:** Select one test value from each class  
**Step 4:** Write test cases  

### 📊 ECP Classification

| Type | Description |
|------|-------------|
| **Valid Equivalence Class** | Acceptable input values |
| **Invalid Equivalence Class** | Unacceptable input values |

---

### 🏗️ EXAMPLE 1: Age Validation (MegiLance User Registration)

**Requirement:**  
User age must be between **18 and 65** years (inclusive)

#### Step 1: Identify Input
- Input field: Age (integer)
- Valid range: 18-65

#### Step 2: Create Equivalence Classes

| Class ID | Type | Range | Description |
|----------|------|-------|-------------|
| **EC1** | Invalid | age < 18 | Below minimum |
| **EC2** | Valid | 18 ≤ age ≤ 65 | Within range |
| **EC3** | Invalid | age > 65 | Above maximum |

#### Step 3: Select Test Values

| Class | Test Value | Reason |
|-------|------------|--------|
| EC1 | 15 | Invalid (too young) |
| EC2 | 30 | Valid (middle value) |
| EC3 | 70 | Invalid (too old) |

#### Step 4: Write Test Cases

| TC ID | Input Age | Expected Result | Class |
|-------|-----------|-----------------|-------|
| TC-ECP-01 | 15 | Error: "Must be 18+" | EC1 |
| TC-ECP-02 | 30 | Success | EC2 |
| TC-ECP-03 | 70 | Error: "Max age 65" | EC3 |

---

### 🏗️ EXAMPLE 2: Password Length (MegiLance Security)

**Requirement:**  
Password length must be between **8 and 128** characters

#### Equivalence Classes:

| Class ID | Type | Range | Test Value |
|----------|------|-------|------------|
| **EC1** | Invalid | len < 8 | "pass" (4 chars) |
| **EC2** | Valid | 8 ≤ len ≤ 128 | "MyPass123" (9 chars) |
| **EC3** | Invalid | len > 128 | "A" * 150 (150 chars) |

#### Test Cases:

```
TC-ECP-04: Input "hello" → Expected: "Min 8 characters"
TC-ECP-05: Input "SecurePass2024!" → Expected: Success
TC-ECP-06: Input (150 chars) → Expected: "Max 128 characters"
```

---

### 🏗️ EXAMPLE 3: Email Format (MegiLance Registration)

**Requirement:**  
Email must follow standard format: user@domain.com

#### Equivalence Classes:

| Class ID | Type | Example | Reason |
|----------|------|---------|--------|
| **EC1** | Valid | waqar@megilance.com | Correct format |
| **EC2** | Invalid | waqar@megilance | Missing TLD |
| **EC3** | Invalid | @megilance.com | Missing username |
| **EC4** | Invalid | waqarmegilance.com | Missing @ |
| **EC5** | Invalid | waqar@@megilance.com | Double @ |

#### Test Cases:

| TC ID | Input Email | Expected Result |
|-------|-------------|-----------------|
| TC-ECP-07 | waqar@megilance.com | Success |
| TC-ECP-08 | waqar@megilance | Error: "Invalid email" |
| TC-ECP-09 | @megilance.com | Error: "Invalid email" |
| TC-ECP-10 | waqarmegilance.com | Error: "Invalid email" |
| TC-ECP-11 | waqar@@megilance.com | Error: "Invalid email" |

---

## 📐 PAGES 19-21: BOUNDARY VALUE ANALYSIS (BVA)

### 🎯 What is BVA?

**Definition:**  
Testing technique focusing on **boundary values** where errors are most likely to occur.

**Key Principle:**  
"Errors occur at boundaries, not in the middle"

### 🔧 BVA Test Values

For a range **[min, max]**, test:

| Position | Value |
|----------|-------|
| Just below min | min - 1 |
| Minimum | min |
| Just above min | min + 1 |
| Just below max | max - 1 |
| Maximum | max |
| Just above max | max + 1 |

---

### 🏗️ EXAMPLE 1: Age Validation (18-65) - BVA

**Boundary Values:**

| Value | Type | Expected Result |
|-------|------|-----------------|
| 17 | Invalid | Error: "Must be 18+" |
| **18** | Valid (min) | Success ✅ |
| 19 | Valid | Success ✅ |
| 64 | Valid | Success ✅ |
| **65** | Valid (max) | Success ✅ |
| 66 | Invalid | Error: "Max age 65" |

#### Test Cases:

```
TC-BVA-01: Age = 17 → Fail (below minimum)
TC-BVA-02: Age = 18 → Pass (minimum boundary)
TC-BVA-03: Age = 19 → Pass (just above minimum)
TC-BVA-04: Age = 64 → Pass (just below maximum)
TC-BVA-05: Age = 65 → Pass (maximum boundary)
TC-BVA-06: Age = 66 → Fail (above maximum)
```

---

### 🏗️ EXAMPLE 2: Password Length (8-128) - BVA

**Boundary Values:**

| Length | Value Example | Expected Result |
|--------|---------------|-----------------|
| 7 | "Pass123" | Error: "Min 8 chars" |
| **8** | "Pass1234" | Success ✅ |
| 9 | "Pass12345" | Success ✅ |
| 127 | "A" * 127 | Success ✅ |
| **128** | "A" * 128 | Success ✅ |
| 129 | "A" * 129 | Error: "Max 128 chars" |

#### Test Cases:

| TC ID | Length | Expected Result |
|-------|--------|-----------------|
| TC-BVA-07 | 7 chars | Fail ❌ |
| TC-BVA-08 | 8 chars | Pass ✅ |
| TC-BVA-09 | 9 chars | Pass ✅ |
| TC-BVA-10 | 127 chars | Pass ✅ |
| TC-BVA-11 | 128 chars | Pass ✅ |
| TC-BVA-12 | 129 chars | Fail ❌ |

---

### 🏗️ EXAMPLE 3: File Upload Size (Max 10MB) - BVA

**Requirement:**  
Profile picture must be ≤ 10MB (10,485,760 bytes)

**Boundary Values:**

| Size (MB) | Bytes | Expected Result |
|-----------|-------|-----------------|
| 9.99 | 10,475,315 | Success ✅ |
| **10.00** | 10,485,760 | Success ✅ |
| 10.01 | 10,496,205 | Error: "Max 10MB" |

#### Test Cases:

```
TC-BVA-13: Upload 9.99MB file → Pass
TC-BVA-14: Upload 10.00MB file → Pass (boundary)
TC-BVA-15: Upload 10.01MB file → Fail
```

---

### 🏗️ EXAMPLE 4: Skills Input (Max 10 skills)

**Requirement:**  
User can add 1-10 skills to profile

**Boundary Values:**

| Number of Skills | Expected Result |
|------------------|-----------------|
| 0 | Error: "Add at least 1 skill" |
| **1** | Success ✅ |
| 2 | Success ✅ |
| 9 | Success ✅ |
| **10** | Success ✅ |
| 11 | Error: "Max 10 skills" |

#### Test Cases:

| TC ID | Skills Count | Expected Result |
|-------|--------------|-----------------|
| TC-BVA-16 | 0 | Fail ❌ |
| TC-BVA-17 | 1 | Pass ✅ |
| TC-BVA-18 | 2 | Pass ✅ |
| TC-BVA-19 | 9 | Pass ✅ |
| TC-BVA-20 | 10 | Pass ✅ |
| TC-BVA-21 | 11 | Fail ❌ |

---

## 📊 ECP vs BVA Comparison

| Aspect | ECP | BVA |
|--------|-----|-----|
| **Focus** | Classes/partitions | Boundaries |
| **Test Values** | One from each class | Min, max, ±1 |
| **Efficiency** | Reduces test cases | Catches boundary errors |
| **When to Use** | Different categories | Numeric ranges |
| **Example** | Email format classes | Age 18-65 boundaries |

---

## 🎯 COMPLETE TEST CASE EXAMPLE: User Registration

### Feature: MegiLance User Registration Form

**Fields to Test:**
1. Email (string)
2. Password (string, 8-128 chars)
3. Age (integer, 18-65)
4. Role (dropdown: Client/Freelancer)

### Combined ECP + BVA Test Cases

| TC ID | Field | Technique | Input | Expected Result |
|-------|-------|-----------|-------|-----------------|
| **TC-001** | Email | ECP-Valid | waqar@megilance.com | Success |
| **TC-002** | Email | ECP-Invalid | waqar@megilance | Error |
| **TC-003** | Password | BVA | 7 chars | Error: "Min 8" |
| **TC-004** | Password | BVA | 8 chars | Success |
| **TC-005** | Password | BVA | 128 chars | Success |
| **TC-006** | Password | BVA | 129 chars | Error: "Max 128" |
| **TC-007** | Age | BVA | 17 | Error: "Min 18" |
| **TC-008** | Age | BVA | 18 | Success |
| **TC-009** | Age | BVA | 65 | Success |
| **TC-010** | Age | BVA | 66 | Error: "Max 65" |
| **TC-011** | Role | ECP-Valid | Client | Success |
| **TC-012** | Role | ECP-Valid | Freelancer | Success |
| **TC-013** | Role | ECP-Invalid | Admin | Error: "Invalid role" |

**Total:** 13 test cases covering all critical scenarios

---

## 📝 Lab Exercise Solutions

### Exercise 1: Apply ECP to Phone Number Field

**Requirement:** Phone must be 11 digits (Pakistani format)

**Solution:**

| Class | Type | Example | Expected |
|-------|------|---------|----------|
| EC1 | Invalid | "12345" (5 digits) | Error |
| EC2 | Valid | "03001234567" (11 digits) | Success |
| EC3 | Invalid | "030012345678" (12 digits) | Error |
| EC4 | Invalid | "abcdefghijk" (letters) | Error |

### Exercise 2: Apply BVA to Bio Length

**Requirement:** Bio text: 10-500 characters

**Solution:**

| Value | Expected |
|-------|----------|
| 9 chars | Fail |
| 10 chars | Pass ✅ |
| 11 chars | Pass |
| 499 chars | Pass |
| 500 chars | Pass ✅ |
| 501 chars | Fail |

---

## 🎓 Viva Preparation

**Q1: What is Black-Box Testing?**  
**A:** Testing without knowing internal code, focusing on inputs and outputs.

**Q2: Explain ECP with example**  
**A:** Divide inputs into classes, test one value from each. Example: Age 18-65 → test 15 (invalid), 30 (valid), 70 (invalid).

**Q3: Why use BVA?**  
**A:** Because most errors occur at boundaries (min, max) not in middle values.

**Q4: Give BVA example**  
**A:** Password 8-128 chars → Test: 7 (fail), 8 (pass), 9 (pass), 127 (pass), 128 (pass), 129 (fail).

**Q5: When to use ECP vs BVA?**  
**A:** ECP for different categories (valid email formats), BVA for numeric ranges (age, length).

---

**Status:** ✅ COMPLETE - Black-Box Testing Documentation Ready

**Next:** Detailed Test Cases & Bug Reports (Pages 22-25)
