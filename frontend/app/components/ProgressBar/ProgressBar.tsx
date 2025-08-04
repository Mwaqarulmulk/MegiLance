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
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`ProgressBar ProgressBar--${theme}`}>
      <div
        className="ProgressBar-fill"
        style={{ width: `${clampedProgress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
