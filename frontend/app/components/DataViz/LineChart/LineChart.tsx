// @AI-HINT: This is a simple, non-interactive line chart component for data visualization.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './LineChart.common.css';
import './LineChart.light.css';
import './LineChart.dark.css';

export interface LineChartProps {
  data: number[];
  labels: string[];
}

const LineChart: React.FC<LineChartProps> = ({ data, labels }) => {
  const { theme } = useTheme();
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
    <div className={`LineChart-container LineChart-container--${theme}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="LineChart-svg">
        <polyline
          className={`LineChart-line LineChart-line--${theme}`}
          fill="none"
          points={points}
        />
        <g className="LineChart-labels">
          {labels.map((label, i) => (
            <text 
              key={i} 
              x={i * stepX + padding} 
              y={height - 5}
              className={`LineChart-label-text LineChart-label-text--${theme}`}
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
