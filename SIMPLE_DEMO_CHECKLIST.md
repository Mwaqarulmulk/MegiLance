# 📋 Professor Demo - Simple Checklist

## ✅ Before Demo (5 minutes)

- [ ] Docker containers running: `docker ps`
- [ ] Backend healthy: `curl http://localhost:8000/api/health/live`
- [ ] Oracle Console open: https://cloud.oracle.com/
- [ ] API docs open: http://localhost:8000/api/docs
- [ ] Know password: `Demo123!`

## 🎬 During Demo (10 minutes)

### Part 1: Infrastructure (2 min)
- [ ] Show Oracle Console → Autonomous Database → megilancedb (AVAILABLE, $0/month)
- [ ] Show Object Storage → megilance-storage (10GB, $0/month)

### Part 2: Docker Stack (2 min)
- [ ] `docker ps` - Show 2 containers running
- [ ] Show API docs at http://localhost:8000/api/docs

### Part 3: Database (2 min)
- [ ] Show tables: Run command from `QUICK_DEMO_COMMANDS.md` → Section 2
- [ ] Explain: 6 tables (USERS, PROJECTS, PROPOSALS, CONTRACTS, PAYMENTS, SKILLS)

### Part 4: API Demo (3 min)
- [ ] Health check: `curl http://localhost:8000/api/health/live`
- [ ] List projects: Use command from `QUICK_DEMO_COMMANDS.md` → Section 4
- [ ] Browse Swagger UI (already open)

### Part 5: Closing (1 min)
- [ ] Mention: $0/month total cost
- [ ] Mention: Production-ready, complete docs
- [ ] Open to questions

## 🔑 Login Info (if needed)

```
client1@megilance.com / Demo123!
```

## 🆘 If Something Breaks

```powershell
docker-compose -f docker-compose.oracle.yml restart backend
Start-Sleep -Seconds 20
```

## 💡 Key Points

- **Cost**: $0.00/month (Always Free tier)
- **Database**: Oracle Autonomous Database
- **Stack**: FastAPI + Python 3.11 + Docker
- **API**: 18+ endpoints with Swagger docs

---

**You've got this! 🎓🚀**
