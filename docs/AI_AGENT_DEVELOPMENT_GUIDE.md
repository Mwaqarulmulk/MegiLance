# MegiLance AI Agent Architectural & Development Guide

This guide establishes software engineering conventions, architecture standards, and design patterns to ensure future **AI Coding Agents** and human developers can extend the MegiLance platform safely, modularly, and efficiently.

---

## 🎯 Core Architectural Principles

### 1. Self-Documenting Header Annotations
Every file created or modified by AI agents must begin with an `@AI-HINT` comment:
```tsx
// @AI-HINT: Brief summary of the file's responsibility, key data contracts, and exports.
```
This enables agents to grasp context instantly without parsing entire source trees.

### 2. Centralized Type Definitions (`@/app/types/`)
- Never inline complex domain interfaces across component files.
- Export and maintain domain entities in `@/app/types/portal.ts` (e.g. `Talent`, `Milestone`, `ProposalItem`, `ProjectData`, `EscrowLedger`).
- Import domain interfaces cleanly into components:
  ```tsx
  import { Talent, Milestone, ProposalItem } from "@/app/types/portal";
  ```

### 3. Component Hierarchy & Atomic Design
Organize React 19 components using strict Atomic Design layers in `frontend/app/components/`:
- **`atoms/`**: Low-level UI primitives (`Button`, `Badge`, `Loading`, `Input`, `ProgressRing`).
- **`molecules/`**: Composition of atoms (`StatCard`, `EmptyState`, `ErrorBanner`, `ActivityTimeline`, `Pagination`).
- **`organisms/`**: Domain feature modules (`Micro1TalentHub`, `MilestoneEscrowManager`, `ProposalComparisonMatrix`, `ProposalSubmissionModal`, `Workroom`, `Sidebar`).
- **`templates/`**: Page layout shells (`PortalNavbar`, `PublicFooter`, `AppLayout`).

### 4. Enterprise CSS Module & Theme Strategy
- Combine Tailwind utility classes with 3-file CSS Modules for theme safety:
  - `ComponentName.common.module.css` (structural layout, flex/grid rules, spacing).
  - `ComponentName.light.module.css` (light palette, background fills, border colors).
  - `ComponentName.dark.module.css` (dark glassmorphic backdrops, glowing borders).
- Merge classes using the `cn()` utility:
  ```tsx
  <div className={cn(commonStyles.card, themeStyles.card, "hover:scale-[1.01]")}>
  ```

### 5. Backend API Integration Pattern
- API requests must route through `apiFetch` (`@/lib/api/core`) or the centralized `api` client (`@/lib/api`).
- FastAPI backend routers are defined in `backend/app/api/v1/` and registered centrally in `backend/app/api/routers.py`.

---

## 🧪 Verification Protocol for AI Agents

Before declaring any feature complete, AI agents must run:
1. **Frontend Production Build**:
   ```bash
   cd frontend && npm run build
   ```
2. **Backend Syntax & Import Check**:
   ```bash
   cd backend && python -m py_compile main.py app/api/routers.py
   ```
