# Pre-Deployment Checklist for MegiLance

## Why Test Locally First?

Testing builds locally **before** deploying to Digital Ocean:
- ✅ Catches build errors immediately (not after 5 minutes of cloud build time)
- ✅ Saves deployment quota and build minutes
- ✅ Prevents failed deployments from breaking production
- ✅ Faster iteration cycle (local builds are quicker)
- ✅ Can debug with full Docker logs and interactive access

## Required Steps Before Every Deployment

### 1. Test Builds Locally

```powershell
# Test both backend and frontend builds
.\test-all-builds.ps1
```

This script will:
- Build backend Docker image and test startup
- Build frontend Docker image and test Next.js compilation
- Verify containers can start successfully
- Check health endpoints
- Report any errors immediately

### 2. Only Deploy if Tests Pass

If `test-all-builds.ps1` shows **✅ ALL BUILDS PASSED**, then deploy:

```powershell
git add .
git commit -m "your descriptive message"
git push origin main
```

Digital Ocean will automatically deploy from the main branch.

### 3. Monitor Deployment

After pushing, monitor with:

```powershell
# Backend deployment status
doctl apps list-deployments ce7acc8e-3398-42d0-95bb-8e44a7c8ad48

# Frontend deployment status  
doctl apps list-deployments cb2428af-2e67-4c8c-84f1-5146cd009a5a

# Or use the monitoring script
# (see monitoring terminal for live updates)
```

## Common Issues Caught by Local Testing

### Backend Issues:
- ❌ Missing Python packages in requirements.txt
- ❌ Package version conflicts
- ❌ Syntax errors in Python code
- ❌ Missing environment variable references
- ❌ Dockerfile COPY path errors

### Frontend Issues:
- ❌ TypeScript compilation errors
- ❌ Missing npm packages in package.json
- ❌ Module resolution failures (import path errors)
- ❌ Next.js configuration errors
- ❌ Turbopack build failures
- ❌ CSS module import issues

## Quick Reference

| Script | Purpose |
|--------|---------|
| `test-backend-build.ps1` | Test only backend build |
| `test-frontend-build.ps1` | Test only frontend build |
| `test-all-builds.ps1` | Test both (recommended) |

## Environment Variables for Local Testing

The test scripts use minimal environment variables. For full testing with database:

```powershell
# Start local PostgreSQL
docker compose up -d db

# Then run tests (they'll connect to local DB)
.\test-all-builds.ps1
```

## Notes

- Local builds use the **exact same Dockerfiles** as Digital Ocean
- Build context is repo root (same as Digital Ocean)
- Tests run on port 8001 (backend) and 3001 (frontend) to avoid conflicts
- Containers are automatically cleaned up after testing

## Current Deployment Status

Backend App ID: `ce7acc8e-3398-42d0-95bb-8e44a7c8ad48`
Frontend App ID: `cb2428af-2e67-4c8c-84f1-5146cd009a5a`

Latest working commit: `dbc8c3b` (Turbopack resolveAlias fix)
