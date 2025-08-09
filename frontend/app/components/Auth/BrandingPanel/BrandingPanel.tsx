// @AI-HINT: This is a shared, reusable branding panel for all authentication pages (Login, Signup, etc.). It centralizes the dynamic, role-based branding to ensure a consistent, premium user experience and follows the DRY principle.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import type { IconType } from 'react-icons';

// Import dedicated styles for the Branding Panel
import commonStyles from './BrandingPanel.common.module.css';
import lightStyles from './BrandingPanel.light.module.css';
import darkStyles from './BrandingPanel.dark.module.css';

export interface RoleConfig {
  brandIcon: IconType;
  brandTitle: string;
  brandText: string;
}

export interface AuthBrandingPanelProps {
  roleConfig: RoleConfig;
}

const AuthBrandingPanel: React.FC<AuthBrandingPanelProps> = ({ roleConfig }) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => {
    const effectiveTheme = theme ?? 'light';
    const themeStyles = effectiveTheme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);
  const { brandIcon: BrandIcon, brandTitle, brandText } = roleConfig;

  // Always render to avoid initial layout shift; theme styles will hydrate on mount.

  return (
    <div className={styles.brandingPanel}>
      <div className={styles.brandingContent}>
        <div className={styles.brandingIconWrapper}>
          <BrandIcon className={styles.brandingIcon} />
        </div>
        <h2 className={styles.brandingTitle}>{brandTitle}</h2>
        <p className={styles.brandingText}>{brandText}</p>
      </div>
      <div className={styles.brandingFooter}>
        <p>&copy; {new Date().getFullYear()} MegiLance. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthBrandingPanel;
