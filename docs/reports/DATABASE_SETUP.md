# MegiLance Database Setup & Turso Integration Guide

## 🗄️ Database Strategy

### Development
- **Local SQLite** (`local_dev.db`)
- File-based, no server setup needed
- Perfect for rapid development
- Auto-created on first run

### Production
- **Turso (libSQL)** - distributed SQLite
- Scalable, replicated across edge locations
- Global replication with local read replicas
- Managed backups and monitoring

## 📋 Prerequisites

```bash
# Install Turso CLI
choco install turso  # Windows
brew install tursodatabase/tap/turso  # macOS
```

## 🚀 Quick Start - Local Development

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Apply migrations
alembic upgrade head

# 5. Start backend
python main.py
```

This will automatically:
- Create `local_dev.db` if it doesn't exist
- Run SQLAlchemy schema creation
- Start server on http://localhost:8000

## 🔧 Turso Production Setup

### 1. Create Turso Database

```bash
# Login to Turso
turso auth login

# List existing databases
turso db list

# Create new database
turso db create megilance-prod

# Get connection URL
turso db show megilance-prod

# Get auth token
turso db tokens create megilance-prod
```

### 2. Set Environment Variables

```bash
# In production .env or deployment config:
ENVIRONMENT=production
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=<your-token-from-above>
SECRET_KEY=<generate-strong-key>
```

### 3. Run Migrations on Production

```bash
# Apply migrations (will use TURSO_DATABASE_URL)
alembic upgrade head
```

### 4. Enable Backups

```bash
# Create backup
turso db backup create megilance-prod

# List backups
turso db backup list megilance-prod

# Restore from backup
turso db restore megilance-prod --backup <backup-name>
```

## 🗂️ Database Schema Overview

### Core Tables

#### users
- id (PRIMARY KEY)
- email (UNIQUE, INDEX)
- hashed_password
- name, bio, location
- role (freelancer|client|admin)
- is_active, is_verified
- created_at, updated_at

#### projects
- id (PRIMARY KEY)
- title, description
- client_id (FK -> users)
- status (open|in_progress|completed|cancelled)
- budget_min, budget_max
- category, skills
- created_at, updated_at

#### proposals
- id (PRIMARY KEY)
- project_id (FK -> projects)
- freelancer_id (FK -> users)
- cover_letter, estimated_duration
- amount, currency
- status (pending|accepted|rejected)
- created_at, updated_at

#### contracts
- id (PRIMARY KEY)
- project_id (FK -> projects)
- client_id (FK -> users)
- freelancer_id (FK -> users)
- terms, scope
- start_date, end_date
- status (draft|active|completed|terminated)
- created_at, updated_at

#### payments
- id (PRIMARY KEY)
- contract_id (FK -> contracts)
- from_user_id, to_user_id (FK -> users)
- amount, currency
- status (pending|processing|completed|failed|refunded)
- payment_type (milestone|full|hourly|escrow)
- tx_hash (blockchain transaction)
- created_at, updated_at

#### messages
- id (PRIMARY KEY)
- conversation_id (FK -> conversations)
- sender_id (FK -> users)
- content, attachments
- is_read
- created_at

#### reviews
- id (PRIMARY KEY)
- project_id (FK -> projects)
- reviewer_id, reviewee_id (FK -> users)
- rating (1-5)
- comment
- created_at

## 🔍 Database Indexes

### Performance Critical Indexes

```sql
-- Authentication
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Project Queries
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Messaging
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Payments
CREATE INDEX idx_payments_user_id ON payments(from_user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Composites
CREATE INDEX idx_projects_client_status ON projects(client_id, status);
CREATE INDEX idx_messages_conv_sender ON messages(conversation_id, sender_id);
```

### Run Indexes Migration

```bash
# The migration `001_add_database_indexes.py` contains all indexes
alembic upgrade head
```

## 📊 Full-Text Search (FTS5)

Turso supports SQLite's FTS5 extension for efficient full-text search.

### Create FTS Virtual Table

```sql
-- Create FTS5 table for projects
CREATE VIRTUAL TABLE projects_fts USING fts5(
  title,
  description,
  content=projects,
  content_rowid=id
);

-- Populate from projects
INSERT INTO projects_fts(rowid, title, description)
SELECT id, title, description FROM projects;

-- Triggers to keep FTS in sync
CREATE TRIGGER projects_ai AFTER INSERT ON projects BEGIN
  INSERT INTO projects_fts(rowid, title, description) 
  VALUES (new.id, new.title, new.description);
END;
```

### Query FTS

```python
# In backend code
results = db.execute("""
  SELECT p.* FROM projects p
  JOIN projects_fts ON p.id = projects_fts.rowid
  WHERE projects_fts MATCH ?
  ORDER BY rank
  LIMIT 20
""", [search_query]).fetchall()
```

## 🔄 Migrations

### Create New Migration

```bash
# Generate migration based on model changes
alembic revision --autogenerate -m "description"

# Review the generated migration
alembic history

# Apply migration
alembic upgrade head
```

### Rollback Migration

```bash
# Rollback to previous version
alembic downgrade -1

# Or rollback to specific version
alembic downgrade <revision-number>
```

### Migration Best Practices

1. **Always create backups before running migrations in production**
2. **Test migrations locally first**
3. **Name migrations descriptively** (`add_user_skills_index`)
4. **Keep migrations small and focused**
5. **Use data migrations cautiously** (test on copy first)

## 🛡️ Database Security

### Connection Security

```python
# Development
DATABASE_URL=sqlite:///./local_dev.db

# Production (HTTPS connection)
TURSO_DATABASE_URL=libsql://db.turso.io?tls=1
TURSO_AUTH_TOKEN=<secure-token>
```

### Data Validation

All user inputs go through Pydantic models:

```python
class PaymentCreate(BaseModel):
    amount: Decimal = Field(..., gt=0, le=1000000)
    currency: str = Field(..., pattern=r"^[A-Z]{3}$")
    description: str = Field(..., min_length=1, max_length=500)
```

### Query Parameterization

Always use parameterized queries to prevent SQL injection:

```python
# ✅ CORRECT - Parameterized query
user = db.query(User).filter(User.email == email).first()

# ❌ WRONG - SQL injection risk
user = db.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

## 📈 Database Monitoring

### Check Database Size

```bash
turso db shell megilance-prod
> SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();
```

### View Recent Backups

```bash
turso db backup list megilance-prod
```

### Test Connection

```python
from sqlalchemy import text
from app.db.session import get_engine

engine = get_engine()
with engine.connect() as conn:
    result = conn.execute(text("SELECT 1"))
    print("Database connection OK")
```

## 🆘 Troubleshooting

### "Database connection failed"

**Solution:**
1. Check `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set
2. Verify token hasn't expired: `turso db tokens list`
3. Create new token: `turso db tokens create <db-name>`

### "Migrations failed"

**Solution:**
1. Check migration file syntax
2. Test migration locally first
3. Backup database before running in production
4. Run: `alembic current` to see current version

### "FTS5 not working"

**Solution:**
1. Turso enables FTS5 by default
2. Verify virtual table created: `SELECT name FROM sqlite_master WHERE type='table'`
3. Re-populate FTS data if needed

## 📚 References

- [Turso Documentation](https://docs.turso.tech)
- [libSQL Client](https://github.com/tursodatabase/libsql)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org)
- [Alembic Migration Tool](https://alembic.sqlalchemy.org)
- [SQLite FTS5](https://www.sqlite.org/fts5.html)
