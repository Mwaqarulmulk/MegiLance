// @AI-HINT: This is the Sidebar component. It provides the main navigation for the application dashboard. It is designed to be responsive, themed, and accessible, with a collapsible state, using a per-component CSS module architecture.
'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import SidebarNav from '../SidebarNav/SidebarNav';
import { MegiLanceLogo } from '../MegiLanceLogo/MegiLanceLogo';
import UserAvatar from '../UserAvatar/UserAvatar';

// AI-HINT: Import all necessary CSS modules. The theme-specific ones are passed as props to child components.
import commonStyles from './Sidebar.common.module.css';
import lightStyles from './Sidebar.light.module.css';
import darkStyles from './Sidebar.dark.module.css';
import adminStyles from './Sidebar.admin.module.css';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  userType?: 'admin' | 'client' | 'freelancer';
}

// AI-HINT: Role-aware navigation is provided by the shared SidebarNav component.

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar, userType }) => {
  const { theme } = useTheme();

  // Ensure hooks are not called conditionally
  const themeStyles = useMemo(() => {
    if (userType === 'admin') {
      return adminStyles;
    }
    return theme === 'light' ? lightStyles : darkStyles;
  }, [theme, userType]);

  if (!theme) return null;

  return (
    <aside
      className={cn(
        commonStyles.sidebar,
        themeStyles.sidebar,
        isCollapsed ? commonStyles.sidebarCollapsed : commonStyles.sidebarExpanded
      )}
    >
      <header className={cn(commonStyles.sidebarHeader, themeStyles.sidebarHeader)}>
        <div className={cn(commonStyles.logoContainer)}>
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
        <SidebarNav isCollapsed={isCollapsed} userType={userType} />
      </div>

      <footer className={cn(commonStyles.sidebarFooter, themeStyles.sidebarFooter)}>
        <div className={cn(commonStyles.userInfo)}>
          <UserAvatar src="/mock-avatar.svg" name="John Doe" size="large" />
          <div
            className={cn(
              commonStyles.userDetails,
              isCollapsed && commonStyles.userDetailsCollapsed
            )}
          >
            <span className={cn(commonStyles.userName, themeStyles.userName)}>John Doe</span>
            <span className={cn(commonStyles.userRole, themeStyles.userRole)}>
              {userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : 'User'}
            </span>
          </div>
        </div>
      </footer>
    </aside>
  );
};

export default Sidebar;

