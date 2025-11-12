# 🚀 MegiLance Production Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (Choose One):                                     │
│  ├─ Vercel (Recommended - Free tier)                       │
│  ├─ Netlify (Alternative - Free tier)                      │
│  ├─ Digital Ocean App Platform                             │
│  └─ Cloudflare Pages                                       │
│         ↓                                                   │
│         ↓ API Calls (HTTPS)                                │
│         ↓                                                   │
│  Backend API (Choose One):                                  │
│  ├─ Oracle Cloud Compute (Always Free VM)                  │
│  ├─ Digital Ocean Droplet ($6/month)                       │
│  ├─ Railway.app ($5/month)                                 │
│  └─ Fly.io (Free tier available)                           │
│         ↓                                                   │
│         ↓ SQL Connection                                    │
│         ↓                                                   │
│  Database:                                                  │
│  └─ Oracle Autonomous Database (Always Free)               │
│     └─ OCID: ...antheljsgrln3kqaq3j7fljpzt6aosyz...       │
│     └─ Location: Oracle Cloud (Frankfurt)                  │
│     └─ Cost: $0.00/month FOREVER                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Recommended Production Stack (Best Cost/Performance)

| Component | Service | Cost | Why |
|-----------|---------|------|-----|
| **Database** | Oracle Autonomous DB | **$0.00/month** | Enterprise-grade, Always Free |
| **Backend API** | Oracle Cloud VM | **$0.00/month** | Always Free tier, same cloud as DB |
| **Frontend** | Vercel | **$0.00/month** | Free tier, auto-scaling, CDN |
| **Domain** | Namecheap/Cloudflare | **~$10/year** | Optional for custom domain |
| **TOTAL** | | **$0.00/month** | 100% free production setup! |

---

## 📋 Phase 1: Database (Already Done ✅)

Your Oracle Autonomous Database is production-ready:
- ✅ Always Free tier (permanent)
- ✅ Auto-scaling (up to 1 OCPU)
- ✅ Automatic backups
- ✅ High availability
- ✅ SSL/TLS encryption
- ✅ DDoS protection

**No changes needed** - your database is already in Oracle Cloud!

---

## 📋 Phase 2: Backend API Deployment

### Option A: Oracle Cloud Compute (RECOMMENDED - FREE)

**Why:** Same cloud as database = lowest latency, no data transfer costs

#### Step 1: Create Always Free VM

```bash
# 1. Login to OCI Console: https://cloud.oracle.com
# 2. Navigate: Compute → Instances → Create Instance

# Instance Details:
# - Name: megilance-backend
# - Image: Ubuntu 22.04 Minimal
# - Shape: VM.Standard.E2.1.Micro (Always Free)
# - OCPU: 1 (Always Free limit)
# - Memory: 1GB
# - Boot Volume: 50GB (Always Free limit)
# - VCN: Create new (or use existing)
# - Assign Public IP: Yes
```

#### Step 2: Configure Firewall

```bash
# Add ingress rules in Security List:
# - Port 22 (SSH) - Your IP only
# - Port 80 (HTTP) - 0.0.0.0/0
# - Port 443 (HTTPS) - 0.0.0.0/0
# - Port 8000 (API) - 0.0.0.0/0 (temporary, will use reverse proxy)
```

#### Step 3: Deploy Backend

```bash
# SSH into your VM
ssh -i ~/.ssh/oci_key ubuntu@<YOUR_PUBLIC_IP>

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone your repo (or upload via SCP)
git clone https://github.com/ghulam-mujtaba5/MegiLance.git
cd MegiLance

# Copy Oracle wallet (upload via SCP)
# scp -i ~/.ssh/oci_key -r oracle-wallet/ ubuntu@<YOUR_PUBLIC_IP>:~/MegiLance/

# Create production .env
cat > backend/.env << 'EOF'
DATABASE_URL=oracle+oracledb://ADMIN:Bfw5ZvHQXjkDb!3lAa1!@megilancedb_high?wallet_location=/app/oracle-wallet&wallet_password=MegiLance2025!Wallet
OCI_REGION=eu-frankfurt-1
OCI_NAMESPACE=frj6px39shbv
OCI_BUCKET_NAME=megilance-storage
SECRET_KEY=<GENERATE_STRONG_SECRET_HERE>
JWT_SECRET_KEY=<GENERATE_STRONG_JWT_SECRET_HERE>
ENVIRONMENT=production
DEBUG=false
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
EOF

# Start backend
docker-compose -f docker-compose.oracle.yml up -d backend

# Run migrations
docker exec megilance-backend-1 alembic upgrade head

# Install Nginx (reverse proxy)
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y

# Configure Nginx
sudo tee /etc/nginx/sites-available/megilance << 'EOF'
server {
    listen 80;
    server_name api.yourdomain.com;  # Change to your domain

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/megilance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate (after DNS is pointed)
sudo certbot --nginx -d api.yourdomain.com
```

#### Step 4: Setup Auto-restart

```bash
# Create systemd service
sudo tee /etc/systemd/system/megilance-backend.service << 'EOF'
[Unit]
Description=MegiLance Backend
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/MegiLance
ExecStart=/usr/local/bin/docker-compose -f docker-compose.oracle.yml up -d backend
ExecStop=/usr/local/bin/docker-compose -f docker-compose.oracle.yml down

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable megilance-backend
sudo systemctl start megilance-backend
```

**Result:** Your backend will be available at `https://api.yourdomain.com`

---

### Option B: Digital Ocean Droplet ($6/month)

```bash
# 1. Create Droplet
# - Ubuntu 22.04
# - Basic Plan ($6/month)
# - 1GB RAM, 1 vCPU, 25GB SSD
# - Datacenter: Frankfurt (close to Oracle DB)

# 2. Follow same deployment steps as Option A
# 3. Point DNS to Digital Ocean IP
```

---

### Option C: Railway.app ($5/month)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create new project
railway init

# 4. Add Oracle wallet as volume
railway volume add oracle-wallet

# 5. Set environment variables in Railway dashboard
# 6. Deploy
railway up
```

---

## 📋 Phase 3: Frontend Deployment

### Option A: Vercel (RECOMMENDED - FREE)

#### Step 1: Prepare Frontend

```bash
cd frontend

# Update .env.production
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production
EOF

# Update next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
EOF
```

#### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Or use Vercel Dashboard:
# 1. Go to https://vercel.com
# 2. Import your GitHub repo
# 3. Configure:
#    - Framework: Next.js
#    - Root Directory: frontend
#    - Environment Variables: NEXT_PUBLIC_API_URL
# 4. Deploy
```

**Result:** Your frontend will be at `https://your-project.vercel.app`

#### Step 3: Custom Domain (Optional)

```bash
# In Vercel Dashboard:
# Settings → Domains → Add Domain
# Add: yourdomain.com and www.yourdomain.com
# Follow DNS configuration instructions
```

---

### Option B: Netlify (Alternative FREE)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd frontend
npm run build
netlify deploy --prod --dir=.next
```

---

### Option C: Digital Ocean App Platform

```bash
# 1. Go to Digital Ocean Dashboard
# 2. Create App → GitHub repo
# 3. Configure:
#    - Type: Static Site
#    - Build Command: npm run build
#    - Output Directory: .next
# 4. Environment Variables: NEXT_PUBLIC_API_URL
# 5. Deploy
```

---

## 📋 Phase 4: Production Checklist

### Security

- [ ] Change all default passwords
- [ ] Generate strong SECRET_KEY and JWT_SECRET_KEY
  ```bash
  # Generate secrets
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- [ ] Enable HTTPS (SSL certificates)
- [ ] Configure CORS properly
- [ ] Set up firewall rules (only allow necessary ports)
- [ ] Use environment variables (never commit secrets)
- [ ] Enable Oracle database SSL/TLS
- [ ] Set up rate limiting on API

### Performance

- [ ] Enable database connection pooling
- [ ] Set up CDN for frontend (Vercel includes this)
- [ ] Optimize images (use Next.js Image component)
- [ ] Enable gzip/brotli compression
- [ ] Set up caching headers
- [ ] Monitor API response times

### Monitoring

- [ ] Set up logging (use OCI Logging or external service)
- [ ] Configure health checks
- [ ] Set up uptime monitoring (UptimeRobot - free)
- [ ] Enable error tracking (Sentry - free tier)
- [ ] Monitor database performance in OCI Console

### Backups

- [ ] Oracle ADB auto-backups enabled (default)
- [ ] Backup oracle-wallet directory
- [ ] Document deployment process
- [ ] Version control everything (Git)

---

## 🔧 Production Environment Variables

### Backend (.env)

```bash
# Database (Oracle Autonomous DB)
DATABASE_URL=oracle+oracledb://ADMIN:YOUR_PASSWORD@megilancedb_high?wallet_location=/app/oracle-wallet&wallet_password=YOUR_WALLET_PASSWORD

# OCI Configuration
OCI_REGION=eu-frankfurt-1
OCI_NAMESPACE=frj6px39shbv
OCI_BUCKET_NAME=megilance-storage
OCI_COMPARTMENT_ID=ocid1.tenancy.oc1..aaaaaaaa4h764yvig7p4xtyxhmty36cwnbhqxsr3ldbaxnwykf2a5ws3qwlq

# Security (GENERATE NEW SECRETS!)
SECRET_KEY=<GENERATE_STRONG_SECRET_32_CHARS>
JWT_SECRET_KEY=<GENERATE_STRONG_JWT_SECRET_32_CHARS>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application
ENVIRONMENT=production
DEBUG=false
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://your-project.vercel.app

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### Frontend (.env.production)

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

---

## 📊 Cost Breakdown (Recommended Setup)

| Service | Plan | Monthly Cost | Annual Cost |
|---------|------|--------------|-------------|
| **Oracle Autonomous DB** | Always Free | $0.00 | $0.00 |
| **Oracle Cloud VM** | Always Free | $0.00 | $0.00 |
| **Object Storage** | Always Free | $0.00 | $0.00 |
| **Vercel** | Free tier | $0.00 | $0.00 |
| **Domain** | .com domain | - | ~$10.00 |
| **SSL Certificate** | Let's Encrypt | $0.00 | $0.00 |
| **TOTAL** | | **$0.00/month** | **~$10/year** |

---

## 🚀 Deployment Timeline

### Today (Local Development)
- ✅ Oracle Autonomous Database setup
- ✅ Backend working locally
- ✅ Frontend working locally
- ✅ Docker containers configured

### Tomorrow (Backend Deployment)
- ⏱️ 30 minutes: Create Oracle Cloud VM
- ⏱️ 20 minutes: Install Docker & dependencies
- ⏱️ 10 minutes: Deploy backend code
- ⏱️ 15 minutes: Configure Nginx & SSL
- **Total: ~1.5 hours**

### Day 3 (Frontend Deployment)
- ⏱️ 10 minutes: Update environment variables
- ⏱️ 5 minutes: Deploy to Vercel
- ⏱️ 15 minutes: Configure custom domain (optional)
- **Total: ~30 minutes**

### Day 4 (Testing & Optimization)
- ⏱️ 30 minutes: End-to-end testing
- ⏱️ 20 minutes: Performance optimization
- ⏱️ 10 minutes: Set up monitoring
- **Total: ~1 hour**

---

## 📝 Quick Deployment Script

Save this as `deploy-production.sh`:

```bash
#!/bin/bash

echo "🚀 MegiLance Production Deployment"
echo "=================================="

# 1. Deploy Backend to Oracle Cloud VM
echo "📦 Step 1: Deploying Backend..."
ssh ubuntu@<YOUR_VM_IP> << 'ENDSSH'
cd ~/MegiLance
git pull origin main
docker-compose -f docker-compose.oracle.yml down
docker-compose -f docker-compose.oracle.yml build backend
docker-compose -f docker-compose.oracle.yml up -d backend
docker exec megilance-backend-1 alembic upgrade head
echo "✅ Backend deployed!"
ENDSSH

# 2. Deploy Frontend to Vercel
echo "🌐 Step 2: Deploying Frontend..."
cd frontend
vercel --prod
echo "✅ Frontend deployed!"

# 3. Run health checks
echo "🏥 Step 3: Health Checks..."
curl -f https://api.yourdomain.com/api/health/live || echo "❌ Backend health check failed"
curl -f https://yourdomain.com || echo "❌ Frontend health check failed"

echo "✅ Deployment complete!"
```

---

## 🎓 For Your Professor Demo

You can showcase:

1. **Cloud Architecture Diagram** (shown above)
2. **Cost Analysis**: $0/month production hosting
3. **Scalability**: Can upgrade Oracle DB and VMs as needed
4. **Professional Setup**: Separate frontend/backend, proper SSL, monitoring
5. **Real URLs**: 
   - Frontend: `https://megilance.yourdomain.com`
   - API: `https://api.yourdomain.com`
   - Docs: `https://api.yourdomain.com/api/docs`

---

## 🔗 Next Steps

1. **Choose your deployment platforms** (I recommend Oracle VM + Vercel)
2. **Get a domain name** (optional but professional)
3. **Follow Phase 2 & 3** deployment guides
4. **Run production checklist**
5. **Set up monitoring**

Want me to help you with any specific deployment step?
