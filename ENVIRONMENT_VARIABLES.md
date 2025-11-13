# MegiLance Frontend - Environment Variables Reference

## DigitalOcean App Platform Configuration

### Required Environment Variables

Copy these into your DigitalOcean App Platform:
**App Settings → Environment Variables → Edit → Add Variable**

---

### 1. NODE_ENV
```
Key: NODE_ENV
Value: production
Scope: RUN_AND_BUILD_TIME
```
**Purpose**: Sets Node.js to production mode for optimizations

---

### 2. NEXT_TELEMETRY_DISABLED
```
Key: NEXT_TELEMETRY_DISABLED
Value: 1
Scope: RUN_AND_BUILD_TIME
```
**Purpose**: Disables Next.js anonymous telemetry

---

### 3. NEXT_PUBLIC_API_URL (⚠️ IMPORTANT)
```
Key: NEXT_PUBLIC_API_URL
Value: http://YOUR_ORACLE_VM_IP/api
Scope: RUN_AND_BUILD_TIME
```
**Purpose**: Backend API endpoint for all API calls

**Examples**:
- Development: `http://localhost:8000/api`
- Production: `http://123.45.67.89/api` (replace with your Oracle VM IP)
- With domain: `https://api.megilance.com`

**⚠️ Update this after Oracle backend deployment!**

---

### 4. NEXT_PUBLIC_APP_NAME
```
Key: NEXT_PUBLIC_APP_NAME
Value: MegiLance
Scope: RUN_AND_BUILD_TIME
```
**Purpose**: Application name shown in UI

---

### 5. NEXT_PUBLIC_APP_URL
```
Key: NEXT_PUBLIC_APP_URL
Value: https://megilance-frontend.ondigitalocean.app
Scope: RUN_AND_BUILD_TIME
```
**Purpose**: Frontend URL for redirects and OAuth

**Update after deployment**:
1. Get your app URL from DigitalOcean dashboard
2. Update this variable with actual URL
3. Example: `https://megilance-frontend-abc123.ondigitalocean.app`

**With custom domain**:
- Update to: `https://www.megilance.com`

---

### 6. PORT
```
Key: PORT
Value: 3000
Scope: RUN_TIME
```
**Purpose**: Port Next.js server listens on (DigitalOcean uses 3000)

---

## Optional Environment Variables

### Stripe Payment (if using)
```
Key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_live_YOUR_KEY
Scope: RUN_AND_BUILD_TIME
```

### Google Analytics (if using)
```
Key: NEXT_PUBLIC_GA_ID
Value: G-XXXXXXXXXX
Scope: RUN_AND_BUILD_TIME
```

### Feature Flags
```
Key: NEXT_PUBLIC_ENABLE_AI_FEATURES
Value: true
Scope: RUN_AND_BUILD_TIME
```

---

## How to Add Variables

### Via DigitalOcean Console:
1. Go to your app: https://cloud.digitalocean.com/apps
2. Click on your app name
3. **Settings** → **App-Level Environment Variables**
4. Click **Edit**
5. Click **Add Variable**
6. Enter Key and Value
7. Select Scope (RUN_AND_BUILD_TIME for most)
8. Click **Save**
9. App will redeploy automatically

### Via doctl CLI:
```powershell
# Set single variable
doctl apps update YOUR_APP_ID --spec digitalocean-app.yaml

# Or update all at once by editing digitalocean-app.yaml
```

---

## Environment Variable Scopes

### BUILD_TIME
- Only available during build process
- Not in runtime container

### RUN_TIME
- Only available when app is running
- Not during build

### RUN_AND_BUILD_TIME (recommended for most)
- Available in both build and runtime
- Use this for NEXT_PUBLIC_* variables

---

## Security Best Practices

### ✅ DO:
- Use `NEXT_PUBLIC_*` prefix for client-side variables
- Use environment-specific values (dev/staging/prod)
- Encrypt sensitive values in DigitalOcean
- Rotate API keys regularly

### ❌ DON'T:
- Commit `.env` files to Git
- Use same values for dev/prod
- Expose backend secrets in frontend
- Hardcode API keys in code

---

## Verification

After setting variables, verify they're loaded:

1. **Check build logs**:
```bash
doctl apps logs YOUR_APP_ID --type build | grep "NEXT_PUBLIC"
```

2. **Check runtime**:
Open browser console (F12) on your deployed site:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should show your API URL
```

3. **Test API connection**:
```javascript
fetch(process.env.NEXT_PUBLIC_API_URL + '/health/live')
  .then(r => r.json())
  .then(console.log)
// Should return: {status: "healthy"}
```

---

## Common Issues

### "Environment variable not found"
**Solution**: Make sure scope is `RUN_AND_BUILD_TIME` for NEXT_PUBLIC_* vars

### "API calls failing"
**Solution**: Check NEXT_PUBLIC_API_URL is correct and includes `/api` path

### "Changes not reflecting"
**Solution**: Variables changed during build require redeploy:
- Console: Settings → Force Rebuild
- CLI: `doctl apps create-deployment YOUR_APP_ID`

### "CORS errors"
**Solution**: Update backend CORS_ORIGINS with your DigitalOcean app URL

---

## Update Checklist

When deploying, update these in order:

- [ ] NEXT_PUBLIC_API_URL (after Oracle backend is live)
- [ ] NEXT_PUBLIC_APP_URL (after first deployment)
- [ ] Verify build succeeds
- [ ] Test API connection
- [ ] Update custom domain (if applicable)
- [ ] Update backend CORS settings

---

## Quick Copy-Paste

For quick setup, copy this and replace values:

```bash
# Core variables (required)
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_API_URL=http://YOUR_ORACLE_VM_IP/api
NEXT_PUBLIC_APP_NAME=MegiLance
NEXT_PUBLIC_APP_URL=https://your-app.ondigitalocean.app
PORT=3000
```

---

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [DigitalOcean App Platform Env Vars](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)
- [doctl Apps Reference](https://docs.digitalocean.com/reference/doctl/reference/apps/)
