---
title: Archive & Removed Assets
doc_version: 1.0.0
last_updated: 2025-11-25
status: active
owners: ["ops", "architecture"]
related: ["MAINTENANCE.md", "README.md"]
description: Catalog of removed or relocated artifacts for historical and audit traceability.
---

# Archive & Removed Assets

> @AI-HINT: Maintains traceability for deleted or relocated files; supports audits and recovery.

This document catalogs removed or relocated files for historical traceability and audit.

## Purpose
Maintain a lightweight, production-ready repository while retaining institutional memory of past artifacts.

## Removed Categories (Cleanup 2025-11-25)
- **Logs / Build Artifacts**: backend-build.log, backend.log, backend_output.log, build-backend.log, build-final.log, frontend-build.log
- **Session / Test Reports**: BACKEND_AUTH_DEBUG_SESSION.md, PARALLEL_DEVELOPMENT_SESSION.md, SYSTEM_TESTING_REPORT_2025-11-24.md, COMPREHENSIVE_TESTING_REPORT_2025-11-25.md, TESTING_SESSION_COMPLETE.md
- **Screenshots / Visual Captures**: top-level PNGs (homepage verification, admin dashboard states), `screenshots/` directory
- **Backups**: migration-backup-20251112_* directories
- **Legacy Oracle Artifacts**: Wallet config references, Oracle-specific deployment notes (superseded by Turso)
- **Throwaway Scripts**: quick_test.py, test_fetch.html, test_login.html

## Relocations
- **Maintenance Scripts** → `backend/scripts/maintenance/`
- **Legacy Tests** → `backend/tests/legacy/`
- **Global Documentation** → Consolidated under `docs/`

## Rationale
| Category | Reason | Outcome |
|----------|--------|---------|
| Logs | Ephemeral, reproducible | Deleted |
| Large Reports | Superseded by canonical docs | Deleted |
| Screenshots | Not part of runtime | Deleted |
| Backups | Historical migration snapshots | Deleted |
| Throwaway Scripts | Duplicated by canonical tests | Deleted |
| Utility Scripts | Needed rarely, cluttered root | Moved |
| Legacy Tests | Historical reference only | Moved |

## Recovery Strategy
If a removed artifact is unexpectedly needed:
1. Check Git history (`git log -- ARCHIVE.md` or specific path).
2. Restore via: `git checkout <commit> -- <path>`.
3. Reintroduce only with justification (performance data, compliance need).

## Future Policy
- New transient artifacts (logs, screenshots) must not be committed.
- Historical migrations documented instead of retaining raw backups.
- Legacy vendor-specific artifacts (Oracle wallet, AWS-specific docs) marked deprecated rather than retained.
- Large one-off reports summarized into living docs (Architecture, TestingStrategy).

---
_Last updated: 2025-11-25_