// @AI-HINT: Centralized navigation configuration for MegiLance application. Contains all navigation items for different user types and sections.
// Icons are referenced by string identifiers to avoid Next.js 15 server component issues.

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  description?: string;
}

export interface ProfileMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon: string; // String identifier for icon
}

// Main public navigation (for home page, marketing pages)
export const publicNavItems: NavItem[] = [
  { label: 'Home', href: '/', icon: 'FaHome' },
  { label: 'How It Works', href: '/how-it-works', icon: 'FaInfoCircle' },
  { label: 'Pricing', href: '/pricing', icon: 'FaMoneyBillWave' },
  { label: 'About', href: '/about', icon: 'FaInfoCircle' },
  { label: 'Blog', href: '/blog', icon: 'FaBlog' },
  { label: 'Contact', href: '/contact', icon: 'FaEnvelope' },
  { label: 'FAQ', href: '/faq', icon: 'FaQuestionCircle' },
];

// Footer navigation links
export const footerNavItems = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Press', href: '/press' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Teams', href: '/teams' },
    { label: 'Referral', href: '/referral' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'User Management', href: '/user-management' },
    { label: 'Auth Dashboard', href: '/auth-dashboard' },
  ],
  services: [
    { label: 'For Freelancers', href: '/freelancers' },
    { label: 'For Clients', href: '/clients' },
    { label: 'AI Tools', href: '/ai/chatbot' },
    { label: 'Fraud Check', href: '/ai/fraud-check' },
    { label: 'Price Estimator', href: '/ai/price-estimator' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Enterprise', href: '/enterprise' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Community', href: '/community' },
    { label: 'Status', href: '/status' },
    { label: 'Forgot Password', href: '/forgot-password' },
    { label: 'Reset Password', href: '/reset-password' },
    { label: 'Support', href: '/support' },
    { label: 'Install', href: '/install' },
    { label: 'Onboarding', href: '/onboarding' },
    { label: 'Search', href: '/search' },
    { label: 'Wallet', href: '/wallet' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Security', href: '/security' },
  ],
};

// Dashboard navigation (general authenticated users)
export const dashboardNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'FaTachometerAlt' },
  { label: 'Projects', href: '/Projects', icon: 'FaBriefcase' },
  { label: 'Messages', href: '/messages', icon: 'FaComments' },
  { label: 'Payments', href: '/Payments', icon: 'FaCreditCard' },
  { label: 'Settings', href: '/Settings', icon: 'FaCogs' },
];

// Freelancer-specific navigation
export const freelancerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/freelancer/dashboard', icon: 'FaTachometerAlt' },
  { label: 'My Jobs', href: '/freelancer/my-jobs', icon: 'FaBriefcase' },
  { label: 'Projects', href: '/freelancer/projects', icon: 'FaFileContract' },
  { label: 'Portfolio', href: '/freelancer/portfolio', icon: 'FaPortrait' },
  { label: 'Analytics', href: '/freelancer/analytics', icon: 'FaChartLine' },
  { label: 'Wallet', href: '/freelancer/wallet', icon: 'FaWallet' },
  { label: 'Invoices', href: '/freelancer/invoices', icon: 'FaCreditCard' },
  { label: 'Timesheets', href: '/freelancer/timesheets', icon: 'FaCalculator' },
  { label: 'Notifications', href: '/freelancer/notifications', icon: 'FaBell' },
  { label: 'Reviews', href: '/freelancer/reviews', icon: 'FaStar' },
  { label: 'Job Alerts', href: '/freelancer/job-alerts', icon: 'FaBell' },
  { label: 'Contracts', href: '/freelancer/contracts', icon: 'FaFileContract' },
  { label: 'Rank', href: '/freelancer/rank', icon: 'FaChartLine' },
  { label: 'Support', href: '/freelancer/support', icon: 'FaLifeRing' },
  { label: 'Settings', href: '/freelancer/settings', icon: 'FaCogs' },
];

// Client-specific navigation
export const clientNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/client/dashboard', icon: 'FaTachometerAlt' },
  { label: 'Post Job', href: '/client/post-job', icon: 'FaRocket' },
  { label: 'Hire', href: '/client/hire', icon: 'FaUsers' },
  { label: 'Projects', href: '/client/projects', icon: 'FaBriefcase' },
  { label: 'Reviews', href: '/client/reviews', icon: 'FaStar' },
  { label: 'Wallet', href: '/client/wallet', icon: 'FaWallet' },
  { label: 'Settings', href: '/client/settings', icon: 'FaCogs' },
];

// Admin navigation
export const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'FaTachometerAlt' },
  { label: 'Users', href: '/admin/users', icon: 'FaUsers' },
  { label: 'Projects', href: '/admin/projects', icon: 'FaBriefcase' },
  { label: 'Payments', href: '/admin/payments', icon: 'FaCreditCard' },
  { label: 'AI Monitoring', href: '/admin/ai-monitoring', icon: 'FaRobot' },
  { label: 'Support', href: '/admin/support', icon: 'FaLifeRing' },
  { label: 'Audit Logs', href: '/audit-logs', icon: 'FaShieldAlt' },
  { label: 'Settings', href: '/admin/settings', icon: 'FaCogs' },
];

// AI Tools navigation
export const aiToolsNavItems: NavItem[] = [
  { label: 'Chatbot', href: '/ai/chatbot', icon: 'FaRobot' },
  { label: 'Price Estimator', href: '/ai/price-estimator', icon: 'FaCalculator' },
  { label: 'Fraud Check', href: '/ai/fraud-check', icon: 'FaShieldAlt' },
];

// Profile menu items (common across all user types)
export const profileMenuItems: ProfileMenuItem[] = [
  { label: 'My Profile', href: '/Profile', icon: 'FaUser' },
  { label: 'Settings', href: '/Settings', icon: 'FaCogs' },
  { label: 'Notifications', href: '/notifications', icon: 'FaBell' },
  { label: 'Logout', onClick: () => {
    // Handle logout logic
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
  }, icon: 'FaSignOutAlt' },
];

// Quick access links for different user types
export const quickAccessLinks = {
  freelancer: [
    { label: 'Find Jobs', href: '/jobs' },
    { label: 'My Proposals', href: '/freelancer/my-jobs' },
    { label: 'Earnings', href: '/freelancer/wallet' },
    { label: 'Messages', href: '/messages' },
  ],
  client: [
    { label: 'Post a Job', href: '/client/post-job' },
    { label: 'Find Freelancers', href: '/freelancers' },
    { label: 'My Projects', href: '/client/projects' },
    { label: 'Messages', href: '/messages' },
  ],
  admin: [
    { label: 'User Management', href: '/admin/users' },
    { label: 'System Health', href: '/admin/ai-monitoring' },
    { label: 'Support Queue', href: '/admin/support' },
    { label: 'Audit Logs', href: '/audit-logs' },
  ],
};

// Utility function to get navigation items based on user type
export const getNavigationForUserType = (userType: 'freelancer' | 'client' | 'admin' | 'public' = 'public'): NavItem[] => {
  switch (userType) {
    case 'freelancer':
      return freelancerNavItems;
    case 'client':
      return clientNavItems;
    case 'admin':
      return adminNavItems;
    case 'public':
    default:
      return publicNavItems;
  }
};

// Icon mapping for client-side resolution
export const iconMap = {
  FaHome: 'FaHome',
  FaInfoCircle: 'FaInfoCircle',
  FaMoneyBillWave: 'FaMoneyBillWave',
  FaBlog: 'FaBlog',
  FaEnvelope: 'FaEnvelope',
  FaQuestionCircle: 'FaQuestionCircle',
  FaTachometerAlt: 'FaTachometerAlt',
  FaBriefcase: 'FaBriefcase',
  FaComments: 'FaComments',
  FaCreditCard: 'FaCreditCard',
  FaCogs: 'FaCogs',
  FaFileContract: 'FaFileContract',
  FaPortrait: 'FaPortrait',
  FaChartLine: 'FaChartLine',
  FaWallet: 'FaWallet',
  FaStar: 'FaStar',
  FaBell: 'FaBell',
  FaLifeRing: 'FaLifeRing',
  FaRocket: 'FaRocket',
  FaUsers: 'FaUsers',
  FaRobot: 'FaRobot',
  FaCalculator: 'FaCalculator',
  FaShieldAlt: 'FaShieldAlt',
  FaUser: 'FaUser',
  FaSignOutAlt: 'FaSignOutAlt',
};

// Breadcrumb configuration
export const breadcrumbConfig: Record<string, string[]> = {
  '/dashboard': ['Dashboard'],
  '/projects': ['Dashboard', 'Projects'],
  '/freelancer/dashboard': ['Freelancer', 'Dashboard'],
  '/freelancer/projects': ['Freelancer', 'Projects'],
  '/freelancer/profile': ['Freelancer', 'Profile'],
  '/freelancer/invoices': ['Freelancer', 'Invoices'],
  '/freelancer/timesheets': ['Freelancer', 'Timesheets'],
  '/freelancer/notifications': ['Freelancer', 'Notifications'],
  '/client/dashboard': ['Client', 'Dashboard'],
  '/client/projects': ['Client', 'Projects'],
  '/client/profile': ['Client', 'Profile'],
  '/client/freelancers': ['Client', 'Freelancers'],
  '/client/post-job': ['Client', 'Post Job'],
  '/client/wallet': ['Client', 'Wallet'],
  '/admin/dashboard': ['Admin', 'Dashboard'],
  '/admin/users': ['Admin', 'Users'],
  '/admin/payments': ['Admin', 'Payments'],
  '/admin/projects': ['Admin', 'Projects'],
  '/admin/ai-monitoring': ['Admin', 'AI Monitoring'],
  '/admin/support': ['Admin', 'Support'],
  '/admin/profile': ['Admin', 'Profile'],
  '/messages': ['Dashboard', 'Messages'],
  '/notifications': ['Dashboard', 'Notifications'],
  '/audit-logs': ['Admin', 'Audit Logs'],
  '/Settings': ['Dashboard', 'Settings'],
  '/Profile': ['Dashboard', 'Profile'],
};
