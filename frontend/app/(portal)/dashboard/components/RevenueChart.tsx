// @AI-HINT: Interactive, theme-aware revenue area chart using Recharts. Includes subtle animations and responsive layout.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const mockData = [
  { month: 'Jan', value: 12_000 },
  { month: 'Feb', value: 14_500 },
  { month: 'Mar', value: 13_200 },
  { month: 'Apr', value: 16_800 },
  { month: 'May', value: 18_100 },
  { month: 'Jun', value: 21_400 },
  { month: 'Jul', value: 23_300 },
  { month: 'Aug', value: 24_900 },
  { month: 'Sep', value: 22_600 },
  { month: 'Oct', value: 25_700 },
  { month: 'Nov', value: 27_200 },
  { month: 'Dec', value: 30_500 },
];

const RevenueChart: React.FC<{ height?: number }> = ({ height = 260 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const stroke = isDark ? '#7aa2ff' : '#4573df';
  const fill = isDark ? 'rgba(122,162,255,0.25)' : 'rgba(69,115,223,0.2)';
  const grid = isDark ? '#1c2230' : '#eef2ff';
  const text = isDark ? '#cdd6f4' : '#1f2937';

  return (
    <div aria-label="Revenue trend chart">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={mockData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" />
          <XAxis dataKey="month" stroke={text} />
          <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} stroke={text} />
          <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} labelClassName="text-sm" />
          <Area type="monotone" dataKey="value" stroke={stroke} fill="url(#revGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
