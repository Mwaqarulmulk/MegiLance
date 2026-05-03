# Changelog & Versioning Policy

## 1. Semantic Versioning
Format: MAJOR.MINOR.PATCH
| Increment | When |
|-----------|------|
| MAJOR | Backward-incompatible API change |
| MINOR | Backward-compatible feature addition |
| PATCH | Backward-compatible bug/security fix |

## 2. Changelog Structure
```
## [Unreleased]
### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security

## [1.0.0] - 2025-01-01
- Initial stable baseline
```
Follow Keep a Changelog principles.

## 3. Release Process
| Step | Action |
|------|--------|
| 1 | Ensure all merged PRs labeled appropriately |
| 2 | Draft Unreleased section into new version block |
| 3 | Run tests & security scans |
| 4 | Update version constant/file (future) |
| 5 | Tag `vX.Y.Z` in git |
| 6 | Push tag & update release notes |

## 4. Dependency Updates
| Policy | Detail |
|--------|-------|
| Security patches | Patch version bump immediately |
| Feature upgrade | MINOR bump if external contract extended |
| Deprecation removal | MAJOR bump |

## 5. Backporting
Apply critical security fixes to last stable minor if >1 minor ahead.

## 6. Automation (Future)
| Tool | Purpose |
|------|--------|
| Conventional commits parser | Generate changelog skeleton |
| Release script | Enforce checklist |

## 7. Tags & Branches
| Branch | Purpose |
|--------|--------|
| main | Current development + latest release |
| release/* (future) | Stabilization window |

## 8. Deprecation Policy
| Stage | Action |
|-------|-------|
| Introduce | Mark as Deprecated in docs |
| Support window | Provide alternative at introduction |
| Removal | Announce version where removed |

---
Maintain accuracy; every release updates this document.
