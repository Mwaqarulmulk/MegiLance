# MegiLance Quick Start - Oracle Cloud Deployment

## 🚀 Deploy Backend + AI to Oracle Cloud in 5 Minutes

### Prerequisites
- Oracle Cloud account (Always Free tier)
- SSH key pair
- Git installed locally

---

## Step 1: Create Oracle Cloud VM (2 minutes)

### Option A: Using Oracle Cloud Console
1. Go to https://cloud.oracle.com/
2. **Compute** → **Instances** → **Create Instance**
3. Settings:
   - Name: `megilance-backend`
   - Image: **Oracle Linux 8**
   - Shape: **VM.Standard.E2.1.Micro** (Always Free)
   - Upload SSH public key
4. Click **Create**
5. Note the **Public IP address**

### Option B: Using OCI CLI
```bash
oci compute instance launch \
  --display-name megilance-backend \
  --shape VM.Standard.E2.1.Micro \
  --image-id ocid1.image.oc1...(Oracle Linux 8) \
  --ssh-authorized-keys-file ~/.ssh/id_rsa.pub
```

---

## Step 2: Configure Firewall (1 minute)

In Oracle Cloud Console:
1. **Networking** → **Virtual Cloud Networks** → **Security Lists**
2. Add **Ingress Rules**:
   ```
   Source: 0.0.0.0/0, Protocol: TCP, Port: 22   (SSH)
   Source: 0.0.0.0/0, Protocol: TCP, Port: 80   (HTTP)
   Source: 0.0.0.0/0, Protocol: TCP, Port: 443  (HTTPS)
   Source: 0.0.0.0/0, Protocol: TCP, Port: 8000 (API)
   Source: 0.0.0.0/0, Protocol: TCP, Port: 9000 (Webhook)
   ```

---

## Step 3: Run Auto-Setup Script (10-15 minutes)

```bash
# SSH into your VM
ssh opc@YOUR_VM_IP

# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/ghulam-mujtaba5/MegiLance/main/deploy-oracle-setup.sh -o setup.sh
chmod +x setup.sh
sudo bash setup.sh

# Script will install:
# - Docker & Docker Compose
# - Nginx reverse proxy
# - Git repository
# - Auto-deployment system
# - Webhook listener
```

---

## Step 4: Setup Database (5 minutes)

### Create Oracle Autonomous Database
1. **Oracle Cloud Console** → **Autonomous Database** → **Create**
2. Choose:
   - **Transaction Processing**
   - **Always Free** tier
3. Set **admin password**
4. Click **Create**

### Download and Upload Wallet
```bash
# Download wallet from Oracle Cloud Console
# DB Connection → Download Wallet

# From your local machine, upload to VM:
scp -r oracle-wallet-23ai opc@YOUR_VM_IP:/tmp/

# On VM, move to app directory:
ssh opc@YOUR_VM_IP
sudo mv /tmp/oracle-wallet-23ai /home/megilance/megilance/
sudo chown -R megilance:megilance /home/megilance/megilance/oracle-wallet-23ai
```

---

## Step 5: Configure Environment (2 minutes)

```bash
# Create backend environment file
sudo nano /home/megilance/megilance/backend/.env
```

**Minimal required configuration:**
```env
# Database
DATABASE_TYPE=oracle
ORACLE_USER=ADMIN
ORACLE_PASSWORD=YourDatabasePassword
ORACLE_DSN=yourdb_high
ORACLE_WALLET_LOCATION=/app/oracle-wallet
ORACLE_WALLET_PASSWORD=YourWalletPassword

# Security
SECRET_KEY=change-this-to-random-string
JWT_SECRET_KEY=change-this-too

# Application
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=https://your-frontend.ondigitalocean.app
```

**Generate secure keys:**
```bash
# On VM or locally
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Step 6: Deploy Application (2 minutes)

```bash
# Run first deployment
sudo -u megilance /home/megilance/deploy.sh

# Monitor deployment
docker-compose -f /home/megilance/megilance/docker-compose.oracle.yml logs -f
```

**Wait for:**
```
✓ Deployment successful!
backend_1  | Application startup complete.
ai_1       | AI service ready
```

**Test it:**
```bash
curl http://localhost:8000/api/health/live
# Should return: {"status":"healthy"}
```

---

## Step 7: Setup Auto-Deployment (3 minutes)

### Configure Webhook Secret
```bash
# Generate secret
openssl rand -hex 32
# Save this secret!

# Update service
sudo nano /etc/systemd/system/megilance-webhook.service
# Change: Environment="WEBHOOK_SECRET=your-secret-here"
# To: Environment="WEBHOOK_SECRET=<generated-secret>"

sudo systemctl daemon-reload
sudo systemctl restart megilance-webhook
```

### Add GitHub Webhook
1. Go to: https://github.com/YOUR_USERNAME/MegiLance/settings/hooks
2. Click **Add webhook**
3. Configure:
   - **Payload URL**: `http://YOUR_VM_IP/webhook`
   - **Content type**: `application/json`
   - **Secret**: (paste the generated secret)
   - **Events**: Just the push event ✅
4. Click **Add webhook**

### Test Auto-Deployment
```bash
# Make a change and push
git add .
git commit -m "Test deployment"
git push origin main

# On VM, watch logs:
sudo journalctl -u megilance-webhook -f
tail -f /home/megilance/deploy.log
```

---

## ✅ Verification Checklist

Run these commands to verify everything:

```bash
# 1. Check services are running
docker ps
# Should show: backend and ai containers

# 2. Check health endpoint
curl http://YOUR_VM_IP/api/health/live

# 3. Check webhook listener
sudo systemctl status megilance-webhook

# 4. Check Nginx
sudo systemctl status nginx
curl http://YOUR_VM_IP/health

# 5. View logs
docker-compose -f /home/megilance/megilance/docker-compose.oracle.yml logs
```

---

## 🎯 Your Backend is Ready!

**API Base URL**: `http://YOUR_VM_IP/api`
**Health Check**: `http://YOUR_VM_IP/health`
**Webhook**: `http://YOUR_VM_IP/webhook`

### API Endpoints
- `GET /api/health/live` - Health check
- `GET /api/health/ready` - Readiness check
- `GET /api/docs` - API documentation (Swagger)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

---

## 📝 Next Steps

1. **Enable HTTPS** (recommended for production):
   ```bash
   # Install Certbot
   sudo dnf install -y certbot python3-certbot-nginx
   
   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com
   ```

2. **Setup Custom Domain**:
   - Point A record to VM IP
   - Update Nginx config
   - Update CORS_ORIGINS in .env

3. **Monitor Resources**:
   ```bash
   # Check memory/CPU
   docker stats
   
   # Check disk space
   df -h
   ```

4. **Setup Backups**:
   ```bash
   # Database backup (already handled by Oracle)
   # Upload backup script
   ```

---

## 🛠 Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose -f /home/megilance/megilance/docker-compose.oracle.yml logs backend

# Check database connection
docker exec -it megilance-backend-1 python -c "from app.core.database import engine; print(engine)"
```

### Webhook not working
```bash
# Check service status
sudo systemctl status megilance-webhook

# View logs
sudo journalctl -u megilance-webhook -f

# Test manually
curl -X POST http://localhost:9000/webhook \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'
```

### Port not accessible
```bash
# Check firewall on VM
sudo firewall-cmd --list-all

# Check Oracle Security Lists in Cloud Console
```

---

## 💰 Cost
**$0/month** - Everything runs on Oracle Always Free tier!

---

Need help? Check the full guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
