# 📘 CSE-455 SOFTWARE TESTING LAB
## LAB 02: TEST CASES FOR USER PROFILE MANAGEMENT SYSTEM

---

## 🎯 Objective
Write comprehensive test cases for the MegiLance User Profile Management System following the standard test case template format.

---

## 📋 TEST CASE TEMPLATE (Standard Format)

```
┌─────────────────────────────────────────────────────────────┐
│ Test Case ID      │ A Unique ID                             │
├─────────────────────────────────────────────────────────────┤
│ Test Case Name    │ A Valid Name                            │
├─────────────────────────────────────────────────────────────┤
│ Test Data         │ Required to perform test (e.g., Password)│
├─────────────────────────────────────────────────────────────┤
│ Pre-Condition     │ Condition required to fulfill the task  │
├─────────────────────────────────────────────────────────────┤
│ Actions           │ System Response                         │
│ (Performed by user)│ (System response against each step)    │
├─────────────────────────────────────────────────────────────┤
│ Expected Result   │ Result required                         │
├─────────────────────────────────────────────────────────────┤
│ Actual Result     │ Resultant Output                        │
├─────────────────────────────────────────────────────────────┤
│ Test Case Status  │ Pass/Fail                               │
├─────────────────────────────────────────────────────────────┤
│ Testing Environment│ e.g., Windows 11, Chrome 120           │
├─────────────────────────────────────────────────────────────┤
│ Tested by         │ XYZ                                     │
├─────────────────────────────────────────────────────────────┤
│ Date              │ February 2, 2026                        │
└─────────────────────────────────────────────────────────────┘
```

---

# 🔐 MODULE 1: USER REGISTRATION

## TC-001: Register with Valid Credentials

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-001 |
| **Test Case Name** | Register with Valid Credentials |
| **Test Data** | Email: waqar@megilance.com, Password: SecurePass123!, Name: Waqar Ul Mulk, Age: 25, Role: Freelancer |
| **Pre-Condition** | • User is on registration page (/signup)<br>• Email is not already registered<br>• Backend API is running |

| Actions | System Response |
|---------|-----------------|
| 1. User enters full name "Waqar Ul Mulk" | 1. Input field accepts text |
| 2. User enters email "waqar@megilance.com" | 2. Email format validated (green tick) |
| 3. User enters password "SecurePass123!" | 3. Password strength shows "Strong" |
| 4. User enters confirm password "SecurePass123!" | 4. Passwords match indicator shows |
| 5. User selects role "Freelancer" | 5. Role dropdown updates |
| 6. User enters age "25" | 6. Age accepted (18-65 valid) |
| 7. User checks "I agree to Terms" | 7. Checkbox is selected |
| 8. User clicks "Sign Up" button | 8. System shows "Creating account..." |

| Field | Value |
|-------|-------|
| **Expected Result** | • User registered successfully<br>• Verification email sent<br>• Redirect to /verify-email page<br>• Success message: "Account created! Check your email." |
| **Actual Result** | User registered successfully. Email sent. Redirected to verification page. |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120, Node 20, Python 3.12 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-002: Register with Invalid Email Format

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-002 |
| **Test Case Name** | Register with Invalid Email Format |
| **Test Data** | Email: waqar@megilance (missing .com) |
| **Pre-Condition** | • User is on registration page<br>• Form is empty |

| Actions | System Response |
|---------|-----------------|
| 1. User enters email "waqar@megilance" | 1. Input field shows red border |
| 2. User clicks outside email field | 2. Error message appears below field |

| Field | Value |
|-------|-------|
| **Expected Result** | • Email field shows error: "Please enter a valid email address"<br>• Form cannot be submitted<br>• No API call made |
| **Actual Result** | Error message displayed: "Invalid email format" |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-003: Register with Password Below Minimum (BVA)

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-003 |
| **Test Case Name** | Register with Password Below Minimum Length (BVA - Boundary) |
| **Test Data** | Password: "Pass12" (6 characters - below minimum 8) |
| **Pre-Condition** | • User is on registration page<br>• Password policy: 8-128 characters |

| Actions | System Response |
|---------|-----------------|
| 1. User enters password "Pass12" (6 chars) | 1. Password field accepts input |
| 2. User moves to next field | 2. Password strength shows "Weak" |
| 3. User clicks "Sign Up" | 3. Validation triggers |

| Field | Value |
|-------|-------|
| **Expected Result** | • Error: "Password must be at least 8 characters"<br>• Form submission blocked<br>• Password field highlighted in red |
| **Actual Result** | Error displayed: "Minimum 8 characters required" |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-004: Register with Password at Minimum Boundary (BVA)

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-004 |
| **Test Case Name** | Register with Password at Minimum Boundary (BVA) |
| **Test Data** | Password: "Pass1234" (exactly 8 characters) |
| **Pre-Condition** | • User is on registration page<br>• All other fields valid |

| Actions | System Response |
|---------|-----------------|
| 1. User enters all valid data | 1. Fields accepted |
| 2. User enters password "Pass1234" (8 chars) | 2. Password accepted |
| 3. User clicks "Sign Up" | 3. Form submits |

| Field | Value |
|-------|-------|
| **Expected Result** | • Password accepted (8 is valid minimum)<br>• Registration successful<br>• User account created |
| **Actual Result** | Password accepted. Registration successful. |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-005: Register with Age Below Minimum (BVA)

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-005 |
| **Test Case Name** | Register with Age Below Minimum (BVA - Invalid) |
| **Test Data** | Age: 17 (below minimum 18) |
| **Pre-Condition** | • User is on registration page<br>• Age policy: 18-65 years |

| Actions | System Response |
|---------|-----------------|
| 1. User enters age "17" | 1. Age field accepts input |
| 2. User clicks "Sign Up" | 2. Validation triggers |

| Field | Value |
|-------|-------|
| **Expected Result** | • Error: "You must be at least 18 years old"<br>• Registration blocked<br>• Age field highlighted |
| **Actual Result** | Error: "Minimum age is 18 years" |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-006: Register with Duplicate Email

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-006 |
| **Test Case Name** | Register with Already Registered Email |
| **Test Data** | Email: existing@megilance.com (already in database) |
| **Pre-Condition** | • Email already exists in system<br>• User on registration page |

| Actions | System Response |
|---------|-----------------|
| 1. User enters existing email | 1. Input accepted |
| 2. User fills all other fields | 2. Fields accepted |
| 3. User clicks "Sign Up" | 3. API call made |
| 4. Server checks email | 4. Duplicate found |

| Field | Value |
|-------|-------|
| **Expected Result** | • Error: "Email already registered"<br>• Suggest: "Try logging in instead"<br>• Link to login page provided |
| **Actual Result** | Error: "This email is already registered. Login instead?" |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

# 🔑 MODULE 2: USER LOGIN

## TC-007: Login with Valid Credentials

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-007 |
| **Test Case Name** | Login with Valid Credentials |
| **Test Data** | Email: waqar@megilance.com, Password: SecurePass123! |
| **Pre-Condition** | • User is registered<br>• Email is verified<br>• User on login page |

| Actions | System Response |
|---------|-----------------|
| 1. User enters email "waqar@megilance.com" | 1. Email field accepts input |
| 2. User enters password "SecurePass123!" | 2. Password masked with dots |
| 3. User clicks "Login" button | 3. Shows "Authenticating..." |
| 4. Server validates credentials | 4. JWT token generated |

| Field | Value |
|-------|-------|
| **Expected Result** | • Login successful<br>• JWT access token issued<br>• Redirect to dashboard<br>• Welcome message shown |
| **Actual Result** | Login successful. Redirected to /freelancer/dashboard |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-008: Login with Invalid Password

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-008 |
| **Test Case Name** | Login with Invalid Password |
| **Test Data** | Email: waqar@megilance.com, Password: WrongPass123 |
| **Pre-Condition** | • User is registered<br>• Correct password is "SecurePass123!" |

| Actions | System Response |
|---------|-----------------|
| 1. User enters correct email | 1. Email accepted |
| 2. User enters wrong password | 2. Password masked |
| 3. User clicks "Login" | 3. API request sent |
| 4. Server validates | 4. Credential mismatch found |

| Field | Value |
|-------|-------|
| **Expected Result** | • Error: "Invalid email or password"<br>• User not logged in<br>• Attempt counter incremented |
| **Actual Result** | Error: "Invalid credentials" displayed |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-009: Login with Unregistered Email

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-009 |
| **Test Case Name** | Login with Non-existent Email |
| **Test Data** | Email: notexist@megilance.com |
| **Pre-Condition** | • Email not in database |

| Actions | System Response |
|---------|-----------------|
| 1. User enters unregistered email | 1. Email accepted |
| 2. User enters any password | 2. Password accepted |
| 3. User clicks "Login" | 3. API request sent |

| Field | Value |
|-------|-------|
| **Expected Result** | • Error: "Invalid email or password"<br>• Same error as wrong password (security)<br>• No account hint given |
| **Actual Result** | Error: "Invalid email or password" |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-010: Login Rate Limiting (5 Failed Attempts)

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-010 |
| **Test Case Name** | Account Lockout After 5 Failed Attempts |
| **Test Data** | Wrong password attempted 6 times |
| **Pre-Condition** | • User account exists<br>• Rate limiting enabled |

| Actions | System Response |
|---------|-----------------|
| 1. User enters wrong password (attempt 1) | 1. "Invalid credentials" |
| 2. User enters wrong password (attempt 2) | 2. "Invalid credentials" |
| 3. User enters wrong password (attempt 3) | 3. "Invalid credentials" |
| 4. User enters wrong password (attempt 4) | 4. "Invalid credentials" |
| 5. User enters wrong password (attempt 5) | 5. "Invalid credentials" |
| 6. User enters password (attempt 6) | 6. Account locked |

| Field | Value |
|-------|-------|
| **Expected Result** | • After 5 failures: "Account temporarily locked"<br>• Lockout duration: 15 minutes<br>• 6th attempt blocked even with correct password |
| **Actual Result** | Account locked for 15 minutes after 5 failed attempts |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

# 👤 MODULE 3: PROFILE MANAGEMENT

## TC-011: View Own Profile

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-011 |
| **Test Case Name** | View Own Profile Page |
| **Test Data** | Logged in user: waqar@megilance.com |
| **Pre-Condition** | • User is logged in<br>• Profile exists |

| Actions | System Response |
|---------|-----------------|
| 1. User clicks profile icon | 1. Dropdown menu appears |
| 2. User clicks "My Profile" | 2. Navigate to /profile |
| 3. Page loads | 3. Profile data fetched from API |

| Field | Value |
|-------|-------|
| **Expected Result** | • Profile page displays<br>• Name, email, bio, skills visible<br>• Avatar shown (or default)<br>• Edit button available |
| **Actual Result** | Profile page loaded with all user information |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-012: Update Profile Bio (Valid)

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-012 |
| **Test Case Name** | Update Profile Bio with Valid Text |
| **Test Data** | Bio: "Senior Software Developer with 5 years experience in Python and JavaScript." |
| **Pre-Condition** | • User logged in<br>• On profile edit page |

| Actions | System Response |
|---------|-----------------|
| 1. User clicks "Edit Profile" | 1. Edit form appears |
| 2. User types bio in textarea | 2. Character count updates |
| 3. User clicks "Save Changes" | 3. API PATCH request sent |
| 4. Server processes | 4. Database updated |

| Field | Value |
|-------|-------|
| **Expected Result** | • Bio saved successfully<br>• Success message: "Profile updated"<br>• New bio displayed on profile |
| **Actual Result** | Profile updated successfully |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-013: Update Bio Exceeding Maximum (BVA)

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-013 |
| **Test Case Name** | Update Bio Exceeding 500 Characters (BVA) |
| **Test Data** | Bio: 501 characters text |
| **Pre-Condition** | • User logged in<br>• Bio max limit: 500 chars |

| Actions | System Response |
|---------|-----------------|
| 1. User enters 501 character bio | 1. Counter shows "501/500" in red |
| 2. User clicks "Save" | 2. Validation triggers |

| Field | Value |
|-------|-------|
| **Expected Result** | • Error: "Bio cannot exceed 500 characters"<br>• Save blocked<br>• Excess characters highlighted |
| **Actual Result** | Error: "Maximum 500 characters allowed" |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-014: Upload Valid Avatar Image

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-014 |
| **Test Case Name** | Upload Valid JPG Avatar |
| **Test Data** | File: avatar.jpg, Size: 2MB, Dimensions: 500x500 |
| **Pre-Condition** | • User logged in<br>• On profile edit page |

| Actions | System Response |
|---------|-----------------|
| 1. User clicks "Upload Avatar" | 1. File picker opens |
| 2. User selects avatar.jpg (2MB) | 2. File selected |
| 3. User confirms upload | 3. Upload progress shows |
| 4. Upload completes | 4. Preview displays |

| Field | Value |
|-------|-------|
| **Expected Result** | • Image uploaded successfully<br>• Preview shows new avatar<br>• Old avatar replaced<br>• Success message displayed |
| **Actual Result** | Avatar uploaded and displayed successfully |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-015: Upload Avatar Exceeding Size Limit (BVA)

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-015 |
| **Test Case Name** | Upload Avatar Exceeding 10MB Limit (BVA) |
| **Test Data** | File: large_avatar.jpg, Size: 12MB |
| **Pre-Condition** | • Max file size: 10MB |

| Actions | System Response |
|---------|-----------------|
| 1. User clicks "Upload Avatar" | 1. File picker opens |
| 2. User selects 12MB file | 2. File validation runs |

| Field | Value |
|-------|-------|
| **Expected Result** | • Error: "File size must be less than 10MB"<br>• Upload blocked<br>• No network request made |
| **Actual Result** | Error: "Maximum file size is 10MB" |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-016: Upload Invalid File Format

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-016 |
| **Test Case Name** | Upload Non-Image File as Avatar |
| **Test Data** | File: document.pdf |
| **Pre-Condition** | • Allowed formats: JPG, PNG, WebP |

| Actions | System Response |
|---------|-----------------|
| 1. User selects PDF file | 1. File validation triggers |

| Field | Value |
|-------|-------|
| **Expected Result** | • Error: "Only JPG, PNG, WebP allowed"<br>• Upload blocked |
| **Actual Result** | Error: "Invalid file format. Please upload JPG, PNG, or WebP" |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-017: Add Skills to Profile

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-017 |
| **Test Case Name** | Add Valid Skills to Profile |
| **Test Data** | Skills: Python, JavaScript, React |
| **Pre-Condition** | • User logged in<br>• Skills list empty |

| Actions | System Response |
|---------|-----------------|
| 1. User types "Python" | 1. Autocomplete suggestions |
| 2. User selects "Python" | 2. Skill tag added |
| 3. User adds "JavaScript" | 3. Second tag added |
| 4. User adds "React" | 4. Third tag added |
| 5. User clicks "Save" | 5. Skills saved |

| Field | Value |
|-------|-------|
| **Expected Result** | • 3 skills added successfully<br>• Skills displayed on profile<br>• Skills searchable by others |
| **Actual Result** | Skills saved and displayed on profile |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-018: Add More Than Maximum Skills (BVA)

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-018 |
| **Test Case Name** | Add 11th Skill (Exceeds Maximum 10) |
| **Test Data** | Attempt to add 11 skills |
| **Pre-Condition** | • User has 10 skills already<br>• Max limit: 10 |

| Actions | System Response |
|---------|-----------------|
| 1. User has 10 skills | 1. Counter shows "10/10" |
| 2. User tries to add 11th skill | 2. Input disabled or blocked |

| Field | Value |
|-------|-------|
| **Expected Result** | • Error: "Maximum 10 skills allowed"<br>• 11th skill not added<br>• Suggest removing one first |
| **Actual Result** | Error: "You can add maximum 10 skills. Remove one to add new." |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

# ⚙️ MODULE 4: ACCOUNT SETTINGS

## TC-019: Change Password Successfully

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-019 |
| **Test Case Name** | Change Password with Valid Data |
| **Test Data** | Current: SecurePass123!, New: NewSecure456! |
| **Pre-Condition** | • User logged in<br>• Knows current password |

| Actions | System Response |
|---------|-----------------|
| 1. User goes to Settings > Security | 1. Security page loads |
| 2. User clicks "Change Password" | 2. Password form appears |
| 3. User enters current password | 3. Field accepts input |
| 4. User enters new password | 4. Strength indicator shows |
| 5. User confirms new password | 5. Match indicator shows |
| 6. User clicks "Update Password" | 6. API request sent |

| Field | Value |
|-------|-------|
| **Expected Result** | • Password changed successfully<br>• Logged out of all devices<br>• Must login with new password |
| **Actual Result** | Password updated. Logged out. Login with new password works. |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-020: Change Password with Wrong Current Password

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-020 |
| **Test Case Name** | Change Password with Incorrect Current Password |
| **Test Data** | Current: WrongPass123 (incorrect) |
| **Pre-Condition** | • User logged in |

| Actions | System Response |
|---------|-----------------|
| 1. User enters wrong current password | 1. Field accepts input |
| 2. User enters new password | 2. New password accepted |
| 3. User clicks "Update" | 3. Server validates current password |

| Field | Value |
|-------|-------|
| **Expected Result** | • Error: "Current password is incorrect"<br>• Password not changed<br>• Must enter correct current password |
| **Actual Result** | Error: "Incorrect current password" |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-021: Delete Account

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-021 |
| **Test Case Name** | Delete User Account Permanently |
| **Test Data** | User confirmation + password |
| **Pre-Condition** | • User logged in<br>• Has no active contracts |

| Actions | System Response |
|---------|-----------------|
| 1. User goes to Settings > Account | 1. Account settings page |
| 2. User clicks "Delete Account" | 2. Warning modal appears |
| 3. User types "DELETE" to confirm | 3. Confirmation accepted |
| 4. User enters password | 4. Password verified |
| 5. User clicks "Delete Forever" | 5. Account deletion starts |

| Field | Value |
|-------|-------|
| **Expected Result** | • Account deleted permanently<br>• All data removed<br>• Logged out<br>• Cannot login again |
| **Actual Result** | Account deleted. All data removed. Login returns "Account not found". |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

# 🔒 MODULE 5: SECURITY

## TC-022: SQL Injection Prevention

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-022 |
| **Test Case Name** | SQL Injection in Email Field |
| **Test Data** | Email: `'; DROP TABLE users; --` |
| **Pre-Condition** | • On registration page |

| Actions | System Response |
|---------|-----------------|
| 1. User enters SQL injection in email | 1. Input accepted |
| 2. User submits form | 2. Server processes |

| Field | Value |
|-------|-------|
| **Expected Result** | • Input sanitized<br>• SQL not executed<br>• Error: "Invalid email format"<br>• Database unaffected |
| **Actual Result** | Error: "Invalid email format". No SQL executed. |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-023: XSS Prevention in Bio

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-023 |
| **Test Case Name** | XSS Attack in Profile Bio |
| **Test Data** | Bio: `<script>alert('XSS')</script>` |
| **Pre-Condition** | • User logged in<br>• Editing profile |

| Actions | System Response |
|---------|-----------------|
| 1. User enters script in bio | 1. Input accepted |
| 2. User saves profile | 2. Data sanitized |
| 3. User views profile | 3. Bio displayed |

| Field | Value |
|-------|-------|
| **Expected Result** | • Script NOT executed<br>• HTML escaped<br>• Displayed as plain text: `<script>alert('XSS')</script>` |
| **Actual Result** | Script displayed as plain text, not executed |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-024: Session Timeout After 30 Minutes

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-024 |
| **Test Case Name** | JWT Session Expiry After 30 Minutes |
| **Test Data** | Wait 31 minutes without activity |
| **Pre-Condition** | • User logged in<br>• Access token: 30 min expiry |

| Actions | System Response |
|---------|-----------------|
| 1. User logs in | 1. JWT token issued (30 min) |
| 2. User waits 31 minutes | 2. Token expires |
| 3. User tries to access protected page | 3. 401 Unauthorized |

| Field | Value |
|-------|-------|
| **Expected Result** | • Session expired after 30 min<br>• Redirect to login page<br>• Message: "Session expired. Please login again." |
| **Actual Result** | Redirected to login with "Session expired" message |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-025: CSRF Protection

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-025 |
| **Test Case Name** | Profile Update Without CSRF Token |
| **Test Data** | POST request without CSRF token |
| **Pre-Condition** | • User logged in<br>• CSRF protection enabled |

| Actions | System Response |
|---------|-----------------|
| 1. Attacker sends POST to /api/profile/update | 1. Server receives request |
| 2. No CSRF token in request | 2. Token validation fails |

| Field | Value |
|-------|-------|
| **Expected Result** | • Request rejected<br>• Error 403: "Invalid CSRF token"<br>• Profile NOT updated |
| **Actual Result** | 403 Forbidden: "Missing or invalid CSRF token" |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

# 📱 MODULE 6: UI/UX

## TC-026: Mobile Responsive Design

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-026 |
| **Test Case Name** | Profile Page on Mobile (375px) |
| **Test Data** | Screen width: 375px (iPhone SE) |
| **Pre-Condition** | • Profile page loaded |

| Actions | System Response |
|---------|-----------------|
| 1. Resize to 375px width | 1. Layout adapts |
| 2. Check all elements | 2. Elements stack vertically |
| 3. Check navigation | 3. Hamburger menu appears |

| Field | Value |
|-------|-------|
| **Expected Result** | • No horizontal scroll<br>• All content visible<br>• Touch targets minimum 44x44px<br>• Text readable |
| **Actual Result** | Fully responsive. All elements accessible on mobile. |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Chrome DevTools - Mobile Simulation |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-027: Dark Mode Theme

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-027 |
| **Test Case Name** | Dark Mode Profile Display |
| **Test Data** | Theme: Dark |
| **Pre-Condition** | • Dark mode enabled in settings |

| Actions | System Response |
|---------|-----------------|
| 1. User enables dark mode | 1. Theme changes |
| 2. User navigates to profile | 2. Dark theme applied |
| 3. Check all components | 3. All styled correctly |

| Field | Value |
|-------|-------|
| **Expected Result** | • Background: Dark colors<br>• Text: Light colors<br>• Sufficient contrast (WCAG AA)<br>• No white backgrounds |
| **Actual Result** | Dark mode applied correctly. All text readable. |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

## TC-028: Keyboard Navigation

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UPM-028 |
| **Test Case Name** | Navigate Profile Form with Keyboard Only |
| **Test Data** | Tab, Enter, Arrow keys |
| **Pre-Condition** | • On profile edit page |

| Actions | System Response |
|---------|-----------------|
| 1. Press Tab | 1. Focus moves to first field |
| 2. Press Tab repeatedly | 2. Focus cycles through all fields |
| 3. Press Enter on button | 3. Button activates |
| 4. Press Escape on modal | 4. Modal closes |

| Field | Value |
|-------|-------|
| **Expected Result** | • All interactive elements focusable<br>• Logical tab order<br>• Focus visible<br>• Actions work with keyboard |
| **Actual Result** | Full keyboard navigation working |
| **Test Case Status** | ✅ **PASS** |
| **Testing Environment** | Windows 11, Chrome 120 |
| **Tested by** | Waqar Ul Mulk |
| **Date** | February 2, 2026 |

---

# 📊 TEST CASE SUMMARY

| Module | Total TCs | Pass | Fail | Status |
|--------|-----------|------|------|--------|
| Registration | 6 | 6 | 0 | ✅ 100% |
| Login | 4 | 4 | 0 | ✅ 100% |
| Profile Management | 8 | 8 | 0 | ✅ 100% |
| Account Settings | 3 | 3 | 0 | ✅ 100% |
| Security | 4 | 4 | 0 | ✅ 100% |
| UI/UX | 3 | 3 | 0 | ✅ 100% |
| **TOTAL** | **28** | **28** | **0** | **✅ 100%** |

---

## ✅ LAB 02 COMPLETION CHECKLIST

- [x] Standard test case template used
- [x] Pre-conditions defined
- [x] Step-by-step actions documented
- [x] Expected results specified
- [x] Actual results recorded
- [x] Pass/Fail status marked
- [x] Testing environment noted
- [x] Tester name and date included
- [x] BVA (Boundary Value Analysis) applied
- [x] ECP (Equivalence Class Partitioning) applied
- [x] Positive and negative test cases

---

**Lab 02 Status:** ✅ COMPLETE
**Next:** Lab 03 - JIRA Scrum Board Setup
