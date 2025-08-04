// @AI-HINT: This component provides a dashboard to visualize the sentiment of user reviews, helping admins monitor platform health.
'use client';

import React from 'react';
import BarChart from '@/app/components/BarChart/BarChart';
import { useTheme } from '@/app/contexts/ThemeContext';
import './ReviewSentimentDashboard.common.css';
import './ReviewSentimentDashboard.light.css';
import './ReviewSentimentDashboard.dark.css';

// Mock data for the dashboard
const sentimentData = {
  overall: 78,
  positive: 1250,
  neutral: 300,
  negative: 80,
  breakdown: [
    { sentiment: 'Positive', percentage: 78 },
    { sentiment: 'Neutral', percentage: 18 },
    { sentiment: 'Negative', percentage: 4 },
  ],
};

const ReviewSentimentDashboard: React.FC = () => {
  const { theme } = useTheme();

  const chartData = sentimentData.breakdown.map(item => ({
    label: item.sentiment,
    value: item.percentage,
  }));

  return (
    <div className={`Dashboard-container Dashboard-container--${theme}`}>
      <h2 className="Dashboard-title">Review Sentiment Dashboard</h2>
      <div className="Dashboard-grid">
        <div className={`Dashboard-card Dashboard-card--${theme}`}>
          <h3 className="Card-title">Overall Sentiment Score</h3>
          <p className={`Card-metric Card-metric--positive`}>{sentimentData.overall}%</p>
          <p className="Card-description">Based on {sentimentData.positive + sentimentData.neutral + sentimentData.negative} reviews</p>
        </div>
        <div className={`Dashboard-card Dashboard-card--${theme}`}>
          <h3 className="Card-title">Sentiment Breakdown</h3>
          <BarChart data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default ReviewSentimentDashboard;
