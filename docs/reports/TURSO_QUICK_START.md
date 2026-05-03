# Turso Database - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Get Turso Credentials

If you already have credentials, skip to Step 2.

#### Option A: Using Turso CLI (Recommended)
```bash
# Install Turso CLI
# Windows: winget install chiselstrike.turso
# macOS: brew install tursodatabase/tap/turso
# Linux: curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create megilance-db

# Get URL
turso db show megilance-db --url

# Get auth token
turso db tokens create megilance-db
```

#### Option B: Using Turso Web Console
1. Visit https://turso.tech and sign up
2. Click "Create Database"
3. Copy the database URL and generate an auth token

### Step 2: Configure Environment Variables

Edit `backend/.env`:

```bash
# REQUIRED - Turso Database
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=eyJhbGci...your-token-here
```

### Step 3: Start the Application

#### Using Docker (Easiest)
```bash
# Development mode with hot reload
docker compose -f docker-compose.dev.yml up --build

# Production mode
docker compose up -d
```

#### Using Local Python
```bash
# Requires Rust toolchain on Windows
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Run server
python -m uvicorn main:app --reload --port 8000
```

## 🔍 Verify Setup

### Check Database Connection
```bash
curl http://localhost:8000/api/health/ready
```

Expected response:
```json
{
  "status": "ready",
  "database": "connected",
  "turso": true
}
```

### View API Documentation
Visit: http://localhost:8000/api/docs

## 🛠️ Troubleshooting

### Error: "Turso database not configured"
**Solution:** Ensure `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set in `backend/.env`

### Error: "sqlalchemy-libsql not installed" (Windows)
**Solution 1 (Recommended):** Use Docker
```bash
docker compose -f docker-compose.dev.yml up --build
```

**Solution 2:** Install Rust toolchain
1. Download from: https://rustup.rs/
2. Run installer and restart terminal
3. Install package: `python -m pip install sqlalchemy-libsql`

### Error: "Failed to connect to Turso"
**Checklist:**
- ✅ Verify auth token is valid (not expired)
- ✅ Check internet connection
- ✅ Ensure database URL format: `libsql://your-db.turso.io`
- ✅ Verify token has correct permissions

## 📊 Turso Free Tier Limits

| Resource | Free Tier |
|----------|-----------|
| Storage | 500 MB |
| Row Reads | 1 billion/month |
| Row Writes | 25 million/month |
| Databases | 3 databases |
| Locations | 3 locations |

**Note:** More than enough for development and small production deployments!

## 🔐 Security Best Practices

### Development
```bash
# Use separate database for dev
turso db create megilance-dev

# Generate read-write token
turso db tokens create megilance-dev
```

### Production
```bash
# Use separate database for production
turso db create megilance-prod

# Generate restricted token (if needed)
turso db tokens create megilance-prod --expiration 30d
```

### Team Collaboration
```bash
# Share database access with team members
turso db share megilance-dev --email teammate@example.com

# Team members can generate their own tokens
turso db tokens create megilance-dev
```

## 📚 Useful Commands

### Database Management
```bash
# List databases
turso db list

# Show database info
turso db show megilance-db

# Access database shell
turso db shell megilance-db

# View database schema
turso db shell megilance-db ".schema"
```

### Token Management
```bash
# List tokens
turso db tokens list megilance-db

# Revoke token
turso db tokens revoke megilance-db <token-name>

# Create temporary token
turso db tokens create megilance-db --expiration 7d
```

### Backups & Replication
```bash
# Create manual backup
turso db backup megilance-db

# List replicas
turso db locations megilance-db

# Add replica location
turso db replicate megilance-db --location iad
```

## 🌐 Multi-Region Setup (Optional)

For global low-latency access:

```bash
# Add replicas in different regions
turso db replicate megilance-prod --location iad  # US East
turso db replicate megilance-prod --location lhr  # London
turso db replicate megilance-prod --location sin  # Singapore

# Verify replicas
turso db locations megilance-prod
```

## 🔄 Migration from Local SQLite

If you have existing local data:

### Export from SQLite
```bash
sqlite3 old_database.db .dump > backup.sql
```

### Import to Turso
```bash
turso db shell megilance-db < backup.sql
```

## 📖 Additional Resources

- **Turso Documentation:** https://docs.turso.tech
- **Turso Discord:** https://discord.gg/turso
- **libSQL Documentation:** https://github.com/tursodatabase/libsql
- **SQLAlchemy Integration:** https://docs.turso.tech/sdk/python/orm

## 💡 Tips

1. **Use branches for testing:**
   ```bash
   turso db create megilance-test --from-db megilance-dev
   ```

2. **Monitor usage:**
   ```bash
   turso db inspect megilance-prod
   ```

3. **Enable point-in-time recovery:** Available on paid plans for production

4. **Set up CI/CD:** Use Turso tokens as GitHub secrets for automated deployments

---

**Need Help?** Check [TURSO_ONLY_MIGRATION_COMPLETE.md](./TURSO_ONLY_MIGRATION_COMPLETE.md) for detailed migration information.
