// @AI-HINT: A reusable card component for the 'How It Works' section, designed for a premium, modern, and visually engaging user experience.

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';

import commonStyles from './StepCard.common.module.css';
import lightStyles from './StepCard.light.module.css';
import darkStyles from './StepCard.dark.module.css';

export interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stepNumber: number;
  type: 'client' | 'freelancer';
}

const StepCard: React.FC<StepCardProps> = ({ icon, title, description, stepNumber, type }) => {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.stepCard, themeStyles.stepCard, commonStyles[type])}>
      <div className={cn(commonStyles.content)}>
        <div className={cn(commonStyles.iconWrapper, themeStyles.iconWrapper)}>
          {icon}
        </div>
        <h3 className={cn(commonStyles.title, themeStyles.title)}>{title}</h3>
        <p className={cn(commonStyles.description, themeStyles.description)}>{description}</p>
      </div>
      <div className={cn(commonStyles.stepNumber, themeStyles.stepNumber)}>
        {stepNumber}
      </div>
    </div>
  );
};

export default StepCard;
