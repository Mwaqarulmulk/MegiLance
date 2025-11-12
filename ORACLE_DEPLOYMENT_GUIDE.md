# MegiLance Oracle Cloud Deployment Guide

## Quick Start (Production)

### Prerequisites
- Docker Desktop installed and running
- OCI CLI configured (`~/.oci/config`)
- Oracle wallet downloaded to `oracle-wallet/`
- `.env.oracle` file with credentials

### Deploy to Oracle Cloud

```powershell
# 1. Start the production stack
docker-compose -f docker-compose.oracle.yml up -d

# 2. Check container status
docker-compose -f docker-compose.oracle.yml ps

# 3. View backend logs
docker-compose -f docker-compose.oracle.yml logs backend -f

# 4. Initialize database schema
docker exec megilance-backend-1 alembic upgrade head

# 5. Access the application
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/api/docs
```

## Oracle Resources

### Autonomous Database
- **Name**: megilancedb
- **OCID**: `ocid1.autonomousdatabase.oc1.eu-frankfurt-1.anth...`
- **Region**: eu-frankfurt-1  
- **Tier**: Always Free (1 ECPU, 1TB)
- **Service Names**:
  - `megilancedb_high` (High priority)
  - `megilancedb_medium` (Medium priority)
  - `megilancedb_low` (Low priority)

### Object Storage
- **Bucket**: megilance-storage
- **Namespace**: frj6px39shbv
- **Capacity**: 10GB (Free Tier)
- **Region**: eu-frankfurt-1

### Security
- **Admin Password**: Stored in `.env.oracle` (Bfw5ZvHQXjkDb!3lAa1!)
- **Wallet Password**: MegiLance2025!Wallet
- **Wallet Location**: `E:\MegiLance\oracle-wallet\`

## Architecture

```
┌─────────────────┐
│   Frontend      │  Next.js 14
│   Port: 3000    │  React + TypeScript
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend       │  FastAPI
│   Port: 8000    │  Python 3.11
└────────┬────────┘
         │
         │ Oracle TNS
         │ + Wallet Auth
         │
┌────────▼────────┐
│ Oracle ADB      │  Always Free
│ eu-frankfurt-1  │  1 ECPU, 1TB
└─────────────────┘
```

## Environment Variables

### Backend (Configured in docker-compose.oracle.yml)
```bash
DATABASE_URL=oracle+oracledb://ADMIN:<password>@megilancedb_high?wallet_location=/app/oracle-wallet&wallet_password=MegiLance2025!Wallet
OCI_REGION=eu-frankfurt-1
OCI_NAMESPACE=frj6px39shbv
OCI_BUCKET_NAME=megilance-storage
OCI_COMPARTMENT_ID=ocid1.tenancy.oc1..aaaaaaaa4h764yvig7p4xtyxhmty36cwnbhqxsr3ldbaxnwykf2a5ws3qwlq
ORACLE_WALLET_LOCATION=/app/oracle-wallet
ORACLE_WALLET_PASSWORD=MegiLance2025!Wallet
```

### Frontend
```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Database Connection

### Connection String Format
```
oracle+oracledb://ADMIN:<password>@<service_name>?wallet_location=<path>&wallet_password=<password>
```

### Service Names
- **High Priority** (recommended): `megilancedb_high`
- **Medium Priority**: `megilancedb_medium`
- **Low Priority**: `megilancedb_low`

### Wallet Configuration
The Oracle wallet contains:
- `tnsnames.ora` - TNS configuration
- `sqlnet.ora` - SQL*Net settings
- `cwallet.sso` - Encrypted credentials
- `ewallet.p12` - PKCS#12 wallet
- `keystore.jks` - Java keystore
- `truststore.jks` - Java truststore

## Docker Configuration

### Dockerfile Highlights
```dockerfile
# Multi-stage build
FROM python:3.11-slim AS builder

# Install Oracle Instant Client 21.13
RUN wget https://download.oracle.com/otn_software/linux/instantclient/2113000/instantclient-basic-linux.x64-21.13.0.0.0dbru.zip
RUN unzip instantclient-basic-linux.x64-21.13.0.0.0dbru.zip -d /opt/oracle

# Install Python dependencies (oracledb, cx_Oracle, oci)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim
COPY --from=builder /opt/oracle /opt/oracle
COPY --from=builder /usr/local /usr/local

# Oracle environment
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_21_13
ENV ORACLE_HOME=/opt/oracle/instantclient_21_13
ENV TNS_ADMIN=/app/oracle-wallet
```

### Docker Compose Configuration
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./oracle-wallet:/app/oracle-wallet:ro
      - ./db:/data/db:ro
    environment:
      - DATABASE_URL=oracle+oracledb://...
      - OCI_REGION=eu-frankfurt-1
      # ... other vars
    networks:
      - megilance

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
    networks:
      - megilance
```

## Database Migrations

### Initialize Database
```powershell
# Run migrations inside backend container
docker exec megilance-backend-1 alembic upgrade head
```

### Create New Migration
```powershell
docker exec megilance-backend-1 alembic revision --autogenerate -m "description"
```

### Rollback Migration
```powershell
docker exec megilance-backend-1 alembic downgrade -1
```

## Monitoring & Troubleshooting

### Check Container Status
```powershell
docker-compose -f docker-compose.oracle.yml ps
```

### View Logs
```powershell
# All logs
docker-compose -f docker-compose.oracle.yml logs -f

# Backend only
docker-compose -f docker-compose.oracle.yml logs backend -f

# Frontend only
docker-compose -f docker-compose.oracle.yml logs frontend -f
```

### Test Database Connection
```powershell
# Inside backend container
docker exec -it megilance-backend-1 python -c "
from sqlalchemy import create_engine
from app.core.config import get_settings
settings = get_settings()
engine = create_engine(settings.database_url)
with engine.connect() as conn:
    result = conn.execute('SELECT 1 FROM DUAL')
    print('✅ Database connection successful!')
"
```

### Health Checks
```powershell
# Backend health
curl http://localhost:8000/api/health/live

# Frontend (check if serving)
curl http://localhost:3000
```

## API Endpoints

### Health & Diagnostics
- `GET /api/health/live` - Liveness probe
- `GET /api/health/ready` - Readiness probe
- `GET /api/health` - Detailed health status

### Documentation
- `GET /api/docs` - Swagger UI
- `GET /api/redoc` - ReDoc UI
- `GET /api/openapi.json` - OpenAPI schema

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

## Cost Optimization

### Free Tier Resources
- **Autonomous Database**: 1 ECPU, 1TB storage (Always Free)
- **Object Storage**: 10GB (Always Free)
- **Outbound Data**: 10TB/month (Always Free)
- **Compute**: 2 AMD VMs, 4 Arm VMs (Always Free)

### Monitoring Costs
```powershell
# Check OCI costs
oci usage-api usage summarize-by-dimension \
  --tenant-id <tenancy-ocid> \
  --time-usage-started 2025-01-01 \
  --time-usage-ended 2025-01-31 \
  --granularity MONTHLY \
  --query-type COST
```

## Backup & Disaster Recovery

### Automatic Backups
Oracle Autonomous Database provides automatic backups:
- **Retention**: 60 days (configurable)
- **Frequency**: Daily
- **Location**: Object Storage (same region)

### Manual Backup
```powershell
# Export data
oci db autonomous-database create-backup \
  --autonomous-database-id $ADB_OCID \
  --display-name "manual-backup-$(Get-Date -Format 'yyyy-MM-dd')"
```

### Restore from Backup
```powershell
# List available backups
oci db autonomous-database-backup list \
  --autonomous-database-id $ADB_OCID

# Restore
oci db autonomous-database restore \
  --autonomous-database-id $ADB_OCID \
  --timestamp "2025-01-15T00:00:00Z"
```

## Security Best Practices

1. **Rotate Credentials Regularly**
   ```powershell
   oci db autonomous-database update \
     --autonomous-database-id $ADB_OCID \
     --admin-password "NewSecurePassword123!"
   ```

2. **Use Wallet Authentication** (Already configured)
   - Never hardcode credentials
   - Store wallet securely
   - Use wallet_location parameter

3. **Enable HTTPS** (Production)
   - Configure SSL certificates
   - Update CORS origins
   - Use secure cookies

4. **Network Security**
   - Restrict access to specific IPs
   - Use private endpoints for database
   - Enable VCN (Virtual Cloud Network)

## Scaling

### Vertical Scaling (Increase Resources)
```powershell
# Scale ECPU count
oci db autonomous-database update \
  --autonomous-database-id $ADB_OCID \
  --cpu-core-count 2
```

### Horizontal Scaling (Add Replicas)
```yaml
# docker-compose.oracle.yml
services:
  backend:
    deploy:
      replicas: 3  # Run 3 backend instances
```

## Maintenance

### Update Database
```powershell
oci db autonomous-database update \
  --autonomous-database-id $ADB_OCID \
  --db-version "19c"
```

### Clean Up Docker
```powershell
# Remove stopped containers
docker-compose -f docker-compose.oracle.yml down

# Remove images
docker-compose -f docker-compose.oracle.yml down --rmi all

# Remove volumes
docker-compose -f docker-compose.oracle.yml down -v
```

---

**Last Updated**: 2025-11-12
**Environment**: Oracle Cloud Infrastructure (OCI)
**Tier**: Always Free
**Status**: Production Ready
