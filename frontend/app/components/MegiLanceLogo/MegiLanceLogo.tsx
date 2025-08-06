// @AI-HINT: This component renders the MegiLance SVG logo and is fully theme-aware.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './MegiLanceLogo.common.module.css';
import lightStyles from './MegiLanceLogo.light.module.css';
import darkStyles from './MegiLanceLogo.dark.module.css';

export const MegiLanceLogo: React.FC<{ className?: string }> = ({ className }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'light' ? lightStyles : darkStyles;

  if (!theme) return null;

  return (
    <svg
      className={cn(commonStyles.logo, className)}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MegiLance Logo"
    >
      <rect width="32" height="32" rx="8" className={cn(commonStyles.background, themeStyles.background)} />
      <path
        d="M9 23V9H12.5L16 16L19.5 9H23V23H20V12L16.5 19H15.5L12 12V23H9Z"
        className={cn(commonStyles.foreground, themeStyles.foreground)}
      />
    </svg>
  );
};

export default MegiLanceLogo;
