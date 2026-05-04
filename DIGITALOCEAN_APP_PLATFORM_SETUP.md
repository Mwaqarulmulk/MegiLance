# DigitalOcean App Platform - MegiLance Deployment

**Status**: ✅ Optimized for DigitalOcean App Platform  
**Date**: May 4, 2026  
**Platform**: DigitalOcean App Platform (Managed Services)

---

## 🚀 Quick Start - DigitalOcean Deployment

### Prerequisites
1. DigitalOcean account with App Platform enabled
2. GitHub repository connected to DO
3. Environment variables configured in DO dashboard

### One-Click Deployment (Recommended)
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Connect your GitHub repository (MegiLance)
4. DigitalOcean will auto-detect `Procfile` and `package.json`
5. Configure environment variables
6. Deploy!

---

## 📋 Configuration Files for DO App Platform

### Root Level: `Procfile`
```
release: cd backend && python -m alembic upgrade head
web: npm run start --prefix frontend
api: cd backend && python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2 --loop uvloop --timeout-keep-alive 5
```

**Explanation**:
- `release`: Runs database migrations before app starts (one-time per deployment)
- `web`: Frontend service (Next.js standalone)
- `api`: Backend API service (FastAPI)

### Backend: `backend/Procfile`
```
web: python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2 --loop uvloop --timeout-keep-alive 5
```

**DO App Platform Note**: Use this if backend is a standalone service  
**Features**:
- `${PORT:-8000}` - DO automatically injects PORT variable
- `--workers 2` - 2 worker processes (for 512MB+ dyno)
- `--loop uvloop` - High-performance event loop
- `--timeout-keep-alive 5` - DigitalOcean load balancer keeps connections alive

### Frontend: `frontend/Procfile`
```
web: PORT=${PORT:-3000} node .next/standalone/server.js
```

**DO App Platform Note**: Frontend runs standalone Node server (no `next start` needed)  
**Features**:
- PORT environment variable injected by DO
- Standalone server = smaller footprint & faster startup

---

## 🌍 DigitalOcean Environment Variables

### Backend Service (`.env.backend` or Dashboard)

```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://[your-db-name].turso.io
TURSO_AUTH_TOKEN=[your-auth-token]

# JWT Authentication
JWT_SECRET_KEY=[generate-32-char-random-key]
JWT_ALGORITHM=HS256

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[your-email@gmail.com]
SMTP_PASSWORD=[your-app-password]

# File Storage
AWS_ACCESS_KEY_ID=[DO_Spaces_key]
AWS_SECRET_ACCESS_KEY=[DO_Spaces_secret]
AWS_STORAGE_BUCKET_NAME=[bucket-name]
AWS_REGION=nyc3

# Payments
STRIPE_SECRET_KEY=[stripe-key]
STRIPE_PUBLISHABLE_KEY=[stripe-key]

# DigitalOcean AI (Optional)
DO_AI_API_KEY=[your-do-ai-key]

# Debug Mode (set to false in production)
DEBUG=false
```

### Frontend Service (`.env.local` or Dashboard)

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.megilance.example.com
NEXT_PUBLIC_SOCKET_URL=https://api.megilance.example.com

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=[google-analytics-id]
```

### AI Service (if separate)

```env
PORT=8001
DEBUG=false
```

---

## 🏗️ DO App Platform App Configuration (Optional `app.yaml`)

If you want to define app structure as code, create `app.yaml`:

```yaml
name: megilance
services:
  - name: frontend
    github:
      repo: your-username/megilance
      branch: main
    build_command: npm install && npm run build --prefix frontend
    run_command: npm run start --prefix frontend
    http_port: 3000
    instance_count: 1
    instance_size_slug: basic-xs
    health_check:
      http_path: /
    envs:
      - key: NEXT_PUBLIC_API_URL
        value: ${api.PUBLIC_URL}

  - name: api
    github:
      repo: your-username/megilance
      branch: main
    build_command: pip install -r backend/requirements.txt
    run_command: python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2 --loop uvloop
    http_port: 8000
    instance_count: 1
    instance_size_slug: basic-sm
    health_check:
      http_path: /api/health/live
    envs:
      - key: TURSO_DATABASE_URL
        scope: RUN_TIME
        value: ${db.TURSO_DATABASE_URL}
      - key: TURSO_AUTH_TOKEN
        scope: RUN_TIME
        value: ${db.TURSO_AUTH_TOKEN}
```

---

## 🔧 Service Configuration in DO Dashboard

### For Each Service (Frontend, Backend):

1. **Service Type**: Web Service
2. **Build Command**: Auto-detected from `Procfile` / `package.json`
3. **Run Command**: From `Procfile`
4. **Port**: Inject via `${PORT}` environment variable
5. **Instance Type**: 
   - Frontend: `basic-xs` (512MB)
   - Backend: `basic-sm` (1GB minimum)
6. **Health Check**:
   - Frontend: `GET /` (HTTP 200)
   - Backend: `GET /api/health/live` (HTTP 200)

### Environment Variables
1. Go to **App Settings** → **Environment**
2. Add variables from above
3. Click **Save**

---

## ✅ Health Checks Configuration

DigitalOcean will automatically check these endpoints:

### Backend Health Check
```bash
curl https://api.megilance.example.com/api/health/live
```

Expected Response:
```json
{
  "status": "live",
  "timestamp": "2026-05-04T10:00:00Z"
}
```

### Frontend Health Check
```bash
curl https://megilance.example.com/
```

Expected: HTTP 200 with Next.js HTML

---

## 📊 Deployment Flow

```
1. Push to main branch
   ↓
2. DigitalOcean detects Procfile
   ↓
3. Builds services (frontend + backend)
   ↓
4. Runs: release: cd backend && python -m alembic upgrade head
   ↓
5. Starts: frontend + backend services
   ↓
6. Health checks pass
   ↓
7. Services live at: https://megilance.example.com
```

---

## 🔍 Monitoring & Logs

### View Logs in DO Dashboard
1. Go to **App Settings** → **Logs**
2. Select service (Frontend/Backend)
3. Real-time logs displayed

### Common Issues & Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| Service won't start | "Error building" in logs | Check Procfile syntax, ensure files exist |
| Port binding fails | "Address already in use" | Use `${PORT}` variable (DO injects it) |
| Database connection failed | "Connection refused" | Check `TURSO_DATABASE_URL` in env vars |
| Frontend 503 errors | "Health check failed" | Ensure Next.js build is in `frontend/.next` |
| Backend timeouts | "504 Gateway Timeout" | Increase instance size or add workers |

---

## 🔐 Security Best Practices for DO

1. **Environment Variables**
   - Never commit `.env` files
   - Use DO Dashboard to manage secrets
   - Mark sensitive vars as "Encrypt"

2. **HTTPS/SSL**
   - DO automatically provides SSL certificates
   - Redirects HTTP → HTTPS

3. **Database**
   - Use Turso (LibSQL) - managed, secure
   - Enable backups in Turso console
   - Use strong `TURSO_AUTH_TOKEN`

4. **API Authentication**
   - JWT tokens with 1-hour expiry
   - Refresh tokens with 7-day expiry
   - CORS restricted to known origins

5. **File Storage**
   - Use DigitalOcean Spaces (S3-compatible)
   - Enable CDN for static assets
   - Never store files locally (they're lost on redeploy)

---

## 📈 Scaling

### Horizontal Scaling
1. Go to **Component** (Frontend/Backend)
2. Increase **Instance Count** (adds more replicas)
3. DO Load Balancer automatically distributes traffic

### Vertical Scaling
1. Go to **Component**
2. Change **Instance Size** (more CPU/RAM)
3. Services restart with more resources

### Recommended Scaling
- **Frontend**: Start with `basic-xs` (512MB), scale to `basic-sm` if needed
- **Backend**: Start with `basic-sm` (1GB), scale to `basic-md` (1.5GB) for heavy workloads
- **Database**: Use Turso free tier (up to 9GB)

---

## 🚨 Troubleshooting

### Problem: "Worker failed to boot"
```
[ERROR] Worker (pid:2) failed to boot
```

**Solution**: This was fixed in this deployment. Ensure:
- ✅ `backend/Dockerfile` removed (not needed for DO App Platform)
- ✅ Backend uses `uvicorn` directly (not gunicorn)
- ✅ `uvloop` in requirements.txt
- ✅ Backend `Procfile` correct

### Problem: "next start does not work with standalone"
```
⚠ "next start" does not work with "output: standalone" configuration
```

**Solution**: Already fixed. Ensure:
- ✅ `frontend/package.json` uses: `"start": "node .next/standalone/server.js"`
- ✅ `frontend/Procfile` configured correctly
- ✅ Frontend built with `npm run build`

### Problem: Frontend returns 404
**Solution**:
1. Ensure `.next/standalone` directory exists in built app
2. Check `NEXT_PUBLIC_API_URL` points to correct backend
3. Verify Next.js build completed successfully

### Problem: Database migrations not running
**Solution**:
1. Ensure release command in root `Procfile`: `release: cd backend && python -m alembic upgrade head`
2. DO runs release commands before starting services
3. Check `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set
4. View logs: App Settings → Logs → Filter by "release"

---

## 📝 Deployment Checklist

- [ ] GitHub repo connected to DigitalOcean
- [ ] All environment variables added to DO Dashboard
- [ ] `Procfile` exists at root + `backend/` + `frontend/`
- [ ] `backend/requirements.txt` includes `uvloop` (no `gunicorn`)
- [ ] `frontend/package.json` start script uses standalone server
- [ ] `backend/app/api/v1/core_domain/system_status.py` has no `get_db_url` import
- [ ] Database migrations configured in release command
- [ ] Health check endpoints working: `/api/health/live` and `/`
- [ ] Logs monitored after first deployment
- [ ] Test critical workflows (auth, projects, payments)

---

## 🔗 DigitalOcean Resources

- [App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Procfile Reference](https://docs.digitalocean.com/products/app-platform/how-to/procfile/)
- [Environment Variables](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)
- [Custom Domains](https://docs.digitalocean.com/products/app-platform/how-to/add-domain/)
- [Monitoring & Alerts](https://docs.digitalocean.com/products/app-platform/how-to/monitor-apps/)

---

## ✅ Final Status

**MegiLance is ready for DigitalOcean App Platform deployment!**

- ✅ Backend: Fixed import errors, switched to uvicorn
- ✅ Frontend: Fixed standalone server configuration  
- ✅ Procfiles: Optimized for DO App Platform
- ✅ Environment: Ready for DO Dashboard configuration
- ✅ AI Services: Running with smart fallbacks

**Next**: Deploy to DO and monitor logs!

---

**Last Updated**: 2026-05-04  
**Platform**: DigitalOcean App Platform  
**Status**: Production Ready
