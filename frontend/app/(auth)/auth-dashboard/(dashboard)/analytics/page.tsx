// @AI-HINT: This is the Analytics page. It will feature charts and data visualizations to provide insights into project performance, earnings, and other key metrics.

import React from 'react';
import Card from '@/app/components/Card/Card';
import styles from './Analytics.module.css';

const AnalyticsPage = () => {
  // AI-HINT: Mock data for analytics. In a real application, this would be calculated or fetched from an API.
  const analyticsData = {
    totalEarnings: 75250.50,
    projectsCompleted: 23,
    clientSatisfaction: 4.9,
    avgResponseTime: '2 hours',
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div>
      <h1 className={styles.pageHeader}>Performance Analytics</h1>
      <div className={styles.analyticsGrid}>
        <Card title="Total Earnings">
          <p className={styles.statValue}>{formatCurrency(analyticsData.totalEarnings)}</p>
          <p className={styles.statLabel}>All time</p>
        </Card>
        <Card title="Projects Completed">
          <p className={styles.statValue}>{analyticsData.projectsCompleted}</p>
          <p className={styles.statLabel}>All time</p>
        </Card>
        <Card title="Client Satisfaction">
          <p className={styles.statValue}>{analyticsData.clientSatisfaction} / 5.0</p>
          <p className={styles.statLabel}>Based on 18 reviews</p>
        </Card>
        <Card title="Avg. Response Time">
          <p className={styles.statValue}>{analyticsData.avgResponseTime}</p>
          <p className={styles.statLabel}>Last 30 days</p>
        </Card>
        <div className={styles.mainChartContainer}>
          <Card title="Earnings Over Time">
            <div className={styles.chartPlaceholder}>
              {/* AI-HINT: A dedicated charting library (e.g., Recharts, Chart.js) will be integrated here to display dynamic data visualizations. */}
              <p>Chart will be displayed here.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
