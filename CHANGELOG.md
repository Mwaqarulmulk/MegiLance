# Changelog

All notable changes to MegiLance will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Security
- Hardened `list_users` endpoint with authentication requirement
- Moved `change_password` from query params to request body
- Added strong `SECRET_KEY` validation on startup
- Fixed payment ownership verification
- Added `Field(gt=0)` validation on payment amounts
- Capped `_user_cache` at 1000 entries to prevent memory exhaustion
- Added content moderation on projects, proposals, and messages
- Added IP-address logging in request middleware
- Added ToS acceptance tracking for user registration

### Added
- Global 500 error page (`error.tsx`) with retry and go-home actions
- Dependabot configuration for automated dependency updates (npm, pip, docker)
- Frontend `.env.example` for environment variable documentation
- TTL-based query cache in Turso HTTP client (30s, 500 max entries)
- 12 database indexes on startup for common query patterns
- Freelancer `availability_status` field (available/busy/away) exposed in API
- EarningsChart wired into freelancer dashboard with real API data
- Unread message count fetched from API on client dashboard (was hardcoded to 0)

### Fixed
- Currency consistency: all payment defaults changed from USDC to USD
- Fixed `milestones.py` import error (`settings` → `get_settings()`)
- Fixed 11 instances of dict subscript access on UserProxy in compliance.py
- Added `__getitem__` to UserProxy for backward compatibility with dict access
- Fixed idempotency cache eviction to run whenever cache has entries
- Normalized role/user_type to lowercase in UserProxy
- Build output files added to `.gitignore`

### Changed
- Admin role checks simplified across feature_flags, fraud_detection, payments, projects
- Proposal auto-calculates `bid_amount` from `hourly_rate` when missing
- Dynamic WebSocket URL derived from window.location
- Token refresh interval set to 25 minutes

## [0.1.0] - 2025-01-01

### Added
- Initial release with core freelancing platform features
- Client and freelancer dashboards
- Project posting and proposal system
- Contract and milestone management
- JWT authentication with refresh tokens
- Turso (libSQL) database integration
- AI-powered matching and recommendations
- Real-time messaging via WebSocket
- Payment tracking (Stripe + crypto stubs)
- Admin analytics dashboard
- Dark/light theme support
- PWA configuration
