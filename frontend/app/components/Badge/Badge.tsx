// @AI-HINT: This is a Badge component, an atomic element for displaying statuses, tags, or other small pieces of information.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Badge.common.css';
import './Badge.light.css';
import './Badge.dark.css';

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

  const badgeClasses = [
    'Badge',
    `Badge--${variant}`,
    `Badge--${theme}`,
    `Badge--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses}>
      {iconBefore && <span className="Badge-icon Badge-icon--before">{iconBefore}</span>}
      {children}
      {iconAfter && <span className="Badge-icon Badge-icon--after">{iconAfter}</span>}
    </span>
  );
};

export default Badge;
