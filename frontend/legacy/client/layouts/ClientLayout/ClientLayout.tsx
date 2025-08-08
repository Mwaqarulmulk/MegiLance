// @AI-HINT: This is the main layout component for the client portal. It establishes the primary structure, including a sidebar and a content area, ensuring a consistent and premium user experience across all client pages.
'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import ClientSidebarNav from '@/app/client/components/ClientSidebarNav/ClientSidebarNav';
import commonStyles from './ClientLayout.common.module.css';
import lightStyles from './ClientLayout.light.module.css';
import darkStyles from './ClientLayout.dark.module.css';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <ClientSidebarNav />
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default ClientLayout;
