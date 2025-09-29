# Notice: Canonical routes map

For the up-to-date route inventory, see `../ROUTES_MAP.md`. This document contains extended notes and remains for reference.

# MegiLance Routes Documentation

This document provides a comprehensive overview of all routes in the MegiLance platform, organized by user role and functionality.

## Table of Contents
1. [Route Structure](#route-structure)
2. [Public Routes](#public-routes)
3. [Authentication Routes](#authentication-routes)
4. [Portal Routes](#portal-routes)
   - [Freelancer Portal](#freelancer-portal)
   - [Client Portal](#client-portal)
   - [Admin Portal](#admin-portal)
5. [API Routes](#api-routes)
6. [Route Groups](#route-groups)
7. [Dynamic Routes](#dynamic-routes)
8. [Middleware and Protection](#middleware-and-protection)

## Route Structure

The MegiLance platform uses Next.js App Router with a structured approach to route organization:

```
app/
├── (auth)/              # Authentication routes
├── (main)/              # Public marketing routes
├── (portal)/            # Protected portal routes
├── api/                 # API routes
└── [page]/              # Individual pages
```

## Public Routes

These routes are accessible to all users without authentication:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Landing page with platform overview |
| `/about` | About | Company information and values |
| `/blog` | Blog | Blog listing page |
| `/blog/[slug]` | BlogPost | Individual blog post |
| `/pricing` | Pricing | Pricing plans and features |
| `/contact` | Contact | Contact form and information |
| `/faq` | FAQ | Frequently asked questions |
| `/jobs` | Jobs | Public job listings |
| `/clients` | Clients | Information for clients |
| `/freelancers` | Freelancers | Information for freelancers |
| `/legal/privacy` | PrivacyPolicy | Privacy policy |
| `/legal/terms` | TermsOfService | Terms of service |
| `/security` | Security | Security information |
| `/support` | Support | Support resources |
| `/teams` | Teams | Team information |
| `/testimonials` | Testimonials | Client testimonials |
| `/how-it-works` | HowItWorks | Platform workflow explanation |
| `/careers` | Careers | Career opportunities |
| `/press` | Press | Press resources |
| `/enterprise` | Enterprise | Enterprise solutions |
| `/status` | Status | System status page |

## Authentication Routes

These routes handle user authentication and are located under the `(auth)` route group:

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | Login | User login page |
| `/signup` | Signup | User registration page |
| `/forgot-password` | ForgotPassword | Password reset request |
| `/reset-password` | ResetPassword | Password reset form |
| `/passwordless` | Passwordless | Passwordless login |

## Portal Routes

Protected routes that require authentication, organized by user role.

### Freelancer Portal

Routes accessible to authenticated freelancers:

| Route | Component | Description |
|-------|-----------|-------------|
| `/freelancer/dashboard` | FreelancerDashboard | Freelancer dashboard overview |
| `/freelancer/profile` | FreelancerProfile | Freelancer profile management |
| `/freelancer/my-jobs` | MyJobs | Freelancer's job listings |
| `/freelancer/proposals` | Proposals | Submitted proposals |
| `/freelancer/contracts` | Contracts | Active contracts |
| `/freelancer/wallet` | Wallet | Financial management |
| `/freelancer/analytics` | Analytics | Performance analytics |
| `/freelancer/settings` | Settings | Account settings |
| `/freelancer/portfolio` | Portfolio | Work portfolio |
| `/freelancer/reviews` | Reviews | Client reviews |
| `/freelancer/rank` | Rank | Freelancer ranking |
| `/freelancer/job-alerts` | JobAlerts | Job notifications |
| `/freelancer/support` | Support | Support requests |
| `/freelancer/projects` | Projects | Project management |
| `/freelancer/projects/[id]` | ProjectDetails | Individual project details |
| `/freelancer/withdraw` | Withdraw | Withdrawal management |

### Client Portal

Routes accessible to authenticated clients:

| Route | Component | Description |
|-------|-----------|-------------|
| `/client/dashboard` | ClientDashboard | Client dashboard overview |
| `/client/profile` | ClientProfile | Client profile management |
| `/client/post-job` | PostJob | Job posting form |
| `/client/projects` | ClientProjects | Project management |
| `/client/projects/[id]` | ClientProjectDetails | Individual project details |
| `/client/freelancers` | Freelancers | Freelancer search and hiring |
| `/client/hire` | Hire | Hiring workflow |
| `/client/reviews` | Reviews | Freelancer reviews |
| `/client/payments` | Payments | Payment management |
| `/client/wallet` | Wallet | Financial management |
| `/client/settings` | Settings | Account settings |
| `/client/analytics` | Analytics | Business analytics |

### Admin Portal

Routes accessible to authenticated administrators:

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/dashboard` | AdminDashboard | Admin dashboard overview |
| `/admin/users` | Users | User management |
| `/admin/projects` | AdminProjects | Project oversight |
| `/admin/payments` | Payments | Payment monitoring |
| `/admin/support` | Support | Support ticket management |
| `/admin/ai-monitoring` | AIMonitoring | AI system monitoring |
| `/admin/settings` | Settings | Platform settings |
| `/admin/profile` | AdminProfile | Admin profile |
| `/admin/calendar` | Calendar | Admin calendar |
| `/admin/users/[id]` | UserDetails | Individual user details |
| `/admin/projects/[id]` | ProjectDetails | Individual project details |
| `/admin/payments/invoices` | Invoices | Invoice management |
| `/admin/payments/refunds` | Refunds | Refund processing |

### Shared Portal Routes

Routes accessible to all authenticated users:

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | Dashboard | General dashboard |
| `/dashboard/analytics` | Analytics | Analytics overview |
| `/dashboard/community` | Community | Community features |
| `/dashboard/projects` | Projects | Project overview |
| `/dashboard/wallet` | Wallet | Wallet overview |
| `/messages` | Messages | Messaging system |
| `/notifications` | Notifications | Notification center |
| `/search` | Search | Search functionality |
| `/help` | Help | Help center |
| `/audit-logs` | AuditLogs | Audit trail |
| `/profile` | Profile | User profile |
| `/settings` | Settings | General settings |

## API Routes

Backend API endpoints:

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/signup` | POST | User registration |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/forgot-password` | POST | Password reset request |
| `/api/auth/reset-password` | POST | Password reset |
| `/api/users` | GET, POST | User management |
| `/api/users/[id]` | GET, PUT, DELETE | Individual user operations |
| `/api/projects` | GET, POST | Project management |
| `/api/projects/[id]` | GET, PUT, DELETE | Individual project operations |
| `/api/proposals` | GET, POST | Proposal management |
| `/api/proposals/[id]` | GET, PUT, DELETE | Individual proposal operations |
| `/api/contracts` | GET, POST | Contract management |
| `/api/contracts/[id]` | GET, PUT, DELETE | Individual contract operations |
| `/api/payments` | GET, POST | Payment processing |
| `/api/payments/[id]` | GET, PUT | Individual payment operations |
| `/api/messages` | GET, POST | Messaging system |
| `/api/messages/[id]` | GET, PUT, DELETE | Individual message operations |
| `/api/notifications` | GET, POST | Notification management |
| `/api/notifications/[id]` | GET, PUT, DELETE | Individual notification operations |
| `/api/reviews` | GET, POST | Review management |
| `/api/reviews/[id]` | GET, PUT, DELETE | Individual review operations |
| `/api/analytics` | GET | Analytics data |
| `/api/search` | GET | Search functionality |
| `/api/wallet` | GET, POST | Wallet operations |
| `/api/wallet/[id]` | GET, PUT | Individual wallet operations |

## Route Groups

The application uses Next.js route groups to organize functionality:

### (auth) Route Group
Contains all authentication-related pages and flows:
- Login and signup flows
- Password reset functionality
- Passwordless authentication

### (main) Route Group
Contains public marketing and informational pages:
- Landing pages
- Blog and content
- Legal and support pages

### (portal) Route Group
Contains protected application pages organized by user role:
- Freelancer-specific routes
- Client-specific routes
- Admin-specific routes
- Shared portal functionality

## Dynamic Routes

Routes with dynamic parameters:

| Route Pattern | Parameter | Description |
|---------------|-----------|-------------|
| `/blog/[slug]` | slug | Blog post identifier |
| `/freelancer/projects/[id]` | id | Project identifier |
| `/client/projects/[id]` | id | Project identifier |
| `/admin/users/[id]` | id | User identifier |
| `/admin/projects/[id]` | id | Project identifier |
| `/messages/[conversationId]` | conversationId | Message conversation identifier |
| `/freelancer/portfolio/[itemId]` | itemId | Portfolio item identifier |

## Middleware and Protection

Route protection is implemented through:

1. **Authentication Middleware**: Verifies user authentication status
2. **Role-Based Access Control**: Ensures users can only access appropriate routes
3. **Route Guarding**: Redirects unauthenticated users to login
4. **Session Management**: Handles user sessions and timeouts

### Protected Routes
- All routes under `(portal)/` require authentication
- Admin routes require admin role
- Client routes require client role or higher
- Freelancer routes require freelancer role or higher

### Public Routes
- All routes under `(main)/` are publicly accessible
- Authentication routes under `(auth)/` are publicly accessible
- Specific exceptions are handled through middleware

## Route Naming Conventions

1. **Kebab-case**: All routes use kebab-case naming (e.g., `/my-profile`)
2. **Descriptive Names**: Route names clearly describe their purpose
3. **Consistent Structure**: Related routes are grouped logically
4. **Role Prefixing**: Portal routes are prefixed with user role when appropriate

## Route Performance

Routes are optimized for:
1. **Fast Loading**: Code splitting and lazy loading
2. **Caching**: Appropriate caching strategies
3. **Preloading**: Strategic link preloading
4. **Bundle Optimization**: Minimized bundle sizes

## Route Testing

All routes should be tested for:
1. **Functionality**: Correct rendering and behavior
2. **Accessibility**: WCAG compliance
3. **Performance**: Loading times and optimization
4. **Security**: Protection against common vulnerabilities
5. **Responsive Design**: Mobile and tablet compatibility

## Route Documentation Updates

This documentation should be updated when:
1. New routes are added
2. Existing routes are modified
3. Route protection levels change
4. API endpoints are updated
5. User roles and permissions are modified

## Future Route Enhancements

Planned route additions:
1. **Mobile App Routes**: Native mobile app specific routes
2. **AI Assistant Routes**: AI-powered functionality routes
3. **Blockchain Integration**: Cryptocurrency and smart contract routes
4. **Advanced Analytics**: Detailed analytics dashboard routes
5. **Marketplace Features**: Enhanced marketplace functionality routes

## Conclusion

The MegiLance routing system is designed to provide a clear, organized, and secure navigation experience for all user types. The route structure supports the platform's complex functionality while maintaining simplicity and performance.