// @AI-HINT: Interactive Reports page for analytics. Theme-aware, responsive, and animated.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import common from './Reports.common.module.css';
import light from './Reports.light.module.css';
import dark from './Reports.dark.module.css';

const revenueData = [
  { month: 'Jan', revenue: 12000, costs: 8000 },
  { month: 'Feb', revenue: 14500, costs: 9200 },
  { month: 'Mar', revenue: 16200, costs: 9800 },
  { month: 'Apr', revenue: 17400, costs: 10300 },
  { month: 'May', revenue: 19350, costs: 11250 },
  { month: 'Jun', revenue: 21000, costs: 12000 },
];

const trendData = [
  { day: 'Mon', value: 22 },
  { day: 'Tue', value: 28 },
  { day: 'Wed', value: 32 },
  { day: 'Thu', value: 31 },
  { day: 'Fri', value: 40 },
  { day: 'Sat', value: 24 },
  { day: 'Sun', value: 18 },
];

const mixData = [
  { name: 'Fixed', value: 38 },
  { name: 'Hourly', value: 44 },
  { name: 'Retainer', value: 18 },
];

const ReportsPage: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const grid = theme === 'dark' ? '#1f2433' : '#eef2ff';
  const text = theme === 'dark' ? '#e5e7eb' : '#1f2937';
  const muted = theme === 'dark' ? '#97a0b8' : '#64748b';
  const primary = '#4573df';
  const secondary = '#ff9800';
  const success = '#27AE60';

  return (
    <section className={cn('p-6', common.wrapper, themed.wrapper)}>
      <header className={cn(common.header, themed.header)}>
        <div>
          <h1 className={cn(common.title, themed.title)}>Reports</h1>
          <p className={cn(common.subtitle, themed.subtitle)}>Revenue, cost, and engagement analytics</p>
        </div>
      </header>

      <div className={cn(common.grid, themed.grid)}>
        <motion.section className={cn(common.card, themed.card)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className={cn(common.cardTitle, themed.cardTitle)}>Revenue vs Costs</h2>
          <div className={common.chartWrap} aria-label="Revenue vs Costs bar chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="month" stroke={muted} />
                <YAxis stroke={muted} />
                <Tooltip contentStyle={{ background: theme === 'dark' ? '#0b0f19' : '#ffffff', border: `1px solid ${grid}`, color: text }} />
                <Legend wrapperStyle={{ color: muted }} />
                <Bar dataKey="revenue" name="Revenue" fill={primary} radius={[6,6,0,0]} />
                <Bar dataKey="costs" name="Costs" fill={secondary} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section className={cn(common.card, themed.card)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className={cn(common.cardTitle, themed.cardTitle)}>Weekly Engagement</h2>
          <div className={common.chartWrap} aria-label="Weekly engagement line chart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="day" stroke={muted} />
                <YAxis stroke={muted} />
                <Tooltip contentStyle={{ background: theme === 'dark' ? '#0b0f19' : '#ffffff', border: `1px solid ${grid}`, color: text }} />
                <Legend wrapperStyle={{ color: muted }} />
                <Line type="monotone" dataKey="value" name="Active users" stroke={success} strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section className={cn(common.card, themed.card)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className={cn(common.cardTitle, themed.cardTitle)}>Contract Mix</h2>
          <div className={common.chartWrap} aria-label="Contract mix pie chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={mixData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                  {mixData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={[primary, secondary, success][idx % 3]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: theme === 'dark' ? '#0b0f19' : '#ffffff', border: `1px solid ${grid}`, color: text }} />
                <Legend wrapperStyle={{ color: muted }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>
    </section>
  );
};

export default ReportsPage;
