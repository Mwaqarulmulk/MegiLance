'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';

import commonStyles from './FeatureCard.common.module.css';
import lightStyles from './FeatureCard.light.module.css';
import darkStyles from './FeatureCard.dark.module.css';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: 'default' | 'hero';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, variant = 'default' }) => {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.featureCard, themeStyles.featureCard, commonStyles[variant])}>
      <div className={cn(commonStyles.iconWrapper, themeStyles.iconWrapper)}>
        {icon}
      </div>
      <h3 className={cn(commonStyles.title, themeStyles.title)}>{title}</h3>
      <p className={cn(commonStyles.description, themeStyles.description)}>{description}</p>
    </div>
  );
};

export default FeatureCard;
