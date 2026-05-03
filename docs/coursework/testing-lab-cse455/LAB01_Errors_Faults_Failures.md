# 📘 CSE-455 SOFTWARE TESTING LAB
## Complete Jira Project: User Profile Management Module

---

# LAB 01: ERRORS, FAULTS AND FAILURES
## Applied to User Profile Management Module

---

## 🔴 UNDERSTANDING ERROR, FAULT, FAILURE

### Definitions (IEEE Standard):

| Term | Definition | Example |
|------|------------|---------|
| **Error** | Human mistake that caused the fault | Developer typed `* param` instead of `* 2` |
| **Fault/Bug/Defect** | Discrepancy in code that causes failure | Wrong logic in code at specific line |
| **Failure** | External incorrect behavior visible to user | System crashes or shows wrong output |

### Relationship Chain:
```
ERROR (Human Mistake) → FAULT (Code Bug) → FAILURE (System Crash)
     Developer              Tester              User
```

---

## 📋 ERROR, FAULT, FAILURE EXAMPLES - USER PROFILE MODULE

### Example 1: Password Validation

```python
# User Profile Password Validation Function
# pre: password is a string
# post: returns True if password length is between 8-128 characters

def validate_password(password):
    min_length = 8
    max_length = 128
    
    # LINE WITH FAULT
    if len(password) < min_length or len(password) >= max_length:  # FAULT: >= should be >
        return False
    return True
```

**Analysis:**
| Type | Description |
|------|-------------|
| **Error** | Developer typed `>=` instead of `>` by mistake (human typo) |
| **Fault** | Line 10: `len(password) >= max_length` should be `len(password) > max_length` |
| **Failure** | A call to `validate_password("A" * 128)` returns `False`, but it should return `True` because 128 is valid (max boundary) |

**Test Case Demonstrating Failure:**
```
Input: "A" * 128 (exactly 128 characters)
Expected Output: True (password is valid, 128 is within limit)
Actual Output: False (password rejected incorrectly)
Result: FAILURE ❌
```

---

### Example 2: Email Validation

```python
# User Profile Email Validation
# pre: email is a string
# post: returns True if email contains @ and domain

def validate_email(email):
    # LINE WITH FAULT
    if "@" in email and "." in email:  # FAULT: Missing check for @ before .
        return True
    return False
```

**Analysis:**
| Type | Description |
|------|-------------|
| **Error** | Developer forgot to check that `.` comes after `@` (logic error) |
| **Fault** | Missing validation: `email.index("@") < email.rindex(".")` |
| **Failure** | `validate_email(".test@domain")` returns `True` but should return `False` |

**Test Cases:**
| Input | Expected | Actual | Status |
|-------|----------|--------|--------|
| `waqar@megilance.com` | True | True | ✅ Pass |
| `.test@domain` | False | True | ❌ Fail (FAILURE) |
| `test.name@` | False | True | ❌ Fail (FAILURE) |

---

### Example 3: Age Validation

```python
# User Profile Age Validation
# pre: age is an integer
# post: returns True if age is between 18 and 65 (inclusive)

def validate_age(age):
    MIN_AGE = 18
    MAX_AGE = 65
    
    # LINE WITH FAULT
    if age > MIN_AGE and age < MAX_AGE:  # FAULT: > should be >=, < should be <=
        return True
    return False
```

**Analysis:**
| Type | Description |
|------|-------------|
| **Error** | Developer used `>` and `<` instead of `>=` and `<=` (boundary error) |
| **Fault** | Line 10: Should be `age >= MIN_AGE and age <= MAX_AGE` |
| **Failure** | `validate_age(18)` returns `False` but should return `True` |

**Test Cases (BVA - Boundary Value Analysis):**
| Input | Expected | Actual | Status | Type |
|-------|----------|--------|--------|------|
| 17 | False | False | ✅ Pass | Non-Failure |
| 18 | True | False | ❌ Fail | FAILURE (Boundary) |
| 19 | True | True | ✅ Pass | Non-Failure |
| 64 | True | True | ✅ Pass | Non-Failure |
| 65 | True | False | ❌ Fail | FAILURE (Boundary) |
| 66 | False | False | ✅ Pass | Non-Failure |

---

### Example 4: Profile Bio Length

```python
# User Profile Bio Validation
# pre: bio is a string
# post: returns True if bio length is between 10 and 500 characters

class UserProfile:
    def __init__(self):
        self.bio = ""
    
    def set_bio(self, bio):
        max_length = 255  # FAULT: Should be 500 as per requirement
        if len(bio) <= max_length:
            self.bio = bio
            return True
        return False
```

**Analysis:**
| Type | Description |
|------|-------------|
| **Error** | Developer set wrong max_length value (255 instead of 500) |
| **Fault** | Line 10: `max_length = 255` should be `max_length = 500` |
| **Failure** | `set_bio("A" * 300)` returns `False` but should return `True` |

---

### Example 5: Avatar File Size Validation

```python
# User Profile Avatar Upload
# pre: file_size is in bytes
# post: returns True if file size <= 10MB (10,485,760 bytes)

def validate_avatar_size(file_size):
    MAX_SIZE = 10 * 1024 * 1024  # 10MB in bytes
    
    # LINE WITH FAULT
    if file_size < MAX_SIZE:  # FAULT: < should be <=
        return True
    return False
```

**Analysis:**
| Type | Description |
|------|-------------|
| **Error** | Developer used `<` instead of `<=` (off-by-one error) |
| **Fault** | Line 8: Should be `file_size <= MAX_SIZE` |
| **Failure** | `validate_avatar_size(10485760)` returns `False` but should return `True` |

---

## 📊 COMPLETE ERROR/FAULT/FAILURE TABLE

| # | Function | Error (Human) | Fault (Code) | Failure (Output) |
|---|----------|---------------|--------------|------------------|
| 1 | validate_password | Typed `>=` instead of `>` | Line 10: wrong operator | 128-char password rejected |
| 2 | validate_email | Forgot order check | Missing @ before . validation | Invalid emails accepted |
| 3 | validate_age | Used exclusive operators | `>` and `<` instead of `>=` `<=` | Age 18 and 65 rejected |
| 4 | set_bio | Wrong constant value | 255 instead of 500 | 300-char bio rejected |
| 5 | validate_avatar | Off-by-one error | `<` instead of `<=` | Exactly 10MB rejected |

---

## 🧪 LAB TASK SOLUTIONS

### Lab Task 1: CourseResult Applied to UserProfile

```java
// User Profile Management - Java Implementation
public class UserProfile {
    public String username;
    public String email;
    public String bio;
    public int age;
    
    public void display() {
        // FAULT: Missing space after colons
        System.out.println("Username:" + username + "Email:" + email + "Bio:" + bio);
    }
    
    public boolean validateAge() {
        // FAULT: Wrong boundary check
        if (age > 18 && age < 65) {  // Should be >= and <=
            return true;
        }
        return false;
    }
}

public class UserProfileRunner {
    public static void main(String[] args) {
        UserProfile u1 = new UserProfile();
        u1.username = "Waqar";
        u1.email = "waqar@megilance.com";
        u1.bio = "Software Developer";
        u1.age = 18;
        
        u1.display();
        System.out.println("Age Valid: " + u1.validateAge());
        
        UserProfile u2 = new UserProfile();
        u2.username = "Ali";
        u2.email = "ali@test.com";
        u2.bio = "Designer";
        u2.age = 25;
        
        u2.display();
        System.out.println("Age Valid: " + u2.validateAge());
    }
}
```

**Test Cases - Failures:**
| TC# | Input Age | Expected | Actual | Status |
|-----|-----------|----------|--------|--------|
| 1 | 18 | True | False | FAILURE |
| 2 | 65 | True | False | FAILURE |
| 3 | 17 | False | False | Pass |

**Test Cases - Non-Failures:**
| TC# | Input Age | Expected | Actual | Status |
|-----|-----------|----------|--------|--------|
| 1 | 25 | True | True | Pass |
| 2 | 40 | True | True | Pass |
| 3 | 64 | True | True | Pass |

---

### Lab Task 2: Line Length Applied to Profile Completeness

```java
// Profile Completeness Calculator
public class ProfileSection {
    public int completedFields;
    public int totalFields;
    
    public ProfileSection(int completed, int total) {
        this.completedFields = completed;
        this.totalFields = total;
    }
    
    public double getCompleteness() {
        // FAULT: Integer division instead of double
        return completedFields / totalFields * 100;  // Should cast to double
    }
}

public class ProfileCompletenessRunner {
    public static void main(String[] args) {
        ProfileSection p1 = new ProfileSection(3, 10);
        System.out.println("Completeness: " + p1.getCompleteness() + "%");
        // Expected: 30.0%
        // Actual: 0.0% (FAILURE - integer division)
        
        ProfileSection p2 = new ProfileSection(10, 10);
        System.out.println("Completeness: " + p2.getCompleteness() + "%");
        // Expected: 100.0%
        // Actual: 100.0% (Pass)
    }
}
```

**3 Test Cases for Failures:**
| TC# | Completed | Total | Expected | Actual | Status |
|-----|-----------|-------|----------|--------|--------|
| 1 | 3 | 10 | 30.0% | 0.0% | FAILURE |
| 2 | 7 | 10 | 70.0% | 0.0% | FAILURE |
| 3 | 1 | 3 | 33.33% | 0.0% | FAILURE |

**3 Test Cases for Non-Failures:**
| TC# | Completed | Total | Expected | Actual | Status |
|-----|-----------|-------|----------|--------|--------|
| 1 | 10 | 10 | 100.0% | 100.0% | Pass |
| 2 | 0 | 10 | 0.0% | 0.0% | Pass |
| 3 | 20 | 10 | 200.0% | 200.0% | Pass |

---

### Lab Task 3: MegiLance System Defects

**Defects Found in User Profile Management:**

| Defect ID | Module | Description | Severity | Priority |
|-----------|--------|-------------|----------|----------|
| DEF-001 | Registration | Password accepts < 8 chars | High | P1 |
| DEF-002 | Profile | Bio truncated at 255 chars | Medium | P2 |
| DEF-003 | Avatar | 10MB files rejected | Medium | P2 |
| DEF-004 | Age | Boundary ages 18, 65 rejected | High | P1 |
| DEF-005 | Email | Invalid format accepted | High | P1 |
| DEF-006 | Display | Missing spaces in output | Low | P4 |
| DEF-007 | Settings | Dark mode button misaligned | Low | P4 |
| DEF-008 | Security | Rate limiting not working | Critical | P1 |

---

## ✅ LAB 01 COMPLETION CHECKLIST

- [x] Understanding of Error, Fault, Failure
- [x] 5 Examples with code
- [x] Test cases identifying failures
- [x] Test cases identifying non-failures
- [x] Applied to User Profile Management Module
- [x] Defect documentation

---

**Lab 01 Status:** ✅ COMPLETE
**Next:** Lab 02 - Test Cases for User Profile System
