// @AI-HINT: This is a premium, investor-grade Review Sentiment Dashboard. It features advanced data visualization, interactive filters, and a detailed breakdown of recent reviews. The component is fully theme-aware and uses a sophisticated layout to present complex data in an intuitive way.

'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Card from '@/app/components/Card/Card';
import Select from '@/app/components/Select/Select';
import BarChart from '@/app/components/BarChart/BarChart';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';

import commonStyles from './ReviewSentimentDashboard.common.module.css';
import lightStyles from './ReviewSentimentDashboard.light.module.css';
import darkStyles from './ReviewSentimentDashboard.dark.module.css';

// Mock Data for a richer, more realistic dashboard
const sentimentData = {
  overall: 78,
  positive: 125,
  neutral: 42,
  negative: 18,
  trend: [
    { label: 'Jan', value: 65 },
    { label: 'Feb', value: 68 },
    { label: 'Mar', value: 75 },
    { label: 'Apr', value: 72 },
    { label: 'May', value: 78 },
    { label: 'Jun', value: 81 },
  ],
  distribution: [
    { label: 'Positive', value: 125, color: '#27AE60' },
    { label: 'Neutral', value: 42, color: '#F2C94C' },
    { label: 'Negative', value: 18, color: '#e81123' },
  ],
  recentReviews: [
    { id: 1, user: 'Alice Johnson', avatar: '/avatars/alice.png', sentiment: 'Positive', text: 'Absolutely fantastic service, exceeded all my expectations!' },
    { id: 2, user: 'Bob Williams', avatar: '/avatars/bob.png', sentiment: 'Negative', text: 'The project was delayed and communication was poor.' },
    { id: 3, user: 'Charlie Brown', avatar: '/avatars/charlie.png', sentiment: 'Neutral', text: 'The outcome was satisfactory, but there is room for improvement.' },
    { id: 4, user: 'Diana Prince', avatar: '/avatars/diana.png', sentiment: 'Positive', text: 'A truly professional and delightful experience from start to finish.' },
  ],
};

const timeRangeOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
];

const ReviewSentimentDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState('30d');
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const getSentimentClass = (sentiment: string) => {
    if (sentiment === 'Positive') return themeStyles.sentimentPositive;
    if (sentiment === 'Negative') return themeStyles.sentimentNegative;
    return themeStyles.sentimentNeutral;
  };

  return (
    <div className={cn(commonStyles.dashboardContainer, themeStyles.dashboardContainer)}>
      <header className={commonStyles.dashboardHeader}>
        <h1 className={cn(commonStyles.dashboardTitle, themeStyles.dashboardTitle)}>Sentiment Dashboard</h1>
        <Select
          id="time-range-select"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          options={timeRangeOptions}
          className={cn(commonStyles.timeRangeTrigger, themeStyles.timeRangeTrigger)}
        />
      </header>

      <div className={commonStyles.metricsGrid}>
        <Card className={cn(commonStyles.metricCard, themeStyles.metricCard)}>
          <h3 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>Overall Score</h3>
          <p className={cn(commonStyles.cardMetric, themeStyles.cardMetricPositive)}>{sentimentData.overall}%</p>
          <p className={cn(commonStyles.cardDescription, themeStyles.cardDescription)}>+2.5% from last month</p>
        </Card>
        <Card className={cn(commonStyles.metricCard, themeStyles.metricCard)}>
          <h3 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>Positive Reviews</h3>
          <p className={cn(commonStyles.cardMetric, themeStyles.cardMetric)}>{sentimentData.positive}</p>
           <p className={cn(commonStyles.cardDescription, themeStyles.cardDescription)}>Total positive feedback</p>
        </Card>
        <Card className={cn(commonStyles.metricCard, themeStyles.metricCard)}>
          <h3 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>Neutral Reviews</h3>
          <p className={cn(commonStyles.cardMetric, themeStyles.cardMetric)}>{sentimentData.neutral}</p>
           <p className={cn(commonStyles.cardDescription, themeStyles.cardDescription)}>Total neutral feedback</p>
        </Card>
        <Card className={cn(commonStyles.metricCard, themeStyles.metricCard)}>
          <h3 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>Negative Reviews</h3>
          <p className={cn(commonStyles.cardMetric, themeStyles.cardMetric)}>{sentimentData.negative}</p>
           <p className={cn(commonStyles.cardDescription, themeStyles.cardDescription)}>Total negative feedback</p>
        </Card>
      </div>

      <div className={commonStyles.chartsGrid}>
        <Card className={cn(commonStyles.chartCard, themeStyles.chartCard)}>
          <h3 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>Sentiment Trend</h3>
          <div className={commonStyles.chartPlaceholder}>
             <BarChart data={sentimentData.trend} />
          </div>
        </Card>
        <Card className={cn(commonStyles.chartCard, themeStyles.chartCard)}>
          <h3 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>Sentiment Distribution</h3>
           <div className={commonStyles.chartPlaceholder}>
             <BarChart data={sentimentData.distribution} />
          </div>
        </Card>
      </div>
      
      <Card className={cn(commonStyles.reviewsCard, themeStyles.reviewsCard)}>
        <h3 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>Recent Reviews</h3>
        <ul className={commonStyles.reviewsList}>
          {sentimentData.recentReviews.map(review => (
            <li key={review.id} className={cn(commonStyles.reviewItem, themeStyles.reviewItem)}>
              <div className={commonStyles.reviewAuthor}>
                <UserAvatar name={review.user} src={review.avatar} size="small" />
                <span className={cn(commonStyles.reviewUser, themeStyles.reviewUser)}>{review.user}</span>
              </div>
              <p className={cn(commonStyles.reviewText, themeStyles.reviewText)}>{review.text}</p>
              <span className={cn(commonStyles.reviewSentiment, getSentimentClass(review.sentiment))}>
                {review.sentiment}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default ReviewSentimentDashboard;
