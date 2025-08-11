// @AI-HINT: This component displays a bar chart for monthly spending using Recharts, with a custom tooltip and theme-aware styling.
'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import common from './SpendingChart.common.module.css';
import light from './SpendingChart.light.module.css';
import dark from './SpendingChart.dark.module.css';

interface SpendingChartProps {
  data: { name: string; spending: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={common.customTooltip}>
        <p className={common.label}>{`${label}`}</p>
        <p className={common.intro}>{`Spending : $${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  return (
    <div className={cn(common.chartContainer, themed.theme)}>
      <h3 className={common.chartTitle}>Monthly Spending</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Legend iconType="circle" />
          <Bar dataKey="spending" fill="#4573DF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingChart;
