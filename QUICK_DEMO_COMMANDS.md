# 🚀 Quick Demo Commands - Copy & Paste Ready

## Pre-Demo Setup (30 seconds)

```powershell
# Check everything is running
docker ps --filter name=megilance

# Verify backend health
curl http://localhost:8000/api/health/live

# Open API docs in browser
start http://localhost:8000/api/docs

# Open Oracle Console
start https://cloud.oracle.com/
```

---

## During Demo

### 1. Show Docker Containers
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### 2. Show Database Tables & Data
```powershell
docker exec megilance-backend-1 python -c "from sqlalchemy import create_engine, text; import os; e=create_engine(os.getenv('DATABASE_URL')); c=e.connect(); tables = [r[0] for r in c.execute(text('SELECT table_name FROM user_tables ORDER BY table_name'))]; [print(f'{t}: {c.execute(text(f\"SELECT COUNT(*) FROM {t}\")).scalar()} rows') for t in tables]"
```

**Expected Output:**
```
CONTRACTS: 0 rows
PAYMENTS: 0 rows
PROJECTS: 3 rows
PROPOSALS: 3 rows
SKILLS: 8 rows
USERS: 6 rows
```

### 3. Test Health Endpoint
```powershell
curl http://localhost:8000/api/health/live
```

**Expected:** `{"status":"ok"}`

### 4. List All Projects
```powershell
curl http://localhost:8000/api/projects | ConvertFrom-Json | Select-Object title, budget_min, budget_max, status | Format-Table
```

### 5. Test Login (PowerShell)
```powershell
$body = "username=client1@megilance.com&password=Demo123!"
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method Post -ContentType "application/x-www-form-urlencoded" -Body $body
Write-Host "User: $($response.user.name)" -ForegroundColor Green
Write-Host "Role: $($response.user.user_type)" -ForegroundColor Green
```

### 6. Get Current User Info
```powershell
$token = $response.access_token
$headers = @{Authorization = "Bearer $token"}
$user = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/me" -Headers $headers
$user | Format-List
```

### 7. Show All Demo Users
```powershell
docker exec megilance-backend-1 python -c "from sqlalchemy import create_engine, text; import os; e=create_engine(os.getenv('DATABASE_URL')); c=e.connect(); users = c.execute(text('SELECT email, name, user_type FROM users ORDER BY user_type, name')).fetchall(); [print(f'{u[2]:12} | {u[1]:20} | {u[0]}') for u in users]"
```

### 8. Show Projects with Details
```powershell
docker exec megilance-backend-1 python -c "from sqlalchemy import create_engine, text; import os; e=create_engine(os.getenv('DATABASE_URL')); c=e.connect(); projects = c.execute(text('SELECT title, budget_min, budget_max, status FROM projects')).fetchall(); [print(f'{p[0][:30]:30} | ${p[1]:5} - ${p[2]:5} | {p[3]}') for p in projects]"
```

### 9. Show Proposals
```powershell
docker exec megilance-backend-1 python -c "from sqlalchemy import create_engine, text; import os; e=create_engine(os.getenv('DATABASE_URL')); c=e.connect(); proposals = c.execute(text('SELECT p.id, proj.title, u.name, p.hourly_rate, p.status FROM proposals p JOIN projects proj ON p.project_id = proj.id JOIN users u ON p.freelancer_id = u.id')).fetchall(); [print(f'Proposal {p[0]} | {p[1][:25]:25} | {p[2]:15} | ${p[3]}/hr | {p[4]}') for p in proposals]"
```

---

## Impressive One-Liners

### Show Complete System Status
```powershell
Write-Host "`n🎯 MegiLance System Status`n" -ForegroundColor Cyan; Write-Host "Containers:" -ForegroundColor Yellow; docker ps --filter name=megilance --format "  ✅ {{.Names}} ({{.Status}})"; Write-Host "`nDatabase:" -ForegroundColor Yellow; docker exec megilance-backend-1 python -c "from sqlalchemy import create_engine, text; import os; e=create_engine(os.getenv('DATABASE_URL')); c=e.connect(); print(f'  ✅ Users: {c.execute(text(\"SELECT COUNT(*) FROM users\")).scalar()}'); print(f'  ✅ Projects: {c.execute(text(\"SELECT COUNT(*) FROM projects\")).scalar()}'); print(f'  ✅ Proposals: {c.execute(text(\"SELECT COUNT(*) FROM proposals\")).scalar()}')"; Write-Host "`nAPI:" -ForegroundColor Yellow; $h = curl -s http://localhost:8000/api/health/live | ConvertFrom-Json; Write-Host "  ✅ Status: $($h.status)" -ForegroundColor Green; Write-Host "`n💰 Monthly Cost: `$0.00`n" -ForegroundColor Green
```

### Database Connection Test
```powershell
docker exec megilance-backend-1 python -c "from sqlalchemy import create_engine; import os; e=create_engine(os.getenv('DATABASE_URL')); e.connect(); print('✅ Connected to Oracle Autonomous Database (Frankfurt)')"
```

---

## Emergency Commands

### Restart Backend
```powershell
docker-compose -f docker-compose.oracle.yml restart backend
Start-Sleep -Seconds 20
curl http://localhost:8000/api/health/live
```

### Restart Everything
```powershell
docker-compose -f docker-compose.oracle.yml restart
Start-Sleep -Seconds 25
curl http://localhost:8000/api/health/live
```

### View Backend Logs
```powershell
docker logs megilance-backend-1 --tail 50
```

---

## Interactive Demo Script

### Run Step-by-Step Demo
```powershell
.\demo-presentation.ps1
```

### Run Specific Section
```powershell
.\demo-presentation.ps1 -Step 1  # Overview
.\demo-presentation.ps1 -Step 2  # Infrastructure
.\demo-presentation.ps1 -Step 3  # Docker
.\demo-presentation.ps1 -Step 4  # Database
.\demo-presentation.ps1 -Step 5  # API Demo
.\demo-presentation.ps1 -Step 6  # Authentication
.\demo-presentation.ps1 -Step 7  # Technical
.\demo-presentation.ps1 -Step 8  # Deployment
.\demo-presentation.ps1 -Step 9  # Summary
```

---

## Demo Credentials

**All passwords:** `Demo123!`

| Role | Email | Name |
|------|-------|------|
| Admin | admin@megilance.com | System Admin |
| Client | client1@megilance.com | John Smith |
| Client | client2@megilance.com | Sarah Johnson |
| Freelancer | freelancer1@megilance.com | Alex Chen |
| Freelancer | freelancer2@megilance.com | Maria Garcia |
| Freelancer | freelancer3@megilance.com | David Kumar |

---

## API Endpoints to Demo

**Base URL:** `http://localhost:8000`

### Public Endpoints
```bash
GET  /api/health/live          # Health check
GET  /api/health/ready         # Readiness check
GET  /api/docs                 # Swagger UI
GET  /api/redoc                # ReDoc UI
GET  /api/projects             # List projects
```

### Auth Endpoints
```bash
POST /api/auth/register        # Register new user
POST /api/auth/login           # Login
POST /api/auth/refresh         # Refresh token
GET  /api/auth/me              # Current user
```

### Protected Endpoints (require Bearer token)
```bash
GET    /api/users/me           # Get current user
PUT    /api/users/me           # Update current user
POST   /api/projects           # Create project
GET    /api/projects/{id}      # Get project
PUT    /api/projects/{id}      # Update project
DELETE /api/projects/{id}      # Delete project
POST   /api/proposals          # Submit proposal
GET    /api/proposals          # List proposals
```

---

## Key Points to Mention

✅ **Cost:** $0.00/month (Always Free tier)  
✅ **Database:** Oracle Autonomous Database (enterprise-grade)  
✅ **Driver:** oracledb 2.0.1 thin mode (no Oracle Client needed)  
✅ **Security:** Wallet authentication + JWT tokens  
✅ **Architecture:** Docker + FastAPI + SQLAlchemy  
✅ **Scalability:** Can upgrade to paid tier as needed  
✅ **Savings:** ~$50-100/month vs AWS RDS  

---

## Pro Tips

1. **Keep Oracle Console open** in a browser tab
2. **Keep API docs open** at http://localhost:8000/api/docs
3. **Have PowerShell ready** with this file open
4. **Test commands before demo** to ensure they work
5. **Know your demo password:** `Demo123!`

**You're ready! 🚀**
