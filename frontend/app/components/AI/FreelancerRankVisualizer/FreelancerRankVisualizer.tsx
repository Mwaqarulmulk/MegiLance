// @AI-HINT: This component provides a visual representation of a freelancer's rank. All styles are per-component only.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './FreelancerRankVisualizer.common.css';
import './FreelancerRankVisualizer.light.css';
import './FreelancerRankVisualizer.dark.css';

interface FreelancerRankVisualizerProps {
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  score: number; // A score from 0 to 1000
}

const rankTiers = {
  Bronze: { min: 0, color: '#cd7f32' },
  Silver: { min: 200, color: '#c0c0c0' },
  Gold: { min: 400, color: '#ffd700' },
  Platinum: { min: 600, color: '#e5e4e2' },
  Diamond: { min: 800, color: '#b9f2ff' },
};

const FreelancerRankVisualizer: React.FC<FreelancerRankVisualizerProps> = ({ rank, score }) => {
  const { theme } = useTheme();
  const visualizerId = React.useId();
  const normalizedScore = Math.min(Math.max(score, 0), 1000);
  const progressPercentage = (normalizedScore / 1000) * 100;
  const rankColor = rankTiers[rank]?.color || '#c0c0c0';

  return (
    <>
      <style>
        {`
          [data-visualizer-id="${visualizerId}"] .RankVisualizer-progress-bar {
            width: ${progressPercentage}%;
            background-color: ${rankColor};
          }
        `}
      </style>
      <div className={`RankVisualizer RankVisualizer--${theme}`} data-visualizer-id={visualizerId}>
        <div className="RankVisualizer-header">
          <h3 className="RankVisualizer-rank-name">{rank} Tier</h3>
          <p className="RankVisualizer-score">Score: {score}</p>
        </div>
        <div className="RankVisualizer-progress-bar-container">
          <div className="RankVisualizer-progress-bar"></div>
        </div>
      </div>
    </>
  );
};

export default FreelancerRankVisualizer;
