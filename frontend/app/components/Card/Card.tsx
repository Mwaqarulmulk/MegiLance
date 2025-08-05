// @AI-HINT: This is a versatile and reusable Card component. It serves as a container for content sections and is fully theme-aware, adapting its styles based on the global theme context.

'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';

import commonStyles from './Card.common.module.css';
import lightStyles from './Card.light.module.css';
import darkStyles from './Card.dark.module.css';

export interface CardProps {
  title?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon: Icon, children, className = '' }) => {
  const { theme } = useTheme();

  if (!theme) {
    return null; // Don't render until theme is resolved to prevent flash
  }

  const themeStyles = theme === 'light' ? lightStyles : darkStyles;

  return (
    <div className={`${commonStyles.card} ${themeStyles.card} ${className}`}>
      {title && (
        <div className={commonStyles.cardHeader}>
          {Icon && <Icon className={commonStyles.cardIcon} size={22} />}
          <h3 className={commonStyles.cardTitle}>{title}</h3>
        </div>
      )}
      <div className={commonStyles.cardContent}>
        {children}
      </div>
    </div>
  );
};

export default Card;
