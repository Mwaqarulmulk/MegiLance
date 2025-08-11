// @AI-HINT: This component provides a fully theme-aware dashboard to visualize review sentiment. It uses the self-contained BarChart component and passes brand-aligned colors for data visualization, ensuring a consistent and premium user experience.
'use client';

import React from 'react';
import SentimentAnalyzer from '@/app/components/AI/SentimentAnalyzer/SentimentAnalyzer';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './ReviewSentimentDashboard.common.module.css';
import lightStyles from './ReviewSentimentDashboard.light.module.css';
import darkStyles from './ReviewSentimentDashboard.dark.module.css';

// Mock data for the dashboard


const ReviewSentimentDashboard: React.FC = () => {
  const { theme } = useTheme();

    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.reviewSentimentDashboardContainer, themeStyles.reviewSentimentDashboardContainer)}>
      <h2 className={cn(commonStyles.reviewSentimentDashboardTitle, themeStyles.reviewSentimentDashboardTitle)}>Review Sentiment Analysis</h2>
      <SentimentAnalyzer score={0.75} />
    </div>
  );
};

export default ReviewSentimentDashboard;
