# DigitalOcean Frontend Deployment Fix

**Issue**: DigitalOcean trying to run `npm run Start` (missing script error)

**Root Cause**: The app's run command in DigitalOcean's system is outdated and hasn't picked up the new configuration.

---

## Quick Fix (Manual via Console)

### Step 1: Access DigitalOcean Console
1. Go to https://cloud.digitalocean.com/apps
2. Click on your **megilance-frontend** app

### Step 2: Update Run Command
1. Click **Settings** (gear icon)
2. Scroll down to **Components** section
3. Click on the **web** component
4. Find the **Run Command** field
5. **Replace** current value with:
   ```
   node .next/standalone/server.js
   ```
6. Click **Save**

### Step 3: Redeploy
1. Click the **Deploy** button
2. Wait for build to complete

---

## Alternative: Install doctl and Auto-Fix

### Install doctl
```powershell
# Download and install
iwr https://github.com/digitalocean/doctl/releases/download/v1.100.0/doctl-1.100.0-windows-amd64.zip -OutFile doctl.zip
Expand-Archive doctl.zip
.\doctl\doctl auth init
```

### Then run:
```bash
# Get current app spec
doctl apps spec get <app-id> > app-current.yaml

# Update and deploy
doctl apps update <app-id> --spec app-current.yaml
```

To find `<app-id>`:
```bash
doctl apps list
```

---

## Verified Working Configuration

Once updated, your frontend will use:
- **Build Command**: `npm install --legacy-peer-deps ... && npm run build`
- **Run Command**: `node .next/standalone/server.js`
- **Port**: 3000
- **Health Check**: GET / (90s initial delay, 30s interval)

This uses the Next.js standalone server directly, no npm wrapper needed.

