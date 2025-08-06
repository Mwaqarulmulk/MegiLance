// @AI-HINT: This is a Badge component, an atomic element for displaying statuses, tags, or other small pieces of information.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';

import commonStyles from './Badge.common.module.css';
import lightStyles from './Badge.light.module.css';
import darkStyles from './Badge.dark.module.css';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium';
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  iconBefore,
  iconAfter,
  className = '',
}) => {
    const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <span
      className={cn(
        commonStyles.badge,
        themeStyles.badge,
        commonStyles[variant],
        themeStyles[variant],
        commonStyles[size],
        themeStyles[size],
        className
      )}
    >
      {iconBefore && <span className={cn(commonStyles.badgeIcon, commonStyles.badgeIconBefore)}>{iconBefore}</span>}
      {children}
      {iconAfter && <span className={cn(commonStyles.badgeIcon, commonStyles.badgeIconAfter)}>{iconAfter}</span>}
    </span>
  );
};

export default Badge;
