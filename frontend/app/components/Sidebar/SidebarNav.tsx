// @AI-HINT: This component renders the navigation items within the Sidebar. It dynamically handles the collapsed state, showing full labels or just icons, and is styled using per-component CSS modules.
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import commonStyles from './SidebarNav.common.module.css';
import lightStyles from './SidebarNav.light.module.css';
import darkStyles from './SidebarNav.dark.module.css';

// Define the structure for a navigation item
export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

// Define the props for the SidebarNav component
export interface SidebarNavProps {
  isCollapsed: boolean;
  navItems: NavItem[];
}

const SidebarNav: React.FC<SidebarNavProps> = ({ isCollapsed, navItems }) => {
  const pathname = usePathname();
  const { theme } = useTheme();

  if (!theme) return null;

  const themeStyles = theme === 'light' ? lightStyles : darkStyles;

  return (
    <nav className={cn(commonStyles.sidebarNav)}>
      <ul className={cn(commonStyles.navList)}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          const linkClasses = cn(
            commonStyles.navLink,
            themeStyles.navLink,
            isActive ? cn(commonStyles.navLinkActive, themeStyles.navLinkActive) : cn(commonStyles.navLinkInactive, themeStyles.navLinkInactive),
            isCollapsed && commonStyles.navLinkCollapsed
          );

          return (
            <li key={item.href} className={cn(commonStyles.navItem, themeStyles.navItem)}>
              <Link href={item.href} title={isCollapsed ? item.label : ''} className={linkClasses}>
                <Icon className={cn(commonStyles.navIcon, themeStyles.navIcon)} />
                {!isCollapsed && <span className={cn(commonStyles.navLabel, themeStyles.navLabel)}>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarNav;

