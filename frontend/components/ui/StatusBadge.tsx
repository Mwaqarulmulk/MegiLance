// @AI-HINT: StatusBadge - reusable colored status indicator
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useThemeStyles } from '@/app/hooks/useThemeMode';
import { cn } from '@/lib/utils';
import commonStyles from './StatusBadge.common.module.css';
import lightStyles from './StatusBadge.light.module.css';
import darkStyles from './StatusBadge.dark.module.css';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, children, icon }) => {
  const themeStyles = useThemeStyles(lightStyles, darkStyles);

  return (
    <motion.span whileHover={{ scale: 1.05 }} transition={{ type: "spring" as const }}
      className={cn(commonStyles.badge, themeStyles.badge)}
      data-variant={variant}
    >
      {icon && <motion.span whileHover={{ scale: 1.05 }} transition={{ type: "spring" as const }} className={commonStyles.icon}>{icon}</motion.span>}
      {children}
    </motion.span>
  );
};
