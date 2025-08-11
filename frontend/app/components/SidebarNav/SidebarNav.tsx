// @AI-HINT: This is a professional, responsive, and fully-themed navigation sidebar. It includes a logo, navigation links with icons, and a user profile section, adhering to brand guidelines. All styles are per-component only.

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import styles from './SidebarNav.common.module.css';
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
} from 'lucide-react';

// Define the structure for a navigation item
export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
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

  // Provide sensible defaults when navItems are not passed in, based on userType
  const computedNavItems: NavItem[] = navItems && navItems.length > 0
    ? navItems
    : ((): NavItem[] => {
        switch (userType) {
          case 'admin':
            return [
              { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
              { href: '/admin/users', label: 'Users', icon: <Users size={18} /> },
              { href: '/admin/projects', label: 'Projects', icon: <FolderGit2 size={18} /> },
              { href: '/admin/payments', label: 'Payments', icon: <CreditCard size={18} /> },
              { href: '/admin/support', label: 'Support', icon: <ShieldAlert size={18} /> },
              { href: '/admin/ai-monitoring', label: 'AI Monitoring', icon: <LineChart size={18} /> },
              { href: '/admin/settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
            ];
          case 'client':
            return [
              { href: '/client/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
              { href: '/messages', label: 'Messages', icon: <MessageSquare size={18} /> },
              { href: '/client/projects', label: 'Projects', icon: <Briefcase size={18} /> },
              { href: '/client/payments', label: 'Payments', icon: <CreditCard size={18} /> },
              { href: '/help', label: 'Help', icon: <HelpCircle size={18} /> },
              { href: '/client/settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
            ];
          case 'freelancer':
            return [
              { href: '/freelancer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
              { href: '/messages', label: 'Messages', icon: <MessageSquare size={18} /> },
              { href: '/freelancer/projects', label: 'Projects', icon: <Briefcase size={18} /> },
              { href: '/freelancer/wallet', label: 'Wallet', icon: <Wallet size={18} /> },
              { href: '/help', label: 'Help', icon: <HelpCircle size={18} /> },
              { href: '/freelancer/settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
            ];
          default:
            return [];
        }
      })();

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
            return (
              <li key={item.href} className={styles.sidebarNavItem}>
                <Link
                  href={item.href}
                  className={cn(
                    styles.sidebarNavLink,
                    isActive && styles.sidebarNavLinkActive
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                  data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className={styles.sidebarNavIcon} aria-hidden>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className={styles.sidebarNavLabel}>{item.label}</span>
                  )}
                </Link>
              </li>
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
