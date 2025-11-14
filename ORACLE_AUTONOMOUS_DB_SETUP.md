# Oracle Autonomous Database Setup for MegiLance

## Current Status
- Backend is configured to use Oracle Autonomous Database
- Oracle Instant Client is already installed in Docker image (`/opt/oracle/instantclient_21_13`)
- OCI SDK is installed (`oci==2.163.1`)

## Steps to Configure

### 1. Create Oracle Autonomous Database

Go to Oracle Cloud Console:
```
https://cloud.oracle.com/
→ Databases → Autonomous Database → Create Autonomous Database
```

Settings:
- **Workload Type**: Transaction Processing (ATP)
- **Deployment Type**: Shared Infrastructure
- **Database Name**: `megilance_db`
- **Admin Password**: Create a secure password (save it!)
- **Network Access**: Secure access from everywhere (or specific IPs)
- **License Type**: License Included

### 2. Download Wallet

After database is created:
```
Database Details → DB Connection → Download Wallet
→ Create password for wallet
→ Download ZIP file
```

The wallet contains:
- `tnsnames.ora` - Connection strings
- `sqlnet.ora` - SQL*Net configuration
- `cwallet.sso` - Auto-login wallet
- Certificate files

### 3. Get Connection String

Open `tnsnames.ora` from the wallet and find your service name:
```
megilance_db_high = (description= (retry_count=20)(retry_delay=3)
  (address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))
  (connect_data=(service_name=xxx_megilance_db_high.adb.oraclecloud.com))
  (security=(ssl_server_dn_match=yes)))
```

### 4. Update Digital Ocean Backend Environment Variables

Update the `backend-spec.yaml` with your actual Oracle connection details:

```yaml
- key: DATABASE_URL
  scope: RUN_TIME
  value: 'oracle+oracledb://admin:YOUR_PASSWORD@(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=YOUR_HOST.oraclecloud.com))(connect_data=(service_name=YOUR_SERVICE_NAME))(security=(ssl_server_dn_match=yes)))'
```

Replace:
- `YOUR_PASSWORD` - The admin password you created
- `YOUR_HOST.oraclecloud.com` - From tnsnames.ora
- `YOUR_SERVICE_NAME` - From tnsnames.ora (e.g., `xxx_megilance_db_high.adb.oraclecloud.com`)

### 5. Upload Wallet to Digital Ocean (Optional)

If using mTLS (mutual TLS), you need to upload wallet files.

**Option A: Use Auto-Login Wallet (Recommended)**
The current setup uses auto-login wallet which doesn't require separate certificates.

**Option B: Upload Wallet Files**
If you need the full wallet:
1. Extract wallet ZIP
2. Create a secret in Digital Ocean:
   ```bash
   # Base64 encode the wallet files
   cat cwallet.sso | base64 > cwallet.base64
   ```
3. Add to backend spec as environment variables or mount as files

### 6. Apply Updated Configuration

```powershell
# Update backend with Oracle configuration
doctl apps update ce7acc8e-3398-42d0-95bb-8e44a7c8ad48 --spec backend-spec.yaml
```

### 7. Initialize Database Schema

After deployment succeeds, the backend will automatically:
- Create all tables using SQLAlchemy models
- Initialize with `init_db()` function
- Ready to accept requests

## Connection String Format

For Oracle Autonomous Database, use this format:

```python
# With Easy Connect Plus
DATABASE_URL = "oracle+oracledb://admin:password@host:1522/service_name?wallet_location=/app/oracle-wallet"

# With Full Connection Descriptor (Current)
DATABASE_URL = "oracle+oracledb://admin:password@(description=(retry_count=20)...)"
```

## Environment Variables Needed

```yaml
DATABASE_URL: Oracle connection string
DB_TYPE: oracle
ORACLE_CLIENT_DIR: /opt/oracle/instantclient_21_13
TNS_ADMIN: /app/oracle-wallet (if using wallet files)
```

## Testing Connection Locally

```powershell
# Test backend with Oracle DB
docker run -it --rm `
  -e DATABASE_URL="oracle+oracledb://admin:password@..." `
  -e SECRET_KEY="test-key-min-32-chars-long" `
  -p 8000:8000 `
  megilance-backend-test:latest
```

## Quick Setup (Without Wallet Files)

If using password authentication only:

1. Create Autonomous Database
2. Set network access to "Secure access from everywhere"
3. Get connection string from `tnsnames.ora`
4. Update `DATABASE_URL` in `backend-spec.yaml`
5. Apply spec: `doctl apps update ce7acc8e-3398-42d0-95bb-8e44a7c8ad48 --spec backend-spec.yaml`

## Current Backend Spec Location

File: `E:\MegiLance\backend-spec.yaml`

Update the `DATABASE_URL` value with your actual Oracle Autonomous Database connection details, then run:

```powershell
doctl apps update ce7acc8e-3398-42d0-95bb-8e44a7c8ad48 --spec backend-spec.yaml
```

## Troubleshooting

### Health Check Failures
- Increased to 180s initial delay and 15 failure threshold
- Backend needs time to connect to Oracle and initialize

### Connection Issues
- Verify host, port, service name from tnsnames.ora
- Ensure admin password is correct
- Check network access settings in Oracle Cloud

### Wallet Issues
- For auto-login wallet, no TNS_ADMIN needed
- For file-based wallet, ensure files are accessible in container

## Next Steps

1. Create your Oracle Autonomous Database in Oracle Cloud
2. Download the wallet
3. Get your connection string from `tnsnames.ora`
4. Update `backend-spec.yaml` with your actual connection details
5. Apply the updated spec
6. Backend will auto-deploy and connect to Oracle DB
