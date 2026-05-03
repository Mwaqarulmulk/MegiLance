# 🚀 MegiLance Deployment Guide

## Quick Reference

| Environment | Database | Server | Memory | CPU |
|-----------|----------|--------|--------|-----|
| Development | SQLite (local) | `python main.py` | 512MB | 1 core |
| Production | Turso (cloud) | Docker | 2GB | 2 cores |

## Local Development Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your local settings
```

### 3. Run Migrations

```bash
# Create database and tables
alembic upgrade head

# Create initial admin user (optional)
python scripts/create_admin.py
```

### 4. Start Development Server

```bash
# Backend (port 8000)
python main.py

# Frontend (port 3000) - in new terminal
cd ../frontend
npm install
npm run dev
```

Access at:
- Frontend: http://localhost:3000
- API: http://localhost:8000/api/docs
- Health Check: http://localhost:8000/api/health/ready

## Docker Production Deployment

### 1. Build Docker Images

```bash
# Build all services
docker compose build

# Or build specific service
docker compose build backend
docker compose build frontend
```

### 2. Configure Secrets

```bash
# Create .env.production (DO NOT COMMIT)
cat > .env.production << EOF
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=<your-token>
STRIPE_SECRET_KEY=<stripe-secret>
SMTP_PASSWORD=<your-smtp-password>
EOF

# In Docker, use --env-file
docker compose --env-file .env.production up -d
```

### 3. Run Migrations in Docker

```bash
# Execute migration in running container
docker compose exec backend alembic upgrade head

# Or create init container that runs before app
# (configured in docker-compose.yml)
```

### 4. Start Services

```bash
# Development (hot reload)
docker compose -f docker-compose.dev.yml up --build

# Production
docker compose -f docker-compose.yml up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

### 5. Health Checks

```bash
# Check backend health
curl http://localhost:8000/api/health/ready

# Check database connectivity
curl http://localhost:8000/api/health/live

# Docker health status
docker compose ps
```

## Cloud Deployment (DigitalOcean Example)

### 1. Create Droplet

```bash
# Create Ubuntu 22.04 droplet with Docker pre-installed
# Size: 2GB RAM / 2 CPU (minimum for production)
```

### 2. Deploy Application

```bash
# SSH into droplet
ssh root@your-ip

# Clone repository
git clone https://github.com/your-org/megilance.git
cd megilance

# Setup environment
cat > .env.production << EOF
ENVIRONMENT=production
TURSO_DATABASE_URL=...
TURSO_AUTH_TOKEN=...
SECRET_KEY=...
EOF

# Start services
docker compose -f docker-compose.yml up -d

# Verify
docker compose ps
curl http://localhost:8000/api/health/ready
```

### 3. Setup SSL Certificate

```bash
# Using Let's Encrypt
docker run --rm -it -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot -d megilance.com -d www.megilance.com

# Update docker-compose.yml to mount certificate
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

### 4. Setup Reverse Proxy

```nginx
# /etc/nginx/sites-available/megilance.conf
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 443 ssl http2;
    server_name megilance.com www.megilance.com;

    ssl_certificate /etc/letsencrypt/live/megilance.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/megilance.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name megilance.com www.megilance.com;
    return 301 https://$server_name$request_uri;
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/megilance.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Environment Variables Reference

### Required for Production

```bash
# Security
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=<32+ character random string>

# Database
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=<auth-token-from-turso>

# Frontend
FRONTEND_URL=https://megilance.com

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<sendgrid-api-key>
FROM_EMAIL=noreply@megilance.com
```

### Optional

```bash
# AI Features
OPENAI_API_KEY=sk-...

# 2FA
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=INFO
```

## Monitoring & Maintenance

### Check Application Health

```bash
# Every 5 minutes
*/5 * * * * curl -f http://localhost:8000/api/health/ready || systemctl restart megilance

# In crontab on server
crontab -e
```

### View Logs

```bash
# Docker logs
docker compose logs -f backend
docker compose logs -f frontend
tail -f /var/log/docker.log

# Application logs (if mounted)
tail -f logs/app.log
```

### Database Backups

```bash
# Turso automatic backups
turso db backup list megilance-prod

# Backup locally
turso db shell megilance-prod < backup.sql

# Restore from backup
turso db restore megilance-prod --backup <backup-id>
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker compose build

# Restart services (zero downtime)
docker compose up -d

# Verify
docker compose ps
curl http://localhost:8000/api/health/ready
```

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker compose logs backend

# Common issues:
# 1. Database connection failed
#    - Verify TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
#    - Run migrations: docker compose exec backend alembic upgrade head

# 2. Port 8000 in use
#    - sudo lsof -i :8000
#    - Kill process: sudo kill -9 <PID>

# 3. Import error
#    - docker compose rebuild backend
#    - docker compose up -d
```

### Frontend Won't Load

```bash
# Check logs
docker compose logs frontend

# Clear cache and rebuild
docker compose up -d --force-recreate --no-cache frontend

# Verify API is accessible from frontend:
docker compose exec frontend curl http://backend:8000/api/health/ready
```

### Database Issues

```bash
# Check connection
docker compose exec backend python -c "from app.db.session import get_engine; get_engine().connect()"

# Run migrations
docker compose exec backend alembic current
docker compose exec backend alembic upgrade head

# Check Turso token expiry
turso db tokens list megilance-prod
# Create new token if expired:
turso db tokens create megilance-prod
```

## Rollback Procedure

```bash
# If deployment fails:

# 1. Stop current version
docker compose down

# 2. Checkout previous version
git checkout <previous-commit>

# 3. Rebuild
docker compose build

# 4. Restart
docker compose up -d

# 5. Verify health
curl http://localhost:8000/api/health/ready
```

## Performance Tuning

### Database Optimization

```python
# In app/db/session.py
pool_pre_ping=True          # Check connections
pool_recycle=3600          # Recycle hourly
echo=False                 # Disable query logging in prod
```

### API Rate Limiting

```python
# Already configured in app/core/rate_limit.py
# Adjust in .env:
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

### Frontend Performance

```bash
# Optimize bundle size
npm run build
npm run analyze  # See bundle analysis

# Enable compression in nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

## Capacity Planning

| Load | Database | Server Memory | Server CPU | Storage |
|------|----------|---------------|-----------|---------|
| 100 users | Turso free | 512MB | 0.5 | 1GB |
| 1K users | Turso pro | 1GB | 1 | 10GB |
| 10K users | Turso pro | 2GB | 2 | 50GB |
| 100K+ users | Turso enterprise | 4GB+ | 4+ | 500GB+ |

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Turso Deployment](https://docs.turso.tech/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Next.js Production](https://nextjs.org/docs/going-to-production)
