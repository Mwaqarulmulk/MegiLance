// @AI-HINT: Interactive Calendar page under the portal group. Uses per-component styles and framer-motion micro-interactions. Theme-aware and responsive.
'use client';

import React, { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import common from './Calendar.common.module.css';
import light from './Calendar.light.module.css';
import dark from './Calendar.dark.module.css';

// Lightweight calendar generator
function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: { date: Date; isCurrentMonth: boolean }[] = [];
  const startOffset = firstDay.getDay();

  // previous month spill
  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, -i);
    days.unshift({ date: d, isCurrentMonth: false });
  }
  // current month
  for (let d = 1; d <= lastDay.getDate(); d++) days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  // next month spill to fill 42 cells
  while (days.length % 7 !== 0 || days.length < 42) {
    const last = days[days.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    days.push({ date: next, isCurrentMonth: false });
  }
  return days;
}

const CalendarPage: React.FC = () => {
  const { theme } = useTheme();
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const days = useMemo(() => getMonthDays(cursor.y, cursor.m), [cursor]);
  const monthLabel = new Date(cursor.y, cursor.m).toLocaleString('default', { month: 'long', year: 'numeric' });
  const themed = theme === 'dark' ? dark : light;

  const changeMonth = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  const cellVariants = { hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } };

  return (
    <section className={cn('p-6', common.container, themed.container)}>
      <header className={cn('mb-4 flex items-center justify-between', common.header, themed.header)}>
        <button onClick={() => changeMonth(-1)} className={cn(common.btn, themed.btn)}>
          <ChevronLeft size={16} /> Prev
        </button>
        <h1 className={cn(common.title, themed.title)}>{monthLabel}</h1>
        <button onClick={() => changeMonth(1)} className={cn(common.btn, themed.btn)}>
          Next <ChevronRight size={16} />
        </button>
      </header>

      <div className={cn('grid grid-cols-7 text-xs mb-1', common.week, themed.week)}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="px-2 py-1">{d}</div>
        ))}
      </div>

      <motion.div className={cn('grid grid-cols-7 gap-1', common.grid, themed.grid)} initial="hidden" animate="visible" transition={{ staggerChildren: 0.01 }}>
        {days.map(({ date, isCurrentMonth }) => {
          const isToday = date.toDateString() === now.toDateString();
          return (
            <motion.button
              key={date.toISOString()}
              variants={cellVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(common.cell, themed.cell, !isCurrentMonth && themed.muted, isToday && themed.today)}
              title={date.toDateString()}
            >
              <div className={cn(common.day, themed.day)}>{date.getDate()}</div>
              <div className={cn(common.meta, themed.meta)}>No events</div>
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
};

export default CalendarPage;
