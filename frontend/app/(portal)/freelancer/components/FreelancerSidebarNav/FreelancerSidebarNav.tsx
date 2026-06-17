// @AI-HINT: This component builds the sidebar navigation for the freelancer portal, providing clear and accessible links to all major sections.
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Gauge, Briefcase, FileText, Wallet, TrendingUp, User, Settings, SendHorizontal, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import MegiLanceLogo from '@/app/components/atoms/MegiLanceLogo/MegiLanceLogo';
import commonStyles from './FreelancerSidebarNav.common.module.css';
import lightStyles from './FreelancerSidebarNav.light.module.css';
import darkStyles from './FreelancerSidebarNav.dark.module.css';

const navItems = [
  { href: '/freelancer/dashboard', label: 'Dashboard', icon: Gauge },
  { href: '/freelancer/invitations', label: 'Invitations', icon: SendHorizontal },
  { href: '/freelancer/projects', label: 'My Projects', icon: Briefcase },
  { href: '/freelancer/contracts', label: 'Contracts', icon: FileText },
  { href: '/freelancer/deliverables', label: 'Deliverables', icon: FileText },
  { href: '/freelancer/time-entries', label: 'Time Entries', icon: TrendingUp },
  { href: '/freelancer/disputes', label: 'Disputes', icon: Wallet },
  { href: '/freelancer/messages', label: 'Messages', icon: SendHorizontal },
  { href: '/freelancer/notifications', label: 'Notifications', icon: Bell },
  { href: '/freelancer/earnings', label: 'Earnings', icon: Wallet },
  { href: '/freelancer/invoices', label: 'Invoices', icon: FileText },
  { href: '/freelancer/escrow', label: 'Escrow', icon: Wallet },
  { href: '/freelancer/legal', label: 'Documents', icon: FileText },
  { href: '/freelancer/profile', label: 'Profile', icon: User },
  { href: '/freelancer/reviews', label: 'Reviews', icon: TrendingUp },
  { href: '/freelancer/settings', label: 'Settings', icon: Settings },
];

const FreelancerSidebarNav = () => {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  const styles = useMemo(() => {
    const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [resolvedTheme]);

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.logoContainer}>
        <MegiLanceLogo />
      </div>
      <nav className={styles.navContainer}>
        <ul>
          {navItems.map((item) => {
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

export default FreelancerSidebarNav;
