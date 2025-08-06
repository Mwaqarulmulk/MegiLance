// @AI-HINT: This is a simple, non-interactive line chart component for data visualization.
'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import commonStyles from './LineChart.common.module.css';
import lightStyles from './LineChart.light.module.css';
import darkStyles from './LineChart.dark.module.css';

export interface LineChartProps {
  data: number[];
  labels: string[];
}

const LineChart: React.FC<LineChartProps> = ({ data, labels }) => {
  const width = 500;
  const height = 200;
  const padding = 20;

  const maxX = width - padding * 2;
  const maxY = height - padding * 2;
  const stepX = maxX / (data.length - 1);
  const maxValue = Math.max(...data);

  const points = data.map((d, i) => {
    const x = i * stepX + padding;
    const y = height - (d / maxValue) * maxY - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={commonStyles.lineChartContainer}>
      <svg viewBox={`0 0 ${width} ${height}`} className={commonStyles.lineChartSvg}>
        <polyline
          className={commonStyles.line}
          points={points}
        />
        <g className={commonStyles.labels}>
          {labels.map((label, i) => (
            <text 
              key={i} 
              x={i * stepX + padding} 
              y={height - 5}
              className={commonStyles.labelText}
            >
              {label}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default LineChart;
