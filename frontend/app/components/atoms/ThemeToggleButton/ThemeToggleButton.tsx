'use client';
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import commonStyles from './ThemeToggleButton.common.module.css';
import lightStyles from './ThemeToggleButton.light.module.css';
import darkStyles from './ThemeToggleButton.dark.module.css';

const ThemeToggleButton: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <div className={commonStyles.themeToggleFloating}>
        <button className={commonStyles.themeToggleBtn} aria-label="Loading theme toggle">
          <Moon size={20} />
        </button>
      </div>
    );
  }

  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={commonStyles.themeToggleFloating}>
      <button
        aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={handleClick}
        className={cn(commonStyles.themeToggleBtn, themeStyles.themeToggleBtn)}
      >
        {resolvedTheme === 'dark' ? (
          <Sun size={20} className={commonStyles.icon} />
        ) : (
          <Moon size={20} className={commonStyles.icon} />
        )}
      </button>
    </div>
  );
};

export default ThemeToggleButton;