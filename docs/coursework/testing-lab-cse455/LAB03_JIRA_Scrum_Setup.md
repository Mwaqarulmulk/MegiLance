# 📘 CSE-455 SOFTWARE TESTING LAB
## LAB 03: JIRA SETUP FOR USER PROFILE MANAGEMENT

---

## 🎯 Objective
Create a complete JIRA Scrum project for User Profile Management Module following proper Agile methodology with Epics, Stories, Child Issues, Sprints, and Backlog.

---

# 📋 PART 1: JIRA PROJECT SETUP

## 1.1 Create New Project

1. **Login to JIRA** → https://your-domain.atlassian.net
2. **Create Project** → Click "Projects" → "Create Project"
3. **Select Template** → Choose **"Scrum"** template
4. **Project Details:**
   - **Project Name:** MegiLance User Profile Module
   - **Project Key:** UPM
   - **Project Lead:** Waqar Ul Mulk

---

## 1.2 Board Configuration

### Scrum Board Settings
```
Board Name: UPM Scrum Board
Estimation: Story Points
Working Days: Monday - Friday
Sprint Duration: 2 weeks
```

### Columns Configuration
```
┌──────────────┬──────────────┬────────────────┬──────────────┐
│  BACKLOG     │  TO DO       │  IN PROGRESS   │    DONE      │
├──────────────┼──────────────┼────────────────┼──────────────┤
│ (unmapped)   │ Selected     │ In Development │ Completed    │
│              │ for Sprint   │ In Review      │ Released     │
│              │ Ready        │ In Testing     │              │
└──────────────┴──────────────┴────────────────┴──────────────┘
```

---

# 📊 PART 2: EPICS

## Epic Overview
```
┌────────────────────────────────────────────────────────────────┐
│                    USER PROFILE MANAGEMENT                      │
│                    (Parent Initiative)                          │
├────────┬────────┬────────┬────────┬────────┬──────────────────┤
│ EPIC-1 │ EPIC-2 │ EPIC-3 │ EPIC-4 │ EPIC-5 │     EPIC-6       │
│ Auth   │Profile │Settings│Security│ UI/UX  │    Testing       │
└────────┴────────┴────────┴────────┴────────┴──────────────────┘
```

---

## 📌 EPIC-1: User Authentication

| Field | Value |
|-------|-------|
| **Key** | UPM-1 |
| **Type** | Epic |
| **Summary** | User Authentication System |
| **Description** | Implement complete user authentication including registration, login, password reset, email verification, and session management with JWT tokens. |
| **Start Date** | Feb 1, 2026 |
| **Due Date** | Feb 14, 2026 |
| **Labels** | `authentication`, `security`, `critical` |
| **Story Points** | 40 |

### Stories Under This Epic:
- UPM-10: User Registration
- UPM-11: User Login
- UPM-12: Password Reset
- UPM-13: Email Verification
- UPM-14: Session Management
- UPM-15: Social Authentication

---

## 📌 EPIC-2: Profile Management

| Field | Value |
|-------|-------|
| **Key** | UPM-2 |
| **Type** | Epic |
| **Summary** | User Profile Management |
| **Description** | Allow users to view and edit their profiles, upload avatars, manage skills, portfolios, and professional information. |
| **Start Date** | Feb 15, 2026 |
| **Due Date** | Feb 28, 2026 |
| **Labels** | `profile`, `core-feature` |
| **Story Points** | 34 |

### Stories Under This Epic:
- UPM-20: View Profile
- UPM-21: Edit Profile Information
- UPM-22: Avatar Upload
- UPM-23: Skills Management
- UPM-24: Portfolio Section
- UPM-25: Profile Visibility Settings

---

## 📌 EPIC-3: Account Settings

| Field | Value |
|-------|-------|
| **Key** | UPM-3 |
| **Type** | Epic |
| **Summary** | Account Settings & Preferences |
| **Description** | Comprehensive account settings including notification preferences, privacy settings, language/locale, and account management. |
| **Start Date** | Mar 1, 2026 |
| **Due Date** | Mar 14, 2026 |
| **Labels** | `settings`, `preferences` |
| **Story Points** | 26 |

### Stories Under This Epic:
- UPM-30: Notification Settings
- UPM-31: Privacy Settings
- UPM-32: Language & Locale
- UPM-33: Connected Accounts
- UPM-34: Account Export
- UPM-35: Account Deletion

---

## 📌 EPIC-4: Security & Compliance

| Field | Value |
|-------|-------|
| **Key** | UPM-4 |
| **Type** | Epic |
| **Summary** | Security & Compliance Features |
| **Description** | Implement security measures including 2FA, session management, audit logging, and compliance with security best practices. |
| **Start Date** | Mar 15, 2026 |
| **Due Date** | Mar 28, 2026 |
| **Labels** | `security`, `compliance`, `critical` |
| **Story Points** | 30 |

### Stories Under This Epic:
- UPM-40: Two-Factor Authentication
- UPM-41: Password Change
- UPM-42: Active Sessions Management
- UPM-43: Login History
- UPM-44: Security Alerts

---

## 📌 EPIC-5: UI/UX Enhancement

| Field | Value |
|-------|-------|
| **Key** | UPM-5 |
| **Type** | Epic |
| **Summary** | UI/UX Enhancement & Accessibility |
| **Description** | Enhance user interface with responsive design, dark mode, accessibility features, and improved user experience. |
| **Start Date** | Mar 29, 2026 |
| **Due Date** | Apr 11, 2026 |
| **Labels** | `ui`, `ux`, `accessibility` |
| **Story Points** | 21 |

### Stories Under This Epic:
- UPM-50: Dark/Light Theme
- UPM-51: Responsive Design
- UPM-52: Accessibility (WCAG)
- UPM-53: Loading States & Animations
- UPM-54: Form Validation UX

---

## 📌 EPIC-6: Quality Assurance & Testing

| Field | Value |
|-------|-------|
| **Key** | UPM-6 |
| **Type** | Epic |
| **Summary** | Quality Assurance & Testing |
| **Description** | Comprehensive testing including unit tests, integration tests, E2E tests, and security testing for all profile features. |
| **Start Date** | Apr 12, 2026 |
| **Due Date** | Apr 25, 2026 |
| **Labels** | `testing`, `qa`, `quality` |
| **Story Points** | 26 |

### Stories Under This Epic:
- UPM-60: Unit Testing
- UPM-61: Integration Testing
- UPM-62: E2E Testing
- UPM-63: Security Testing
- UPM-64: Performance Testing

---

# 📖 PART 3: USER STORIES

## Story Format (Standard):
```
As a [type of user]
I want [some goal]
So that [some reason/benefit]
```

---

## 📌 STORY: UPM-10 User Registration

| Field | Value |
|-------|-------|
| **Key** | UPM-10 |
| **Type** | Story |
| **Parent** | UPM-1 (Authentication Epic) |
| **Summary** | User Registration with Email |
| **Description** | As a new visitor, I want to register an account with my email and password, so that I can access the platform features. |
| **Story Points** | 8 |
| **Priority** | High |
| **Sprint** | Sprint 1 |

### Acceptance Criteria:
```
GIVEN I am on the registration page
WHEN I enter valid email, password, and name
AND I click "Sign Up"
THEN my account is created
AND I receive a verification email
AND I am redirected to verification page

GIVEN I enter an already registered email
WHEN I click "Sign Up"
THEN I see error "Email already registered"

GIVEN I enter password less than 8 characters
WHEN I click "Sign Up"
THEN I see error "Password must be at least 8 characters"
```

### Child Issues (Sub-tasks):
| Key | Type | Summary | Estimate |
|-----|------|---------|----------|
| UPM-101 | Sub-task | Design registration form UI | 2h |
| UPM-102 | Sub-task | Implement form validation (frontend) | 3h |
| UPM-103 | Sub-task | Create registration API endpoint | 4h |
| UPM-104 | Sub-task | Implement password hashing | 2h |
| UPM-105 | Sub-task | Send verification email | 3h |
| UPM-106 | Sub-task | Write unit tests | 2h |

---

## 📌 STORY: UPM-11 User Login

| Field | Value |
|-------|-------|
| **Key** | UPM-11 |
| **Type** | Story |
| **Parent** | UPM-1 (Authentication Epic) |
| **Summary** | User Login with Email/Password |
| **Description** | As a registered user, I want to login with my email and password, so that I can access my account. |
| **Story Points** | 5 |
| **Priority** | High |
| **Sprint** | Sprint 1 |

### Acceptance Criteria:
```
GIVEN I am on the login page
WHEN I enter valid email and password
AND I click "Login"
THEN I am logged in
AND I am redirected to my dashboard
AND I receive a JWT token

GIVEN I enter invalid credentials
WHEN I click "Login"
THEN I see error "Invalid email or password"

GIVEN I fail 5 login attempts
WHEN I try again
THEN my account is temporarily locked for 15 minutes
```

### Child Issues (Sub-tasks):
| Key | Type | Summary | Estimate |
|-----|------|---------|----------|
| UPM-111 | Sub-task | Design login form UI | 2h |
| UPM-112 | Sub-task | Implement login API endpoint | 3h |
| UPM-113 | Sub-task | Generate and manage JWT tokens | 3h |
| UPM-114 | Sub-task | Implement rate limiting | 2h |
| UPM-115 | Sub-task | Remember me functionality | 2h |
| UPM-116 | Sub-task | Write unit tests | 2h |

---

## 📌 STORY: UPM-12 Password Reset

| Field | Value |
|-------|-------|
| **Key** | UPM-12 |
| **Type** | Story |
| **Parent** | UPM-1 (Authentication Epic) |
| **Summary** | Forgot Password & Reset |
| **Description** | As a user who forgot my password, I want to reset it via email, so that I can regain access to my account. |
| **Story Points** | 5 |
| **Priority** | High |
| **Sprint** | Sprint 1 |

### Acceptance Criteria:
```
GIVEN I am on the forgot password page
WHEN I enter my registered email
AND I click "Send Reset Link"
THEN I receive a password reset email
AND the link expires in 1 hour

GIVEN I click a valid reset link
WHEN I enter a new password (8+ characters)
AND I click "Reset Password"
THEN my password is updated
AND I can login with the new password
```

### Child Issues (Sub-tasks):
| Key | Type | Summary | Estimate |
|-----|------|---------|----------|
| UPM-121 | Sub-task | Design forgot password UI | 1h |
| UPM-122 | Sub-task | Create reset token generation | 2h |
| UPM-123 | Sub-task | Send reset email with link | 2h |
| UPM-124 | Sub-task | Implement reset password API | 3h |
| UPM-125 | Sub-task | Token expiration validation | 2h |
| UPM-126 | Sub-task | Write unit tests | 2h |

---

## 📌 STORY: UPM-20 View Profile

| Field | Value |
|-------|-------|
| **Key** | UPM-20 |
| **Type** | Story |
| **Parent** | UPM-2 (Profile Epic) |
| **Summary** | View User Profile Page |
| **Description** | As a user, I want to view my profile page, so that I can see my information as others see it. |
| **Story Points** | 5 |
| **Priority** | Medium |
| **Sprint** | Sprint 2 |

### Acceptance Criteria:
```
GIVEN I am logged in
WHEN I click "My Profile"
THEN I see my profile page with:
- Profile picture
- Name and title
- Bio/description
- Skills list
- Contact information
- Member since date

GIVEN I view my profile
WHEN the page loads
THEN it loads in less than 2 seconds
```

### Child Issues (Sub-tasks):
| Key | Type | Summary | Estimate |
|-----|------|---------|----------|
| UPM-201 | Sub-task | Design profile page layout | 3h |
| UPM-202 | Sub-task | Create profile API endpoint | 2h |
| UPM-203 | Sub-task | Implement profile data fetching | 2h |
| UPM-204 | Sub-task | Add loading skeleton | 1h |
| UPM-205 | Sub-task | Mobile responsive styling | 2h |

---

## 📌 STORY: UPM-21 Edit Profile Information

| Field | Value |
|-------|-------|
| **Key** | UPM-21 |
| **Type** | Story |
| **Parent** | UPM-2 (Profile Epic) |
| **Summary** | Edit Profile Information |
| **Description** | As a user, I want to edit my profile information, so that I can keep my details up to date. |
| **Story Points** | 8 |
| **Priority** | High |
| **Sprint** | Sprint 2 |

### Acceptance Criteria:
```
GIVEN I am on my profile page
WHEN I click "Edit Profile"
THEN I see an edit form with:
- Name field (editable)
- Title field (editable)
- Bio textarea (max 500 chars)
- Location field

GIVEN I update my bio
WHEN I click "Save Changes"
THEN my profile is updated
AND I see success message "Profile updated"

GIVEN I enter bio longer than 500 characters
WHEN I try to save
THEN I see error "Bio cannot exceed 500 characters"
```

### Child Issues (Sub-tasks):
| Key | Type | Summary | Estimate |
|-----|------|---------|----------|
| UPM-211 | Sub-task | Design edit profile form | 2h |
| UPM-212 | Sub-task | Implement form validation | 3h |
| UPM-213 | Sub-task | Create profile update API | 3h |
| UPM-214 | Sub-task | Add character counter | 1h |
| UPM-215 | Sub-task | Implement optimistic updates | 2h |
| UPM-216 | Sub-task | Write unit tests | 2h |

---

## 📌 STORY: UPM-22 Avatar Upload

| Field | Value |
|-------|-------|
| **Key** | UPM-22 |
| **Type** | Story |
| **Parent** | UPM-2 (Profile Epic) |
| **Summary** | Profile Picture Upload |
| **Description** | As a user, I want to upload a profile picture, so that my profile looks more personal and professional. |
| **Story Points** | 8 |
| **Priority** | Medium |
| **Sprint** | Sprint 2 |

### Acceptance Criteria:
```
GIVEN I am editing my profile
WHEN I click "Upload Photo"
THEN I can select an image file
AND accepted formats are: JPG, PNG, WebP

GIVEN I select a valid image (under 10MB)
WHEN upload completes
THEN I see a preview of my new avatar
AND the avatar is saved to my profile

GIVEN I select a file larger than 10MB
WHEN I try to upload
THEN I see error "File size must be under 10MB"
```

### Child Issues (Sub-tasks):
| Key | Type | Summary | Estimate |
|-----|------|---------|----------|
| UPM-221 | Sub-task | Design avatar upload UI | 2h |
| UPM-222 | Sub-task | Implement file picker with drag-drop | 3h |
| UPM-223 | Sub-task | Create file upload API endpoint | 3h |
| UPM-224 | Sub-task | Image resize/compression | 3h |
| UPM-225 | Sub-task | Avatar cropping tool | 4h |
| UPM-226 | Sub-task | Write unit tests | 2h |

---

## 📌 STORY: UPM-40 Two-Factor Authentication

| Field | Value |
|-------|-------|
| **Key** | UPM-40 |
| **Type** | Story |
| **Parent** | UPM-4 (Security Epic) |
| **Summary** | Enable Two-Factor Authentication |
| **Description** | As a security-conscious user, I want to enable 2FA on my account, so that my account is more secure. |
| **Story Points** | 8 |
| **Priority** | High |
| **Sprint** | Sprint 3 |

### Acceptance Criteria:
```
GIVEN I am in Security Settings
WHEN I click "Enable 2FA"
THEN I see a QR code for authenticator app
AND I can enter the 6-digit code to verify

GIVEN I have enabled 2FA
WHEN I login with correct password
THEN I am prompted for 2FA code
AND I must enter valid code to complete login

GIVEN I lose access to my authenticator
WHEN I use a backup code
THEN I can login and access my account
```

### Child Issues (Sub-tasks):
| Key | Type | Summary | Estimate |
|-----|------|---------|----------|
| UPM-401 | Sub-task | Design 2FA setup wizard | 2h |
| UPM-402 | Sub-task | Generate TOTP secret | 2h |
| UPM-403 | Sub-task | Create QR code display | 2h |
| UPM-404 | Sub-task | Implement 2FA verification API | 3h |
| UPM-405 | Sub-task | Generate backup codes | 2h |
| UPM-406 | Sub-task | Add 2FA check to login flow | 3h |
| UPM-407 | Sub-task | Write unit tests | 2h |

---

## 📌 STORY: UPM-50 Dark/Light Theme

| Field | Value |
|-------|-------|
| **Key** | UPM-50 |
| **Type** | Story |
| **Parent** | UPM-5 (UI/UX Epic) |
| **Summary** | Dark Mode Theme Support |
| **Description** | As a user, I want to switch between dark and light themes, so that I can use the interface comfortably in different lighting conditions. |
| **Story Points** | 5 |
| **Priority** | Medium |
| **Sprint** | Sprint 4 |

### Acceptance Criteria:
```
GIVEN I am logged in
WHEN I toggle the theme switch
THEN the interface changes to dark/light mode
AND my preference is saved

GIVEN it's my first visit
WHEN I access the platform
THEN the theme matches my system preference

GIVEN I switch to dark mode
WHEN I navigate between pages
THEN dark mode persists across all pages
```

### Child Issues (Sub-tasks):
| Key | Type | Summary | Estimate |
|-----|------|---------|----------|
| UPM-501 | Sub-task | Create 3-file CSS module system | 3h |
| UPM-502 | Sub-task | Design dark theme colors | 2h |
| UPM-503 | Sub-task | Implement theme toggle | 2h |
| UPM-504 | Sub-task | Save theme preference | 1h |
| UPM-505 | Sub-task | System preference detection | 2h |
| UPM-506 | Sub-task | Test all pages in both themes | 2h |

---

# 🐛 PART 4: BUGS

## Bug Template:
```
| Field              | Value                              |
|--------------------|------------------------------------|
| Summary            | Brief description of bug           |
| Steps to Reproduce | 1. Step 1, 2. Step 2, etc.        |
| Expected Result    | What should happen                 |
| Actual Result      | What actually happens              |
| Severity           | Critical/Major/Minor/Trivial       |
| Priority           | Highest/High/Medium/Low/Lowest     |
| Environment        | Browser, OS, etc.                  |
| Attachments        | Screenshots, videos                |
```

---

## 📌 BUG-01: Registration Form Accepts Empty Password

| Field | Value |
|-------|-------|
| **Key** | UPM-BUG-001 |
| **Type** | Bug |
| **Summary** | Registration form submits with empty password field |
| **Steps to Reproduce** | 1. Go to /signup<br>2. Enter email and name<br>3. Leave password empty<br>4. Click "Sign Up" |
| **Expected Result** | Form should show error "Password is required" |
| **Actual Result** | Form submits and shows server error 500 |
| **Severity** | 🔴 Critical |
| **Priority** | Highest |
| **Component** | Registration |
| **Affects Version** | 1.0.0 |
| **Environment** | Chrome 120, Windows 11 |
| **Reported By** | Waqar Ul Mulk |
| **Date** | Feb 5, 2026 |

---

## 📌 BUG-02: Avatar Upload Crashes on Large Files

| Field | Value |
|-------|-------|
| **Key** | UPM-BUG-002 |
| **Type** | Bug |
| **Summary** | Avatar upload crashes browser on files > 15MB |
| **Steps to Reproduce** | 1. Go to Profile > Edit<br>2. Click Upload Avatar<br>3. Select 20MB image file<br>4. Page freezes and crashes |
| **Expected Result** | Show error "File too large" before upload |
| **Actual Result** | Browser tab crashes, unsaved data lost |
| **Severity** | 🔴 Critical |
| **Priority** | Highest |
| **Component** | Profile |
| **Environment** | All browsers |
| **Fix** | Add client-side file size validation before upload |

---

## 📌 BUG-03: Session Not Expiring After 30 Minutes

| Field | Value |
|-------|-------|
| **Key** | UPM-BUG-003 |
| **Type** | Bug |
| **Summary** | JWT token remains valid after 30 minutes idle |
| **Steps to Reproduce** | 1. Login to account<br>2. Wait 35 minutes (no activity)<br>3. Perform action requiring auth<br>4. Action succeeds instead of 401 |
| **Expected Result** | Session expires after 30 minutes, redirect to login |
| **Actual Result** | Session remains active indefinitely |
| **Severity** | 🟠 Major |
| **Priority** | High |
| **Component** | Security |
| **Environment** | All |

---

## 📌 BUG-04: Dark Mode Broken on Settings Page

| Field | Value |
|-------|-------|
| **Key** | UPM-BUG-004 |
| **Type** | Bug |
| **Summary** | Settings page shows white background in dark mode |
| **Steps to Reproduce** | 1. Enable dark mode<br>2. Navigate to Settings<br>3. Observe white background |
| **Expected Result** | Dark background with light text |
| **Actual Result** | White background making text invisible |
| **Severity** | 🟡 Minor |
| **Priority** | Medium |
| **Component** | UI/UX |
| **Environment** | All browsers |

---

## 📌 BUG-05: Password Reset Link Doesn't Expire

| Field | Value |
|-------|-------|
| **Key** | UPM-BUG-005 |
| **Type** | Bug |
| **Summary** | Password reset link works after 24 hours |
| **Steps to Reproduce** | 1. Request password reset<br>2. Wait 24 hours<br>3. Click reset link<br>4. Link still works |
| **Expected Result** | Link should expire after 1 hour |
| **Actual Result** | Link works indefinitely |
| **Severity** | 🟠 Major |
| **Priority** | High |
| **Component** | Authentication |
| **Security Risk** | Yes - compromises password reset security |

---

# 🏃 PART 5: SPRINTS

## Sprint Configuration
```
Sprint Duration: 2 weeks
Planning: Day 1 (Monday)
Daily Standup: Every day 9:30 AM
Sprint Review: Day 10 (Friday)
Retrospective: Day 10 (Friday PM)
```

---

## 📌 Sprint 1: Authentication Foundation

| Field | Value |
|-------|-------|
| **Sprint Name** | Sprint 1 - Authentication Foundation |
| **Goal** | Implement core authentication (register, login, password reset) |
| **Start Date** | Feb 1, 2026 |
| **End Date** | Feb 14, 2026 |
| **Velocity Target** | 40 points |

### Sprint Backlog:
| Key | Story | Points | Assignee |
|-----|-------|--------|----------|
| UPM-10 | User Registration | 8 | Developer 1 |
| UPM-11 | User Login | 5 | Developer 1 |
| UPM-12 | Password Reset | 5 | Developer 2 |
| UPM-13 | Email Verification | 5 | Developer 2 |
| UPM-14 | Session Management | 8 | Developer 1 |
| UPM-15 | Social Authentication | 5 | Developer 2 |
| - | Bug fixes buffer | 4 | Team |

---

## 📌 Sprint 2: Profile Features

| Field | Value |
|-------|-------|
| **Sprint Name** | Sprint 2 - Profile Features |
| **Goal** | Complete profile viewing and editing features |
| **Start Date** | Feb 15, 2026 |
| **End Date** | Feb 28, 2026 |
| **Velocity Target** | 38 points |

### Sprint Backlog:
| Key | Story | Points | Assignee |
|-----|-------|--------|----------|
| UPM-20 | View Profile | 5 | Developer 1 |
| UPM-21 | Edit Profile | 8 | Developer 1 |
| UPM-22 | Avatar Upload | 8 | Developer 2 |
| UPM-23 | Skills Management | 5 | Developer 2 |
| UPM-24 | Portfolio Section | 8 | Developer 1 |
| - | Bug fixes buffer | 4 | Team |

---

## 📌 Sprint 3: Settings & Security

| Field | Value |
|-------|-------|
| **Sprint Name** | Sprint 3 - Settings & Security |
| **Goal** | Implement settings, 2FA, and security features |
| **Start Date** | Mar 1, 2026 |
| **End Date** | Mar 14, 2026 |
| **Velocity Target** | 38 points |

### Sprint Backlog:
| Key | Story | Points | Assignee |
|-----|-------|--------|----------|
| UPM-30 | Notification Settings | 5 | Developer 2 |
| UPM-31 | Privacy Settings | 5 | Developer 2 |
| UPM-40 | Two-Factor Auth | 8 | Developer 1 |
| UPM-41 | Password Change | 5 | Developer 1 |
| UPM-42 | Active Sessions | 5 | Developer 1 |
| UPM-43 | Login History | 5 | Developer 2 |
| - | Bug fixes buffer | 5 | Team |

---

## 📌 Sprint 4: UI/UX & Polish

| Field | Value |
|-------|-------|
| **Sprint Name** | Sprint 4 - UI/UX & Polish |
| **Goal** | Enhance UI/UX, dark mode, accessibility |
| **Start Date** | Mar 15, 2026 |
| **End Date** | Mar 28, 2026 |
| **Velocity Target** | 35 points |

### Sprint Backlog:
| Key | Story | Points | Assignee |
|-----|-------|--------|----------|
| UPM-50 | Dark/Light Theme | 5 | Developer 1 |
| UPM-51 | Responsive Design | 8 | Developer 2 |
| UPM-52 | Accessibility | 8 | Developer 1 |
| UPM-53 | Loading States | 5 | Developer 2 |
| UPM-54 | Form Validation UX | 5 | Developer 2 |
| - | Bug fixes buffer | 4 | Team |

---

## 📌 Sprint 5: Testing & Release

| Field | Value |
|-------|-------|
| **Sprint Name** | Sprint 5 - Testing & Release |
| **Goal** | Complete QA, fix bugs, prepare for release |
| **Start Date** | Mar 29, 2026 |
| **End Date** | Apr 11, 2026 |
| **Velocity Target** | 26 points |

### Sprint Backlog:
| Key | Story | Points | Assignee |
|-----|-------|--------|----------|
| UPM-60 | Unit Testing | 5 | Developer 1 |
| UPM-61 | Integration Testing | 5 | Developer 2 |
| UPM-62 | E2E Testing | 5 | Tester |
| UPM-63 | Security Testing | 5 | Tester |
| UPM-64 | Performance Testing | 3 | Developer 1 |
| - | Bug fixes buffer | 3 | Team |

---

# 📈 PART 6: ROADMAP

```
                    MEGILANCE USER PROFILE MANAGEMENT ROADMAP
                    ==========================================
                    
February 2026                March 2026                  April 2026
─────────────────────────────────────────────────────────────────────
Week 1-2        Week 3-4     Week 1-2      Week 3-4     Week 1-2
                    
┌─────────────────┐
│ EPIC 1          │
│ Authentication  │
│ (Sprint 1)      │
└─────────────────┘
                 ┌─────────────────┐
                 │ EPIC 2          │
                 │ Profile Mgmt    │
                 │ (Sprint 2)      │
                 └─────────────────┘
                                  ┌──────────────────────┐
                                  │ EPIC 3 & 4            │
                                  │ Settings + Security   │
                                  │ (Sprint 3)            │
                                  └──────────────────────┘
                                                        ┌─────────────────┐
                                                        │ EPIC 5          │
                                                        │ UI/UX           │
                                                        │ (Sprint 4)      │
                                                        └─────────────────┘
                                                                         ┌───────────────┐
                                                                         │ EPIC 6        │
                                                                         │ QA & Testing  │
                                                                         │ (Sprint 5)    │
                                                                         └───────────────┘
                                                                         
                                                                               🚀 RELEASE v1.0
```

---

# 📊 PART 7: DASHBOARD GADGETS

## Dashboard Configuration

### Gadget 1: Sprint Burndown Chart
```
Type: Burndown Chart
Description: Shows remaining work in current sprint
Filter: Sprint = currentSprint()
Refresh: Every 15 minutes
```

### Gadget 2: Issue Statistics
```
Type: Issue Statistics
Description: Distribution of issues by type
Filter: project = UPM
Statistic Type: By Type (Epic/Story/Bug/Sub-task)
```

### Gadget 3: Created vs Resolved
```
Type: Created vs Resolved Chart
Description: Shows issues created vs resolved over time
Filter: project = UPM
Period: Last 30 days
```

### Gadget 4: Bug Distribution by Severity
```
Type: Pie Chart
Description: Bug distribution by severity
Filter: project = UPM AND type = Bug
Field: Priority
```

### Gadget 5: Velocity Chart
```
Type: Velocity Chart
Description: Team velocity over sprints
Board: UPM Scrum Board
Sprints: Last 5 sprints
```

### Gadget 6: Two-Dimensional Filter Statistics
```
Type: 2D Filter Stats
Description: Stories by Status and Priority
Rows: Priority
Columns: Status
Filter: project = UPM AND type = Story
```

---

# ✅ LAB 03 COMPLETION CHECKLIST

## Scrum Board Setup
- [x] Create Scrum project in JIRA
- [x] Configure board columns (Backlog, To Do, In Progress, Done)
- [x] Set sprint duration (2 weeks)

## Backlog Management
- [x] Create Product Backlog with all items
- [x] Create 6 Epics with descriptions
- [x] Create 25+ User Stories with acceptance criteria
- [x] Create Child Issues (Sub-tasks) for stories
- [x] Prioritize backlog items

## Sprint Planning
- [x] Plan 5 sprints with goals
- [x] Allocate stories to sprints
- [x] Estimate using story points
- [x] Define sprint velocity

## Bug Tracking
- [x] Create bugs with proper format
- [x] Define severity and priority
- [x] Include steps to reproduce
- [x] Link to affected components

## Roadmap & Timeline
- [x] Create timeline view
- [x] Show epic dependencies
- [x] Mark milestones

## Dashboard
- [x] Configure 6+ gadgets
- [x] Add burndown chart
- [x] Add velocity chart
- [x] Add bug distribution

---

**Lab 03 Status:** ✅ COMPLETE
