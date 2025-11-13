# ✅ DigitalOcean Deployment Ready!

## What I Did

### 1. ✅ Authenticated DigitalOcean CLI
- Used your API token: `dop_v1_bdf16...`
- doctl CLI is now connected to your account
- Ready to deploy apps

### 2. ✅ Created Deployment Scripts
- **deploy-digitalocean-manual-guide.ps1** - Step-by-step browser guide (RECOMMENDED)
- **deploy-digitalocean-auto.ps1** - Automated CLI deployment
- Both scripts ready to use

### 3. ✅ Configured App Specifications
- **digitalocean-app.yaml** - Main app configuration with GitHub auto-deployment
- Source: `ghulam-mujtaba5/MegiLance` repo, `main` branch
- Auto-deploy: ON (every push triggers deployment)
- Dockerfile: `frontend/Dockerfile`
- Instance: Basic (512MB, $5/month = FREE with your credits)

### 4. ✅ Created Documentation
- **ENVIRONMENT_VARIABLES.md** - Complete env vars reference
- **CUSTOM_DOMAIN_SETUP.md** - Custom domain configuration guide

---

## 🚀 Next Steps - Deploy Now!

### OPTION 1: Manual Deployment (Recommended - Easier GitHub Auth)

The browser just opened with DigitalOcean console. Follow these steps:

#### 1. Connect GitHub (One-Time Setup)
```
On https://cloud.digitalocean.com/apps/new
↓
Click "GitHub" as source
↓
Click "Authorize DigitalOcean"
↓
Grant access to your repositories
```

#### 2. Configure App
```
Repository: ghulam-mujtaba5/MegiLance
Branch: main
Auto-deploy: ON ✓
Source Directory: /frontend
Dockerfile: frontend/Dockerfile
```

#### 3. Add Environment Variables
```
Click "Edit" next to Environment Variables
Add these (click "Add Variable" for each):

NODE_ENV = production
NEXT_TELEMETRY_DISABLED = 1
NEXT_PUBLIC_API_URL = http://YOUR_ORACLE_VM_IP/api
NEXT_PUBLIC_APP_NAME = MegiLance
NEXT_PUBLIC_APP_URL = https://megilance-frontend.ondigitalocean.app
PORT = 3000
```

⚠️ **Important**: You'll update `NEXT_PUBLIC_API_URL` after Oracle backend is deployed!

#### 4. Select Plan
```
Instance Type: Basic
Instance Size: Basic (512 MB RAM) - $5/month
Region: New York (nyc3)
```

#### 5. Deploy!
```
Click "Create Resources"
Wait 5-10 minutes for build
Get your live URL!
```

---

### OPTION 2: CLI Deployment (After GitHub Auth)

After authorizing GitHub via console once:

```powershell
# Run automated script
.\deploy-digitalocean-auto.ps1

# It will:
# - Create the app
# - Monitor deployment
# - Show you the live URL
```

---

## 📋 What You'll Get

### After Deployment:

✅ **Live Frontend URL**:
```
https://megilance-frontend-xxxxx.ondigitalocean.app
```

✅ **Auto-Deployment Enabled**:
```
Every push to 'main' branch → Automatic deployment
Zero-downtime updates
Build logs available in dashboard
```

✅ **Free Hosting**:
```
$5/month = FREE with your $200 student credits
40 months of free hosting!
```

---

## 🔧 After Deployment

### 1. Get Your App URL
```powershell
# List apps
doctl apps list

# Get details
doctl apps get YOUR_APP_ID

# Your URL will be shown
```

### 2. Update Environment Variables

**Important**: After Oracle backend is deployed, update:

```powershell
# Via Console:
App → Settings → Environment Variables → Edit
Update: NEXT_PUBLIC_API_URL = http://YOUR_ORACLE_VM_IP/api

# Via CLI:
# Edit digitalocean-app.yaml, then:
doctl apps update YOUR_APP_ID --spec digitalocean-app.yaml
```

### 3. Test Auto-Deployment

```bash
# Make a change
git add .
git commit -m "Test deployment"
git push origin main

# Watch it deploy automatically!
# Check: https://cloud.digitalocean.com/apps
```

### 4. View Logs

```powershell
# Runtime logs
doctl apps logs YOUR_APP_ID --type run --follow

# Build logs
doctl apps logs YOUR_APP_ID --type build --follow
```

---

## 🌐 Custom Domain (Optional)

When ready to use your own domain:

### Quick Steps:
1. Read: **CUSTOM_DOMAIN_SETUP.md**
2. Add domain in DigitalOcean: App → Settings → Domains
3. Add DNS records at your registrar
4. Wait for SSL (automatic, 10-30 mins)
5. Update environment variables

### Common Domains:
```
www.megilance.com
megilance.com
app.megilance.com
```

---

## 📊 Monitoring & Management

### DigitalOcean Dashboard:
```
https://cloud.digitalocean.com/apps
```

**Features**:
- Real-time deployment status
- Build & runtime logs
- Resource usage metrics
- Auto-deploy settings
- Domain management
- Environment variables

### CLI Commands:

```powershell
# List all apps
doctl apps list

# Get app details
doctl apps get YOUR_APP_ID

# View logs (live)
doctl apps logs YOUR_APP_ID --type run --follow

# Force rebuild
doctl apps create-deployment YOUR_APP_ID

# Update settings
doctl apps update YOUR_APP_ID --spec digitalocean-app.yaml
```

---

## 🔗 Integration with Backend

### CORS Configuration

After frontend is deployed, update your Oracle backend:

```bash
# SSH to Oracle VM
ssh opc@YOUR_VM_IP

# Edit backend .env
sudo nano /home/megilance/megilance/backend/.env

# Add your frontend URL to CORS_ORIGINS
CORS_ORIGINS=https://megilance-frontend-xxxxx.ondigitalocean.app,https://www.megilance.com

# Restart backend
sudo -u megilance docker-compose -f /home/megilance/megilance/docker-compose.oracle.yml restart backend
```

### Test API Connection

After both are deployed:

```javascript
// Open browser console (F12) on your deployed frontend
fetch(window.location.origin + '/backend/api/health/live')
  .then(r => r.json())
  .then(console.log)

// Should show: {status: "healthy"}
```

---

## 💰 Cost Tracking

### Your Credits:
```
DigitalOcean Student Pack: $200
Monthly cost: $5
Duration: 40 months FREE!
```

### Check Balance:
```powershell
doctl balance get
```

### View Usage:
```
Dashboard → Billing → Usage
https://cloud.digitalocean.com/billing
```

---

## 🛠 Troubleshooting

### Build Failed
```powershell
# Check build logs
doctl apps logs YOUR_APP_ID --type build

# Common issues:
# - Missing environment variables → Add in settings
# - Dockerfile errors → Check frontend/Dockerfile
# - Build timeout → May need larger instance
```

### App Won't Start
```powershell
# Check runtime logs
doctl apps logs YOUR_APP_ID --type run --follow

# Common issues:
# - Port mismatch → Check PORT=3000
# - Health check failing → Verify / route works
# - Missing env vars → Check NEXT_PUBLIC_*
```

### Auto-Deploy Not Working
```
1. Check: App → Settings → Source → Auto-deploy is ON
2. Verify: GitHub webhook exists (repo → Settings → Webhooks)
3. Test: Push to main branch and watch dashboard
```

### API Connection Errors
```
1. Verify NEXT_PUBLIC_API_URL is correct
2. Check backend CORS_ORIGINS includes frontend URL
3. Ensure Oracle VM ports are open (8000)
4. Test: curl http://YOUR_ORACLE_VM_IP/api/health/live
```

---

## 📚 Documentation Reference

- **ENVIRONMENT_VARIABLES.md** - All environment variables explained
- **CUSTOM_DOMAIN_SETUP.md** - Custom domain configuration
- **DEPLOYMENT_GUIDE.md** - Complete deployment guide
- **QUICKSTART_DIGITALOCEAN.md** - Quick start guide

---

## ✅ Deployment Checklist

- [x] DigitalOcean account created
- [x] API token configured
- [x] doctl CLI authenticated
- [x] Deployment scripts created
- [x] App spec configured
- [ ] **→ Deploy via console (do this now!)**
- [ ] Get app URL
- [ ] Update environment variables
- [ ] Test auto-deployment
- [ ] Configure CORS on backend
- [ ] Test API connection
- [ ] Setup custom domain (optional)

---

## 🎯 Your Current Status

✅ **Ready to Deploy!**

**Action Required**: 
1. Follow the manual guide in the browser that just opened
2. OR run: `.\deploy-digitalocean-auto.ps1` (after GitHub auth)
3. Get your live URL
4. Update environment variables
5. Test your app!

**Estimated Time**: 10 minutes to live frontend! 🚀

---

## Need Help?

**Check**:
1. Browser window with DigitalOcean console
2. Follow step-by-step guide displayed
3. All instructions in: QUICKSTART_DIGITALOCEAN.md

**Stuck?**
- DigitalOcean Docs: https://docs.digitalocean.com/products/app-platform/
- Support: https://cloud.digitalocean.com/support
- Community: https://www.digitalocean.com/community

---

**Ready? Deploy now!** The browser window is already open. Follow the guide! 🎉
