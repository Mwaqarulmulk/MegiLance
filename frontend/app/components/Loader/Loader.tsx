// @AI-HINT: This is a Loader/Spinner component, an atomic element used for indicating loading states.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
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

  const loaderClasses = cn(
    commonStyles.loader,
    commonStyles[size],
    commonStyles[variant],
    themeStyles.themeWrapper,
    className
  );

  const loaderContent = (
    <div 
      className={loaderClasses}
      role="status"
      aria-live="polite"
      aria-label={text || 'Loading'}
    >
      <div className={commonStyles.spinnerContainer} aria-hidden="true">
        {variant === 'dots' && (
          <>
            <div className={commonStyles.dot}></div>
            <div className={commonStyles.dot}></div>
            <div className={commonStyles.dot}></div>
          </>
        )}
        {variant === 'pulse' && <div />}
        {variant === 'spinner' && <div />}
      </div>
      {text && (
        <span className={commonStyles.text}>{text}</span>
      )}
      <span className="sr-only">{text || 'Loading, please wait...'}</span>
    </div>
  );

  if (overlay) {
    return (
      <div className={cn(commonStyles.overlay, themeStyles.themeWrapper)}>
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
