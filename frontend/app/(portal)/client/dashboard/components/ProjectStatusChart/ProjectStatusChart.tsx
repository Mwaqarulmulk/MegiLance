// @AI-HINT: This component displays a donut chart for project statuses using Recharts, with a custom legend and tooltip.
'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import common from './ProjectStatusChart.common.module.css';
import light from './ProjectStatusChart.light.module.css';
import dark from './ProjectStatusChart.dark.module.css';

interface ProjectStatusChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#4573DF', '#27AE60', '#F2C94C', '#E81123'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={common.customTooltip}>
        <p className={common.label}>{`${payload[0].name} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const ProjectStatusChart: React.FC<ProjectStatusChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  return (
    <div className={cn(common.chartContainer, themed.theme)}>
      <h3 className={common.chartTitle}>Project Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectStatusChart;
