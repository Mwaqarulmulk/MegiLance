// @AI-HINT: This is an Alert component, an atomic element for displaying prominent messages to the user.
'use client';

import React from 'react';
import { FiInfo, FiCheckCircle, FiAlertTriangle, FiXCircle, FiX } from 'react-icons/fi';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './Alert.common.module.css';
import lightStyles from './Alert.light.module.css';
import darkStyles from './Alert.dark.module.css';

export interface AlertProps {
  title: string;
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  onClose?: () => void;
  className?: string;
}

const ICONS: { [key: string]: React.ReactNode } = {
  info: <FiInfo />,
  success: <FiCheckCircle />,
  warning: <FiAlertTriangle />,
  danger: <FiXCircle />,
};

const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  onClose,
  className = '',
}) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  // Return null or a skeleton if the theme isn't loaded yet
  if (!theme) return null;

  return (
    <div 
      className={cn(
        commonStyles.alert,
        themeStyles.alert,
        commonStyles[variant],
        themeStyles[variant],
        className
      )} 
      role="alert"
    >
      <div className={commonStyles.alertIcon}>{ICONS[variant]}</div>
      <div className={commonStyles.alertContent}>
        <h3 className={commonStyles.alertTitle}>{title}</h3>
        <div className={commonStyles.alertDescription}>{children}</div>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className={commonStyles.alertCloseButton} 
          aria-label="Close alert"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default Alert;
