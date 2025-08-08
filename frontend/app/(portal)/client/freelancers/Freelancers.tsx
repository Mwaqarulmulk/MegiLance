// @AI-HINT: Client Freelancers page. Theme-aware, accessible filters and animated freelancers grid.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './Freelancers.common.module.css';
import light from './Freelancers.light.module.css';
import dark from './Freelancers.dark.module.css';

interface Freelancer {
  id: string;
  name: string;
  title: string;
  rate: string; // e.g., "$65/hr"
  location: string;
  skills: string[];
  availability: 'Full-time' | 'Part-time' | 'Contract';
}

const FREELANCERS: Freelancer[] = [
  { id: 'f-201', name: 'Alex Johnson', title: 'Senior Frontend Engineer', rate: '$85/hr', location: 'Remote (US)', skills: ['React', 'Next.js', 'TypeScript', 'CSS Modules'], availability: 'Contract' },
  { id: 'f-202', name: 'Priya Sharma', title: 'Product Designer', rate: '$70/hr', location: 'Remote (EU)', skills: ['Figma', 'Design Systems', 'Prototyping'], availability: 'Part-time' },
  { id: 'f-203', name: 'Wei Chen', title: 'ML Engineer', rate: '$120/hr', location: 'Remote (APAC)', skills: ['Python', 'LLMs', 'Vector DBs'], availability: 'Contract' },
  { id: 'f-204', name: 'Sara Kim', title: 'Fullstack Engineer', rate: '$95/hr', location: 'Remote (US)', skills: ['Node.js', 'Next.js', 'Postgres'], availability: 'Full-time' },
  { id: 'f-205', name: 'Diego López', title: 'iOS Developer', rate: '$110/hr', location: 'Remote (LATAM)', skills: ['Swift', 'SwiftUI', 'Combine'], availability: 'Contract' },
  { id: 'f-206', name: 'Lina Müller', title: 'QA Automation', rate: '$65/hr', location: 'Remote (EU)', skills: ['Playwright', 'Cypress', 'Jest'], availability: 'Part-time' },
];

const AVAILABILITIES = ['All', 'Full-time', 'Part-time', 'Contract'] as const;

const Freelancers: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState<(typeof AVAILABILITIES)[number]>('All');

  const headerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const gridVisible = useIntersectionObserver(gridRef, { threshold: 0.1 });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FREELANCERS.filter(f =>
      (availability === 'All' || f.availability === availability) &&
      (!q || f.name.toLowerCase().includes(q) || f.title.toLowerCase().includes(q) || f.skills.join(' ').toLowerCase().includes(q))
    );
  }, [query, availability]);

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <div ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <div>
            <h1 className={common.title}>Freelancers</h1>
            <p className={cn(common.subtitle, themed.subtitle)}>Search and filter to find the perfect talent. Browse profiles and start the hire flow.</p>
          </div>
          <div className={common.controls} aria-label="Freelancer filters">
            <label className={common.srOnly} htmlFor="q">Search</label>
            <input id="q" className={cn(common.input, themed.input)} type="search" placeholder="Search by name, skill, or title…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <label className={common.srOnly} htmlFor="availability">Availability</label>
            <select id="availability" className={cn(common.select, themed.select)} value={availability} onChange={(e) => setAvailability(e.target.value as (typeof AVAILABILITIES)[number])}>
              {AVAILABILITIES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <Link className={cn(common.button, themed.button)} href="/client/hire">Go to Hire Flow</Link>
          </div>
        </div>

        <section ref={gridRef} className={cn(common.grid, gridVisible ? common.isVisible : common.isNotVisible)} aria-label="Freelancers grid">
          {filtered.map(f => (
            <article key={f.id} className={cn(common.card)}>
              <div className={cn(common.cardTitle, themed.cardTitle)}>{f.name}</div>
              <div className={cn(common.meta, themed.meta)}>
                <span>{f.title}</span>
                <span>•</span>
                <span>{f.rate}</span>
                <span>•</span>
                <span>{f.location}</span>
              </div>
              <div className={cn(common.tags)} aria-label={`Skills for ${f.name}`}>
                {f.skills.map(s => (
                  <span key={s} className={cn(common.badge, themed.badge)}>{s}</span>
                ))}
              </div>
              <div className={cn(common.meta, themed.meta)}>
                <span className={cn(common.badge, themed.badge)}>{f.availability}</span>
              </div>
              <div>
                <Link className={cn(common.button, themed.button)} href={`/client/hire?freelancer=${f.id}`}>Hire {f.name.split(' ')[0]}</Link>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div role="status" aria-live="polite">No freelancers match your filters.</div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Freelancers;
