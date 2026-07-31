// @AI-HINT: EmptyState - reusable empty data placeholder
'use client';

import React from 'react';
import { useThemeStyles } from '@/app/hooks/useThemeMode';
import { cn } from '@/lib/utils';
import commonStyles from './EmptyState.common.module.css';
import lightStyles from './EmptyState.light.module.css';
import darkStyles from './EmptyState.dark.module.css';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  const themeStyles = useThemeStyles(lightStyles, darkStyles);

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <div className={cn(commonStyles.icon, themeStyles.icon)}>{icon}</div>
      <h3 className={cn(commonStyles.title, themeStyles.title)}>{title}</h3>
      {description && <p className={cn(commonStyles.description, themeStyles.description)}>{description}</p>}
      {action && <div className={commonStyles.action}>{action}</div>}
    </div>
  );
};
