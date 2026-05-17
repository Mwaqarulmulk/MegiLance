# Turso Database Setup Guide

## Prerequisites
- Turso CLI installed (`turso --version`)
- Turso account at https://turso.tech

## Step 1: Login to Turso

```bash
turso auth login
```

This will open a browser window for authentication.

## Step 2: Create Database (if not exists)

```bash
turso db create megilance-db --location aws-ap-south-1
```

## Step 3: Generate Auth Token

```bash
turso db tokens create megilance-db
```

Copy the token output.

## Step 4: Configure Environment

Edit `backend/.env`:

```env
TURSO_DATABASE_URL=libsql://megilance-db-<your-org>.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=<paste-token-here>
```

## Step 5: Apply Migrations

```bash
cd backend
python scripts/setup_turso.py
```

This will:
1. Verify connection
2. Apply all 5 migrations
3. Create performance indexes
4. Verify schema

## Step 6: Verify

```bash
# Check health
curl http://localhost:8000/health

# Check metrics
curl http://localhost:8000/health/metrics

# List tables via Turso CLI
turso db shell megilance-db "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```

## Expected Tables (22 total)

| Table | Migration | Purpose |
|-------|-----------|---------|
| `users` | Base | User accounts |
| `projects` | Base | Project listings |
| `proposals` | Base | Freelancer applications |
| `contracts` | Base | Active contracts |
| `conversations` | Base | Chat conversations |
| `messages` | Base | Chat messages |
| `reviews` | Base | Project reviews |
| `disputes` | Base | Dispute cases |
| `payments` | Base | Payment records |
| `escrow` | Base | Escrow records |
| `notifications` | Base | User notifications |
| `support_tickets` | Base | Support tickets |
| `gigs` | 004 | Gig marketplace |
| `gig_orders` | 004 | Gig orders |
| `gig_reviews` | 004 | Gig reviews |
| `gig_revisions` | 004 | Gig revisions |
| `gig_deliveries` | 004 | Gig deliveries |
| `gig_faqs` | 004 | Gig FAQs |
| `notification_preferences` | 005 | Notification settings |
| `wallet_transactions` | 005 | Wallet history |
| `fraud_alerts` | 005 | Fraud reports |
| `support_messages` | 005 | Ticket messages |

## Useful Turso Commands

```bash
# List databases
turso db list

# Show database info
turso db show megilance-db

# Shell into database
turso db shell megilance-db

# Run a query
turso db shell megilance-db "SELECT COUNT(*) FROM users"

# View connection strings
turso db show megilance-db --url

# Create new token
turso db tokens create megilance-db

# List tokens
turso db tokens list megilance-db

# Invalidate all tokens
turso db tokens invalidate megilance-db
```

## Troubleshooting

### "You are not logged in"
```bash
turso auth login
```

### "Database not found"
```bash
turso db list
# Check the database name and org in the URL
```

### "Invalid token"
```bash
turso db tokens create megilance-db
# Update TURSO_AUTH_TOKEN in .env
```

### Migration fails
```bash
# Run migrations one at a time
cd backend
python scripts/apply_migration.py scripts/migrations/003_enhance_portfolio.py
python scripts/apply_migration.py scripts/migrations/004_gig_marketplace.py
python scripts/apply_migration.py scripts/migrations/005_add_missing_tables.py
```
