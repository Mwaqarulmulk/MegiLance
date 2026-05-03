# Incident Response Guide

> MegiLance Platform — Incident classification, response procedures, and escalation

## Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P1 Critical** | Complete service outage or data breach | Immediate | Database down, auth broken, data leak |
| **P2 High** | Major feature broken, partial outage | < 1 hour | Payments failing, search broken, API errors > 5% |
| **P3 Medium** | Non-critical feature degraded | < 4 hours | Slow queries, email delivery delayed, UI glitch |
| **P4 Low** | Minor issue, workaround available | Next business day | Cosmetic bug, documentation gap |

## Incident Response Steps

### 1. Detect
- Monitor `/api/health/ready` endpoint
- Check application logs: `docker compose logs -f backend`
- Watch for elevated 5xx error rates
- User reports via support tickets

### 2. Triage
- Assess severity level (P1-P4)
- Identify affected systems (backend, frontend, database, email)
- Check recent deployments or changes

### 3. Mitigate
**Database issues:**
```bash
# Check Turso status
turso db show megilance-prod

# Test connectivity
curl -X POST $TURSO_DATABASE_URL/v2/pipeline \
  -H "Authorization: Bearer $TURSO_AUTH_TOKEN" \
  -d '{"requests":[{"type":"execute","stmt":{"sql":"SELECT 1"}}]}'
```

**Backend issues:**
```bash
# Check service health
curl localhost:8000/api/health/ready

# Restart service
docker compose restart backend
# or: systemctl restart megilance-backend

# Check logs for errors
docker compose logs --tail=100 backend | grep -i error
```

**Frontend issues:**
```bash
# Check if build is valid
npm run build

# Restart
docker compose restart frontend
```

**Auth issues:**
```bash
# Verify JWT config
python -c "from app.core.config import get_settings; s = get_settings(); print(f'SECRET_KEY set: {bool(s.SECRET_KEY)}')"

# Check token blacklist isn't corrupted (in-memory, resets on restart)
docker compose restart backend
```

### 4. Resolve
- Apply fix (hotfix branch → merge → deploy)
- Verify fix in production
- Update this log with incident details

### 5. Post-Incident
- Document root cause
- Update monitoring/alerting if gap identified
- Add regression test if applicable

## Common Issues & Fixes

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| 503 on all endpoints | Backend crashed | `docker compose restart backend` |
| 401 on valid tokens | SECRET_KEY changed | Restore previous SECRET_KEY value |
| Slow queries > 2s | Missing index or large table scan | Check query plans, add indexes |
| Email not sending | SMTP credentials expired | Update SMTP_PASSWORD in .env |
| File upload fails | Disk full or permissions | Check disk space, `uploads/` permissions |
| CORS errors | Frontend URL mismatch | Update CORS_ORIGINS in backend .env |
| Rate limiting too aggressive | SLOWAPI settings | Adjust rate limits in rate_limit.py |

## Contact & Escalation

- **Platform issues**: Check `PLATFORM_ISSUES.md` for known issues
- **Database**: Turso support (turso.tech)
- **Hosting**: Check provider status page
- **Stripe payments**: Stripe dashboard (dashboard.stripe.com)
