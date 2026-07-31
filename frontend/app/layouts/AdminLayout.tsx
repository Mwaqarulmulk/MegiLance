// @AI-HINT: This is the AdminLayout, used for all admin-facing pages. It includes the SidebarNav with admin links.
'use client';

import React from 'react';
import { useThemeMode, useThemeStyles } from '@/app/hooks/useThemeMode';
import { cn } from '@/lib/utils';
import SidebarNav from '@/app/components/organisms/SidebarNav/SidebarNav';
import commonStyles from './DashboardLayout.common.module.css';
import lightStyles from './DashboardLayout.light.module.css';
import darkStyles from './DashboardLayout.dark.module.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const mode = useThemeMode();
  const themeStyles = useThemeStyles(lightStyles, darkStyles);

  return (
    <div className={cn(commonStyles.layout, themeStyles.layout)}>
      <SidebarNav theme={mode} userType="admin" />
      <main className={commonStyles.main}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
