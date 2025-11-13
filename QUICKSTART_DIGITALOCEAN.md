# MegiLance Quick Start - DigitalOcean Frontend Deployment

## 🚀 Deploy Next.js Frontend in 3 Minutes

### Prerequisites
- DigitalOcean account with GitHub Student Pack activated ($200 credits)
- GitHub repository: `ghulam-mujtaba5/MegiLance`
- doctl CLI installed (optional for Method 1)

---

## Method 1: Automated Script (Fastest) ⚡

```bash
# Run the deployment script
bash deploy-digitalocean-setup.sh

# Follow prompts:
# 1. Enter DigitalOcean API token
# 2. Confirm app creation
# 3. Done!
```

**Script does:**
- Installs doctl CLI if needed
- Authenticates with DigitalOcean
- Creates App Platform app from spec
- Connects GitHub repository
- Enables auto-deployment
- Displays app URL

---

## Method 2: DigitalOcean Console (No CLI needed) 🖱️

### Step 1: Create App
1. Go to https://cloud.digitalocean.com/apps
2. Click **Create App**

### Step 2: Connect GitHub
1. **Source**: Select **GitHub**
2. **Authorize DigitalOcean** (first time only)
3. **Repository**: `ghulam-mujtaba5/MegiLance`
4. **Branch**: `main`
5. Click **Next**

### Step 3: Configure Resources
1. **Detect Resource**: Auto-detected ✅
   - Name: `megilance-frontend`
   - Type: **Web Service**
   - Source Directory: `/frontend`
   - Dockerfile: `frontend/Dockerfile`

2. **Environment Variables** (click **Edit** → **Add Variable**):
   ```env
   NODE_ENV = production
   NEXT_PUBLIC_API_URL = http://YOUR_ORACLE_VM_IP/api
   NEXT_PUBLIC_APP_NAME = MegiLance
   NEXT_PUBLIC_APP_URL = https://megilance-frontend.ondigitalocean.app
   ```

3. Click **Next**

### Step 4: Choose Plan
- **Instance Type**: Basic
- **Instance Size**: **Basic** (512 MB RAM / 1 vCPU) - $5/month
- **Instance Count**: 1
- Click **Next**

### Step 5: Review and Deploy
1. **App Name**: `megilance-frontend`
2. **Region**: New York (nyc3) - closest to your users
3. **Auto-Deploy**: ✅ Enabled (deploys on every push to main)
4. Click **Create Resources**

### Step 6: Wait for Deployment
- Build time: 3-5 minutes
- DigitalOcean will:
  1. Clone repository
  2. Build Docker image from `frontend/Dockerfile`
  3. Deploy to App Platform
  4. Assign URL

---

## Method 3: Direct doctl Commands 💻

```bash
# 1. Install doctl (if not already)
# macOS:
brew install doctl

# Linux:
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz
tar xf doctl-1.94.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin

# Windows (PowerShell):
choco install doctl

# 2. Authenticate
doctl auth init
# Enter your API token when prompted

# 3. Create app spec file (already exists: digitalocean-app.yaml)
# Update NEXT_PUBLIC_API_URL with your Oracle VM IP

# 4. Create app
doctl apps create --spec digitalocean-app.yaml

# 5. Get app ID
doctl apps list

# 6. Get app URL
doctl apps get YOUR_APP_ID
```

---

## ✅ Verification

Once deployed, verify:

### 1. Check App Status
**Console**: https://cloud.digitalocean.com/apps
**CLI**:
```bash
doctl apps list
doctl apps get YOUR_APP_ID
```

### 2. Open Your App
URL format: `https://megilance-frontend-xxxxx.ondigitalocean.app`

### 3. Test Homepage
Should load with:
- ✅ MegiLance branding
- ✅ Navigation menu
- ✅ Hero section
- ✅ No console errors

### 4. Test API Connection
Open browser console (F12) and check:
```javascript
fetch(window.location.origin + '/backend/api/health/live')
  .then(r => r.json())
  .then(console.log)
// Should show: {status: "healthy"}
```

---

## 🔄 Auto-Deployment Setup

Already configured! Every push to `main` branch will:

1. **GitHub**: You push code
2. **DigitalOcean**: Detects push via webhook
3. **Build**: Rebuilds Docker image
4. **Deploy**: Updates live app (zero downtime)

### Test It
```bash
# Make a change
echo "Test deployment" >> frontend/README.md
git add .
git commit -m "Test auto-deployment"
git push origin main

# Watch deployment
doctl apps logs YOUR_APP_ID --type build --follow
```

---

## 🎨 Configure Environment Variables

### Add via Console
1. **App** → **Settings** → **Environment Variables**
2. Click **Edit** → **Add Variable**
3. Add variables:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=http://YOUR_ORACLE_VM_IP/api
   NEXT_PUBLIC_STRIPE_KEY=pk_test_...
   ```
4. Click **Save**
5. App will **redeploy automatically**

### Add via CLI
```bash
doctl apps update YOUR_APP_ID --spec digitalocean-app.yaml
```

---

## 🌐 Custom Domain (Optional)

### Add Domain
1. **App** → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `www.megilance.com`
4. Add DNS records (shown in console):
   ```
   Type: CNAME
   Name: www
   Value: megilance-frontend-xxxxx.ondigitalocean.app.
   ```
5. Wait for SSL certificate (automatic, 10-30 mins)

### Update Environment
Update `NEXT_PUBLIC_APP_URL` to your custom domain:
```bash
# Edit digitalocean-app.yaml
# Change: NEXT_PUBLIC_APP_URL: https://www.megilance.com

doctl apps update YOUR_APP_ID --spec digitalocean-app.yaml
```

---

## 📊 Monitoring

### View Logs
**Console**: App → **Runtime Logs**
**CLI**:
```bash
# Runtime logs
doctl apps logs YOUR_APP_ID --type run --follow

# Build logs
doctl apps logs YOUR_APP_ID --type build --follow

# Deployment logs
doctl apps logs YOUR_APP_ID --type deploy --follow
```

### Check Metrics
**Console**: App → **Insights**
- CPU usage
- Memory usage
- Request count
- Response times

### Setup Alerts
**Console**: App → **Settings** → **Alerts**
- Deployment failed
- High memory usage
- High CPU usage
- Domain not working

---

## 🛠 Troubleshooting

### Build Fails

**Check build logs:**
```bash
doctl apps logs YOUR_APP_ID --type build
```

**Common issues:**
- Missing environment variables → Add in App Settings
- Dockerfile path wrong → Check `dockerfile_path` in spec
- Build timeout → Increase resources or optimize build

### App Not Loading

**Check runtime logs:**
```bash
doctl apps logs YOUR_APP_ID --type run --follow
```

**Common issues:**
- Health check failing → Check `/` route works
- Port mismatch → Ensure app listens on port 3000
- Environment variables → Check `NEXT_PUBLIC_*` vars set

### API Connection Issues

**Check CORS:**
```bash
# In Oracle VM backend/.env
CORS_ORIGINS=https://your-app.ondigitalocean.app,https://www.megilance.com
```

**Check API URL:**
```javascript
// frontend/.env
NEXT_PUBLIC_API_URL=http://YOUR_ORACLE_VM_IP/api
```

### Auto-Deploy Not Working

**Re-enable GitHub integration:**
1. App → **Settings** → **Source**
2. Click **Reconnect GitHub**
3. Ensure "Auto-deploy" is ON

**Check webhook:**
1. GitHub → **Settings** → **Webhooks**
2. Should see DigitalOcean webhook
3. Check recent deliveries for errors

---

## 💰 Cost Management

### Current Plan
- **Basic (512 MB)**: $5/month
- **With GitHub Student Pack**: FREE (uses $200 credits)
- **Credits last**: 40 months at current usage

### Monitor Usage
```bash
doctl balance get
doctl apps list-regions --format Slug,Default,Bandwidth
```

### Optimize Costs
If needed later:
- **Scale down**: 256 MB ($4/month)
- **Auto-scaling**: OFF for predictable costs
- **CDN**: Use DigitalOcean CDN (included)

---

## 🚀 Performance Tips

### Enable CDN
```bash
# Already configured in app spec!
# CDN automatically enabled for static assets
```

### Optimize Images
```javascript
// Next.js Image component (already used)
import Image from 'next/image'

<Image 
  src="/hero.jpg" 
  width={800} 
  height={600}
  quality={85}
/>
```

### Enable Caching
```javascript
// next.config.mjs (already configured)
export default {
  compress: true,
  poweredByHeader: false,
  // ... existing config
}
```

---

## ✅ Deployment Complete!

Your frontend is live at:
**https://megilance-frontend-xxxxx.ondigitalocean.app**

### Next Steps
1. ✅ Connect to backend API (set `NEXT_PUBLIC_API_URL`)
2. ✅ Test user registration and login
3. ✅ Verify all pages load correctly
4. ✅ Check mobile responsiveness
5. 🔧 Add custom domain (optional)
6. 🔧 Setup monitoring alerts
7. 🔧 Configure SSL/HTTPS (automatic with custom domain)

---

## 📚 Resources

- [App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [doctl Reference](https://docs.digitalocean.com/reference/doctl/)
- [Pricing Calculator](https://www.digitalocean.com/pricing/calculator)
- [GitHub Student Pack](https://education.github.com/pack)

---

Need help? Check the full guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
