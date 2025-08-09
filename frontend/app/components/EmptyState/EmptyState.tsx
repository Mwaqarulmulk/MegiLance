// @AI-HINT: Premium, theme-aware EmptyState component with icon/illustration slot and CTA.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import commonStyles from './EmptyState.common.module.css';
import lightStyles from './EmptyState.light.module.css';
import darkStyles from './EmptyState.dark.module.css';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode; // e.g., a Button
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className }) => {
  const { theme } = useTheme();
  if (!theme) return null;
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <section className={cn(commonStyles.wrapper, themeStyles.wrapper, className)} aria-live="polite">
      {icon && <div className={cn(commonStyles.iconWrap, themeStyles.iconWrap)}>{icon}</div>}
      <h3 className={cn(commonStyles.title, themeStyles.title)}>{title}</h3>
      {description && <p className={cn(commonStyles.description, themeStyles.description)}>{description}</p>}
      {action && <div className={cn(commonStyles.action, themeStyles.action)}>{action}</div>}
    </section>
  );
};

export default EmptyState;
