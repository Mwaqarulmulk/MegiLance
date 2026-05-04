# Database Schema Documentation

> MegiLance Platform — Turso (libSQL) Database Schema Reference

## Overview

The platform uses **Turso** (libSQL cloud database) accessed via HTTP API (Hrana protocol). Models are defined in `backend/app/models/` as SQLAlchemy mapped classes for reference, but all runtime queries use raw SQL via `turso_http.py`.

**Total tables: 40** across 38 model files.

---

## Core Tables

### `users`
Primary user accounts for all roles (client, freelancer, admin).

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| email | VARCHAR(254) | Unique, indexed |
| hashed_password | VARCHAR(255) | bcrypt hash |
| name | VARCHAR(100) | Display name |
| full_name | VARCHAR(200) | Optional full name |
| role | VARCHAR(20) | admin/client/freelancer |
| user_type | VARCHAR(20) | Mirrors role (legacy) |
| is_active | BOOLEAN | Account enabled |
| email_verified | BOOLEAN | Email verification status |
| email_verification_token | VARCHAR(255) | Pending verification token |
| two_factor_enabled | BOOLEAN | 2FA status |
| skills | TEXT | Comma-separated skill list |
| hourly_rate | FLOAT | Freelancer rate |
| account_balance | FLOAT | Wallet balance |
| bio | TEXT | Profile biography |
| location | VARCHAR(100) | User location |
| profile_image_url | VARCHAR(500) | Avatar URL |
| profile_data | TEXT | JSON blob (title, portfolio_url) |
| joined_at | DATETIME | Registration timestamp |

### `projects`
Client-posted project listings.

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| title | VARCHAR(200) | |
| description | TEXT | |
| category | VARCHAR(100) | |
| budget_type | VARCHAR(20) | fixed/hourly |
| budget_min | FLOAT | |
| budget_max | FLOAT | |
| client_id | INTEGER FK→users | |
| status | VARCHAR(20) | open/in_progress/completed/cancelled/on_hold |
| skills | TEXT | Required skills |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### `proposals`
Freelancer bids on projects.

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| project_id | INTEGER FK→projects | |
| freelancer_id | INTEGER FK→users | |
| bid_amount | FLOAT | gt=0 validated |
| cover_letter | TEXT | Sanitized |
| status | VARCHAR(20) | pending/accepted/rejected/withdrawn |
| availability | VARCHAR(100) | |
| estimated_hours | FLOAT | |
| created_at | DATETIME | |

### `contracts`
Agreements between client and freelancer.

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| contract_address | VARCHAR(255) | Unique identifier |
| project_id | INTEGER FK→projects | |
| freelancer_id | INTEGER FK→users | |
| client_id | INTEGER FK→users | |
| winning_bid_id | INTEGER FK→proposals | |
| contract_type | VARCHAR(50) | |
| amount | FLOAT | Total contract value |
| currency | VARCHAR(10) | Default: USD |
| status | VARCHAR(20) | |
| description | TEXT | |
| created_at | DATETIME | |

### `milestones`
Contract deliverable tracking.

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| contract_id | INTEGER FK→contracts | |
| title | VARCHAR(200) | |
| description | TEXT | |
| amount | FLOAT | Milestone payment |
| status | VARCHAR(20) | pending/in_progress/submitted/approved/rejected |
| due_date | DATETIME | |
| created_at | DATETIME | |

---

## Communication Tables

### `conversations`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| project_id | INTEGER FK→projects | Optional |
| client_id | INTEGER FK→users | |
| freelancer_id | INTEGER FK→users | |
| title | VARCHAR(200) | |
| status | VARCHAR(20) | |
| last_message_at | DATETIME | |

### `messages`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| conversation_id | INTEGER FK→conversations | |
| sender_id | INTEGER FK→users | |
| content | TEXT | Sanitized via sanitize_content() |
| is_read | BOOLEAN | |
| created_at | DATETIME | |

---

## Financial Tables

### `payments`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| contract_id | INTEGER FK→contracts | |
| milestone_id | INTEGER FK→milestones | |
| from_user_id | INTEGER FK→users | |
| to_user_id | INTEGER FK→users | |
| amount | FLOAT | gt=0 validated |
| payment_type | VARCHAR(50) | |
| status | VARCHAR(20) | |
| transaction_id | VARCHAR(255) | External reference |
| created_at | DATETIME | |

### `escrow`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| contract_id | INTEGER FK→contracts | |
| amount | FLOAT | |
| status | VARCHAR(20) | |

### `invoices`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| contract_id | INTEGER FK→contracts | |
| amount | FLOAT | |
| status | VARCHAR(20) | |
| due_date | DATETIME | |

### `refunds`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| payment_id | INTEGER FK→payments | |
| amount | FLOAT | |
| reason | TEXT | |
| status | VARCHAR(20) | |

---

## Dispute & Review Tables

### `disputes`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| contract_id | INTEGER FK→contracts | |
| raised_by | INTEGER FK→users | |
| dispute_type | VARCHAR(50) | |
| description | TEXT | Sanitized |
| status | VARCHAR(20) | |
| assigned_to | INTEGER FK→users | Admin |
| resolution | TEXT | Sanitized |

### `reviews`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| reviewer_id | INTEGER FK→users | |
| reviewee_id | INTEGER FK→users | |
| contract_id | INTEGER FK→contracts | Must be completed |
| rating | INTEGER | 1-5 |
| comment | TEXT | Sanitized |

---

## Gig Marketplace Tables

### `gigs`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| seller_id | INTEGER FK→users | |
| title | VARCHAR(200) | |
| slug | VARCHAR(255) | Unique |
| description | TEXT | |
| category_id | INTEGER FK→categories | |
| status | VARCHAR(20) | draft/active/paused/suspended |
| basic_price | FLOAT | |
| rating_average | FLOAT | |
| orders_completed | INTEGER | |

### `gig_orders`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| order_number | VARCHAR(50) | Unique |
| gig_id | INTEGER FK→gigs | |
| buyer_id | INTEGER FK→users | |
| seller_id | INTEGER FK→users | |
| total_price | FLOAT | |
| status | VARCHAR(20) | |

### `gig_deliveries`, `gig_faqs`, `gig_reviews`, `gig_revisions`
Supporting tables for gig lifecycle operations.

---

## Supporting Tables

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | VARCHAR(100) | |
| slug | VARCHAR(100) | |
| parent_id | INTEGER FK→categories | Self-referential |
| is_active | BOOLEAN | |

### `skills`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | VARCHAR(100) | |
| category | VARCHAR(100) | |

### `user_skills`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| user_id | INTEGER FK→users | |
| skill_id | INTEGER FK→skills | |
| proficiency_level | VARCHAR(20) | |
| is_verified | BOOLEAN | |

### `tags` / `project_tags`
Tagging system for projects.

### `favorites`
User bookmarks for projects/freelancers.

### `portfolio_items`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| freelancer_id | INTEGER FK→users | |
| title | VARCHAR(200) | |
| description | TEXT | |
| image_url | VARCHAR(500) | |
| project_url | VARCHAR(500) | |

---

## Platform Operations Tables

### `notifications`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| user_id | INTEGER FK→users | |
| notification_type | VARCHAR(50) | |
| title | VARCHAR(200) | |
| content | TEXT | |
| is_read | BOOLEAN | |

### `support_tickets`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| user_id | INTEGER FK→users | |
| subject | VARCHAR(200) | |
| status | VARCHAR(20) | |

### `audit_logs`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| user_id | INTEGER FK→users | |
| entity_type | VARCHAR(50) | |
| entity_id | INTEGER | |
| action | VARCHAR(50) | |
| old_values | TEXT | JSON |
| new_values | TEXT | JSON |
| ip_address | VARCHAR(45) | |

### `analytics_events`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| event_type | VARCHAR(50) | |
| user_id | INTEGER FK→users | |
| session_id | VARCHAR(100) | |
| entity_type | VARCHAR(50) | |
| entity_id | INTEGER | |
| event_data | TEXT | JSON |

### `user_sessions`
Active session tracking for security.

### `user_verifications`
KYC/identity verification status.

| Column | Type | Notes |
|--------|------|-------|
| user_id | INTEGER PK FK→users | |
| kyc_status | VARCHAR(20) | |
| identity_doc_url | VARCHAR(500) | |
| company_name | VARCHAR(200) | |
| tax_id | VARCHAR(50) | |

---

## Other Tables

| Table | Purpose |
|-------|---------|
| `referrals` | Referral program tracking |
| `time_entries` | Billable hour tracking |
| `external_projects` | Scraped external job listings |
| `talent_invitations` | Client→freelancer invites |
| `seller_stats` | Cached seller performance metrics |
| `scope_change_requests` | Contract modification requests |
| `project_embeddings` | AI matching vector storage |
| `user_embeddings` | AI matching vector storage |

---

## Key Relationships

```
users ─┬─< projects ─< proposals
       │              └─< contracts ─┬─< milestones
       │                             ├─< payments
       │                             ├─< disputes
       │                             └─< escrow
       ├─< conversations ─< messages
       ├─< portfolio_items
       ├─< reviews (as reviewer/reviewee)
       ├─< gigs ─< gig_orders
       ├─< notifications
       └─< audit_logs
```

## Notes

- **No ORM at runtime**: All queries use raw SQL via `turso_http.py` (Hrana HTTP protocol)
- **No foreign key enforcement**: Turso HTTP API doesn't support PRAGMA foreign_keys; referential integrity managed at application layer
- **ID format**: INTEGER auto-increment (some endpoints accept string IDs and cast)
- **Timestamps**: All use `datetime.now(timezone.utc).isoformat()` format
- **Soft deletes**: Not implemented — records are hard-deleted
- **Migrations**: Alembic configured but primarily for reference; most schema changes applied via raw SQL
