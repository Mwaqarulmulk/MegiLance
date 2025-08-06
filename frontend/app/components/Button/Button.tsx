// @AI-HINT: This is a versatile, enterprise-grade Button component for all user actions. It supports multiple variants (primary, secondary), sizes, loading/disabled states, and icons. All styles are per-component only.

'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

import commonStyles from './Button.common.module.css';
import lightStyles from './Button.light.module.css';
import darkStyles from './Button.dark.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ElementType;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();

  if (!theme) {
    return null; // Don't render until theme is resolved
  }

  const themeStyles = theme === 'light' ? lightStyles : darkStyles;

  return (
    <button
      className={cn(
        commonStyles.button,
        themeStyles.button,
        commonStyles[variant],
        themeStyles[variant],
        commonStyles[size],
        themeStyles[size],
        { [commonStyles.fullWidth]: fullWidth, [themeStyles.fullWidth]: fullWidth },
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={cn(commonStyles.icon, themeStyles.icon, commonStyles.loadingIcon, themeStyles.loadingIcon)} size={20} />
      ) : (
        <>
          {Icon && <Icon className={cn(commonStyles.icon, themeStyles.icon)} size={20} />}
          <span className={cn(commonStyles.buttonText, themeStyles.buttonText)}>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
