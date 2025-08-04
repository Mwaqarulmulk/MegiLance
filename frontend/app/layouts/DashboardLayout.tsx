// @AI-HINT: This is the DashboardLayout, used for client and freelancer pages. It includes the SidebarNav and a main content area.
'use client';

import React from 'react';
import SidebarNav from '@/app/components/SidebarNav/SidebarNav';
import { useTheme } from '@/app/contexts/ThemeContext';
import './DashboardLayout.common.css';
import './DashboardLayout.light.css';
import './DashboardLayout.dark.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'client' | 'freelancer';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userType }) => {
  const { theme } = useTheme();

  return (
    <div className={`DashboardLayout DashboardLayout--${theme}`}>
      <SidebarNav theme={theme} userType={userType} />
      <main className="DashboardLayout-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
