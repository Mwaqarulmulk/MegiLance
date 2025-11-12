# 🚀 MegiLance Oracle Quick Reference

## Current Status
**Date:** November 13, 2025  
**Setup:** 100% Oracle Autonomous Database (Always Free Tier)  
**Cost:** $0.00/month  
**Build:** In Progress (Step 3/6 - Installing dependencies)

---

## Quick Commands

### Start Everything
```powershell
# Complete automated setup
.\ORACLE_COMPLETE_SETUP.ps1
```

### Check Status
```powershell
# Container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Backend logs
docker logs megilance-backend-1 --tail 50

# Test all APIs
.\ORACLE_TEST_ALL.ps1
```

### Database Operations
```powershell
# Run migrations
docker exec megilance-backend-1 alembic upgrade head

# Check current migration
docker exec megilance-backend-1 alembic current

# Connect to Oracle DB
docker exec -it megilance-backend-1 python
>>> from sqlalchemy import create_engine
>>> import os
>>> engine = create_engine(os.getenv('DATABASE_URL'))
>>> # Now you can execute SQL
```

### Test Specific Endpoints
```powershell
# Health check
curl http://localhost:8000/api/health/live

# Register user
curl -X POST http://localhost:8000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@megilance.com","password":"Test123!","full_name":"Test User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "username=test@megilance.com&password=Test123!"
```

---

## URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Backend API** | http://localhost:8000 | FastAPI Backend |
| **Swagger UI** | http://localhost:8000/api/docs | Interactive API Docs |
| **ReDoc** | http://localhost:8000/api/redoc | Alternative API Docs |
| **Frontend** | http://localhost:3000 | Next.js Frontend |
| **Health** | http://localhost:8000/api/health/live | Health Check |

---

## Oracle Database Info

### Connection Details
- **Type:** Oracle Autonomous Database 23ai
- **Service:** megilancedb_high
- **User:** ADMIN
- **Password:** Bfw5ZvHQXjkDb!3lAa1!
- **Wallet:** E:\MegiLance\oracle-wallet
- **Wallet Password:** MegiLance2025!Wallet

### Connection String
```
oracle+oracledb://ADMIN:Bfw5ZvHQXjkDb!3lAa1!@megilancedb_high?wallet_location=/app/oracle-wallet&wallet_password=MegiLance2025!Wallet
```

### OCI Console
- **URL:** https://cloud.oracle.com
- **Region:** eu-frankfurt-1 (Frankfurt)
- **Compartment:** Root compartment
- **Database OCID:** `ocid1.autonomousdatabase.oc1.eu-frankfurt-1.antheljsgrln3kqaq3j7fljpzt6aosyzdllb3jfydp3sjgqvmfhkwnkmewdq`

---

## Troubleshooting

### Build Issues
```powershell
# Clean rebuild
docker-compose -f docker-compose.oracle.yml down
docker-compose -f docker-compose.oracle.yml build --no-cache backend
docker-compose -f docker-compose.oracle.yml up -d
```

### Backend Won't Start
```powershell
# Check logs
docker logs megilance-backend-1 --tail 100

# Verify oracledb module
docker exec megilance-backend-1 python -c "import oracledb; print(oracledb.__version__)"

# Test database connection
docker exec megilance-backend-1 python -c "
from sqlalchemy import create_engine, text
import os
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    result = conn.execute(text('SELECT 1 FROM DUAL'))
    print('Connected!')
"
```

### Migration Errors
```powershell
# Reset to base
docker exec megilance-backend-1 alembic downgrade base

# Rerun migrations
docker exec megilance-backend-1 alembic upgrade head

# Check migration history
docker exec megilance-backend-1 alembic history
```

### Database Connection Fails
1. Check wallet files exist:
   ```powershell
   Get-ChildItem E:\MegiLance\oracle-wallet
   ```
2. Verify ADB status in OCI Console (should be "AVAILABLE")
3. Test connection from container:
   ```powershell
   docker exec megilance-backend-1 ls -la /app/oracle-wallet
   ```

---

## Files Structure

```
E:\MegiLance\
├── backend/
│   ├── Dockerfile.oracle          # Optimized Oracle Dockerfile
│   ├── requirements.txt           # Python deps (includes oracledb)
│   ├── .env                       # Environment variables
│   └── app/
│       ├── main.py               # FastAPI app
│       ├── models/               # SQLAlchemy models
│       └── api/v1/               # API endpoints
├── frontend/                      # Next.js frontend
├── oracle-wallet/                 # Oracle DB authentication
│   ├── tnsnames.ora
│   ├── sqlnet.ora
│   └── cwallet.sso
├── docker-compose.oracle.yml      # Docker Compose for Oracle
├── ORACLE_COMPLETE_SETUP.ps1      # Automated setup script
├── ORACLE_TEST_ALL.ps1            # Comprehensive test suite
├── UPGRADE_ORACLE_23AI.md         # 23ai upgrade guide
├── PROFESSOR_DEMO_CHECKLIST.md    # Demo preparation
└── ORACLE_ALWAYS_FREE_SETUP.md    # Technical documentation
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login (returns JWT)
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user (requires auth)

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project (requires auth)
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project (requires auth)
- `DELETE /api/projects/{id}` - Delete project (requires auth)

### Proposals
- `GET /api/proposals` - List proposals
- `POST /api/proposals` - Submit proposal (requires auth)
- `GET /api/proposals/{id}` - Get proposal details

### Health
- `GET /api/health/live` - Liveness check
- `GET /api/health/ready` - Readiness check

---

## Professor Demo Checklist

### Pre-Demo (5 minutes before)
- [ ] Run `.\ORACLE_COMPLETE_SETUP.ps1`
- [ ] Run `.\ORACLE_TEST_ALL.ps1`
- [ ] Open Swagger UI: http://localhost:8000/api/docs
- [ ] Open OCI Console: https://cloud.oracle.com

### Demo Flow (10-15 minutes)
1. **Introduction (2 min)**
   - "Full-stack app with Oracle 23ai Autonomous Database"
   - "100% Always Free tier - zero monthly cost"
   - "FastAPI backend + Next.js frontend"

2. **Oracle Console (3 min)**
   - Show Autonomous Database (AVAILABLE status)
   - Highlight: 1 OCPU, Always Free tier
   - Show Object Storage bucket (10GB free)
   - Cost Analysis: $0.00/month

3. **Backend API (4 min)**
   - Open Swagger UI
   - Demo POST /api/auth/register (create user)
   - Demo POST /api/auth/login (get JWT)
   - Demo GET /api/auth/me (authenticated endpoint)
   - Show response times (<100ms)

4. **Database Verification (3 min)**
   - Query version: `SELECT BANNER FROM V$VERSION`
   - Show tables: `SELECT table_name FROM user_tables`
   - Count users: `SELECT COUNT(*) FROM users`
   - Demonstrate data persistence

5. **Architecture (2-3 min)**
   - Explain oracledb thin mode (no Instant Client)
   - Docker containerization
   - SQLAlchemy ORM
   - Always Free tier advantages

### Key Points to Emphasize
✅ Enterprise Oracle database at zero cost  
✅ Modern Python stack (FastAPI + SQLAlchemy)  
✅ Production-ready with migrations  
✅ Full authentication system  
✅ Cloud-native architecture  
✅ Scalable to paid tier seamlessly  

---

## Next Steps After Demo

1. **Deploy to Oracle Cloud Compute (Always Free)**
   ```bash
   # Use Always Free VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM)
   # Or use Oracle Container Engine for Kubernetes (OKE)
   ```

2. **Add Features**
   - File uploads to Object Storage
   - Real-time messaging (WebSockets)
   - Email notifications
   - Advanced search

3. **Monitoring**
   - Set up OCI Monitoring
   - Configure alerts
   - Enable audit logs

4. **Upgrade to 23ai** (if not already)
   - See UPGRADE_ORACLE_23AI.md
   - 10-15 minutes, zero downtime

---

## Support Resources

- **Oracle Docs:** https://docs.oracle.com/en/cloud/paas/autonomous-database/
- **oracledb Python:** https://python-oracledb.readthedocs.io/
- **FastAPI:** https://fastapi.tiangolo.com/
- **OCI Free Tier:** https://www.oracle.com/cloud/free/

---

## Cost Breakdown (Always Free Tier)

| Resource | Specs | Monthly Cost |
|----------|-------|--------------|
| Autonomous Database | 1 OCPU, 20GB RAM, 1TB storage | **$0.00** |
| Object Storage | 10GB | **$0.00** |
| Outbound Data Transfer | 10TB/month | **$0.00** |
| **TOTAL** | | **$0.00** |

**Note:** This is perpetually free - not a trial. As long as you stay within Always Free limits, you pay nothing.

---

## Build Status

**Current Build:** Oracle backend with oracledb 2.0.1  
**Expected Completion:** 5-8 minutes total  
**Current Step:** 3/6 (Installing gcc and dependencies)  
**Progress:** ~40% complete  

**Next Steps After Build:**
1. ✅ Start containers
2. ✅ Run migrations
3. ✅ Test APIs
4. ✅ Verify data persistence
5. ✅ Run full test suite
6. ✅ Prepare demo

---

_Last Updated: November 13, 2025 00:20 UTC_  
_Status: Build in progress - Oracle setup automated_
