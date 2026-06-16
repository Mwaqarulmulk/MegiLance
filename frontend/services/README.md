# Services Layer

Domain service modules that encapsulate business logic, data transformation,
and error handling. These sit between hooks/components and the raw API client,
providing:

- **Data normalization** — consistent response shape regardless of API version
- **Fallback handling** — graceful degradation via `fetchWithFallback()`
- **Error extraction** — `errorToString()` for user-friendly messages
- **Response unwrapping** — `unwrapResponse()` handles paginated/array ambiguity

## Structure

| File | Responsibility |
|------|---------------|
| `base.service.ts` | Shared utilities (fetchWithFallback, unwrapResponse, errorToString) |
| `auth.service.ts` | User normalization, redirect logic, token refresh |
| `dashboard.service.ts` | Dashboard data aggregation & transformation |
| `project.service.ts` | Project CRUD with consistent error handling |
| `notification.service.ts` | Notification management |
| `user.service.ts` | Profile read/update/avatar |

## Usage

```ts
import { fetchDashboardData } from '@/services';
// or import specific service for tree-shaking:
import { normalizeUser } from '@/services/auth.service';

const dashboard = await fetchDashboardData(userRole);
```

## Migration

Hooks currently contain business logic that is being migrated here.
New features should use these services rather than calling `api.*` directly.
