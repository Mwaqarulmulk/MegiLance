// @AI-HINT: This is a Loader/Spinner component, an atomic element used for indicating loading states.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Loader.common.css';
import './Loader.light.css';
import './Loader.dark.css';

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

  const loaderContent = (
    <div 
      className={`Loader Loader--${theme} Loader--${size} Loader--${variant} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={text || 'Loading'}
    >
      <div className="Loader-spinner" aria-hidden="true">
        {variant === 'dots' && (
          <>
            <div className="Loader-dot"></div>
            <div className="Loader-dot"></div>
            <div className="Loader-dot"></div>
          </>
        )}
        {variant === 'pulse' && <div className="Loader-pulse"></div>}
        {variant === 'spinner' && <div className="Loader-circle"></div>}
      </div>
      {text && (
        <span className="Loader-text">{text}</span>
      )}
      <span className="sr-only">{text || 'Loading, please wait...'}</span>
    </div>
  );

  if (overlay) {
    return (
      <div className={`Loader-overlay Loader-overlay--${theme}`}>
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
