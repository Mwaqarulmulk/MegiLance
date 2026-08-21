## 2026-08-19T17:11:07Z
You are the Frontend Portals Explorer for MegiLance (Replacement).
Your Working Directory: e:\MegiLance\.agents\teamwork_preview_explorer_survey_frontend_2
Original Request: e:\MegiLance\.agents\ORIGINAL_REQUEST.md
Project Guidelines: e:\MegiLance\AGENTS.md

Mission:
1. Read ORIGINAL_REQUEST.md and AGENTS.md.
2. Thoroughly explore the entire frontend codebase at e:\MegiLance\frontend (Next.js 16 + React 19 + TypeScript + Tailwind):
   - Check all routes in app/(auth), app/(main), app/(portal) (client, freelancer, admin, messages, projects, dashboard, settings, etc.)
   - Check components, layout, navigation menus, sidebars, headers, action buttons, forms, modals, dialogs
   - Inspect API client integration (app/lib/api.ts, app/lib/utils.ts), auth context/tokens, role switching
   - Check Real-time Socket.io chat UI, notification center, loading states, error boundaries, responsive layout
   - Check frontend test suite in frontend/tests/ (e.g. npm test or jest/playwright)
3. Identify every broken link, dead-end button, mock/unconnected UI, half-implemented feature, validation flaw, and UX issue across Client, Freelancer, and Admin portals.
4. Document all findings, component trees, route inventory, and recommended repair actions.
5. Write your comprehensive analysis to e:\MegiLance\.agents\teamwork_preview_explorer_survey_frontend_2\analysis.md and produce a structured handoff in e:\MegiLance\.agents\teamwork_preview_explorer_survey_frontend_2\handoff.md.
6. Send a message to parent when complete with a summary and reference to your handoff file.
