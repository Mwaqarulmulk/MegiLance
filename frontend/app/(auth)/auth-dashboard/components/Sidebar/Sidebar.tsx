// @AI-HINT: The Sidebar provides primary navigation for the dashboard. It's a key component for achieving a premium, investor-grade UI, offering consistent branding, user context, and clear navigation pathways.

'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { FaSignOutAlt, FaTachometerAlt, FaBriefcase, FaUsers } from 'react-icons/fa';
import { User } from '../../types';
import { cn } from '@/lib/utils';

import commonStyles from './Sidebar.common.module.css';
import lightStyles from './Sidebar.light.module.css';
import darkStyles from './Sidebar.dark.module.css';

interface SidebarProps {
  user: User;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
  { href: '/projects', label: 'Projects', icon: FaBriefcase },
  { href: '/clients', label: 'Clients', icon: FaUsers },
];

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const { theme } = useTheme();

  const styles = React.useMemo(() => {
    const themeStyles = theme === 'light' ? lightStyles : darkStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        {/* Placeholder for Logo */}
        <div className={styles.logo}>MegiLance</div>
      </div>
      <div className={styles.userProfile}>
        <Image src={user.avatar} alt={`${user.fullName}'s avatar`} width={40} height={40} className={styles.avatar} />
        <span className={styles.userName}>{user.fullName}</span>
      </div>
      <nav className={styles.navigation}>
        <ul>
          {navItems.map((item) => (
            <li key={item.label}>
              <a href={item.href} className={styles.navItem}>
                <item.icon className={styles.navIcon} />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.sidebarFooter}>
        <button className={styles.logoutButton}>
          <FaSignOutAlt className={styles.navIcon} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
