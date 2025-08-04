// @AI-HINT: This component renders a dynamic bar chart. All styles are per-component only.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './BarChart.common.css';
import './BarChart.light.css';
import './BarChart.dark.css';

export interface BarChartDataItem {
  label: string;
  value: number;
  color?: string; // Optional color override
}

interface BarChartProps {
  data: BarChartDataItem[];
}

const Bar: React.FC<{ item: BarChartDataItem }> = ({ item }) => {
  const barId = React.useId();
  const safeValue = Math.min(100, Math.max(0, item.value || 0));

  return (
    <>
      <style>
        {`
          [data-bar-id="${barId}"] .BarChart-bar {
            width: ${safeValue}%;
            ${item.color ? `background-color: ${item.color};` : ''}
          }
        `}
      </style>
      <div className="BarChart-bar-container" data-bar-id={barId}>
        <span className="BarChart-label">{item.label}</span>
        <div className="BarChart-bar-wrapper">
          <div className={`BarChart-bar BarChart-bar--${item.label.toLowerCase()}`}></div>
        </div>
        <span className="BarChart-percentage">{item.value}%</span>
      </div>
    </>
  );
};

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const { theme } = useTheme();

  return (
    <div className={`BarChart BarChart--${theme}`}>
      {data.map(item => (
        <Bar key={item.label} item={item} />
      ))}
    </div>
  );
};

export default BarChart;
