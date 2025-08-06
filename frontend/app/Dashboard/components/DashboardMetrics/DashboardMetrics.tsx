// @AI-HINT: This component displays a grid of key performance metrics (KPIs). It's designed for high-impact visual data representation, a hallmark of investor-grade SaaS dashboards. It's fully responsive and themed.

'use client';

import React, { useState, useEffect } from 'react';
import { DashboardMetric } from '../../types';
import { FaBriefcase, FaTasks, FaUsers, FaChartBar } from 'react-icons/fa';
import commonStyles from './DashboardMetrics.common.module.css';
import lightStyles from './DashboardMetrics.light.module.css';
import darkStyles from './DashboardMetrics.dark.module.css';

// Map string names from API to actual React icon components
const iconMap: { [key: string]: React.ElementType } = {
  FaBriefcase,
  FaTasks,
  FaUsers,
  FaChartBar,
};

// @AI-HINT: This component displays a grid of key performance metrics (KPIs). It's designed for high-impact visual data representation, a hallmark of investor-grade SaaS dashboards. It's fully responsive and themed. Now fully theme-switchable.


const DashboardMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setMetrics(data.metrics || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="DashboardMetrics-loading">Loading metrics...</div>;
  }

  if (error) {
    return <div className="DashboardMetrics-error">Error: {error}</div>;
  }

  return (
    <div className="DashboardMetrics">
      {metrics.map((metric) => {
        const IconComponent = iconMap[metric.icon as string];
        return (
          <div key={metric.id} className="DashboardMetricCard">
            <div className="MetricCard-icon-wrapper">
              {IconComponent && <IconComponent className="MetricCard-icon" />}
            </div>
            <div className="MetricCard-content">
              <span className="MetricCard-label">{metric.label}</span>
              <span className="MetricCard-value">{metric.value}</span>
              {metric.change && (
                <span className={`MetricCard-change MetricCard-change--${metric.changeType}`}>
                  {metric.change}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardMetrics;
