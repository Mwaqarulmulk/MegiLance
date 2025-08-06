// @AI-HINT: This component provides a UI control for switching between light and dark themes. It uses the global ThemeContext to access the current theme and the toggle function.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

import commonStyles from './ThemeSwitcher.common.module.css';
import lightStyles from './ThemeSwitcher.light.module.css';
import darkStyles from './ThemeSwitcher.dark.module.css';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  // To avoid a flash of the wrong theme, we don't render until the theme is determined on the client.
  if (!theme) {
    return null;
  }

  const themeStyles = theme === 'light' ? lightStyles : darkStyles;

  return (
    <button
      onClick={toggleTheme}
      className={cn(commonStyles.themeToggle, themeStyles.themeToggle)}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? 
        <Moon size={20} className={cn(commonStyles.icon, themeStyles.icon)} /> : 
        <Sun size={20} className={cn(commonStyles.icon, themeStyles.icon)} />
      }
    </button>
  );
};

export default ThemeSwitcher;
