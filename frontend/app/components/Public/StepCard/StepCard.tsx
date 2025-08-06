// @AI-HINT: This component displays a single step in a process, used on the 'How It Works' page.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './StepCard.common.module.css';
import lightStyles from './StepCard.light.module.css';
import darkStyles from './StepCard.dark.module.css';

// @AI-HINT: This component displays a single step in a process, used on the 'How It Works' page. It is fully theme-aware and uses CSS modules.

export interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

const StepCard: React.FC<StepCardProps> = ({ stepNumber, title, description, icon, className }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.stepCardContainer, themeStyles.themeWrapper, className)}>
      <div className={commonStyles.header}>
        <div className={commonStyles.iconWrapper}>
          {icon}
        </div>
        <div className={commonStyles.number}>{stepNumber}</div>
      </div>
      <div className={commonStyles.content}>
        <h3 className={commonStyles.title}>{title}</h3>
        <p className={commonStyles.description}>{description}</p>
      </div>
    </div>
  );
};

export default StepCard;
