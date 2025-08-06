// @AI-HINT: This component analyzes text sentiment and displays it visually. All styles are per-component only.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './SentimentAnalyzer.common.module.css';
import lightStyles from './SentimentAnalyzer.light.module.css';
import darkStyles from './SentimentAnalyzer.dark.module.css';

interface SentimentAnalyzerProps {
  // A score from -1 (very negative) to 1 (very positive)
  score: number;
  className?: string;
}

const getSentimentDetails = (score: number) => {
  if (score > 0.2) {
    return { label: 'Positive', bgColor: '#2ecc71', textColor: '#ffffff' }; // Emerald green
  }
  if (score < -0.2) {
    return { label: 'Negative', bgColor: '#e74c3c', textColor: '#ffffff' }; // Alizarin red
  }
  return { label: 'Neutral', bgColor: '#95a5a6', textColor: '#ffffff' }; // Asbestos gray
};

const SentimentAnalyzer: React.FC<SentimentAnalyzerProps> = ({ score, className }) => {
  const { theme } = useTheme();
  if (!theme) return null;

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const { label, bgColor, textColor } = getSentimentDetails(score);

  const indicatorStyle = {
    '--indicator-bg-color': bgColor,
    '--indicator-text-color': textColor,
  } as React.CSSProperties;

  return (
    <div className={cn(commonStyles.container, themeStyles.themeWrapper, className)}>
      <span className={commonStyles.label}>Sentiment:</span>
      <span className={commonStyles.indicator} style={indicatorStyle}>
        {label}
      </span>
    </div>
  );
};

export default SentimentAnalyzer;
