// @AI-HINT: This component renders the primary sidebar navigation for the admin portal, providing links to all key administrative sections.
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { FaTachometerAlt, FaUsers, FaBox, FaChartBar, FaCog, FaCreditCard, FaLifeRing, FaRobot } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import MegiLanceLogo from '@/app/components/MegiLanceLogo/MegiLanceLogo';

import commonStyles from './AdminSidebarNav.common.module.css';
import lightStyles from './AdminSidebarNav.light.module.css';
import darkStyles from './AdminSidebarNav.dark.module.css';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
  { href: '/admin/users', label: 'User Management', icon: FaUsers },
  { href: '/admin/projects', label: 'Projects', icon: FaBox },
  { href: '/admin/payments', label: 'Payments', icon: FaCreditCard },
  { href: '/admin/support', label: 'Support', icon: FaLifeRing },
  { href: '/admin/ai-monitoring', label: 'AI Monitoring', icon: FaRobot },
  { href: '/admin/analytics', label: 'Analytics', icon: FaChartBar },
  { href: '/admin/settings', label: 'Settings', icon: FaCog },
];

const AdminSidebarNav: React.FC = () => {
  const pathname = usePathname();
  const { theme } = useTheme();

  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.logoContainer}>
        <MegiLanceLogo />
      </div>
      <nav className={styles.navContainer}>
        <ul>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link href={item.href} className={cn(styles.navLink, isActive && styles.activeLink)}>
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebarNav;
