# MegiLance 2.0 Third-Party Free-Tier Integration Guide

This guide details all external service configurations required for running MegiLance in production using **strictly generous free tiers**.

---

## 1. Google OAuth 2.0 ("Continue with Google")

Google OAuth provides seamless 1-click registration and login for Clients, Freelancers, and Admins.

### Setup Steps:
1. Navigate to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Create a new project named **`MegiLance`**.
3. Under **APIs & Services** $\rightarrow$ **OAuth consent screen**:
   - **User Type**: External
   - **App name**: `MegiLance`
   - **User support email**: `your-megilance-email@gmail.com`
   - **Developer contact information**: `your-megilance-email@gmail.com`
   - **Scopes**: Add `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
4. Under **APIs & Services** $\rightarrow$ **Credentials** $\rightarrow$ **Create Credentials** $\rightarrow$ **OAuth Client ID**:
   - **Application type**: Web application
   - **Name**: `MegiLance Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://your-domain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/callback`
     - `https://your-domain.com/callback`
     - `http://localhost:8000/api/v1/auth/social/google/callback`
     - `https://api.your-domain.com/api/v1/auth/social/google/callback`
5. Copy the generated **Client ID** and **Client Secret**.

### Environment Variables:
```env
# Backend .env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret

# Frontend .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## 2. Cloudflare DNS, SSL & CDN (Free Tier)

Cloudflare provides free DNS management, DDoS mitigation, Full SSL/TLS certificates, HTTP/3, and edge caching.

### Setup Steps:
1. Create a free account at **[Cloudflare.com](https://dash.cloudflare.com/)**.
2. Click **Add a Site** $\rightarrow$ Enter your domain (e.g., `megilance.com`).
3. Select the **Free Plan** ($0/month).
4. Update your domain's nameservers at your registrar (e.g. Namecheap, GoDaddy) to the two Cloudflare nameservers provided.
5. In the **DNS** settings tab, add the following records (with Proxy status enabled 🟧):
   | Type | Name | Target | Proxy Status |
   | :--- | :--- | :--- | :--- |
   | `A` | `@` | DigitalOcean App IP / Vercel CNAME | Proxied |
   | `CNAME` | `www` | `@` | Proxied |
   | `CNAME` | `api` | DigitalOcean backend URL | Proxied |
6. In **SSL/TLS**:
   - Set encryption mode to **Full (strict)**.
   - Enable **Always Use HTTPS**.
   - Enable **Automatic HTTPS Rewrites**.
7. In **Network**:
   - Enable **WebSockets** (Critical for Socket.io real-time chat & notifications).
   - Enable **gRPC** and **HTTP/3 (with QUIC)**.

---

## 3. Transactional Email Setup (Brevo / Resend Free Tier)

MegiLance sends automated notifications, passwordless logins, milestone approval alerts, and invoices via SMTP.

### Option A: Brevo (Recommended - 300 emails/day FREE forever)
1. Sign up at **[Brevo.com](https://www.brevo.com/)**.
2. Go to **Transactional** $\rightarrow$ **SMTP & API** $\rightarrow$ **Generate a new SMTP key**.
3. Under **Senders & IP**, add and verify your sender domain/email with DNS TXT (SPF & DKIM) records in Cloudflare.

```env
# Backend .env
SMTP_SERVER=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-login-email@domain.com
SMTP_PASSWORD=your-generated-brevo-smtp-key
EMAILS_FROM_EMAIL=notifications@your-domain.com
EMAILS_FROM_NAME="MegiLance Platform"
```

### Option B: Resend (100 emails/day / 3,000/month FREE)
```env
SMTP_SERVER=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASSWORD=re_your_api_key
EMAILS_FROM_EMAIL=onboarding@resend.dev
```

---

## 4. Turso Database (LibSQL Remote Cloud - Free Tier)

Turso provides distributed SQLite in the cloud with 9 GB storage and 1 Billion row reads/month free.

### Setup Steps:
1. Install Turso CLI or log in at **[Turso.io](https://app.turso.io/)**.
2. Create database: `turso db create megilance-db`
3. Generate token: `turso db tokens create megilance-db`
4. Copy the `libsql://` database URL and authentication token.

```env
# Backend .env
TURSO_DATABASE_URL=libsql://megilance-db-yourorg.turso.io
TURSO_AUTH_TOKEN=your-jwt-auth-token-from-turso
```

---

## 5. Web3 & MetaMask Crypto Payments (EVM Multi-Chain)

MegiLance supports native tokens (ETH, BNB, POL) and stablecoins (USDC, USDT) across multiple EVM chains with on-chain JSON-RPC verification.

### Supported Networks & Built-in Free Public RPCs:
| Chain | Network Name | Currency Symbol | Free Public RPC URL |
| :--- | :--- | :--- | :--- |
| **11155111** | Sepolia Testnet | ETH | `https://ethereum-sepolia-rpc.publicnode.com` |
| **80002** | Polygon Amoy Testnet | POL | `https://rpc-amoy.polygon.technology` |
| **8453** | Base Mainnet | ETH | `https://mainnet.base.org` |
| **56** | BNB Smart Chain | BNB | `https://bsc-dataseed.binance.org` |
| **137** | Polygon Mainnet | POL | `https://polygon-rpc.com` |

### Configuration:
```env
# Backend .env
# Set your platform receiving EVM wallet address:
CRYPTO_WALLET_ADDRESS=0x71C...YourPlatformEvmAddress
CRYPTO_NETWORK=SEPOLIA # or BASE, BSC, POLYGON
```

---

## 6. End-to-End Persona Workflow Summary

### A. Client Workflow (e.g. Aesthetic Clinic Owner):
1. Register/Login via Google or Email.
2. Post Project: "Aesthetic Clinic Web & Booking Platform" ($1,200 budget).
3. Review proposals submitted by freelancers.
4. Accept proposal $\rightarrow$ System automatically provisions **Part 1 (50% Advance)** and **Part 2 (50% Final)** milestones.
5. Deposit escrow via Wallet / Card / MetaMask.
6. Release **Part 1 Advance** to initiate project kickoff.
7. Freelancer submits final deliverables for **Part 2**.
8. Client reviews deliverables $\rightarrow$ Clicks **Approve & Release** $\rightarrow$ Contract completed.
9. Client leaves 5-star review.

### B. Freelancer Workflow (e.g. Umair):
1. Register/Login with freelancer profile.
2. Search and discover open projects.
3. Submit competitive proposal.
4. Receive contract acceptance and notification of Advance Deposit release.
5. Complete milestone deliverables and upload via Workspace/Deliverables portal.
6. Receive final milestone release directly into wallet balance.
7. Withdraw balance via crypto/bank or view transparent invoice history.
