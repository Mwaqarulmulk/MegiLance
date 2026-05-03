# Dev Quick Login Feature

## Overview
Development-only quick login feature for MegiLance that appears on the login page in development mode. Provides instant access to test accounts with real credentials from the database.

## Features

### 1. **Role-Based Quick Access**
- Three role buttons: Admin, Freelancer, Client
- Each button shows:
  - Role icon
  - Role label
  - Associated email address

### 2. **Two Operating Modes**

#### Auto-Fill Mode (Default)
- Click a role button to auto-fill email and password fields
- Automatically switches to the correct role tab
- User can then click "Sign In" button manually
- Good for testing form validation and UI behavior

#### Auto-Login Mode
- Toggle "Auto-login on click" checkbox
- Click a role button to instantly log in
- Bypasses form submission, goes directly to dashboard
- Perfect for rapid testing of dashboard features

## Test Credentials

All test accounts use role-specific passwords.

These are **real working accounts** verified in the Turso database:

| Role | Email | Password | Features |
|------|-------|----------|----------|
| Admin | admin@megilance.com | Admin@123 | Full platform access, user management, analytics |
| Freelancer | freelancer1@example.com | Freelancer@123 | Verified freelancer account with full features |
| Client | client1@example.com | Client@123 | Verified client account with project posting abilities |

> **Note:** These credentials are confirmed working against the live Turso database.

## Security

- **Only visible in development**: Component checks `process.env.NODE_ENV === 'development'`
- **Not included in production builds**: Completely removed from production
- **Clear visual indicator**: Yellow/amber warning banner shows it's a dev feature
- **Dashed border**: Visual distinction from regular login UI

## Usage

### Starting Development Server
```powershell
# Start all services
docker compose up -d

# Or start frontend only
cd frontend
npm run dev
```

### Testing Workflow
1. Navigate to http://localhost:3000/login
2. You'll see the "Quick Login (Dev Only)" section
3. For auto-fill testing:
   - Click any role button
   - Credentials are filled automatically
   - Click "Sign In as [Role]" to login
4. For instant login:
   - Check "Auto-login on click"
   - Click any role button
   - Instantly redirected to dashboard

## Component Structure

```
frontend/app/components/Auth/DevQuickLogin/
├── DevQuickLogin.tsx                # Main component
├── DevQuickLogin.common.module.css  # Layout & structure
├── DevQuickLogin.light.module.css   # Light theme colors
├── DevQuickLogin.dark.module.css    # Dark theme colors
└── index.ts                         # Barrel export
```

## Implementation Details

### Integration in Login Page
```tsx
<DevQuickLogin 
  onCredentialSelect={handleDevQuickLogin}  // Auto-fill handler
  onAutoLogin={handleDevAutoLogin}           // Instant login handler
/>
```

### Theme Support
- Full light/dark theme support
- Uses MegiLance CSS Module architecture
- Amber/yellow color scheme for dev warnings
- Smooth animations and hover effects

## Testing Different Roles

### Admin Dashboard
- URL: `/admin/dashboard`
- Features: Platform management, user oversight, analytics

### Freelancer Dashboard
- URL: `/freelancer/dashboard`
- Features: Project browsing, proposals, portfolio management

### Client Dashboard
- URL: `/client/dashboard`
- Features: Project posting, talent hiring, team management

## Troubleshooting

### Component Not Visible
- Ensure `NODE_ENV=development` is set
- Check if frontend dev server is running
- Clear browser cache and reload

### Login Fails
- Verify backend is running on port 8000
- Check that users exist in Turso database
- Passwords are role-specific: `Admin@123`, `Freelancer@123`, `Client@123`
- Check browser console for detailed error messages

### Wrong Dashboard Redirect
- Component automatically selects correct role tab
- Ensures `portal_area` localStorage is set correctly
- If issues persist, check `roleConfig` in Login.tsx

## Future Enhancements

Potential improvements:
- [ ] Add more test accounts (multiple freelancers/clients)
- [ ] Show account status (verified, 2FA enabled, etc.)
- [ ] Add "Copy Credentials" button
- [ ] Keyboard shortcuts (Alt+1, Alt+2, Alt+3 for roles)
- [ ] Remember last used role in dev session

## Related Files

- `frontend/app/(auth)/login/Login.tsx` - Main login page integration
- `backend/seed_demo_data.py` - Creates test accounts in database
- `.github/copilot-instructions.md` - Project coding standards
