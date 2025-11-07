# MegiLance AI Agent Instructions

## Architecture Overview
```
Next.js Frontend → FastAPI Backend → PostgreSQL
```
**Stack**: Next.js 14 + TypeScript + CSS Modules | FastAPI + SQLAlchemy + PostgreSQL

## Frontend Rules (Next.js 14)

### CSS Architecture (CRITICAL)
**Every component needs 3 CSS files:**
```
Component.common.module.css  → layout, structure, motion
Component.light.module.css   → light theme colors
Component.dark.module.css    → dark theme colors
```

**Theme integration pattern:**
```tsx
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './Component.common.module.css';
import lightStyles from './Component.light.module.css';
import darkStyles from './Component.dark.module.css';

const { resolvedTheme } = useTheme();
const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;
return <div className={cn(commonStyles.container, themeStyles.container)} />;
```

### Component Conventions
- **@AI-HINT comment required** at top of every file explaining purpose
- **TypeScript mandatory** with full type safety
- **Button variants**: primary, secondary, danger, outline, ghost, social, success, warning
- **Button sizes**: sm, md, lg, icon
- **No global CSS** - all styling scoped to components
- **Accessibility**: Include ARIA labels on interactive elements

### Route Structure
```
app/
  (auth)/      → login, signup (public)
  (main)/      → marketing pages (public)
  (portal)/    → dashboards (protected)
```

### Design Tokens
- Primary: `#4573df` | Success: `#27AE60` | Error: `#e81123` | Warning: `#F2C94C` | Accent: `#ff9800`
- Fonts: Poppins (headings), Inter (body), JetBrains Mono (code)

## Backend Rules (FastAPI)

### Project Structure
```
backend/app/
  core/      → config, security, AWS utils
  models/    → SQLAlchemy models
  schemas/   → Pydantic request/response
  api/v1/    → endpoint handlers
  services/  → business logic
```

### API Conventions
- **Authentication**: JWT tokens (30min access, 7 days refresh)
- **Roles**: Client/Freelancer enforced at endpoint level
- **Status codes**: 201 (created), 204 (no content), 400 (bad request), 403 (forbidden), 404 (not found)
- **All inputs** validated via Pydantic schemas
- **All endpoints** have comprehensive docstrings
- Use `Depends()` for DB sessions and auth

### Key Endpoints
- Health: `/api/health/live`, `/api/health/ready`
- Docs: `/api/docs` (Swagger), `/api/redoc`
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`

### Database
- **Models**: User, Project, Proposal, Contract, Payment, Portfolio, Message, Review, Skill
- **Dev**: `init_db()` creates tables on startup
- **Prod**: Use Alembic migrations

## Local Development

**Start all services:**
```powershell
docker compose up -d db backend frontend
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/api/docs
- Database: PostgreSQL on port 5432

**Frontend API calls** (backend proxied at `/backend/*`):
```ts
const res = await fetch('/backend/api/health/live');
```

**Rebuild after dependency changes:**
```powershell
docker compose build backend frontend
```

## Testing
```powershell
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm test
```

## Common Pitfalls
❌ **DON'T**:
- Use global CSS or Tailwind utilities for component styles
- Hardcode AWS credentials
- Forget light/dark theme handling
- Skip `@AI-HINT` comments
- Break Button variant/size contracts

✅ **DO**:
- Use 3-file CSS Module pattern
- Validate all API inputs with Pydantic
- Use `cn()` utility for class merging
- Check health endpoints after backend changes
- Test both auth states for new features

## Quick Commands

```powershell
# Local dev
docker compose up -d                    # Start
docker compose logs -f backend          # Logs
docker compose down                     # Stop

# Backend
cd backend
uvicorn main:app --reload              # Dev server
pytest tests/ -v                       # Tests

# Frontend
cd frontend
npm run dev                            # Dev server
npm run build                          # Production build
npm test                               # Tests

# Database migrations
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Key Files
- `frontend/README.md` - Frontend architecture details
- `backend/README.md` - Backend API documentation
- `MegiLance-Brand-Playbook.md` - Design system
- `docs/SystemArchitectureDiagrams.md` - System architecture
