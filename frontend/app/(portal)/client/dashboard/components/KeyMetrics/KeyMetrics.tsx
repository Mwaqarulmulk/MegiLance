// AI-HINT: This component displays the key performance indicators (KPIs) for the client dashboard using the modernized DashboardWidget.
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import DashboardWidget, { DashboardWidgetProps } from '@/app/components/DashboardWidget/DashboardWidget';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';
import common from './KeyMetrics.common.module.css';

interface KeyMetricsProps {
  metrics: {
    totalProjects: number;
    activeProjects: number;
    totalSpent: string;
    pendingPayments: number;
  };
  loading: boolean;
  metricCards: Omit<DashboardWidgetProps, 'value'>[];
}

const KeyMetrics: React.FC<KeyMetricsProps> = ({ metrics, loading, metricCards }) => {
  const { theme } = useTheme();

  const values = [
    metrics.totalProjects,
    metrics.activeProjects,
    metrics.totalSpent,
    metrics.pendingPayments
  ];

  if (loading) {
    return (
      <section className={common.widgetsGrid} aria-label="Loading key metrics">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={common.widgetSkeleton}>
            <Skeleton height={24} width={150} />
            <Skeleton height={36} width={100} />
            <Skeleton height={18} width={120} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className={common.widgetsGrid} aria-label="Key Metrics">
      {metricCards.map((card, index) => (
        <DashboardWidget
          key={card.title}
          {...card}
          value={String(values[index])}
        />
      ))}
    </section>
  );
};

export default KeyMetrics;
