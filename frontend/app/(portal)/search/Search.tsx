// @AI-HINT: Portal Search page. Theme-aware, accessible, animated with filters and results list.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
import common from './Search.common.module.css';
import light from './Search.light.module.css';
import dark from './Search.dark.module.css';

type Result = {
  id: string;
  title: string;
  snippet: string;
  type: 'Message' | 'Project' | 'User' | 'Invoice';
  date: string; // ISO or human
};

const MOCK_RESULTS: Result[] = [
  { id: 'r1', title: 'Design review notes', snippet: 'We agreed on updating the spacing tokens…', type: 'Project', date: '2025-08-01' },
  { id: 'r2', title: 'Chat with Sofia', snippet: 'Pushed latest Next.js optimizations…', type: 'Message', date: '2025-08-06' },
  { id: 'r3', title: 'Invoice INV-204', snippet: 'Invoice paid successfully — $2,400', type: 'Invoice', date: '2025-07-28' },
  { id: 'r4', title: 'Hannah Lee', snippet: 'Product Designer — Accessibility, Design Systems', type: 'User', date: '2025-07-20' },
];

const TYPES = ['All', 'Message', 'Project', 'User', 'Invoice'] as const;
const DATES = ['Any time', 'Past week', 'Past month', 'Past year'] as const;

const Search: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const { notify } = useToaster();

  const [query, setQuery] = useState('');
  const [type, setType] = useState<(typeof TYPES)[number]>('All');
  const [date, setDate] = useState<(typeof DATES)[number]>('Any time');

  const headerRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const resultsVisible = useIntersectionObserver(resultsRef, { threshold: 0.1 });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byQuery = q
      ? MOCK_RESULTS.filter(
          (r) => r.title.toLowerCase().includes(q) || r.snippet.toLowerCase().includes(q)
        )
      : MOCK_RESULTS;
    const byType = type === 'All' ? byQuery : byQuery.filter((r) => r.type === type);

    const dayMs = 24 * 60 * 60 * 1000;
    const withinDate = (d: string) => {
      if (date === 'Any time') return true;
      const now = new Date();
      const dt = new Date(d);
      const diff = now.getTime() - dt.getTime();
      if (date === 'Past week') return diff <= 7 * dayMs;
      if (date === 'Past month') return diff <= 31 * dayMs;
      if (date === 'Past year') return diff <= 365 * dayMs;
      return true;
    };

    const byDate = byType.filter((r) => withinDate(r.date));
    return byDate;
  }, [query, type, date]);

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <div ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <h1 className={common.title}>Search</h1>
          <p className={common.subtitle}>Find messages, projects, teammates, and invoices across your workspace.</p>
        </div>

        <div className={cn(common.controls)} role="search" aria-label="Global search controls">
          <label className={common.srOnly} htmlFor="q">Query</label>
          <input
            id="q"
            className={common.input}
            type="search"
            placeholder="Search everything…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <label className={common.srOnly} htmlFor="type">Type</label>
          <select id="type" className={common.select} value={type} onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label className={common.srOnly} htmlFor="date">Date</label>
          <select id="date" className={common.select} value={date} onChange={(e) => setDate(e.target.value as (typeof DATES)[number])}>
            {DATES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div ref={resultsRef} className={cn(common.results, resultsVisible ? common.isVisible : common.isNotVisible)} role="list" aria-label="Search results">
          {results.map((r) => (
            <article key={r.id} role="listitem" className={common.card} aria-labelledby={`res-${r.id}-title`}>
              <h3 id={`res-${r.id}-title`} className={common.cardTitle}>{r.title}</h3>
              <div className={common.cardMeta}>{r.type} • {r.date}</div>
              <p>{r.snippet}</p>
            </article>
          ))}
        </div>

        {results.length === 0 && (
          <EmptyState
            title="No results found"
            description="Try a different query or adjust filters to broaden your search."
            action={
              <button
                type="button"
                className={common.select}
                onClick={() => notify({ title: 'Tip', description: 'Use broader keywords or select All types.', variant: 'info', duration: 2500 })}
              >
                Get Search Tips
              </button>
            }
          />
        )}
      </div>
    </main>
  );
};

export default Search;
