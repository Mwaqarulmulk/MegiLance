// @AI-HINT: Glassmorphism card animation component with frosted-glass effect and motion transitions
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import commonStyles from './GlassCard.common.module.css';
import lightStyles from './GlassCard.light.module.css';
import darkStyles from './GlassCard.dark.module.css';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
}) => {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        commonStyles.glassCard,
        themeStyles.glassCard,
        hoverEffect && commonStyles.hoverEffect,
        hoverEffect && themeStyles.hoverEffect,
        className
      )}
    >
      {children}
    </motion.div>
  );
};
