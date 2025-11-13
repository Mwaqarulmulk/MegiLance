# Custom Domain Setup for MegiLance Frontend

## Overview

Connect your custom domain (e.g., `www.megilance.com`) to your DigitalOcean App Platform deployment.

**Time required**: 10-15 minutes (+ DNS propagation time)

---

## Prerequisites

- ✅ DigitalOcean app deployed and running
- ✅ Domain purchased (from Namecheap, GoDaddy, Google Domains, etc.)
- ✅ Access to domain DNS settings

---

## Step 1: Add Domain in DigitalOcean

### Via Console (Recommended):

1. Go to: https://cloud.digitalocean.com/apps
2. Click your app: **megilance-frontend**
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your domain:
   ```
   www.megilance.com
   ```
   Or root domain:
   ```
   megilance.com
   ```
6. Click **Add Domain**

### Via doctl CLI:

```powershell
# Get your app ID
doctl apps list

# Add domain
doctl apps update YOUR_APP_ID --spec digitalocean-app-with-domain.yaml
```

---

## Step 2: Configure DNS Records

DigitalOcean will show you DNS records to add. You need to add these to your domain registrar.

### For Root Domain (megilance.com):

**A Record**:
```
Type: A
Name: @
Value: [IP shown by DigitalOcean]
TTL: 3600
```

**AAAA Record** (IPv6, optional):
```
Type: AAAA
Name: @
Value: [IPv6 shown by DigitalOcean]
TTL: 3600
```

### For Subdomain (www.megilance.com):

**CNAME Record**:
```
Type: CNAME
Name: www
Value: megilance-frontend-xxxxx.ondigitalocean.app.
TTL: 3600
```

**⚠️ Important**: Include the trailing dot (`.`) at the end!

---

## Step 3: Add DNS Records at Your Registrar

### Namecheap:

1. Login to Namecheap
2. **Domain List** → **Manage**
3. **Advanced DNS**
4. Click **Add New Record**
5. Add records from Step 2
6. Click **Save All Changes**

### GoDaddy:

1. Login to GoDaddy
2. **My Products** → **DNS**
3. Click **Add** for each record
4. Enter values from Step 2
5. Click **Save**

### Google Domains:

1. Login to Google Domains
2. Click **Manage** → **DNS**
3. **Custom records** → **Manage custom records**
4. Click **Create new record**
5. Add records from Step 2
6. Click **Save**

### Cloudflare (if using):

1. Login to Cloudflare
2. Select your domain
3. **DNS** → **Records** → **Add record**
4. Add records from Step 2
5. **⚠️ Disable proxy** (orange cloud OFF) for CNAME
6. Click **Save**

---

## Step 4: Wait for DNS Propagation

**Time**: 5 minutes to 48 hours (usually 10-30 minutes)

### Check propagation:

```powershell
# Windows
nslookup www.megilance.com

# Should show DigitalOcean IP or CNAME
```

**Online tools**:
- https://dnschecker.org/
- https://www.whatsmydns.net/

---

## Step 5: Verify SSL Certificate

DigitalOcean automatically provisions SSL certificates via Let's Encrypt.

1. Go to: App → **Settings** → **Domains**
2. Wait for status: **✓ Certificate Active**
3. This takes 5-10 minutes after DNS propagation

---

## Step 6: Update Environment Variables

After domain is active, update these:

### In DigitalOcean:
```
NEXT_PUBLIC_APP_URL=https://www.megilance.com
```

### In Backend (Oracle VM):
```bash
# Edit backend/.env
CORS_ORIGINS=https://www.megilance.com,https://megilance.com

# Restart backend
docker-compose -f docker-compose.oracle.yml restart backend
```

---

## Step 7: Test Your Domain

### 1. Open in browser:
```
https://www.megilance.com
```

### 2. Verify SSL:
- Click padlock icon in browser
- Should show **"Connection is secure"**
- Certificate issued by **Let's Encrypt**

### 3. Test redirects:
```
http://www.megilance.com → https://www.megilance.com ✓
https://megilance.com → https://www.megilance.com (if configured)
```

---

## Advanced: Root Domain + WWW

To use both `megilance.com` and `www.megilance.com`:

### Option 1: WWW as Primary (Recommended)

**DNS**:
```
A @ → DigitalOcean IP
CNAME www → app.ondigitalocean.app.
```

**DigitalOcean**:
- Add both domains
- Set `www.megilance.com` as primary
- `megilance.com` redirects to `www.megilance.com`

### Option 2: Root as Primary

**DNS**:
```
A @ → DigitalOcean IP
```

**DigitalOcean**:
- Add `megilance.com` only
- All traffic goes to root domain

---

## Troubleshooting

### Domain not connecting after 24 hours

**Check DNS**:
```powershell
nslookup www.megilance.com
# Should show: megilance-frontend-xxxxx.ondigitalocean.app
```

**Check CNAME**:
- Make sure trailing dot exists: `app.ondigitalocean.app.`
- TTL not too high (use 3600)
- No conflicts with other records

### SSL certificate pending

**Wait**: Can take up to 30 minutes after DNS propagation

**Check**: App → Settings → Domains → Certificate Status

**Force retry**: Remove and re-add domain

### "This site can't be reached"

**Check**:
1. DNS records added correctly
2. DNS propagated (use dnschecker.org)
3. Domain status is "Active" in DigitalOcean
4. No typos in CNAME target

### CORS errors after domain change

**Fix**:
```bash
# Update backend CORS
# backend/.env
CORS_ORIGINS=https://www.megilance.com,https://megilance.com

# Restart
docker-compose restart backend
```

### Mixed content warnings

**Cause**: HTTP resources loaded on HTTPS page

**Fix**:
- Update all URLs to use `https://`
- Or use protocol-relative URLs: `//example.com`

---

## Custom Domain Checklist

- [ ] Domain purchased and accessible
- [ ] Domain added in DigitalOcean
- [ ] DNS records added at registrar
- [ ] DNS propagated (use dnschecker.org)
- [ ] SSL certificate active (green checkmark)
- [ ] NEXT_PUBLIC_APP_URL updated
- [ ] Backend CORS updated
- [ ] App redeployed with new env vars
- [ ] Site loads on custom domain
- [ ] SSL working (https:// with padlock)
- [ ] API calls working (no CORS errors)
- [ ] Redirects configured (http → https)

---

## Email Setup (Optional)

To use custom domain for email (e.g., `contact@megilance.com`):

### Using Google Workspace:
1. Add domain to Google Workspace
2. Add MX records to DNS:
   ```
   MX @ → ASPMX.L.GOOGLE.COM (Priority 1)
   MX @ → ALT1.ASPMX.L.GOOGLE.COM (Priority 5)
   ...
   ```

### Using Email Forwarding:
Most registrars offer free email forwarding:
- `contact@megilance.com` → your personal email

---

## Cost

**DigitalOcean**:
- Custom domain: **FREE**
- SSL certificate: **FREE** (Let's Encrypt)
- No additional charges

**Domain Registration**:
- Varies by registrar ($10-15/year typical)

---

## Quick Commands

```powershell
# Check DNS
nslookup www.megilance.com

# Check with specific DNS server
nslookup www.megilance.com 8.8.8.8

# Test HTTPS
curl -I https://www.megilance.com

# View certificate
openssl s_client -connect www.megilance.com:443 -servername www.megilance.com

# Check domain in DigitalOcean
doctl apps get YOUR_APP_ID --format Spec.Domains
```

---

## Resources

- [DigitalOcean Custom Domains Guide](https://docs.digitalocean.com/products/app-platform/how-to/manage-domains/)
- [DNS Records Explained](https://www.cloudflare.com/learning/dns/dns-records/)
- [Let's Encrypt SSL](https://letsencrypt.org/)
- [DNS Checker Tool](https://dnschecker.org/)

---

## Need Help?

1. Check DigitalOcean domain status in dashboard
2. Verify DNS records using dnschecker.org
3. Check SSL certificate status (should auto-provision)
4. Contact your domain registrar for DNS help
5. DigitalOcean support: https://cloud.digitalocean.com/support

---

Your custom domain will be live at: **https://www.megilance.com** 🎉
