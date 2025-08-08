// @AI-HINT: Client Projects list page. Theme-aware, accessible filters and animated project cards grid.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './Projects.common.module.css';
import light from './Projects.light.module.css';
import dark from './Projects.dark.module.css';

interface Project {
  id: string;
  title: string;
  status: 'Open' | 'In Progress' | 'Completed';
  budget: string;
  updated: string;
}

const PROJECTS: Project[] = [
  { id: 'p-101', title: 'Marketing site build', status: 'In Progress', budget: '$4,500', updated: '2025-08-08' },
  { id: 'p-102', title: 'iOS MVP', status: 'Open', budget: '$12,000', updated: '2025-08-06' },
  { id: 'p-103', title: 'Design system v2', status: 'Completed', budget: '$2,800', updated: '2025-07-29' },
  { id: 'p-104', title: 'Data pipeline POC', status: 'Open', budget: '$3,200', updated: '2025-08-01' },
  { id: 'p-105', title: 'Chat assistant pilot', status: 'In Progress', budget: '$6,800', updated: '2025-08-03' },
  { id: 'p-106', title: 'Billing integration', status: 'Completed', budget: '$1,900', updated: '2025-07-20' },
];

const STATUSES = ['All', 'Open', 'In Progress', 'Completed'] as const;

const Projects: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All');

  const headerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const gridVisible = useIntersectionObserver(gridRef, { threshold: 0.1 });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROJECTS.filter(p =>
      (status === 'All' || p.status === status) &&
      (!q || p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
    );
  }, [query, status]);

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <div ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <div>
            <h1 className={common.title}>Projects</h1>
            <p className={cn(common.subtitle, themed.subtitle)}>Browse and manage your projects. Filter by status and search by title or ID.</p>
          </div>
          <div className={common.controls} aria-label="Project filters">
            <label className={common.srOnly} htmlFor="q">Search</label>
            <input id="q" className={cn(common.input, themed.input)} type="search" placeholder="Search projects…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <label className={common.srOnly} htmlFor="status">Status</label>
            <select id="status" className={cn(common.select, themed.select)} value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Link className={cn(common.button, themed.button)} href="/client/post-job">Post New Job</Link>
          </div>
        </div>

        <section ref={gridRef} className={cn(common.grid, gridVisible ? common.isVisible : common.isNotVisible)} aria-label="Projects grid">
          {filtered.map(p => (
            <Link key={p.id} href={`/client/projects/${p.id}`} className={cn(common.card)}>
              <div className={cn(common.cardTitle, themed.cardTitle)}>{p.title}</div>
              <div className={cn(common.meta, themed.meta)}>
                <span className={cn(common.badge, themed.badge)}>{p.status}</span>
                <span>•</span>
                <span>{p.budget}</span>
                <span>•</span>
                <span>Updated {p.updated}</span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div role="status" aria-live="polite">No projects match your filters.</div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Projects;
