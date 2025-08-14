'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import common from './KPITiles.common.module.css';
import light from './KPITiles.light.module.css';
import dark from './KPITiles.dark.module.css';

const KPITiles: React.FC = () => {
  const { theme } = useTheme();
  if (!theme) return null;
  const themed = theme === 'dark' ? dark : light;

  const tiles = [
    { title: 'Monthly Revenue', value: '$48,920', delta: '+12.4% MoM' },
    { title: 'Active Projects', value: '42', delta: '+5 this week' },
    { title: 'New Messages', value: '18', delta: '+3 today' },
    { title: 'Disputes Open', value: '2', delta: '0 since yesterday' },
  ];

  return (
    <section aria-label="Key performance indicators" className={common.grid}>
      {tiles.map((t) => (
        <article key={t.title} className={cn(common.card, themed.card)}>
          <h3 className={cn(common.title, themed.title)}>{t.title}</h3>
          <div className={cn(common.value, themed.value)}>{t.value}</div>
          <div className={cn(common.delta, themed.delta)}>{t.delta}</div>
        </article>
      ))}
    </section>
  );
};

export default KPITiles;
