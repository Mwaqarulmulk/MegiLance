// @AI-HINT: This is a versatile, enterprise-grade Button component for all user actions. It supports multiple variants (primary, secondary), sizes, loading/disabled states, and icons. All styles are per-component only.

'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

import commonStyles from './Button.common.module.css';
import lightStyles from './Button.light.module.css';
import darkStyles from './Button.dark.module.css';

// Base props for the button, independent of the element type
export interface ButtonOwnProps<E extends React.ElementType = React.ElementType> {
  as?: E;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// Combined props including standard HTML attributes
export type ButtonProps<C extends React.ElementType = 'button'> = ButtonOwnProps<C> & Omit<React.ComponentProps<C>, keyof ButtonOwnProps<C>>;

const Button = <C extends React.ElementType = 'button'>({
  children,
  as,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  iconBefore,
  iconAfter,
  className = '',
  ...props
}: ButtonProps<C>) => {
  const { theme } = useTheme();
  const Component = as || 'button';

  if (!theme) return null; // Or a loading skeleton

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <Component
      className={cn(
        commonStyles.button,
        commonStyles[`variant-${variant}`],
        commonStyles[`size-${size}`],
        themeStyles.button,
        themeStyles[`variant-${variant}`],
        themeStyles[`size-${size}`],
        isLoading && commonStyles.loading,
        isLoading && themeStyles.loading,
        fullWidth && commonStyles.fullWidth,
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className={cn(commonStyles.spinner, themeStyles.spinner)} />}
      {iconBefore && !isLoading && <span className={commonStyles.iconBefore}>{iconBefore}</span>}
      <span className={cn(commonStyles.buttonText, themeStyles.buttonText, isLoading && commonStyles.loadingText)}>
        {children}
      </span>
      {iconAfter && !isLoading && <span className={commonStyles.iconAfter}>{iconAfter}</span>}
    </Component>
  );
};

export default Button;
