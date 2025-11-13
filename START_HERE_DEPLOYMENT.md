# 🚀 MegiLance Deployment - Start Here!

## Quick Navigation

Choose your deployment path:

### 1️⃣ Deploy Backend + AI to Oracle Cloud (Always Free)
📖 **[QUICKSTART_ORACLE.md](./QUICKSTART_ORACLE.md)** - 15 minutes total
- Oracle Cloud VM setup
- Autonomous Database configuration
- Auto-deployment with Git webhooks
- **Cost: $0/month**

### 2️⃣ Deploy Frontend to DigitalOcean (Student Pack)
📖 **[QUICKSTART_DIGITALOCEAN.md](./QUICKSTART_DIGITALOCEAN.md)** - 5 minutes total
- App Platform setup
- GitHub auto-deployment
- 3 deployment methods (script, console, CLI)
- **Cost: $0/month with credits**

### 3️⃣ Complete Reference Guide
📖 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Full documentation
- Detailed explanations
- Troubleshooting
- Security checklist
- Advanced configuration

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│ GitHub Repository                                    │
│ https://github.com/ghulam-mujtaba5/MegiLance        │
└─────────────┬───────────────────────┬───────────────┘
              │                       │
        [Git Push]              [Git Push]
              │                       │
              ▼                       ▼
┌─────────────────────────┐  ┌──────────────────────┐
│ Oracle Cloud            │  │ DigitalOcean         │
│ (Backend + AI)          │  │ (Frontend)           │
│                         │  │                      │
│ • VM.Standard.E2.1.Micro│  │ • App Platform       │
│ • Autonomous Database   │  │ • Basic (512 MB)     │
│ • Webhook Auto-Deploy   │  │ • GitHub Integration │
│ • Nginx Reverse Proxy   │  │                      │
│                         │  │                      │
│ API: http://VM_IP:8000  │  │ https://app.do.app   │
│ Cost: $0/month          │  │ Cost: $0/month       │
└─────────────────────────┘  └──────────────────────┘
```

---

## Deployment Order

Follow these steps in order:

### ✅ Step 1: Oracle Cloud Backend (15 mins)
```bash
# See QUICKSTART_ORACLE.md
1. Create VM
2. Run setup script
3. Configure database
4. Setup webhook
5. Test deployment
```

### ✅ Step 2: DigitalOcean Frontend (5 mins)
```bash
# See QUICKSTART_DIGITALOCEAN.md
1. Connect GitHub
2. Configure app
3. Set environment variables
4. Deploy
```

### ✅ Step 3: Connect Services
```bash
# Update frontend environment
NEXT_PUBLIC_API_URL=http://YOUR_ORACLE_VM_IP/api

# Update backend CORS
CORS_ORIGINS=https://your-app.ondigitalocean.app
```

---

## Prerequisites

### Accounts Needed
- ✅ **Oracle Cloud** (Sign up: https://cloud.oracle.com/)
  - Always Free tier (no credit card required)
  - Email verification required
  
- ✅ **DigitalOcean** (Sign up: https://cloud.digitalocean.com/)
  - GitHub Student Pack ($200 credits)
  - Or regular account ($5/month)
  
- ✅ **GitHub** (Your repository)
  - Fork or clone: `ghulam-mujtaba5/MegiLance`

### Tools Needed (Optional)
```bash
# Oracle Cloud CLI
brew install oci-cli

# DigitalOcean CLI
brew install doctl

# Both automated in setup scripts!
```

---

## What Gets Deployed

### Oracle Cloud (Backend + AI)
- **FastAPI Backend** - REST API on port 8000
- **AI Service** - ML/AI processing
- **Autonomous Database** - Always Free tier (20 GB)
- **Nginx** - Reverse proxy for routing
- **Webhook Listener** - Auto-deployment on Git push
- **Docker Compose** - Container orchestration

### DigitalOcean (Frontend)
- **Next.js App** - React frontend
- **Auto-build** - From Dockerfile
- **Auto-deploy** - On every push to main
- **CDN** - Global content delivery
- **SSL** - Automatic HTTPS

---

## Auto-Deployment Flow

```
Developer pushes code to GitHub
           ↓
GitHub sends webhook to both services
           ↓
    ┌──────┴───────┐
    ▼              ▼
Oracle VM      DigitalOcean
receives       receives
webhook        webhook
    ↓              ↓
Pulls code     Pulls code
    ↓              ↓
Rebuilds       Rebuilds
containers     app
    ↓              ↓
Restarts       Deploys
services       new version
    ↓              ↓
Health check   Health check
    ↓              ↓
✅ LIVE        ✅ LIVE
```

---

## Time Estimates

| Task | Time |
|------|------|
| Oracle VM Setup | 5 mins |
| Database Config | 5 mins |
| Backend Deploy | 3 mins |
| Webhook Setup | 2 mins |
| **Total Oracle** | **15 mins** |
| | |
| DigitalOcean Setup | 2 mins |
| App Deploy | 3 mins |
| **Total DO** | **5 mins** |
| | |
| **TOTAL TIME** | **20 mins** |

---

## Cost Breakdown

| Service | Plan | Monthly Cost | Annual Cost |
|---------|------|--------------|-------------|
| Oracle VM | Always Free | **$0** | **$0** |
| Oracle DB | Always Free | **$0** | **$0** |
| DigitalOcean | Basic (with credits) | **$0** | **$0** |
| GitHub | Free | **$0** | **$0** |
| **TOTAL** | | **$0/month** | **$0/year** |

*DigitalOcean costs $5/month after $200 credits run out (40 months)*

---

## Quick Commands Reference

### Oracle VM
```bash
# SSH to VM
ssh opc@YOUR_VM_IP

# Check services
docker ps
sudo systemctl status megilance-webhook

# View logs
docker-compose logs -f
sudo journalctl -u megilance-webhook -f

# Restart services
docker-compose restart
sudo systemctl restart megilance-webhook

# Manual deploy
sudo -u megilance /home/megilance/deploy.sh
```

### DigitalOcean
```bash
# List apps
doctl apps list

# View logs
doctl apps logs YOUR_APP_ID --type run --follow

# Get app info
doctl apps get YOUR_APP_ID

# Restart app
doctl apps update YOUR_APP_ID --spec digitalocean-app.yaml
```

---

## Verification Checklist

After deployment, verify:

### Backend (Oracle)
- [ ] VM is running and accessible
- [ ] Docker containers are up (`docker ps`)
- [ ] Health endpoint works: `curl http://VM_IP:8000/api/health/live`
- [ ] API docs accessible: `http://VM_IP:8000/api/docs`
- [ ] Webhook listener running: `sudo systemctl status megilance-webhook`
- [ ] Database connected (check logs)

### Frontend (DigitalOcean)
- [ ] App is deployed and live
- [ ] Homepage loads correctly
- [ ] No console errors (F12)
- [ ] API connection works
- [ ] Auto-deploy enabled in settings

### Integration
- [ ] Frontend can reach backend API
- [ ] CORS configured correctly
- [ ] User registration works
- [ ] User login works
- [ ] File uploads work

---

## Need Help?

### Documentation
- 📘 **Quick Starts**: QUICKSTART_ORACLE.md, QUICKSTART_DIGITALOCEAN.md
- 📗 **Full Guide**: DEPLOYMENT_GUIDE.md
- 📙 **Architecture**: ARCHITECTURE_DIAGRAMS.md
- 📕 **Brand Guidelines**: MegiLance-Brand-Playbook.md

### Common Issues
1. **"Webhook not triggering"**
   - Check GitHub webhook secret matches systemd service
   - Verify firewall allows port 9000
   - Check webhook logs: `sudo journalctl -u megilance-webhook -f`

2. **"Frontend can't connect to API"**
   - Update `NEXT_PUBLIC_API_URL` in DigitalOcean env vars
   - Update `CORS_ORIGINS` in backend .env
   - Check Oracle VM firewall allows port 8000

3. **"Database connection failed"**
   - Verify wallet uploaded to VM
   - Check wallet password in .env
   - Verify Autonomous DB is running in Oracle Console

### Support Resources
- Oracle Cloud Docs: https://docs.oracle.com/cloud/
- DigitalOcean Docs: https://docs.digitalocean.com/
- GitHub Webhooks: https://docs.github.com/webhooks

---

## Next Steps After Deployment

1. **Setup Custom Domain**
   - Add DNS records
   - Configure SSL (automatic)
   - Update environment variables

2. **Enable Monitoring**
   - Setup Oracle Cloud monitoring
   - Configure DigitalOcean alerts
   - Add uptime monitoring

3. **Security Hardening**
   - Change default passwords
   - Enable firewall rules
   - Setup backup strategy

4. **Performance Optimization**
   - Enable CDN
   - Configure caching
   - Optimize images

---

## Ready to Deploy?

1. **Start with Oracle Backend**: [QUICKSTART_ORACLE.md](./QUICKSTART_ORACLE.md)
2. **Then DigitalOcean Frontend**: [QUICKSTART_DIGITALOCEAN.md](./QUICKSTART_DIGITALOCEAN.md)
3. **Reference full docs as needed**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

**Total time: 20 minutes | Total cost: $0/month**

Let's deploy! 🚀
