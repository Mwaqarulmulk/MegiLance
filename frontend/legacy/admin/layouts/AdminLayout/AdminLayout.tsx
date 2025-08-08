// @AI-HINT: This is the main layout component for the admin portal. It establishes the primary structure, including a sidebar and a content area, ensuring a consistent and premium user experience across all admin pages.
'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import AdminSidebarNav from '@/app/admin/components/AdminSidebarNav/AdminSidebarNav';
import commonStyles from './AdminLayout.common.module.css';
import lightStyles from './AdminLayout.light.module.css';
import darkStyles from './AdminLayout.dark.module.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <AdminSidebarNav />
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
