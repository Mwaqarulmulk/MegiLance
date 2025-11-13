# MegiLance Deployment Guide
## Oracle Cloud Always Free + DigitalOcean GitHub Student Pack

This guide covers deploying MegiLance with **backend + AI on Oracle Cloud** (Always Free tier) and **frontend on DigitalOcean** (GitHub Student Pack) with Git-based continuous deployment.

---

## 📋 Prerequisites

### Oracle Cloud Account
- Sign up: https://www.oracle.com/cloud/free/
- Always Free tier includes:
  - 2 AMD Compute VMs (1/8 OCPU, 1GB RAM each)
  - Oracle Autonomous Database (Always Free)
  - 10 GB Block Storage
  - 10 GB Object Storage

### DigitalOcean Account
- Sign up with GitHub Student Pack: https://www.digitalocean.com/github-students
- Includes $200 credit (valid for 1 year)

### Local Tools Required
```bash
# Oracle CLI
pip install oci-cli

# DigitalOcean CLI
# Windows: Download from https://github.com/digitalocean/doctl/releases
# Linux: See deploy-digitalocean-setup.sh
# macOS: brew install doctl

# Git
git --version

# SSH Client
ssh -V
```

---

## 🚀 Part 1: Oracle Cloud Backend + AI Deployment

### Step 1: Create Oracle Cloud VM

#### Using Oracle Cloud Console (Web UI):
1. Log in to https://cloud.oracle.com/
2. Navigate to **Compute** → **Instances**
3. Click **Create Instance**
4. Configuration:
   - **Name**: `megilance-backend`
   - **Image**: Oracle Linux 8
   - **Shape**: VM.Standard.E2.1.Micro (Always Free)
   - **Network**: Create new VCN or use default
   - **SSH Keys**: Upload your public SSH key
5. Click **Create**

#### Using OCI CLI (Command Line):
```bash
# Configure OCI CLI
oci setup config

# Create instance
oci compute instance launch \
  --availability-domain <your-AD> \
  --compartment-id <your-compartment-id> \
  --shape VM.Standard.E2.1.Micro \
  --display-name megilance-backend \
  --image-id <oracle-linux-8-image-id> \
  --subnet-id <subnet-id> \
  --ssh-authorized-keys-file ~/.ssh/id_rsa.pub
```

### Step 2: Configure VM Security

#### Open Required Ports:
```bash
# In Oracle Cloud Console:
# Networking → Virtual Cloud Networks → Your VCN → Security Lists
# Add Ingress Rules:
# - 0.0.0.0/0 → TCP → 22 (SSH)
# - 0.0.0.0/0 → TCP → 80 (HTTP)
# - 0.0.0.0/0 → TCP → 443 (HTTPS)
# - 0.0.0.0/0 → TCP → 8000 (Backend API)
# - 0.0.0.0/0 → TCP → 9000 (Webhook)
```

### Step 3: SSH into VM and Run Setup

```bash
# SSH into your VM
ssh opc@<VM_PUBLIC_IP>

# Download setup script
wget https://raw.githubusercontent.com/ghulam-mujtaba5/MegiLance/main/deploy-oracle-setup.sh

# Make it executable
chmod +x deploy-oracle-setup.sh

# Run setup (this will take 10-15 minutes)
sudo bash deploy-oracle-setup.sh
```

**What this script does:**
- ✅ Installs Docker & Docker Compose
- ✅ Sets up application user and directories
- ✅ Configures firewall rules
- ✅ Installs and configures Nginx reverse proxy
- ✅ Clones your Git repository
- ✅ Creates auto-deployment script
- ✅ Sets up webhook listener for Git push events
- ✅ Creates systemd services for auto-start

### Step 4: Configure Oracle Autonomous Database

1. **Create Database** (via Oracle Cloud Console):
   - Navigate to **Autonomous Database**
   - Click **Create Autonomous Database**
   - Choose **Transaction Processing**
   - Select **Always Free** tier
   - Set admin password

2. **Download Wallet**:
   - Click **DB Connection**
   - Download wallet (Instance Wallet)
   - Unzip to your local machine

3. **Upload Wallet to VM**:
```bash
# From your local machine
scp -r oracle-wallet-23ai opc@<VM_IP>:/home/megilance/megilance/
```

### Step 5: Configure Environment Variables

```bash
# SSH into VM
ssh opc@<VM_PUBLIC_IP>

# Create backend .env file
sudo nano /home/megilance/megilance/backend/.env
```

**Add these variables:**
```env
# Database Configuration
DATABASE_TYPE=oracle
ORACLE_USER=ADMIN
ORACLE_PASSWORD=YourAdminPassword
ORACLE_DSN=your_database_name_high
ORACLE_WALLET_LOCATION=/app/oracle-wallet
ORACLE_WALLET_PASSWORD=YourWalletPassword

# Application Settings
SECRET_KEY=your-super-secret-key-change-this
ENVIRONMENT=production
DEBUG=false
ALLOWED_HOSTS=*

# CORS Settings
CORS_ORIGINS=https://your-frontend-url.ondigitalocean.app

# JWT Settings
JWT_SECRET_KEY=another-super-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=/app/uploads

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@megilance.com

# AWS S3 (optional for file storage)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=megilance-uploads
AWS_REGION=us-east-1
```

### Step 6: Set Webhook Secret

```bash
# Generate a strong secret
openssl rand -hex 32

# Update webhook service
sudo nano /etc/systemd/system/megilance-webhook.service

# Replace: Environment="WEBHOOK_SECRET=your-secret-here"
# With: Environment="WEBHOOK_SECRET=<generated-secret>"

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart megilance-webhook.service
```

### Step 7: Run Initial Deployment

```bash
# As megilance user
sudo -u megilance /home/megilance/deploy.sh

# Check logs
docker-compose -f /home/megilance/megilance/docker-compose.oracle.yml logs -f
```

### Step 8: Configure GitHub Webhook

1. Go to your GitHub repository: https://github.com/ghulam-mujtaba5/MegiLance
2. Settings → Webhooks → Add webhook
3. Configure:
   - **Payload URL**: `http://<VM_PUBLIC_IP>/webhook`
   - **Content type**: `application/json`
   - **Secret**: (the secret from Step 6)
   - **Events**: Just the push event
   - **Active**: ✅ Checked

4. Save webhook

**Test it:**
```bash
# Make a change and push to main branch
git add .
git commit -m "Test auto-deployment"
git push origin main

# On VM, watch webhook logs
sudo journalctl -u megilance-webhook -f

# Watch deployment logs
tail -f /home/megilance/deploy.log
```

---

## 🌊 Part 2: DigitalOcean Frontend Deployment

### Method 1: Using DigitalOcean CLI (Recommended)

```bash
# Download and run setup script
wget https://raw.githubusercontent.com/ghulam-mujtaba5/MegiLance/main/deploy-digitalocean-setup.sh
chmod +x deploy-digitalocean-setup.sh
bash deploy-digitalocean-setup.sh
```

### Method 2: Manual Setup via DigitalOcean Console

1. **Create App**:
   - Go to https://cloud.digitalocean.com/apps
   - Click **Create App**
   - Choose **GitHub** as source
   - Authorize DigitalOcean
   - Select: `ghulam-mujtaba5/MegiLance`
   - Branch: `main`
   - Source Directory: `/frontend`

2. **Configure Build**:
   - **Dockerfile**: `frontend/Dockerfile`
   - **HTTP Port**: `3000`
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`

3. **Environment Variables**:
   ```
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   NEXT_PUBLIC_API_URL=http://<ORACLE_VM_IP>/api
   ```

4. **Auto-Deploy Settings**:
   - ✅ Enable "Autodeploy on push"
   - Branch: `main`

5. **Resources**:
   - Instance Type: **Basic** (Free tier compatible)
   - Size: **512MB RAM / 1 vCPU** ($5/month, covered by student credits)

6. **Create App**

### Method 3: Using doctl Commands Directly

```bash
# Authenticate
doctl auth init

# Create app from spec file
cat > digitalocean-app.yaml << 'EOF'
name: megilance-frontend
region: nyc3

services:
  - name: web
    github:
      repo: ghulam-mujtaba5/MegiLance
      branch: main
      deploy_on_push: true
    source_dir: /frontend
    dockerfile_path: frontend/Dockerfile
    
    envs:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_API_URL
        value: http://YOUR_ORACLE_VM_IP/api
    
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 3000
    
    health_check:
      http_path: /
      
    routes:
      - path: /
EOF

# Deploy
doctl apps create --spec digitalocean-app.yaml

# Get app info
doctl apps list
```

---

## 🔄 Continuous Deployment Workflow

### How It Works

**Backend + AI (Oracle Cloud):**
```
Git Push → GitHub → Webhook → Oracle VM → Deploy Script → Docker Rebuild
```

**Frontend (DigitalOcean):**
```
Git Push → GitHub → DigitalOcean → Auto Build → Deploy
```

### Making Updates

1. **Make code changes locally**
2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Feature: Add new feature"
   git push origin main
   ```

3. **Automatic deployment happens**:
   - Oracle VM receives webhook → runs deploy script
   - DigitalOcean detects push → builds and deploys

4. **Monitor deployment**:
   ```bash
   # Oracle backend logs
   ssh opc@<VM_IP>
   tail -f /home/megilance/deploy.log
   
   # DigitalOcean frontend logs
   doctl apps logs <APP_ID> --type run --follow
   ```

---

## 🛠 Useful Commands

### Oracle Cloud Backend

```bash
# SSH into VM
ssh opc@<VM_IP>

# Switch to app user
sudo su - megilance

# Check running containers
docker ps

# View logs
cd /home/megilance/megilance
docker-compose -f docker-compose.oracle.yml logs -f backend
docker-compose -f docker-compose.oracle.yml logs -f ai

# Restart services
docker-compose -f docker-compose.oracle.yml restart

# Rebuild and restart
docker-compose -f docker-compose.oracle.yml down
docker-compose -f docker-compose.oracle.yml build --no-cache
docker-compose -f docker-compose.oracle.yml up -d

# Manual deployment
/home/megilance/deploy.sh

# Check webhook service
sudo systemctl status megilance-webhook
sudo journalctl -u megilance-webhook -f

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/access.log
```

### DigitalOcean Frontend

```bash
# List apps
doctl apps list

# Get app details
doctl apps get <APP_ID>

# View logs
doctl apps logs <APP_ID> --type run --follow
doctl apps logs <APP_ID> --type build

# List deployments
doctl apps list-deployments <APP_ID>

# Trigger manual deployment
doctl apps create-deployment <APP_ID>

# Update environment variables
doctl apps update <APP_ID> --spec app-spec.yaml

# Delete app
doctl apps delete <APP_ID>
```

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Set strong webhook secret
- [ ] Configure proper CORS origins
- [ ] Use HTTPS (set up Let's Encrypt on Oracle VM)
- [ ] Restrict database access to VM IP only
- [ ] Enable Oracle Cloud Security Lists
- [ ] Set up firewall rules on VM
- [ ] Use environment variables for secrets
- [ ] Enable 2FA on GitHub account
- [ ] Regularly update dependencies

---

## 📊 Cost Breakdown

### Oracle Cloud (Always Free)
- ✅ Compute VM: **$0/month** (Always Free)
- ✅ Autonomous Database: **$0/month** (Always Free)
- ✅ Block Storage: **$0/month** (10GB included)
- ✅ Bandwidth: **$0/month** (10TB outbound)

**Total Oracle: $0/month**

### DigitalOcean (GitHub Student Pack)
- Frontend App (Basic): **$5/month**
- **With $200 credit**: Free for 40 months!

**Total DigitalOcean: $0/month** (with credits)

**TOTAL COST: $0/month** ✅

---

## 🐛 Troubleshooting

### Backend not starting
```bash
# Check logs
docker-compose -f docker-compose.oracle.yml logs backend

# Verify database connection
docker-compose -f docker-compose.oracle.yml exec backend python -c "from app.core.database import engine; print(engine)"

# Check wallet location
ls -la /home/megilance/megilance/oracle-wallet-23ai/
```

### Webhook not triggering
```bash
# Check webhook service
sudo systemctl status megilance-webhook
sudo journalctl -u megilance-webhook -n 50

# Test webhook manually
curl -X POST http://<VM_IP>/webhook \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'

# Check firewall
sudo firewall-cmd --list-all
```

### Frontend not deploying
```bash
# Check build logs
doctl apps logs <APP_ID> --type build

# Verify GitHub connection
doctl apps get <APP_ID> | grep github

# Check environment variables
doctl apps get <APP_ID> | grep envs
```

---

## 📚 Additional Resources

- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Webhooks](https://docs.github.com/en/webhooks)
- [Let's Encrypt SSL](https://letsencrypt.org/)

---

## 🎉 Summary

You now have:
- ✅ **Backend + AI** running on Oracle Cloud (Always Free)
- ✅ **Frontend** running on DigitalOcean (GitHub Student Credits)
- ✅ **Auto-deployment** on every Git push
- ✅ **Zero monthly costs**
- ✅ **Production-ready** setup

**Total setup time**: ~30 minutes
**Total monthly cost**: **$0** 🎊
