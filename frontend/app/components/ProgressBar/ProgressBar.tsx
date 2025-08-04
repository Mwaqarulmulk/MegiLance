// @AI-HINT: This is a ProgressBar component, an atomic element used for displaying progress.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './ProgressBar.common.css';
import './ProgressBar.light.css';
import './ProgressBar.dark.css';

interface ProgressBarProps {
  progress: number; // A value from 0 to 100
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  striped?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  size = 'md',
  variant = 'default',
  label,
  showPercentage = false,
  animated = false,
  striped = false,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}) => {
  const { theme } = useTheme();
  const progressId = React.useId();
  const safeProgress = Math.min(100, Math.max(0, progress || 0));
  
  const progressBarClasses = [
    'ProgressBar',
    `ProgressBar--${theme}`,
    `ProgressBar--${size}`,
    `ProgressBar--${variant}`,
    striped && 'ProgressBar--striped',
    animated && 'ProgressBar--animated',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="ProgressBar-container">
      {(label || showPercentage) && (
        <div className="ProgressBar-header">
          {label && (
            <span className="ProgressBar-label" id={`${progressId}-label`}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="ProgressBar-percentage">
              {Math.round(safeProgress)}%
            </span>
          )}
        </div>
      )}
      <div 
        className={progressBarClasses}
        role="progressbar"
        aria-valuenow={safeProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || (label ? undefined : `Progress: ${Math.round(safeProgress)}%`)}
        aria-labelledby={label ? `${progressId}-label` : undefined}
        aria-describedby={ariaDescribedBy}
        style={{
          '--progress-value': `${safeProgress}%`
        } as React.CSSProperties}
      >
        <div className="ProgressBar-track">
          <div className="ProgressBar-fill" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
