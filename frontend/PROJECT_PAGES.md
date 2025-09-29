# MegiLance Project Pages & Status

Note: This is the canonical source for page inventory and status. For exact path-to-component mapping, see `ROUTES_MAP.md`.

Last Updated: 2025-08-10

---

## Overview

This document tracks all public and portal routes, design standards, and implementation status. Frontend is the current priority and must reach investor-grade quality before any backend work.

## Design & Implementation Standards

- Brand: Blue #4573df, Orange #ff9800, Success #27AE60, Error #e81123, Warning #F2C94C
- Fonts: Poppins (headings), Inter (body), JetBrains Mono (code)
- Theming: per-component CSS (.common.module.css, .light.module.css, .dark.module.css); no global CSS except tokens
- Accessibility: keyboard-first, ria-* where needed, focus-visible, headings hierarchy, AA contrast
- UX: tooltips, transitions, micro-interactions, responsive at 360/768/1024/1280/1536
- PWA: env-toggled via NEXT_ENABLE_PWA; builds verified green

## Current Status Summary

- Admin portal: users, projects, payments, support, settings polished; minor ARIA-sort cleanup pending in dmin/users
- Client portal: projects, freelancers, payments, reviews, wallet upgraded with sorting/pagination/CSV and theme-aware UI
- Client hire flow: progress bar, inline help, counters, Save Draft/Reset (localStorage)
- Client settings: help, counters, live status, Save Draft/Discard (localStorage)
- Builds: normal and PWA-enabled builds pass; lint is clean

## Routes Matrix (High-Level)

- Public (simple layout): /, /about, /blog, /blog/[slug], /pricing, /contact, /faq, /clients, /freelancers, /legal/privacy, /legal/terms, /security, /support, /teams, /testimonials, plus recommended: /careers, /press, /brand, /status, /changelog, /partners, /integrations, /accessibility, /responsible-disclosure, /cookies
- Auth (entry): /login, /signup, /forgot-password, /reset-password
- Shared (portal): /dashboard, /dashboard/analytics, /dashboard/community, /dashboard/projects, /dashboard/wallet, /audit-logs, /messages, /notifications, /search, /help
- Admin: /admin/dashboard, /admin/users, /admin/projects, /admin/payments, /admin/support, /admin/ai-monitoring, /admin/settings
- Client: /client/dashboard, /client/post-job, /client/projects, /client/projects/[id], /client/freelancers, /client/hire, /client/reviews, /client/payments, /client/settings, /client/wallet
- Freelancer: /freelancer/dashboard, /freelancer/profile, /freelancer/my-jobs, /freelancer/proposals, /freelancer/contracts, /freelancer/wallet, /freelancer/analytics, /freelancer/settings

## Navigation Access Map (Source of Access)

- **Public Navbar**: `/`, `/how-it-works`, `/pricing`, `/about`, `/blog`, `/contact`, `/faq`
- **Footer • Company**: `/about`, `/how-it-works`, `/careers`, `/blog`, `/press`, `/testimonials`, `/teams`, `/referral`, `/analytics`, `/user-management`, `/auth-dashboard`
- **Footer • Services**: `/freelancers`, `/clients`, `/ai/chatbot`, `/ai/fraud-check`, `/ai/price-estimator`, `/pricing`, `/enterprise`
- **Footer • Support**: `/help`, `/contact`, `/faq`, `/community`, `/status`, `/forgot-password`, `/reset-password`, `/support`, `/install`, `/onboarding`, `/search`, `/wallet`
- **Footer • Legal**: `/privacy`, `/terms`, `/cookies`, `/security`, `/status`

- **Dashboard Navbar**: `/dashboard`, `/Projects`, `/messages`, `/Payments`, `/Settings`
- **Sidebar (Dashboard)**: `/dashboard`, `/dashboard/projects`, `/dashboard/wallet`, `/dashboard/analytics`, `/dashboard/community`, `/messages`

- **Freelancer Navbar**: `/freelancer/dashboard`, `/freelancer/my-jobs`, `/freelancer/projects`, `/freelancer/portfolio`, `/freelancer/analytics`, `/freelancer/wallet`, `/freelancer/reviews`, `/freelancer/job-alerts`, `/freelancer/contracts`, `/freelancer/rank`, `/freelancer/support`, `/freelancer/settings`
- **Freelancer Quick Access**: `/jobs`, `/freelancer/my-jobs`, `/freelancer/wallet`, `/messages`

- **Client Navbar**: `/client/dashboard`, `/client/post-job`, `/client/hire`, `/client/projects`, `/client/reviews`, `/client/wallet`, `/client/settings`
- **Admin Navbar**: `/admin/dashboard`, `/admin/users`, `/admin/projects`, `/admin/payments`, `/admin/ai-monitoring`, `/admin/support`, `/audit-logs`, `/admin/settings`

- **Profile Menu**: `/Profile`, `/Settings`, Logout → `/`

### Dynamic/Deep Links
- `/client/projects/[id]` and `/freelancer/projects/[id]` are reachable from their Projects list pages.

## Navigation Verification

- **Config**: See `app/config/navigation.ts` for centralized items. Links adjusted to match actual routes (case-correct paths like `/Projects`, `/Payments`, `/Profile`, `/Settings`).
- **Build**: Production build passes with all routes listed (no 404s introduced). See `frontend/temp.md` for the generated route table.
- **Lint**: Clean. Note: known ARIA-sort cleanups pending in `app/(portal)/admin/users/AdminUsers.tsx` and `app/freelancer/contracts/page.tsx` (tracked separately).

## Detailed Progress (Portal)

- Admin
  - Users: sorting (pending ARIA-sort attr clean-up), pagination, CSV, theme-aware
  - Projects, Payments, Support: sorting/pagination/CSV; toolbar + pagination bar
  - Settings: polished, theme-aware

- Client
  - Projects, Freelancers, Payments, Reviews, Wallet: sorting/pagination/CSV; toolbar + pagination bar; accessible controls
  - Hire: multi-step with progressbar, ria-describedby help, counters, Save Draft/Reset
  - Settings: help + counters + live region; Save Draft/Discard

- Freelancer (next focus)
  - Dashboard: present
  - Profile/My Jobs/Proposals/Contracts/Wallet/Analytics/Settings: polish pass to reach parity (sorting/pagination/CSV where relevant), theme-aware UI, accessibility

## Acceptance Checklist (per page)

- Layout: semantic landmarks, skip link, responsive grid rhythm
- Accessibility: labels, ria-describedby for errors/help, focus management
- Data UX: sorting, pagination, CSV export where lists/tables exist
- Theming: light/dark styles present; no leakage into globals
- Performance: images optimized, transitions GPU-friendly, CLS controlled
- QA: Lighthouse AA, keyboard navigation, screen reader smoke test

## Notes

- PWA manifest and icons verified; enable with NEXT_ENABLE_PWA=1
- AdminUsers ria-sort attributes to be finalized in a quick follow-up fix
- This file was restored after accidental truncation and updated to reflect latest progress
