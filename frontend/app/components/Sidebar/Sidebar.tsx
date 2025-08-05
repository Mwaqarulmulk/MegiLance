// @AI-HINT: This is the Sidebar component. It provides the main navigation for the application dashboard. It is designed to be responsive, themed, and accessible, with a collapsible state, using a per-component CSS module architecture.
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, LayoutDashboard, Briefcase, Wallet, BarChart2, MessageSquare, Users } from 'lucide-react';

import { useTheme } from '@/app/contexts/ThemeContext';
import SidebarNav, { NavItem } from './SidebarNav';

// AI-HINT: Import all necessary CSS modules. The theme-specific ones are passed as props to child components.
import commonStyles from './Sidebar.common.module.css';
import lightStyles from './Sidebar.light.module.css';
import darkStyles from './Sidebar.dark.module.css';

import navLightStyles from './SidebarNav.light.module.css';
import navDarkStyles from './SidebarNav.dark.module.css';



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
  const { theme: currentTheme } = useTheme();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

    const theme = currentTheme === 'light' ? lightStyles : darkStyles;

  const sidebarClasses = `
    ${commonStyles.sidebar}
    ${theme.sidebar}
    ${isCollapsed ? commonStyles.sidebarCollapsed : commonStyles.sidebarExpanded}
  `;

  return (
    <aside className={sidebarClasses}>
      <header className={commonStyles.sidebarHeader}>
        <div className={commonStyles.logoContainer}>
          {/* AI-HINT: Using Next.js Image component for optimized logo loading */}
          <Image src="/logo-icon.svg" alt="MegiLance Logo" width={32} height={32} className={commonStyles.logoIcon} />
          <span className={`${commonStyles.logoText} ${theme.logoText} ${isCollapsed ? commonStyles.logoTextCollapsed : ''}`}>
            MegiLance
          </span>
        </div>
        <button onClick={toggleSidebar} className={`${commonStyles.toggleButton} ${theme.toggleButton}`} title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </header>

      <div className={commonStyles.sidebarNavContainer}>
        <SidebarNav 
          isCollapsed={isCollapsed} 
          navItems={defaultNavItems}
          lightStyles={navLightStyles}
          darkStyles={navDarkStyles}
          currentTheme={currentTheme}
        />
      </div>

      <footer className={`${commonStyles.sidebarFooter} ${theme.sidebarFooter}`}>
        <div className={commonStyles.userInfo}>
          <Image src="/mock-avatar.png" alt="User Avatar" width={40} height={40} className={commonStyles.avatar} />
          <div className={`${commonStyles.userDetails} ${isCollapsed ? commonStyles.userDetailsCollapsed : ''}`}>
            <span className={`${commonStyles.userName} ${theme.userName}`}>John Doe</span>
            <span className={`${commonStyles.userRole} ${theme.userRole}`}>Client</span>
          </div>
        </div>
      </footer>
    </aside>
  );
};

export default Sidebar;

