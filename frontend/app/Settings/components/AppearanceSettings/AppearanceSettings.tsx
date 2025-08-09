// @AI-HINT: This component provides controls for the user to change the application's visual theme, such as switching between light and dark mode. It uses the 'next-themes' library to apply changes globally.

'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import SettingsSection from '../SettingsSection/SettingsSection';
import { Sun, Moon } from 'lucide-react';

import commonStyles from './AppearanceSettings.common.module.css';
import lightStyles from './AppearanceSettings.light.module.css';
import darkStyles from './AppearanceSettings.dark.module.css';

const AppearanceSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const styles = useMemo(() => {
    const themeStyles = theme === 'light' ? lightStyles : darkStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  return (
    <SettingsSection
      title="Appearance"
      description="Customize the look and feel of the application. Your preferences will be saved for your next visit."
    >
      <div className={styles.switcher}>
        <button
          className={cn(styles.button, theme === 'light' && styles.active)}
          onClick={() => setTheme('light')}
          aria-pressed={theme === 'light'}
        >
          <Sun size={20} />
          <span>Light</span>
        </button>
        <button
          className={cn(styles.button, theme === 'dark' && styles.active)}
          onClick={() => setTheme('dark')}
          aria-pressed={theme === 'dark'}
        >
          <Moon size={20} />
          <span>Dark</span>
        </button>
      </div>
    </SettingsSection>
  );
};

export default AppearanceSettings;
