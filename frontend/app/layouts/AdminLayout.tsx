// @AI-HINT: This is the AdminLayout, used for all admin-facing pages. It includes the SidebarNav with admin links.
'use client';

import React from 'react';
import SidebarNav from '@/app/components/SidebarNav/SidebarNav';
import { useTheme } from '@/app/contexts/ThemeContext';
import './DashboardLayout.common.css'; // Reusing dashboard layout styles
import './DashboardLayout.light.css';
import './DashboardLayout.dark.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className={`DashboardLayout DashboardLayout--${theme}`}>
      <SidebarNav theme={theme} userType="admin" />
      <main className="DashboardLayout-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
