# MegiLance 2.0 Deployment Guide

**Production-Ready Deployment for Advanced Features**

Version: 2.0  
Last Updated: December 2025

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Migration](#database-migration)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Third-Party Services](#third-party-services)
7. [Security Hardening](#security-hardening)
8. [Monitoring & Observability](#monitoring--observability)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Services
- **Turso Database** (libSQL cloud) or PostgreSQL/SQLite
- **TURN/STUN Server** for WebRTC video calls
- **Twilio Account** for SMS MFA
- **CoinGecko API Key** (free tier) for crypto prices
- **ExchangeRate-API Key** for currency conversion
- **Ethereum/Polygon RPC** (Infura/Alchemy) for blockchain
- **Stripe Account** for payment processing
- **Email Service** (SendGrid/SES) for transactional emails

### Server Requirements
- **Backend**: 2+ CPU cores, 4GB RAM, 20GB storage
- **Frontend**: CDN or static hosting (Vercel/Netlify/Cloudflare)
- **OS**: Linux (Ubuntu 22.04+ recommended)
- **Runtime**: Python 3.11+, Node.js 18+

---

## Environment Setup

### 1. Backend Environment Variables

Create `/backend/.env.production`:

```bash
# Core Application
APP_NAME="MegiLance"
APP_VERSION="2.0.0"
ENVIRONMENT="production"
DEBUG=false
SECRET_KEY="<GENERATE_SECURE_64_CHAR_KEY>"
API_V1_STR="/api"

# Database
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="<YOUR_TURSO_TOKEN>"
# OR for PostgreSQL:
# DATABASE_URL="postgresql://user:pass@host:5432/megilance"

# JWT Authentication
JWT_SECRET_KEY="<GENERATE_SECURE_64_CHAR_KEY>"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# SMS MFA (Twilio)
TWILIO_ACCOUNT_SID="<YOUR_TWILIO_SID>"
TWILIO_AUTH_TOKEN="<YOUR_TWILIO_TOKEN>"
TWILIO_PHONE_NUMBER="+1234567890"
MFA_CODE_EXPIRY_MINUTES=5

# Multi-Currency & Crypto
COINGECKO_API_KEY="<YOUR_COINGECKO_KEY>"  # Optional for free tier
EXCHANGERATE_API_KEY="<YOUR_EXCHANGERATE_KEY>"
CRYPTO_PRICE_CACHE_MINUTES=5

# Blockchain Integration
WEB3_PROVIDER_URL="https://mainnet.infura.io/v3/<YOUR_INFURA_KEY>"
ETHEREUM_NETWORK="mainnet"  # or "goerli" for testnet
POLYGON_NETWORK="mainnet"  # or "mumbai" for testnet

# Video Communication (WebRTC)
STUN_SERVER_URL="stun:stun.l.google.com:19302"
TURN_SERVER_URL="turn:your-turn-server.com:3478"
TURN_SERVER_USERNAME="<USERNAME>"
TURN_SERVER_PASSWORD="<PASSWORD>"

# Stripe Payments
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email Service
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="<YOUR_SENDGRID_API_KEY>"
EMAIL_FROM="noreply@megilance.com"

# Security
CORS_ORIGINS='["https://megilance.com","https://www.megilance.com"]'
RATE_LIMIT_ENABLED=true
MAX_REQUESTS_PER_MINUTE=60

# Storage (Optional - AWS S3/Cloudflare R2)
S3_BUCKET_NAME="megilance-uploads"
S3_REGION="us-east-1"
AWS_ACCESS_KEY_ID="<YOUR_AWS_KEY>"
AWS_SECRET_ACCESS_KEY="<YOUR_AWS_SECRET>"
```

### 2. Frontend Environment Variables

Create `/frontend/.env.production`:

```bash
NEXT_PUBLIC_API_URL="https://api.megilance.com"
NEXT_PUBLIC_WS_URL="wss://api.megilance.com"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_ENVIRONMENT="production"
NEXT_TELEMETRY_DISABLED=1
```

### 3. Generate Secure Keys

```bash
# Generate JWT secret keys (64 characters)
openssl rand -hex 32

# Generate SECRET_KEY for app
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## Database Migration

### 1. Apply Schema Migration

```bash
cd backend

# Option 1: Run migration script
python scripts/run_migration.py apply

# Option 2: Manual SQL execution (Turso)
turso db shell your-database < app/db/advanced_schema.sql

# Verify tables created
python scripts/run_migration.py verify
```

### 2. Seed Production Data

```bash
# Seed exchange rates and initial data
python scripts/run_migration.py seed

# Create admin user
python scripts/create_admin.py \
  --email admin@megilance.com \
  --password <SECURE_PASSWORD> \
  --full-name "Admin User"
```

### 3. Database Backup Setup

```bash
# Turso automatic backups (configured in dashboard)
# OR cron job for manual backups:
0 2 * * * turso db backup your-database > /backups/megilance-$(date +\%Y\%m\%d).sql
```

---

## Backend Deployment

### Option 1: Docker Deployment (Recommended)

```bash
# Build production image
docker build -f backend/Dockerfile \
  --build-arg ENVIRONMENT=production \
  -t megilance-backend:2.0 .

# Run container
docker run -d \
  --name megilance-backend \
  -p 8000:8000 \
  --env-file backend/.env.production \
  --restart unless-stopped \
  megilance-backend:2.0

# Check logs
docker logs -f megilance-backend
```

### Option 2: Systemd Service

Create `/etc/systemd/system/megilance-backend.service`:

```ini
[Unit]
Description=MegiLance Backend API
After=network.target

[Service]
Type=exec
User=megilance
Group=megilance
WorkingDirectory=/opt/megilance/backend
EnvironmentFile=/opt/megilance/backend/.env.production
ExecStart=/opt/megilance/venv/bin/gunicorn \
  main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --access-logfile /var/log/megilance/access.log \
  --error-logfile /var/log/megilance/error.log
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable megilance-backend
sudo systemctl start megilance-backend
sudo systemctl status megilance-backend
```

### Option 3: Kubernetes Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: megilance-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: megilance-backend
  template:
    metadata:
      labels:
        app: megilance-backend
    spec:
      containers:
      - name: backend
        image: megilance-backend:2.0
        ports:
        - containerPort: 8000
        envFrom:
        - secretRef:
            name: megilance-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /api/health/ready
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health/ready
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Option 2: Docker + Nginx

```bash
# Build Next.js app
cd frontend
npm run build

# Build Docker image
docker build -f Dockerfile -t megilance-frontend:2.0 .

# Run with Nginx
docker run -d \
  --name megilance-frontend \
  -p 3000:3000 \
  megilance-frontend:2.0
```

### Option 3: Static Export + CDN

```bash
# Export static site
npm run build
npm run export

# Upload to S3/R2
aws s3 sync out/ s3://megilance-frontend --delete

# Or use Cloudflare Pages
npx wrangler pages publish out
```

---

## Third-Party Services

### 1. TURN Server Setup (Coturn)

```bash
# Install Coturn
sudo apt-get install coturn

# Configure /etc/turnserver.conf
listening-port=3478
fingerprint
lt-cred-mech
user=megilance:SECURE_PASSWORD
realm=megilance.com
server-name=turn.megilance.com
cert=/etc/letsencrypt/live/turn.megilance.com/fullchain.pem
pkey=/etc/letsencrypt/live/turn.megilance.com/privkey.pem

# Start service
sudo systemctl enable coturn
sudo systemctl start coturn
```

### 2. Twilio SMS Setup

1. Sign up at [twilio.com](https://twilio.com)
2. Get phone number from Console
3. Copy Account SID and Auth Token
4. Add to `.env.production`
5. Verify webhook URL: `https://api.megilance.com/api/twilio/webhook`

### 3. CoinGecko & ExchangeRate-API

```bash
# CoinGecko (Free Tier)
# Sign up: https://www.coingecko.com/en/api/pricing
# No API key needed for demo mode

# ExchangeRate-API (Free Tier)
# Sign up: https://www.exchangerate-api.com/
# Copy API key to .env
```

### 4. Infura/Alchemy (Blockchain RPC)

```bash
# Infura: https://infura.io/
# Create project → Copy Ethereum/Polygon endpoints

# Alchemy: https://www.alchemy.com/
# Create app → Copy API key
```

---

## Security Hardening

### 1. SSL/TLS Certificates

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d api.megilance.com -d megilance.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 2. Firewall Configuration

```bash
# UFW firewall rules
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3478/tcp  # TURN server
sudo ufw enable
```

### 3. Rate Limiting (Nginx)

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=60r/m;
    
    server {
        location /api/ {
            limit_req zone=api_limit burst=10;
            proxy_pass http://localhost:8000;
        }
    }
}
```

### 4. Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'";
```

---

## Monitoring & Observability

### 1. Health Checks

```bash
# Backend health endpoint
curl https://api.megilance.com/api/health/ready

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  "version": "2.0.0"
}
```

### 2. Application Monitoring

```bash
# Install Sentry for error tracking
pip install sentry-sdk[fastapi]

# Add to main.py
import sentry_sdk
sentry_sdk.init(
    dsn="<YOUR_SENTRY_DSN>",
    environment="production",
    traces_sample_rate=0.1
)
```

### 3. Server Monitoring

```bash
# Install Prometheus + Grafana
docker run -d -p 9090:9090 prom/prometheus
docker run -d -p 3000:3000 grafana/grafana

# Or use cloud services:
# - DataDog
# - New Relic
# - AWS CloudWatch
```

### 4. Log Aggregation

```bash
# ELK Stack or Loki
# Centralize logs from all services

# Example: Ship to CloudWatch
aws logs create-log-group --log-group-name /megilance/backend
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Fails**
```bash
# Check Turso connectivity
turso db show your-database

# Test connection
python -c "import libsql_experimental as libsql; db = libsql.connect('libsql://...'); print(db)"
```

**2. WebRTC Video Calls Not Working**
```bash
# Verify STUN/TURN server
stunclient turn.megilance.com 3478

# Check firewall allows UDP 3478
sudo ufw allow 3478/udp
```

**3. SMS MFA Not Sending**
```bash
# Test Twilio credentials
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_SID/Messages.json \
  --data-urlencode "Body=Test" \
  --data-urlencode "From=+1234567890" \
  --data-urlencode "To=+0987654321" \
  -u $TWILIO_SID:$TWILIO_TOKEN
```

**4. Payment Processing Errors**
```bash
# Verify Stripe webhook
stripe listen --forward-to localhost:8000/api/stripe/webhook

# Check webhook secret matches .env
```

---

## Rollback Procedures

### 1. Backend Rollback

```bash
# Docker
docker stop megilance-backend
docker rm megilance-backend
docker run -d --name megilance-backend megilance-backend:1.0

# Systemd
sudo systemctl stop megilance-backend
# Replace binary with previous version
sudo systemctl start megilance-backend
```

### 2. Database Rollback

```bash
# Restore from backup
turso db restore your-database backup-20251201.sql

# OR manual rollback
python scripts/run_migration.py rollback
```

### 3. Frontend Rollback

```bash
# Vercel
vercel rollback

# S3/CDN
aws s3 sync s3://megilance-frontend-backup/ s3://megilance-frontend --delete
```

---

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrated successfully
- [ ] SSL certificates installed
- [ ] TURN server running and accessible
- [ ] Twilio SMS working
- [ ] Stripe webhooks configured
- [ ] CoinGecko/ExchangeRate APIs tested
- [ ] Blockchain RPC endpoints verified
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Monitoring/alerting setup
- [ ] Log aggregation configured
- [ ] Backup cron jobs scheduled
- [ ] Load testing completed
- [ ] Disaster recovery plan documented

---

## Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Check error logs
- Monitor API response times
- Verify payment processing

**Weekly:**
- Review security events
- Update exchange rate cache
- Check disk space usage

**Monthly:**
- Update dependencies (`pip-audit`, `npm audit`)
- Rotate JWT secret keys
- Review and archive old logs

### Getting Help

- **Documentation**: `/docs/`
- **API Reference**: `https://api.megilance.com/docs`
- **Support Email**: support@megilance.com

---

**End of Deployment Guide**
