# Frontend Services

> @AI-HINT: Reserved directory for future service layer extraction

## Current State

This directory is intentionally empty. All API call wrappers currently live in
[`lib/api.ts`](../lib/api.ts) as a monolithic API client (~2800 lines, 50+ namespaces).

## Planned Migration

When `api.ts` is split, individual service modules will move here:

```
services/
  auth.service.ts       → authApi namespace
  projects.service.ts   → projectsApi namespace
  contracts.service.ts  → contractsApi namespace
  payments.service.ts   → paymentsApi namespace
  ...
```

Each service will encapsulate API calls for one domain and export typed methods.
