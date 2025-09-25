// @AI-HINT: This is a professional, responsive, and fully-themed navigation sidebar. It includes a logo, navigation links with icons, and a user profile section, adhering to brand guidelines. All styles are per-component only.

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import styles from './SidebarNav.common.module.css';
import lightStyles from './SidebarNav.light.module.css';
import darkStyles from './SidebarNav.dark.module.css';
import {
  LayoutDashboard,
  MessageSquare,
  FolderGit2,
  Wallet,
  HelpCircle,
  Settings as SettingsIcon,
  Users,
  CreditCard,
  LineChart,
  ShieldAlert,
  Briefcase,
  Bell,
  ChevronDown,
  ChevronUp,
  Home,
  User,
  FileText,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  Lock,
  Star,
  TrendingUp
} from 'lucide-react';

// Define the structure for a navigation item
export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  submenu?: NavItem[];
}

// Define the props for the SidebarNav component
export interface SidebarNavProps {
  navItems?: NavItem[];
  userType?: 'admin' | 'client' | 'freelancer';
  // Accept external theme prop for compatibility with legacy callers; internal theming still uses next-themes.
  theme?: string;
  isCollapsed?: boolean;
  className?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({
  navItems,
  userType,
  theme: _externalTheme,
  isCollapsed = false,
  className = '',
}) => {
  const pathname = usePathname();
  const { theme } = useTheme(); // Use hook for theme
  const [openSubmenus, setOpenSubmenus] = React.useState<Record<string, boolean>>({});

  // Provide sensible defaults when navItems are not passed in, based on userType
  const computedNavItems: NavItem[] = navItems && navItems.length > 0
    ? navItems
    : ((): NavItem[] => {
        switch (userType) {
          case 'admin':
            return [
              { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
              { href: '/admin/users', label: 'Users', icon: <Users size={18} />, badge: '12' },
              { href: '/admin/projects', label: 'Projects', icon: <FolderGit2 size={18} /> },
              { 
                href: '/admin/payments', 
                label: 'Payments', 
                icon: <CreditCard size={18} />,
                badge: '3',
                submenu: [
                  { href: '/admin/payments/invoices', label: 'Invoices', icon: <FileText size={14} /> },
                  { href: '/admin/payments/refunds', label: 'Refunds', icon: <CreditCard size={14} /> },
                ]
              },
              { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
              { href: '/admin/support', label: 'Support', icon: <ShieldAlert size={18} />, badge: '5' },
              { href: '/admin/ai-monitoring', label: 'AI Monitoring', icon: <LineChart size={18} /> },
              { href: '/admin/calendar', label: 'Calendar', icon: <Calendar size={18} /> },
              { href: '/admin/settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
            ];
          case 'client':
            return [
              { href: '/client/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
              { href: '/messages', label: 'Messages', icon: <MessageSquare size={18} />, badge: '7' },
              { href: '/client/projects', label: 'Projects', icon: <Briefcase size={18} /> },
              { href: '/client/payments', label: 'Payments', icon: <CreditCard size={18} /> },
              { href: '/client/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
              { href: '/help', label: 'Help', icon: <HelpCircle size={18} /> },
              { href: '/client/settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
            ];
          case 'freelancer':
            return [
              { href: '/freelancer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
              { href: '/messages', label: 'Messages', icon: <MessageSquare size={18} />, badge: '2' },
              { href: '/freelancer/projects', label: 'Projects', icon: <Briefcase size={18} /> },
              { href: '/freelancer/wallet', label: 'Wallet', icon: <Wallet size={18} /> },
              { href: '/freelancer/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
              { href: '/freelancer/my-jobs', label: 'My Jobs', icon: <Briefcase size={18} /> },
              { href: '/freelancer/portfolio', label: 'Portfolio', icon: <User size={18} /> },
              { href: '/freelancer/reviews', label: 'Reviews', icon: <Star size={18} /> },
              { href: '/freelancer/rank', label: 'Rank', icon: <TrendingUp size={18} /> },
              { href: '/help', label: 'Help', icon: <HelpCircle size={18} /> },
              { href: '/freelancer/settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
            ];
          default:
            return [
              { href: '/', label: 'Home', icon: <Home size={18} /> },
              { href: '/profile', label: 'Profile', icon: <User size={18} /> },
              { href: '/messages', label: 'Messages', icon: <MessageSquare size={18} /> },
              { href: '/settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
            ];
        }
      })();

  const themeStyles = theme === 'light' ? lightStyles : darkStyles;

  const toggleSubmenu = (href: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  const sidebarClasses = cn(
    styles.sidebarNav,
    `theme-${theme}`, // Apply global theme class for CSS variables
    isCollapsed && styles.sidebarNavCollapsed,
    className
  );

  return (
    <aside className={sidebarClasses}>
      <div className={styles.sidebarNavHeader}>
        <div className={styles.sidebarNavLogo}>
          {isCollapsed ? 'M' : 'MegiLance'}
        </div>
      </div>
      <nav className={styles.sidebarNavNav}>
        <ul className={styles.sidebarNavList}>
          {computedNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isSubmenuOpen = openSubmenus[item.href];
            
            return (
              <React.Fragment key={item.href}>
                <li className={styles.sidebarNavItem}>
                  <Link
                    href={item.submenu ? '#' : item.href}
                    className={cn(
                      styles.sidebarNavLink,
                      themeStyles.navLinkInactive,
                      isActive && styles.sidebarNavLinkActive,
                      isActive && themeStyles.navLinkActive
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    title={item.label}
                    data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={(e) => {
                      if (item.submenu) {
                        e.preventDefault();
                        toggleSubmenu(item.href);
                      }
                    }}
                  >
                    <span className={cn(styles.sidebarNavIcon, isActive && styles.sidebarNavIconActive)} aria-hidden>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className={styles.sidebarNavLabel}>{item.label}</span>
                        {item.badge && (
                          <span className={cn(styles.badge, themeStyles.badge)}>{item.badge}</span>
                        )}
                        {item.submenu && (
                          <span className={cn(styles.sidebarNavIcon, styles.sidebarNavChevron)}>
                            {isSubmenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
                {item.submenu && !isCollapsed && isSubmenuOpen && (
                  <ul className={styles.sidebarNavList} style={{ paddingLeft: '1.5rem' }}>
                    {item.submenu.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <li key={subItem.href} className={cn(styles.sidebarNavItem, styles.sidebarNavSubItem)}>
                          <Link
                            href={subItem.href}
                            className={cn(
                              styles.sidebarNavLink,
                              themeStyles.navLinkInactive,
                              isSubActive && styles.sidebarNavLinkActive,
                              isSubActive && themeStyles.navLinkActive,
                              styles.sidebarNavSubLink
                            )}
                            aria-current={isSubActive ? 'page' : undefined}
                            title={subItem.label}
                          >
                            <span className={cn(styles.sidebarNavIcon, isSubActive && styles.sidebarNavIconActive)} aria-hidden>
                              {subItem.icon}
                            </span>
                            <span className={styles.sidebarNavLabel}>{subItem.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </React.Fragment>
            );
          })}
        </ul>
      </nav>
      <div className={styles.sidebarNavFooter}>
        {/* Placeholder for future UserAvatar or ProfileMenu component */}

      </div>
    </aside>
  );
};

export default SidebarNav;