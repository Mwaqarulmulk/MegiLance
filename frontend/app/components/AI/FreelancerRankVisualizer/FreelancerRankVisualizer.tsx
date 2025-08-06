// @AI-HINT: This component provides a visual representation of a freelancer's rank. All styles are per-component only.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './FreelancerRankVisualizer.common.module.css';
import lightStyles from './FreelancerRankVisualizer.light.module.css';
import darkStyles from './FreelancerRankVisualizer.dark.module.css';

interface FreelancerRankVisualizerProps {
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  score: number; // A score from 0 to 1000
  className?: string;
}

const rankTiers = {
  Bronze: { color: '#cd7f32' },
  Silver: { color: '#c0c0c0' },
  Gold: { color: '#ffd700' },
  Platinum: { color: '#e5e4e2' },
  Diamond: { color: '#b9f2ff' },
};

const FreelancerRankVisualizer: React.FC<FreelancerRankVisualizerProps> = ({ rank, score, className }) => {
  const { theme } = useTheme();
  if (!theme) return null;

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const normalizedScore = Math.min(Math.max(score, 0), 1000);
  const progressPercentage = (normalizedScore / 1000) * 100;
  const rankColor = rankTiers[rank]?.color || '#c0c0c0';

  const progressBarStyle = {
    '--progress-width': `${progressPercentage}%`,
    '--progress-color': rankColor,
  } as React.CSSProperties;

  return (
    <div className={cn(commonStyles.container, themeStyles.themeWrapper, className)}>
      <div className={commonStyles.header}>
        <h3 className={commonStyles.rankName}>{rank} Tier</h3>
        <p className={commonStyles.score}>Score: {score}</p>
      </div>
      <div className={commonStyles.progressBarContainer}>
        <div className={commonStyles.progressBar} style={progressBarStyle}></div>
      </div>
    </div>
  );
};

export default FreelancerRankVisualizer;
