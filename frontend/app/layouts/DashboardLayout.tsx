// @AI-HINT: This is the DashboardLayout, used for client and freelancer pages. It includes the SidebarNav and a main content area.
'use client';

import React from 'react';
import { useThemeMode, useThemeStyles } from '@/app/hooks/useThemeMode';
import { cn } from '@/lib/utils';
import SidebarNav from '@/app/components/organisms/SidebarNav/SidebarNav';
import commonStyles from './DashboardLayout.common.module.css';
import lightStyles from './DashboardLayout.light.module.css';
import darkStyles from './DashboardLayout.dark.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'client' | 'freelancer';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userType }) => {
  const mode = useThemeMode();
  const themeStyles = useThemeStyles(lightStyles, darkStyles);

  return (
    <div className={cn(commonStyles.layout, themeStyles.layout)}>
      <SidebarNav theme={mode} userType={userType} />
      <main className={commonStyles.main}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
