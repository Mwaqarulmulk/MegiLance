---
title: Maintenance Guide
doc_version: 1.0.0
last_updated: 2025-11-25
status: active
owners: ["ops", "backend"]
related: ["ARCHIVE.md", "README.md", "ENGINEERING_STANDARDS_2025.md"]
description: Operational tasks, script usage, and routine hygiene procedures for the repository.
---

# Maintenance Guide

> @AI-HINT: Provides standardized procedures for routine cleanup, test execution, build verification, and database maintenance.

This directory contains scripts and tools for maintaining the MegiLance project.

## Directory Structure

- `scripts/`: General utility scripts (e.g., cleanup).
- `scripts/maintenance/`: Database and schema maintenance scripts.
- `tests/scripts/`: Ad-hoc test scripts and legacy test runners.
- `docs/`: All project documentation.

## Common Tasks

### Cleanup Workspace
Remove logs, temporary files, and old reports:
```powershell
pwsh -File scripts/cleanup_workspace.ps1
```

### Run System Tests
Execute the comprehensive system test suite:
```bash
python comprehensive_test.py
```

### Verify Builds
Check frontend and backend builds:
```powershell
.\test-all-builds.ps1
```

### Database Maintenance
Scripts for schema verification are in `scripts/maintenance/`.
Turso migration removed Oracle wallet tasks; legacy scripts deprecated.
Example:
```bash
python scripts/maintenance/verify_schema.py
```
