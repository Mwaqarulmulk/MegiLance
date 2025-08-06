// @AI-HINT: This is a professional, responsive, and fully-themed navigation sidebar. It includes a logo, navigation links with icons, and a user profile section, adhering to brand guidelines. All styles are per-component only.

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import styles from './SidebarNav.common.module.css';

// Define the structure for a navigation item
export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

// Define the props for the SidebarNav component
export interface SidebarNavProps {
  navItems: NavItem[];
  isCollapsed?: boolean;
  className?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({
  navItems,
  isCollapsed = false,
  className = '',
}) => {
  const pathname = usePathname();
  const { theme } = useTheme(); // Use hook for theme

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
          {navItems.map((item) => (
            <li key={item.href} className={styles.sidebarNavItem}>
              <Link
                href={item.href}
                className={cn(
                  styles.sidebarNavLink,
                  pathname === item.href && styles.sidebarNavLinkActive
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={styles.sidebarNavIcon}>{item.icon}</span>
                {!isCollapsed && <span className={styles.sidebarNavLabel}>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.sidebarNavFooter}>
        {/* Placeholder for future UserAvatar or ProfileMenu component */}
      </div>
    </aside>
  );
};

export default SidebarNav;
