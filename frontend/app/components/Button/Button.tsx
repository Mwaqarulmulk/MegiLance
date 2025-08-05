// @AI-HINT: This is a versatile, enterprise-grade Button component for all user actions. It supports multiple variants (primary, secondary), sizes, loading/disabled states, and icons. All styles are per-component only.

'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { Loader2 } from 'lucide-react';

import commonStyles from './Button.common.module.css';
import lightStyles from './Button.light.module.css';
import darkStyles from './Button.dark.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  icon?: React.ElementType;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();

  if (!theme) {
    return null; // Don't render until theme is resolved
  }

  const themeStyles = theme === 'light' ? lightStyles : darkStyles;

  const buttonClasses = `
    ${commonStyles.button}
    ${commonStyles[variant]}
    ${commonStyles[size]}
    ${themeStyles.button}
    ${themeStyles[variant]}
    ${className}
  `;

  return (
    <button className={buttonClasses} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <Loader2 className={`${commonStyles.icon} ${commonStyles.loadingIcon}`} size={20} />
      ) : (
        <>
          {Icon && <Icon className={commonStyles.icon} size={20} />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
