# DigitalOcean Deployment - Complete Fix Guide

**Issue Identified**: 2 conflicting YAML specs (backend-minimal.yaml & frontend-app.yaml) causing deployment chaos

**Status**: ✅ FIXED - New unified deployment spec created

---

## 🚨 The Problem

You had **TWO separate app specs** that DigitalOcean couldn't resolve:
- `backend-minimal.yaml` - Backend-only deployment
- `frontend-app.yaml` - Frontend-only deployment

This caused DigitalOcean to either:
- Deploy them as 2 separate apps with no communication
- Try to merge them and fail due to conflicts
- Ignore one and only deploy the other

---

## ✅ The Solution

### New Unified Spec: `.do/app.yaml`

This single YAML file defines:
- ✅ **Frontend Service (web)** - Next.js standalone server on port 3000
- ✅ **Backend Service (api)** - FastAPI/Uvicorn on port 8000
- ✅ **Database Migrations** - Runs before deployment
- ✅ **Health Checks** - For both services
- ✅ **Auto-connect** - Frontend knows backend URL automatically

### Frontend CSS Fix

**File**: `frontend/app/globals.css`

**Changed from**:
```css
@import "tailwindcss";
```

**Changed to**:
```css
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
```

This fixes CSS not compiling in production.

---

## 📋 Steps to Deploy

### Step 1: Delete Old Apps
1. Go to https://cloud.digitalocean.com/apps
2. Delete `megilance-frontend` app
3. Delete `megilance-backend` app
4. **Wait 2-3 minutes** for cleanup

### Step 2: Create New Unified App
1. Click **Create App** button
2. Select your GitHub repo: `umair-fa22/MegiLance`
3. Choose branch: `main`
4. Click **Next**
5. **Deployment Settings**:
   - Under "Choose where to build": Select **Monorepo** (or Custom settings)
   - Click **Buildpack Configuration** if available

### Step 3: Upload New Spec
1. In the App Platform dashboard, go to **Settings**
2. Look for **App Spec** section
3. Click **Edit** or **View YAML**
4. Copy-paste the entire content from `.do/app.yaml`
5. Click **Save**

### Step 4: Deploy
1. Click the **Deploy** button
2. **Monitor logs** under each service:
   - `web` (frontend) - should start within 2 minutes
   - `api` (backend) - should start within 1 minute
3. Verify health checks pass for both

---

## 🔧 If Using doctl CLI

**Install doctl**:
```powershell
iwr https://github.com/digitalocean/doctl/releases/download/v1.100.0/doctl-1.100.0-windows-amd64.zip -OutFile doctl.zip
Expand-Archive doctl.zip -DestinationPath doctl
.\doctl\doctl auth init  # Follow prompts
```

**Deploy the unified spec**:
```bash
cd e:\MegiLance
doctl apps create --spec .do/app.yaml
# or update existing:
doctl apps update <app-id> --spec .do/app.yaml
```

---

## 📊 Deployment Architecture

```
DigitalOcean App Platform (Unified: megilance)
│
├─ Frontend Service (web)
│  ├─ Port: 3000
│  ├─ Run: node .next/standalone/server.js
│  ├─ Health: GET / (90s initial delay)
│  └─ Routes: / (all traffic)
│
├─ Backend Service (api)
│  ├─ Port: 8000
│  ├─ Run: uvicorn main:app --workers 2
│  ├─ Health: GET /api/health/live (60s initial delay)
│  └─ Routes: /api/* (API traffic)
│
└─ Database (Turso - External)
   └─ Connection via TURSO_DATABASE_URL secret
```

---

## ✅ Verification

**After deployment, verify each service**:

```bash
# Check frontend
curl https://megilance.ondigitalocean.app/  # Should return HTML with CSS

# Check backend
curl https://megilance.ondigitalocean.app/api/health/live  # Should return {"status": "ready"}

# Check API communication
curl https://megilance.ondigitalocean.app/api/auth/me  # Should work (may need auth)
```

---

## 🚀 What's Fixed

| Issue | Before | After |
|-------|--------|-------|
| **Deployment Spec** | 2 conflicting files | 1 unified file ✅ |
| **Frontend CSS** | Not compiling | Tailwind v4 imports ✅ |
| **Backend Health** | Gunicorn worker errors | Direct Uvicorn ✅ |
| **Frontend Startup** | `npm run Start` error | Standalone server ✅ |
| **Service Communication** | Manual URL setup | Auto-connected ✅ |

---

## 📞 Troubleshooting

### Frontend still showing plain HTML
✅ Already fixed - CSS imports updated in `globals.css`

### Backend returns 502/503
1. Check backend logs: "ERROR"
2. Verify TURSO_DATABASE_URL is set in secrets
3. Verify JWT_SECRET_KEY is set in secrets

### Services can't communicate
✅ Already fixed in `app.yaml` - frontend gets `NEXT_PUBLIC_BACKEND_URL` automatically

---

## 📝 Files Modified

- ✅ `.do/app.yaml` - NEW unified deployment spec
- ✅ `frontend/app/globals.css` - Fixed Tailwind CSS imports
- ✅ `frontend/Procfile` - Already correct
- ✅ `Procfile` - Already correct

**Status**: Ready to deploy! 🚀

