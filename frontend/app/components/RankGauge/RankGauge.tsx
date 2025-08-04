// @AI-HINT: This component displays a dynamic semi-circle gauge. All styles are per-component only.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './RankGauge.common.css';
import './RankGauge.light.css';
import './RankGauge.dark.css';

interface RankGaugeProps {
  score: number; // A score from 0 to 100
}

const RankGauge: React.FC<RankGaugeProps> = ({ score }) => {
  const { theme } = useTheme();
  const gaugeId = React.useId();
  const safeScore = Math.min(100, Math.max(0, score || 0));
  const rotation = (safeScore / 100) * 180;

  return (
    <>
      <style>
        {`
          [data-gauge-id="${gaugeId}"] .RankGauge-fill {
            transform: rotate(${rotation}deg);
          }
        `}
      </style>
      <div className={`RankGauge RankGauge--${theme}`} data-gauge-id={gaugeId}>
        <div className="RankGauge-fill"></div>
        <div className="RankGauge-cover"></div>
        <span className="RankGauge-score">{safeScore}</span>
      </div>
    </>
  );
};

export default RankGauge;
