// @AI-HINT: This component provides a dashboard to visualize the sentiment of user reviews, helping admins monitor platform health.
'use client';

import React from 'react';
import BarChart from '@/app/components/BarChart/BarChart';
import { useTheme } from '@/app/contexts/ThemeContext';
import commonStyles from './ReviewSentimentDashboard.common.module.css';
import lightStyles from './ReviewSentimentDashboard.light.module.css';
import darkStyles from './ReviewSentimentDashboard.dark.module.css';

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

  const styles = {
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  };

  return (
    <div className={styles.reviewSentimentDashboardContainer}>
      <h2 className={styles.reviewSentimentDashboardTitle}>Review Sentiment Dashboard</h2>
      <div className={styles.reviewSentimentDashboardGrid}>
        <div className={styles.reviewSentimentDashboardCard}>
          <h3 className={styles.cardTitle}>Overall Sentiment Score</h3>
          <p className={`${styles.cardMetric} ${styles.cardMetricPositive}`}>{sentimentData.overall}%</p>
          <p className={styles.cardDescription}>Based on {sentimentData.positive + sentimentData.neutral + sentimentData.negative} reviews</p>
        </div>
        <div className={styles.reviewSentimentDashboardCard}>
          <h3 className={styles.cardTitle}>Sentiment Breakdown</h3>
          <BarChart data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default ReviewSentimentDashboard;
