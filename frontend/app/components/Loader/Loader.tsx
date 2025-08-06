// @AI-HINT: This is a Loader/Spinner component, an atomic element used for indicating loading states.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './Loader.common.module.css';
import lightStyles from './Loader.light.module.css';
import darkStyles from './Loader.dark.module.css';

interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  overlay?: boolean;
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  text, 
  overlay = false, 
  variant = 'spinner',
  className = '' 
}) => {
  const { theme } = useTheme();
  if (!theme) return null; // Avoid rendering until the theme is loaded

    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const sizeClass = {
    xs: commonStyles.sizeXs,
    sm: commonStyles.sizeSm,
    md: commonStyles.sizeMd,
    lg: commonStyles.sizeLg,
    xl: commonStyles.sizeXl,
  }[size];

  const loaderContent = (
    <div 
      className={cn(commonStyles.loader, sizeClass, className)}
      role="status"
      aria-live="polite"
      aria-label={text || 'Loading'}
    >
      <div className={cn(commonStyles.spinnerContainer, commonStyles[variant])} aria-hidden="true">
        {variant === 'dots' && (
          <>
            <div className={cn(commonStyles.dot, themeStyles.dot)}></div>
            <div className={cn(commonStyles.dot, themeStyles.dot)}></div>
            <div className={cn(commonStyles.dot, themeStyles.dot)}></div>
          </>
        )}
        {variant === 'pulse' && <div className={cn(commonStyles.pulse, themeStyles.pulse)} />}
        {variant === 'spinner' && <div className={cn(commonStyles.spinner, themeStyles.spinner)} />}
      </div>
      {text && (
        <span className={cn(commonStyles.text, themeStyles.text)}>{text}</span>
      )}
      <span className="sr-only">{text || 'Loading, please wait...'}</span>
    </div>
  );

  if (overlay) {
    return (
      <div className={cn(commonStyles.overlay, themeStyles.overlay)}>
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
