// @AI-HINT: This component displays a grid of key performance metrics (KPIs). It's designed for high-impact visual data representation, a hallmark of investor-grade SaaS dashboards. It's fully responsive and themed.

'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { FaBriefcase, FaTasks, FaUsers, FaChartBar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { mockMetrics } from '../../mock-data';

import commonStyles from './DashboardMetrics.common.module.css';
import lightStyles from './DashboardMetrics.light.module.css';
import darkStyles from './DashboardMetrics.dark.module.css';

// Map string names from mock data to actual React icon components
const iconMap: { [key: string]: React.ElementType } = {
  FaBriefcase,
  FaTasks,
  FaUsers,
  FaChartBar,
};

const DashboardMetrics: React.FC = () => {
  const { theme } = useTheme();

  const styles = React.useMemo(() => {
    const themeStyles = theme === 'light' ? lightStyles : darkStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  return (
    <div className={styles.metricsGrid}>
      {mockMetrics.map((metric) => {
        const IconComponent = iconMap[metric.icon];
        const isPositive = metric.changeType === 'increase';

        return (
          <div key={metric.id} className={styles.metricCard}>
            <div className={styles.metricHeader}>
              {IconComponent && <IconComponent className={styles.metricIcon} />}
              <span>{metric.label}</span>
            </div>
            <div className={styles.metricValue}>{metric.value}</div>
            {metric.change && (
              <div className={cn(styles.metricChange, isPositive ? styles.positiveChange : styles.negativeChange)}>
                {isPositive ? <FaArrowUp className={styles.changeIcon} /> : <FaArrowDown className={styles.changeIcon} />}
                <span>{metric.change}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DashboardMetrics;
