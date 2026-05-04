# MegiLance Production Launch Checklist

> Last updated: February 2026

## Pre-Launch Critical Requirements

### Security
- [x] Backend general exception handler hides internal errors in production
- [x] Health endpoint hides DB error details in production
- [x] Blog POST/PUT/DELETE endpoints require admin authentication
- [x] Auth cookie includes Secure flag on HTTPS
- [x] Rate limiting on auth endpoints (10/min login, 5/min signup)
- [x] CORS wildcard blocked in production
- [x] Secret key validation in production
- [x] Security headers (X-Frame-Options, CSP, HSTS, etc.)
- [x] Token auto-refresh on 401 with race condition handling
- [ ] Set up Redis for token blacklist (currently in-memory)
- [ ] Move refresh tokens from localStorage to httpOnly cookies
- [ ] Configure Sentry or error monitoring service
- [ ] Set strong SECRET_KEY in production environment
- [ ] Remove `*` from CORS origins in production

### SEO
- [x] All public pages have proper metadata (title, description, canonical)
- [x] OpenGraph images exist (og-image.png, og/default.png)
- [x] Twitter card images exist
- [x] JSON-LD structured data on homepage
- [x] robots.ts configured
- [x] sitemap.ts with 60+ URLs including programmatic SEO pages
- [x] Canonical URLs on all pages
- [x] Features page uses server-side redirect (not client-side)
- [x] Careers page has full SEO metadata
- [ ] Generate actual PNG files for OG images (current placeholders are SVGs)
- [ ] Set up Google Search Console and verify site
- [ ] Submit sitemap to Google/Bing
- [ ] Configure Google Analytics measurement ID

### PWA
- [x] manifest.json properly configured
- [x] Icon purpose split into "any" and "maskable"
- [x] Removed broken shortcut icon and screenshot references
- [x] PWA enabled in production (was incorrectly disabled)
- [ ] Add actual PWA screenshots if desired

### Frontend
- [x] Error boundaries on all route groups (auth, portal, main, global)
- [x] Loading states configured
- [x] ClientRoot.tsx syntax error fixed
- [x] Footer has legal links (Privacy, Terms, Cookies)
- [x] Social media links point to real URLs
- [x] Production-ready branding (removed FYP references)
- [x] API client has auto-refresh on 401
- [x] Rate limit (429) handling in API client
- [x] Error reporting utility created
- [x] Request timeout (30s) configured
- [ ] Add newsletter signup to footer
- [ ] Test all pages in both light and dark themes
- [ ] Performance audit with Lighthouse
- [ ] Check all page load times < 3 seconds

### Backend
- [x] Proper error handling on all endpoints
- [x] Rate limiting configured
- [x] JWT auth with proper expiry
- [x] CORS properly configured
- [x] Request ID middleware for tracing
- [x] JSON structured logging
- [x] Health check endpoints (live + ready)
- [ ] Set up proper SMTP for email delivery
- [ ] Configure Stripe keys for payments
- [ ] Set up background task queue (Celery/RQ)
- [ ] Database migrations up to date
- [ ] Load testing

### Infrastructure
- [ ] SSL/TLS certificate configured
- [ ] Domain DNS configured
- [ ] Docker containers optimized for production
- [ ] Environment variables set in deployment platform
- [ ] Database backup strategy
- [ ] Monitoring and alerting
- [ ] CDN for static assets
- [ ] Log aggregation service

### Business
- [ ] Privacy Policy reviewed by legal
- [ ] Terms of Service reviewed by legal
- [ ] Cookie consent banner implemented
- [ ] Payment processing compliance (PCI DSS if applicable)
- [ ] Support email configured (support@megilance.com)
- [ ] Social media accounts created

## Environment Variables Required

### Backend (.env)
```
ENVIRONMENT=production
SECRET_KEY=<strong-random-64-char-string>
TURSO_DATABASE_URL=<your-turso-url>
TURSO_AUTH_TOKEN=<your-turso-token>
BACKEND_CORS_ORIGINS=["https://megilance.com","https://www.megilance.com"]
```

### Frontend (.env.local)
```
NEXT_PUBLIC_APP_URL=https://megilance.com
NEXT_PUBLIC_BACKEND_URL=https://api.megilance.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```
