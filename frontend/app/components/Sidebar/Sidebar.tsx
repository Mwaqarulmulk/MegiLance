// @AI-HINT: This is the Sidebar component. It provides the main navigation for the application dashboard. It is designed to be responsive, themed, and accessible, with a collapsible state, using a per-component CSS module architecture.
'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, Briefcase, Wallet, BarChart2, MessageSquare, Users } from 'lucide-react';

import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import SidebarNav, { NavItem } from './SidebarNav';
import { MegiLanceLogo } from '../MegiLanceLogo/MegiLanceLogo';
import UserAvatar from '../UserAvatar/UserAvatar';

// AI-HINT: Import all necessary CSS modules. The theme-specific ones are passed as props to child components.
import commonStyles from './Sidebar.common.module.css';
import lightStyles from './Sidebar.light.module.css';
import darkStyles from './Sidebar.dark.module.css';





// AI-HINT: Navigation items are defined as a data structure for easy management and role-based filtering in the future.
const defaultNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: Briefcase },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/clients', label: 'Clients', icon: Users },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (!theme) return null;

  const themeStyles = theme === 'light' ? lightStyles : darkStyles;

  return (
    <aside
      className={cn(
        commonStyles.sidebar,
        themeStyles.sidebar,
        isCollapsed ? commonStyles.sidebarCollapsed : commonStyles.sidebarExpanded
      )}
    >
      <header className={cn(commonStyles.sidebarHeader, themeStyles.sidebarHeader)}>
        <div className={cn(commonStyles.logoContainer, themeStyles.logoContainer)}>
          <MegiLanceLogo className={commonStyles.logoIcon} />
          <span
            className={cn(
              commonStyles.logoText,
              themeStyles.logoText,
              isCollapsed && commonStyles.logoTextCollapsed
            )}
          >
            MegiLance
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className={cn(commonStyles.toggleButton, themeStyles.toggleButton)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </header>

      <div className={cn(commonStyles.sidebarNavContainer, themeStyles.sidebarNavContainer)}>
        <SidebarNav 
          isCollapsed={isCollapsed} 
          navItems={defaultNavItems}
        />
      </div>

      <footer className={cn(commonStyles.sidebarFooter, themeStyles.sidebarFooter)}>
        <div className={cn(commonStyles.userInfo, themeStyles.userInfo)}>
          <UserAvatar src="/mock-avatar.png" name="John Doe" size="large" />
          <div
            className={cn(
              commonStyles.userDetails,
              themeStyles.userDetails,
              isCollapsed && commonStyles.userDetailsCollapsed
            )}
          >
            <span className={cn(commonStyles.userName, themeStyles.userName)}>John Doe</span>
            <span className={cn(commonStyles.userRole, themeStyles.userRole)}>Client</span>
          </div>
        </div>
      </footer>
    </aside>
  );
};

export default Sidebar;

