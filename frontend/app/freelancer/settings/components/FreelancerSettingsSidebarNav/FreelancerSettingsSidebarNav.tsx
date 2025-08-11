// @AI-HINT: This is a route-aware sidebar navigation component specifically for the multi-page freelancer settings section. It uses usePathname to determine the active link.
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import commonStyles from './FreelancerSettingsSidebarNav.common.module.css';
import lightStyles from './FreelancerSettingsSidebarNav.light.module.css';
import darkStyles from './FreelancerSettingsSidebarNav.dark.module.css';

interface FreelancerSettingsSidebarNavProps {
  items: {
    href: string;
    title: string;
  }[];
}

const FreelancerSettingsSidebarNav: React.FC<FreelancerSettingsSidebarNavProps> = ({ items }) => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  // Handle the case where the base /settings path should default to the /settings/account active state.
  const getIsActive = (href: string) => {
    if (href === '/freelancer/settings') {
      return pathname === href || pathname === '/freelancer/settings/account';
    }
    return pathname === href;
  };

  return (
    <nav className={cn(styles.nav)} aria-label="Settings navigation">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            styles.link,
            getIsActive(item.href) ? styles.active : ''
          )}
          title={item.title}
          aria-current={getIsActive(item.href) ? 'page' : undefined}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
};

export default FreelancerSettingsSidebarNav;
