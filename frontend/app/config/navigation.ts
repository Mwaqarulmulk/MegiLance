// @AI-HINT: Centralized navigation configuration for MegiLance application. Contains all navigation items for different user types and sections.
// Icons are referenced by string identifiers to avoid Next.js 15 server component issues.

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  description?: string;
  badge?: string | number;
  submenu?: NavItem[];
  status?: string;
  section?: string; // Optional section header to display above this item
}

export interface ProfileMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon: string; // String identifier for icon
}

// Main public navigation (for home page, marketing pages)
export const publicNavItems: NavItem[] = [
  { label: "Home", href: "/", icon: "FaHome" },
  { label: "How It Works", href: "/how-it-works", icon: "FaInfoCircle" },
  { label: "Explore", href: "/explore", icon: "FaSearch" },
  { label: "Pricing", href: "/pricing", icon: "FaMoneyBillWave" },
];

// Footer navigation links
export const footerNavItems = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Blog", href: "/blog" },
  ],
  services: [
    { label: "For Freelancers", href: "/freelancers" },
    { label: "For Clients", href: "/clients" },
    { label: "Pricing", href: "/pricing" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms" },
  ],
};

// Dashboard navigation (general authenticated users) - REMOVED
// All users should use role-specific navigation (freelancer, client, or admin)
export const dashboardNavItems: NavItem[] = [];

// Freelancer-specific navigation — streamlined to essential items only
export const freelancerNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/freelancer/dashboard",
    icon: "LayoutDashboard",
    section: "Overview",
  },
  {
    label: "Invitations",
    href: "/freelancer/invitations",
    icon: "Mail",
    section: "Work",
  },
  {
    label: "My Projects",
    href: "/freelancer/projects",
    icon: "Briefcase",
  },
  { label: "Contracts", href: "/freelancer/contracts", icon: "FolderGit2" },
  { label: "Deliverables", href: "/freelancer/deliverables", icon: "Upload" },
  { label: "Time Entries", href: "/freelancer/time-entries", icon: "Clock" },
  { label: "Disputes", href: "/freelancer/disputes", icon: "Gavel" },
  {
    label: "Messages",
    href: "/freelancer/messages",
    icon: "MessageSquare",
    section: "Communication",
  },
  { label: "Notifications", href: "/freelancer/notifications", icon: "Bell" },
  {
    label: "Earnings",
    href: "/freelancer/earnings",
    icon: "Wallet",
    section: "Finance",
  },
  { label: "Invoices", href: "/freelancer/invoices", icon: "Receipt" },
  { label: "Escrow", href: "/freelancer/escrow", icon: "Lock" },
  { label: "Documents", href: "/freelancer/legal", icon: "FileSignature" },
  {
    label: "AI Suite",
    href: "/ai",
    icon: "Bot",
    section: "Intelligence",
    submenu: [
      { label: "AI Operations", href: "/ai", icon: "Bot" },
      {
        label: "Pricing Engine",
        href: "/ai/price-estimator",
        icon: "TrendingUp",
      },
      {
        label: "Smart Invoices",
        href: "/ai/invoice-generator",
        icon: "FileText",
      },
      { label: "AI Assistant", href: "/ai/chatbot", icon: "MessageSquare" },
    ],
  },
  {
    label: "Profile",
    href: "/freelancer/profile",
    icon: "User",
    section: "Account",
  },
  { label: "Reviews", href: "/freelancer/reviews", icon: "Star" },
  { label: "Settings", href: "/freelancer/settings", icon: "Settings" },
  {
    label: "Report Issue",
    href: "/feedback",
    icon: "Flag",
    section: "Support",
  },
];

// Client-specific navigation — streamlined to essential items only
export const clientNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/client/dashboard",
    icon: "LayoutDashboard",
    section: "Overview",
  },
  {
    label: "Find Talent",
    href: "/client/find-talent",
    icon: "Sparkles",
    section: "Hiring",
  },
  {
    label: "My Projects",
    href: "/client/projects",
    icon: "Briefcase",
  },
  { label: "Contracts", href: "/client/contracts", icon: "FolderGit2" },
  { label: "Deliverables", href: "/client/deliverables", icon: "Upload" },
  { label: "Disputes", href: "/client/disputes", icon: "Gavel" },
  {
    label: "Messages",
    href: "/client/messages",
    icon: "MessageSquare",
    section: "Communication",
  },
  { label: "Notifications", href: "/client/notifications", icon: "Bell" },
  {
    label: "Payments",
    href: "/client/payments",
    icon: "CreditCard",
    section: "Finance",
  },
  { label: "Invoices", href: "/client/invoices", icon: "Receipt" },
  { label: "Wallet", href: "/client/wallet", icon: "Wallet" },
  { label: "Documents", href: "/client/documents", icon: "FileSignature" },
  {
    label: "AI Tools",
    href: "/ai",
    icon: "Bot",
    section: "Intelligence",
    submenu: [
      { label: "AI Overview", href: "/ai", icon: "Bot" },
      {
        label: "Price Estimator",
        href: "/ai/price-estimator",
        icon: "TrendingUp",
      },
      { label: "Chat Assistant", href: "/ai/chatbot", icon: "MessageSquare" },
    ],
  },
  {
    label: "Profile",
    href: "/client/profile",
    icon: "User",
    section: "Account",
  },
  { label: "Reviews", href: "/client/reviews", icon: "Star" },
  { label: "Settings", href: "/client/settings", icon: "Settings" },
  {
    label: "Report Issue",
    href: "/feedback",
    icon: "Flag",
    section: "Support",
  },
];

// Admin navigation — streamlined to essential management items
export const adminNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "LayoutDashboard",
    section: "Overview",
  },
  { label: "Analytics", href: "/admin/analytics", icon: "LineChart" },
  {
    label: "Users",
    href: "/admin/users",
    icon: "Users",
    section: "Management",
    submenu: [
      { label: "All Users", href: "/admin/users", icon: "Users" },
      { label: "Projects", href: "/admin/projects", icon: "Briefcase" },
      { label: "Disputes", href: "/admin/disputes", icon: "Gavel" },
      { label: "User Feedback", href: "/admin/feedback", icon: "Flag" },
      { label: "Messages", href: "/admin/messages", icon: "MessageSquare" },
    ],
  },
  { label: "Projects", href: "/admin/projects", icon: "Briefcase" },
  { label: "User Feedback", href: "/admin/feedback", icon: "Flag", section: "Moderation" },
  { label: "Disputes", href: "/admin/disputes", icon: "Gavel" },
  { label: "Messages", href: "/admin/messages", icon: "MessageSquare" },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: "CreditCard",
    section: "Financial",
  },
  {
    label: "AI Services",
    href: "/ai",
    icon: "Bot",
    section: "Intelligence",
    submenu: [
      { label: "AI Hub", href: "/ai", icon: "Bot" },
      { label: "AI Chatbot", href: "/ai/chatbot", icon: "MessageSquare" },
      {
        label: "AI Price Estimator",
        href: "/ai/price-estimator",
        icon: "TrendingUp",
      },
      {
        label: "AI Invoice Generator",
        href: "/ai/invoice-generator",
        icon: "FileText",
      },
    ],
  },
  {
    label: "Content Moderation",
    href: "/admin/moderation",
    icon: "ShieldAlert",
    section: "Security",
  },
  { label: "Fraud Detection", href: "/admin/fraud-detection", icon: "ShieldAlert" },
  { label: "Audit Logs", href: "/admin/audit", icon: "FileText" },
  {
    label: "System Health",
    href: "/admin/health",
    icon: "Activity",
    section: "System",
  },
  { label: "Issues & Errors", href: "/admin/issues", icon: "Bug" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
];

// AI Tools navigation
export const aiToolsNavItems: NavItem[] = [
  { label: "Chatbot", href: "/ai/chatbot", icon: "Bot" },
  { label: "Price Estimator", href: "/ai/price-estimator", icon: "CreditCard" },
  { label: "Fraud Check", href: "/ai/fraud-check", icon: "ShieldAlert" },
];

// Profile menu items (common across all user types)
export const profileMenuItems: ProfileMenuItem[] = [
  { label: "My Profile", href: "/profile", icon: "FaUser" },
  { label: "Settings", href: "/settings", icon: "FaCogs" },
  { label: "Notifications", href: "/notifications", icon: "FaBell" },
  {
    label: "Logout",
    onClick: async () => {
      if (typeof window !== "undefined") {
        try {
          // Notify backend to blacklist the token
          const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
          if (token) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/logout`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              credentials: 'include',
            }).catch(() => {});
          }
        } catch {
          // Continue with logout even if backend call fails
        }
        // Clear all auth data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.removeItem("portal_area");
        localStorage.removeItem("ml_user_role");
        sessionStorage.removeItem("auth_token");
        // Drop JS-accessible auth cookies
        document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
        document.cookie = "refresh_token=; path=/; max-age=0; SameSite=Lax";
        // Broadcast to other tabs
        try {
          localStorage.setItem("auth_logout_broadcast", "true");
          localStorage.removeItem("auth_logout_broadcast");
        } catch (e) { console.warn('Logout broadcast error:', e); }
        window.location.href = "/login";
      }
    },
    icon: "FaSignOutAlt",
  },
];

// Quick access links for different user types
export const quickAccessLinks = {
  freelancer: [
    { label: "Invitations", href: "/freelancer/invitations" },
    { label: "My Projects", href: "/freelancer/projects" },
    { label: "Earnings", href: "/freelancer/earnings" },
    { label: "Messages", href: "/freelancer/messages" },
  ],
  client: [
    { label: "Find Talent", href: "/client/find-talent" },
    { label: "My Projects", href: "/client/projects" },
    { label: "Messages", href: "/client/messages" },
  ],
  admin: [
    { label: "User Management", href: "/admin/users" },
    { label: "System Health", href: "/admin/health" },
    { label: "Support Queue", href: "/admin/disputes" },
    { label: "Audit Logs", href: "/admin/audit" },
  ],
};

// Utility function to get navigation items based on user type
export const getNavigationForUserType = (
  userType: "freelancer" | "client" | "admin" | "public" = "public",
): NavItem[] => {
  switch (userType) {
    case "freelancer":
      return freelancerNavItems;
    case "client":
      return clientNavItems;
    case "admin":
      return adminNavItems;
    case "public":
    default:
      return publicNavItems;
  }
};

// Breadcrumb configuration
export const breadcrumbConfig: Record<string, string[]> = {
  "/projects": ["Projects"],

  // ── Freelancer breadcrumbs ──────────────────────────────────
  "/freelancer/dashboard": ["Freelancer", "Dashboard"],
  "/freelancer/activity": ["Freelancer", "Activity"],
  "/freelancer/projects": ["Freelancer", "Projects"],
  "/freelancer/invitations": ["Freelancer", "Invitations"],
  "/freelancer/contracts": ["Freelancer", "Contracts"],
  "/freelancer/deliverables": ["Freelancer", "Deliverables"],
  "/freelancer/time-entries": ["Freelancer", "Time Entries"],
  "/freelancer/invoices": ["Freelancer", "Invoices"],
  "/freelancer/payments": ["Freelancer", "Payments"],
  "/freelancer/earnings": ["Freelancer", "Earnings"],
  "/freelancer/rate-cards": ["Freelancer", "Rate Cards"],
  "/freelancer/subscription": ["Freelancer", "Subscription"],
  "/freelancer/messages": ["Freelancer", "Messages"],
  "/freelancer/notifications": ["Freelancer", "Notifications"],
  "/freelancer/calendar": ["Freelancer", "Calendar"],
  "/freelancer/reviews": ["Freelancer", "Reviews"],
  "/freelancer/portfolio": ["Freelancer", "Portfolio"],
  "/freelancer/profile": ["Freelancer", "Profile"],
  "/freelancer/assessments": ["Freelancer", "Assessments"],
  "/freelancer/files": ["Freelancer", "Files"],
  "/freelancer/notes": ["Freelancer", "Notes"],
  "/freelancer/templates": ["Freelancer", "Templates"],
  "/freelancer/workflows": ["Freelancer", "Workflows"],
  "/freelancer/integrations": ["Freelancer", "Integrations"],
  "/freelancer/legal": ["Freelancer", "Legal"],
  "/freelancer/verification": ["Freelancer", "Verification"],
  "/freelancer/video-calls": ["Freelancer", "Video Calls"],
  "/freelancer/communication": ["Freelancer", "Communication"],
  "/freelancer/feedback": ["Freelancer", "Feedback"],
  "/freelancer/disputes": ["Freelancer", "Disputes"],
  "/freelancer/escrow": ["Freelancer", "Escrow"],
  "/freelancer/favorites": ["Freelancer", "Favorites"],
  "/freelancer/settings": ["Freelancer", "Settings"],
  "/freelancer/help": ["Freelancer", "Help"],

  // ── Client breadcrumbs ──────────────────────────────────────
  "/client/dashboard": ["Client", "Dashboard"],
  "/client/projects": ["Client", "Projects"],
  "/client/find-talent": ["Client", "Find Talent"],
  "/client/contracts": ["Client", "Contracts"],
  "/client/deliverables": ["Client", "Deliverables"],
  "/client/invoices": ["Client", "Invoices"],
  "/client/documents": ["Client", "Documents"],
  "/client/payments": ["Client", "Payments"],
  "/client/messages": ["Client", "Messages"],
  "/client/notifications": ["Client", "Notifications"],
  "/client/calendar": ["Client", "Calendar"],
  "/client/reviews": ["Client", "Reviews"],
  "/client/reports": ["Client", "Reports"],
  "/client/find-freelancers": ["Client", "Find Freelancers"],
  "/client/favorites": ["Client", "Favorites"],
  "/client/disputes": ["Client", "Disputes"],
  "/client/video-calls": ["Client", "Video Calls"],
  "/client/profile": ["Client", "Profile"],
  "/client/settings": ["Client", "Settings"],
  "/client/help": ["Client", "Help"],
  "/client/escrow": ["Client", "Escrow"],
  "/client/wallet": ["Client", "Wallet"],
  "/client/analytics": ["Client", "Analytics"],
  "/client/security": ["Client", "Security"],

  // ── Admin breadcrumbs ───────────────────────────────────────
  "/admin/dashboard": ["Admin", "Dashboard"],
  "/admin/analytics": ["Admin", "Analytics"],
  "/admin/metrics": ["Admin", "Metrics"],
  "/admin/users": ["Admin", "Users"],
  "/admin/projects": ["Admin", "Projects"],
  "/admin/messages": ["Admin", "Messages"],
  "/admin/disputes": ["Admin", "Disputes"],
  "/admin/categories": ["Admin", "Categories"],
  "/admin/skills": ["Admin", "Skills"],
  "/admin/tags": ["Admin", "Tags"],
  "/admin/blog": ["Admin", "Blog"],
  "/admin/branding": ["Admin", "Branding"],
  "/admin/payments": ["Admin", "Payments"],
  "/admin/refunds": ["Admin", "Refunds"],
  "/admin/billing": ["Admin", "Billing"],
  "/admin/moderation": ["Admin", "Content Moderation"],
  "/admin/fraud-detection": ["Admin", "Fraud Detection"],
  "/admin/security": ["Admin", "Security"],
  "/admin/audit": ["Admin", "Audit Logs"],
  "/admin/compliance": ["Admin", "Compliance"],
  "/admin/ai-monitoring": ["Admin", "AI Monitoring"],
  "/admin/health": ["Admin", "System Health"],
  "/admin/api-keys": ["Admin", "API Keys"],
  "/admin/webhooks": ["Admin", "Webhooks"],
  "/admin/calendar": ["Admin", "Calendar"],
  "/admin/feedback": ["Admin", "Feedback"],
  "/admin/video-calls": ["Admin", "Video Calls"],
  "/admin/support": ["Admin", "Support"],
  "/admin/help": ["Admin", "Help"],
  "/admin/reports": ["Admin", "Reports"],
  "/admin/email-templates": ["Admin", "Email Templates"],
  "/admin/feature-flags": ["Admin", "Feature Flags"],
  "/admin/integrations": ["Admin", "Integrations"],
  "/admin/profile": ["Admin", "Profile"],
  "/admin/settings": ["Admin", "Settings"],

  // ── Shared / fallback ───────────────────────────────────────
  "/Settings": ["Dashboard", "Settings"],
  "/Profile": ["Dashboard", "Profile"],
};
