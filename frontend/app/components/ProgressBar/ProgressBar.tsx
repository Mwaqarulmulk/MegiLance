// @AI-HINT: This is a ProgressBar component, an atomic element used for displaying progress.
'use client';

import React from 'react';
import './ProgressBar.common.css';
import './ProgressBar.light.css';
import './ProgressBar.dark.css';

interface ProgressBarProps {
  progress: number; // A value from 0 to 100
  theme?: 'light' | 'dark';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, theme = 'light' }) => {
  const progressId = React.useId();
  const safeProgress = Math.min(100, Math.max(0, progress || 0));

  return (
    <>
      <style>
        {`
          [data-progress-id="${progressId}"] .ProgressBar-fill {
            width: ${safeProgress}%;
          }
        `}
      </style>
      <div className={`ProgressBar ProgressBar--${theme}`} data-progress-id={progressId}>
        <div className="ProgressBar-fill"></div>
      </div>
    </>
  );
};

export default ProgressBar;
