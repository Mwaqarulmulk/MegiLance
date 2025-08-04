// @AI-HINT: This component analyzes text sentiment and displays it visually. All styles are per-component only.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './SentimentAnalyzer.common.css';
import './SentimentAnalyzer.light.css';
import './SentimentAnalyzer.dark.css';

interface SentimentAnalyzerProps {
  // A score from -1 (very negative) to 1 (very positive)
  score: number;
}

const getSentimentDetails = (score: number) => {
  if (score > 0.2) {
    return { label: 'Positive', color: '#2ecc71' }; // Emerald green
  }
  if (score < -0.2) {
    return { label: 'Negative', color: '#e74c3c' }; // Alizarin red
  }
  return { label: 'Neutral', color: '#95a5a6' }; // Asbestos gray
};

const SentimentAnalyzer: React.FC<SentimentAnalyzerProps> = ({ score }) => {
  const { theme } = useTheme();
  const analyzerId = React.useId();
  const { label, color } = getSentimentDetails(score);

  return (
    <>
      <style>
        {`
          [data-analyzer-id="${analyzerId}"] .SentimentAnalyzer-indicator {
            background-color: ${color};
            /* A simple heuristic for text color contrast */
            color: ${color === '#ffd700' || color === '#2ecc71' ? '#1f2937' : '#ffffff'};
          }
        `}
      </style>
      <div className={`SentimentAnalyzer SentimentAnalyzer--${theme}`} data-analyzer-id={analyzerId}>
        <span className="SentimentAnalyzer-label">Sentiment:</span>
        <span className="SentimentAnalyzer-indicator">
          {label}
        </span>
      </div>
    </>
  );
};

export default SentimentAnalyzer;
