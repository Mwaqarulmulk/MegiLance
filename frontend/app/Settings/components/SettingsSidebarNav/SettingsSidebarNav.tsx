// @AI-HINT: This component renders the vertical navigation menu for the Settings page. It indicates the active section and allows users to switch between different settings panels.

'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { User, Shield, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

import commonStyles from './SettingsSidebarNav.common.module.css';
import lightStyles from './SettingsSidebarNav.light.module.css';
import darkStyles from './SettingsSidebarNav.dark.module.css';

export type SettingsSection = 'profile' | 'security' | 'appearance';

interface NavItem {
  id: SettingsSection;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Sun }, // Base icon
];

interface SettingsSidebarNavProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

const SettingsSidebarNav: React.FC<SettingsSidebarNavProps> = ({ activeSection, onSectionChange }) => {
  const { theme } = useTheme();

  const styles = React.useMemo(() => {
    const themeStyles = theme === 'light' ? lightStyles : darkStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const appearanceIcon = theme === 'dark' ? Moon : Sun;
  const updatedNavItems = navItems.map(item => 
    item.id === 'appearance' ? { ...item, icon: appearanceIcon } : item
  );

  return (
    <nav className={styles.nav} aria-label="Settings">
      <h2 className={styles.title}>Settings</h2>
      <ul className={styles.list} role="tablist" aria-orientation="vertical">
        {updatedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <li key={item.id} role="presentation">
              <button
                role="tab"
                aria-selected={isActive}
                aria-controls={`settings-panel-${item.id}`}
                id={`settings-tab-${item.id}`}
                className={cn(styles.itemButton, isActive && styles.active)}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className={styles.itemIcon} size={20} />
                <span className={styles.itemLabel}>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SettingsSidebarNav;
