# MegiLance Documentation Index

This is the single source of truth for project documentation. Use this index to navigate to canonical docs. Files outside `docs/` that overlap are kept for history but now point back here.

---

## Platform Overview

- Project Requirements & Specification (canonical): `../MegiLance-Requirements-and-Specification.md`
- Brand Guidelines (canonical): `../MegiLance-Brand-Playbook.md`
- Architecture Diagrams (canonical): `SystemArchitectureDiagrams.md`
- System Construction Plan (canonical): `SystemConstructionPlan.md`
- Deployment Guide (canonical): `DeploymentGuide.md`
- Hybrid Full-Stack Setup (canonical): `HybridFullStackSetup.md`
- Database Design Specs (canonical): `DatabaseDesignSpecs.md`

Notes:
- Historical files with overlapping content have a deprecation banner linking back to these canonical docs.
- Frontend documentation lives within `frontend/` and is indexed below.

---

## Frontend Docs

- Frontend README: `../frontend/README.md`
- Architecture Overview: `../frontend/ARCHITECTURE_OVERVIEW.md`
- Routes Map: `../frontend/ROUTES_MAP.md`
- Pages Index: `../frontend/PROJECT_PAGES.md`
- Component Library and UI/UX: see `../frontend/docs/` for deep dives:
  - Design System: `../frontend/docs/DESIGN_SYSTEM.md`
  - Component Library: `../frontend/docs/COMPONENT_LIBRARY.md`
  - UI Enhancements and Audits: `../frontend/docs/ComprehensiveAuditReport.md`, `../frontend/docs/UI_Enhancement_Complete_Report.md`
  - Testing Infra: `../frontend/docs/TESTING_INFRASTRUCTURE.md`

---

## Backend and AI

- Backend overview is covered in the System Construction Plan and Deployment Guide.
- AI service details are co-located in `ai/` and referenced by the Construction Plan.

---

## Deprecated or Consolidated Files

These files remain for history/discoverability and now redirect to canonical docs:

- `../DiagramsPreview.md` → `SystemArchitectureDiagrams.md`
- `../MegiLance-Implementation-Plan.md` → `SystemConstructionPlan.md`
- `../MegiLance-Recommended-Stack.md` → `HybridFullStackSetup.md`, `DeploymentGuide.md`

---

## Contributing to Docs

- Add new documentation under `docs/` and link it here.
- If an external or root-level doc overlaps, add a short banner at the top pointing to the canonical file in `docs/`.
