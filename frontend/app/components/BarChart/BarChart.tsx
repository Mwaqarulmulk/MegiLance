// @AI-HINT: This component renders a dynamic bar chart. All styles are per-component only.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './BarChart.common.module.css';
import lightStyles from './BarChart.light.module.css';
import darkStyles from './BarChart.dark.module.css';

export interface BarChartDataItem {
  label: string;
  value: number;
  color?: string; // Optional color override
}

interface BarChartProps {
  data: BarChartDataItem[];
  className?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, className }) => {
  const { theme } = useTheme();
  if (!theme) return null;

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.barChart, themeStyles.barChart, className)}>
      {data.map(item => {
        const safeValue = Math.min(100, Math.max(0, item.value || 0));
        const barStyle = {
          width: `${safeValue}%`,
          ...(item.color && { '--bar-color': item.color }),
        } as React.CSSProperties;

        return (
          <div key={item.label} className={cn(commonStyles.container, themeStyles.container)}>
            <span className={cn(commonStyles.label, themeStyles.label)}>{item.label}</span>
            <div className={cn(commonStyles.wrapper, themeStyles.wrapper)}>
              <div
                className={cn(commonStyles.bar, themeStyles.bar)}
                style={barStyle}
                role="progressbar"
                aria-valuenow={safeValue}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.label}: ${item.value}%`}
              ></div>
            </div>
            <span className={cn(commonStyles.percentage, themeStyles.percentage)}>{item.value}%</span>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;
