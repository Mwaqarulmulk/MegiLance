// @AI-HINT: This component displays a grid of key performance metrics (KPIs). It's designed for high-impact visual data representation, a hallmark of production-ready SaaS dashboards. It's fully responsive and themed.

'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Briefcase, ListTodo, Users, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardData } from '@/hooks/useDashboardData';

import commonStyles from './DashboardMetrics.common.module.css';
import lightStyles from './DashboardMetrics.light.module.css';
import darkStyles from './DashboardMetrics.dark.module.css';

// Map string names from API data to actual React icon components
const iconMap: { [key: string]: any } = {
  FaBriefcase: Briefcase,
  FaTasks: ListTodo,
  FaUsers: Users,
  FaChartBar: BarChart3,
};

const DashboardMetrics: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const { data, loading, error } = useDashboardData();

  const styles = React.useMemo(() => {
    const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;
    return { ...commonStyles, ...themeStyles } as { [k: string]: string };
  }, [resolvedTheme]);

  if (loading) {
    return (
      <div className={styles.metricsGrid} aria-busy={loading || undefined} aria-live="polite">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={cn(styles.metricIcon, styles.metricIconMuted)} />
              <span className={styles.skeletonText} />
            </div>
            <div className={styles.skeletonValue} />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data?.metrics?.length) {
    return <div role="status" className={styles.errorState}>Unable to load metrics.</div>;
  }

  return (
    <div className={styles.metricsGrid}>
      {data.metrics.map((metric) => {
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
                {isPositive ? <ArrowUp className={styles.changeIcon} size={14} /> : <ArrowDown className={styles.changeIcon} size={14} />}
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
