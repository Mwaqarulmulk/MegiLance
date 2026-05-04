// @AI-HINT: Portal route for main Dashboard - middleware handles role redirect; this is a fallback
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { getAuthToken } from '@/lib/api';
import commonStyles from './Dashboard.common.module.css';
import lightStyles from './Dashboard.light.module.css';
import darkStyles from './Dashboard.dark.module.css';

/**
 * Fallback redirect page — middleware.ts handles most `/dashboard` requests
 * server-side via JWT decode. This page only renders if middleware can't
 * determine the role (e.g., malformed JWT, cookie-only localStorage token).
 */
const PortalDashboardPage = () => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace('/login?returnTo=/dashboard');
      return;
    }

    // Determine role from localStorage
    const portalArea = window.localStorage.getItem('portal_area');
    if (portalArea) {
      const target = portalArea === 'admin' ? '/admin/dashboard'
        : portalArea === 'freelancer' ? '/freelancer/dashboard'
        : '/client/dashboard';
      router.replace(target);
      return;
    }

    // Fallback: parse user object
    try {
      const user = JSON.parse(window.localStorage.getItem('user') || '{}');
      const role = (user.user_type || user.role || 'client').toLowerCase();
      const target = role === 'admin' ? '/admin/dashboard'
        : role === 'freelancer' ? '/freelancer/dashboard'
        : '/client/dashboard';
      router.replace(target);
    } catch {
      router.replace('/client/dashboard');
    }
  }, [router]);

  return (
    <div className={commonStyles.redirectWrapper}>
      <div className={cn(commonStyles.redirectSpinner, themeStyles.redirectSpinner)} />
      <p className={cn(commonStyles.redirectText, themeStyles.redirectText)}>
        Redirecting to your dashboard...
      </p>
    </div>
  );
};

export default PortalDashboardPage;
