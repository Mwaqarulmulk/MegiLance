// @AI-HINT: Portal Dashboard page. Reuses premium dashboard components from (auth)/dashboard with theme-aware styles.
'use client';

import React, { useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

// Reuse existing dashboard components and types
import DashboardHeader from '@/app/(auth)/auth-dashboard/components/DashboardHeader/DashboardHeader';
import DashboardMetrics from '@/app/(auth)/auth-dashboard/components/DashboardMetrics/DashboardMetrics';
import DashboardRecentProjects from '@/app/(auth)/auth-dashboard/components/DashboardRecentProjects/DashboardRecentProjects';
import DashboardActivityFeed from '@/app/(auth)/auth-dashboard/components/DashboardActivityFeed/DashboardActivityFeed';
import type { User } from '@/app/(auth)/auth-dashboard/types';

// Use (auth) dashboard style tokens for the header component which expects a merged styles object
import authCommon from '@/app/(auth)/auth-dashboard/dashboard.common.module.css';
import authLight from '@/app/(auth)/auth-dashboard/dashboard.light.module.css';
import authDark from '@/app/(auth)/auth-dashboard/dashboard.dark.module.css';

// Page-level styles for layout
import common from './Dashboard.common.module.css';
import light from './Dashboard.light.module.css';
import dark from './Dashboard.dark.module.css';

const mockUser: User = {
  fullName: 'Jordan Smith',
  email: 'jordan@example.com',
  bio: 'Product Manager focused on outcomes and velocity.',
  avatar: '/images/avatars/avatar-1.png',
  notificationCount: 3,
};

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const headerStyles = useMemo(() => {
    const t = theme === 'light' ? authLight : authDark;
    return { ...authCommon, ...t } as { [k: string]: string };
  }, [theme]);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const metricsRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const metricsVisible = useIntersectionObserver(metricsRef, { threshold: 0.1 });
  const contentVisible = useIntersectionObserver(contentRef, { threshold: 0.1 });

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <div ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <DashboardHeader userRole="client" user={mockUser} styles={headerStyles} />
        </div>
        <div ref={metricsRef} className={cn(common.metrics, metricsVisible ? common.isVisible : common.isNotVisible)}>
          <DashboardMetrics />
        </div>
        <div ref={contentRef} className={cn(common.contentGrid, contentVisible ? common.isVisible : common.isNotVisible)}>
          <div className={common.recentProjects}>
            <DashboardRecentProjects />
          </div>
          <div className={common.activityFeed}>
            <DashboardActivityFeed />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
