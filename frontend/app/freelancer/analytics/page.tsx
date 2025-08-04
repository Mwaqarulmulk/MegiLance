// @AI-HINT: This page displays performance analytics for the freelancer, including views, applications, and earnings.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import LineChart from '@/app/components/DataViz/LineChart/LineChart';
import './AnalyticsPage.common.css';
import './AnalyticsPage.light.css';
import './AnalyticsPage.dark.css';

// @AI-HINT: Mock data for analytics.
const analyticsData = {
  kpis: {
    profileViews: 1256,
    applicationsSent: 48,
    hireRate: '12.5%',
    totalEarned: 5250.00,
  },
  viewsOverTime: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [300, 450, 600, 550, 800, 1256],
  },
  earningsOverTime: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [500, 800, 1200, 2000, 3500, 5250],
  },
};

const AnalyticsPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`AnalyticsPage-container AnalyticsPage-container--${theme}`}>
      <header className="AnalyticsPage-header">
        <h1 className="AnalyticsPage-title">Your Analytics</h1>
        <p className="AnalyticsPage-subtitle">Track your performance and find new opportunities for growth.</p>
      </header>

      <main className="AnalyticsPage-main">
        <div className="AnalyticsPage-kpi-grid">
          <div className={`AnalyticsPage-kpi-card AnalyticsPage-kpi-card--${theme}`}>
            <span className="AnalyticsPage-kpi-label">Profile Views</span>
            <span className="AnalyticsPage-kpi-value">{analyticsData.kpis.profileViews}</span>
          </div>
          <div className={`AnalyticsPage-kpi-card AnalyticsPage-kpi-card--${theme}`}>
            <span className="AnalyticsPage-kpi-label">Applications Sent</span>
            <span className="AnalyticsPage-kpi-value">{analyticsData.kpis.applicationsSent}</span>
          </div>
          <div className={`AnalyticsPage-kpi-card AnalyticsPage-kpi-card--${theme}`}>
            <span className="AnalyticsPage-kpi-label">Hire Rate</span>
            <span className="AnalyticsPage-kpi-value">{analyticsData.kpis.hireRate}</span>
          </div>
          <div className={`AnalyticsPage-kpi-card AnalyticsPage-kpi-card--${theme}`}>
            <span className="AnalyticsPage-kpi-label">Total Earned (USD)</span>
            <span className="AnalyticsPage-kpi-value">${analyticsData.kpis.totalEarned.toFixed(2)}</span>
          </div>
        </div>

        <div className={`AnalyticsPage-chart-card AnalyticsPage-chart-card--${theme}`}>
          <h2 className="AnalyticsPage-card-title">Profile Views Over Time</h2>
          <LineChart data={analyticsData.viewsOverTime.data} labels={analyticsData.viewsOverTime.labels} />
        </div>

        <div className={`AnalyticsPage-chart-card AnalyticsPage-chart-card--${theme}`}>
          <h2 className="AnalyticsPage-card-title">Earnings Over Time</h2>
          <LineChart data={analyticsData.earningsOverTime.data} labels={analyticsData.earningsOverTime.labels} />
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
