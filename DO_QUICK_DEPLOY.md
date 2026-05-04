# DigitalOcean App Platform - Quick Deploy Guide

## ✅ Pre-Deployment Checklist (All Complete)

- ✅ Backend: Removed `get_db_url` import error
- ✅ Backend: Using `uvicorn` directly (no gunicorn)
- ✅ Frontend: Using standalone Node server (not `next start`)
- ✅ Procfiles: Optimized for DO App Platform
- ✅ Environment: Ready for DO Dashboard

---

## 🚀 Deploy to DigitalOcean (5 Minutes)

### Step 1: Connect Repository
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Select **GitHub** and authorize
4. Choose repo: `your-username/MegiLance`
5. Branch: `main`
6. Click **Next**

### Step 2: Configure Services
DO will auto-detect:
- Frontend service (from `package.json`)
- Backend service (from `requirements.txt`)
- Release command (from `Procfile`)

For each service, verify:
- **Name**: frontend / api
- **Source**: GitHub (main branch)
- **Port**: Auto-detected (3000 / 8000)
- **Instance**: basic-xs (frontend), basic-sm (backend)

### Step 3: Set Environment Variables
Click **Environment** and add:

**Backend Variables**:
```
TURSO_DATABASE_URL=libsql://[your-db].turso.io
TURSO_AUTH_TOKEN=[your-token]
JWT_SECRET_KEY=[32-char-random-string]
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[email@gmail.com]
SMTP_PASSWORD=[app-password]
AWS_ACCESS_KEY_ID=[spaces-key]
AWS_SECRET_ACCESS_KEY=[spaces-secret]
AWS_STORAGE_BUCKET_NAME=[bucket-name]
AWS_REGION=nyc3
STRIPE_SECRET_KEY=[stripe-key]
DEBUG=false
```

**Frontend Variables**:
```
NEXT_PUBLIC_API_URL=https://api.megilance.example.com
NEXT_PUBLIC_SOCKET_URL=https://api.megilance.example.com
```

### Step 4: Add Custom Domain (Optional)
1. Go to **App Settings** → **Domains**
2. Add: `megilance.example.com` and `api.megilance.example.com`
3. Update DNS records at your domain registrar

### Step 5: Deploy
Click **Create App** and wait 3-5 minutes for deployment

---

## 📊 Monitoring After Deploy

### Check Service Status
1. Go to **App Settings** → **Components**
2. Look for green checkmarks (✅ Running)

### View Logs
1. Click component (frontend or api)
2. Scroll to **Logs** section
3. Watch real-time output

### Test Services
```bash
# Frontend
curl https://megilance.example.com

# Backend Health
curl https://api.megilance.example.com/api/health/live

# Backend Status
curl https://api.megilance.example.com/api/v1/system-status
```

---

## 🔧 If Services Don't Start

### Check Backend Logs
Look for:
```
✅ Good: 
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete

❌ Bad:
ImportError: cannot import name 'get_db_url'
```

**Fix**: Ensure `system_status.py` has `get_db_url` import removed

### Check Frontend Logs
Look for:
```
✅ Good:
ready - started server on 0.0.0.0:3000

❌ Bad:
⚠ "next start" does not work with "output: standalone"
```

**Fix**: Ensure `frontend/package.json` uses `node .next/standalone/server.js`

### Common Errors

| Error | Fix |
|-------|-----|
| `Worker failed to boot` | Backend uses gunicorn (should be uvicorn) |
| `Cannot import get_db_url` | Remove dead import from system_status.py |
| `next start incompatible` | Use standalone server in package.json |
| `TURSO_DATABASE_URL not set` | Add to DO Dashboard environment variables |
| `Health check failed` | Check `/api/health/live` returns 200 |

---

## 📈 Scale After Deployment

### Add More Backend Instances
1. Go to **api** component
2. Change **Instance Count** to 2-3
3. DO Load Balancer distributes traffic

### Increase Memory
1. Select component
2. Change **Instance Size** to basic-md (1.5GB)
3. Service restarts automatically

---

## 🔄 Deploy Updates

### Deploy New Code
```bash
git add -A
git commit -m "Update: [description]"
git push origin main
```

DigitalOcean automatically:
1. Detects commit
2. Builds new images
3. Runs: `release: cd backend && python -m alembic upgrade head`
4. Deploys with zero downtime (rolling restart)

---

## ✅ Everything is Ready!

Your application is configured for DigitalOcean App Platform. Just:

1. **Deploy** to DO
2. **Monitor** logs
3. **Test** critical workflows
4. **Scale** as needed

No Docker. No local builds. Just push to GitHub and let DO handle the rest! 🚀

---

**Production URL**: `https://megilance.example.com`  
**API URL**: `https://api.megilance.example.com`  
**Status**: ✅ Ready for Deployment
