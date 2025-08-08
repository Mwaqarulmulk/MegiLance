// @AI-HINT: Jobs page: theme-aware, animated, accessible job listings with filters. Per-component CSS modules only.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './Jobs.common.module.css';
import light from './Jobs.light.module.css';
import dark from './Jobs.dark.module.css';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  budget: string;
  description: string;
  featured?: boolean;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior React/Next.js Engineer',
    company: 'MegiLance Labs',
    location: 'Remote',
    type: 'Full-time',
    budget: '$120k–$160k',
    description:
      'Build premium-grade interfaces with Next.js, TypeScript, and modular CSS. Own performance and a11y.',
    featured: true,
  },
  {
    id: '2',
    title: 'Solidity Engineer (USDC Escrow)',
    company: 'StableCircle',
    location: 'EU Remote',
    type: 'Contract',
    budget: '$90–$130/hr',
    description:
      'Design audited smart contracts for escrow and milestone payouts. Strong testing culture required.',
  },
  {
    id: '3',
    title: 'AI/ML Engineer (Ranking)',
    company: 'SignalRank',
    location: 'Hybrid — London',
    type: 'Full-time',
    budget: '$150k–$190k',
    description:
      'Ship ranking models for marketplace quality. Own data pipeline, evaluation, and production inference.',
  },
  {
    id: '4',
    title: 'Product Designer',
    company: 'BlueOrbit',
    location: 'Remote',
    type: 'Part-time',
    budget: '$60–$90/hr',
    description:
      'Design investor-grade experiences across marketing and portal UIs. Figma mastery required.',
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'Opsly',
    location: 'Remote',
    type: 'Full-time',
    budget: '$130k–$170k',
    description:
      'Own CI/CD, observability, and infra as code. Experience with Vercel, Docker, and DX excellence.',
  },
  {
    id: '6',
    title: 'Technical Writer',
    company: 'DocForge',
    location: 'Remote',
    type: 'Contract',
    budget: '$70–$100/hr',
    description:
      'Create clear guides, API docs, and UX copy. Align with brand tone and a11y standards.',
  },
];

const Jobs: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');

  const headerRef = useRef<HTMLElement | null>(null);
  const filtersRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const filtersVisible = useIntersectionObserver(filtersRef, { threshold: 0.1 });
  const gridVisible = useIntersectionObserver(gridRef, { threshold: 0.1 });

  const filtered = useMemo(() => {
    return mockJobs.filter((j) => {
      const qMatch = q
        ? [j.title, j.company, j.description].some((v) => v.toLowerCase().includes(q.toLowerCase()))
        : true;
      const locMatch = location ? j.location.toLowerCase().includes(location.toLowerCase()) : true;
      const typeMatch = type ? j.type === (type as Job['type']) : true;
      return qMatch && locMatch && typeMatch;
    });
  }, [q, location, type]);

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <header
          ref={headerRef as any}
          className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}
        >
          <h1 className={common.headerTitle}>Explore Jobs</h1>
          <p className={common.headerText}>Find investor-grade opportunities with transparent budgets and clear scopes.</p>
        </header>

        <div
          ref={filtersRef}
          className={cn(common.filters, filtersVisible ? common.isVisible : common.isNotVisible)}
          role="search"
          aria-label="Job search filters"
        >
          <label className={common.label} htmlFor="job-q">Search</label>
          <input
            id="job-q"
            className={common.input}
            type="search"
            placeholder="Role, company, or keyword"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search jobs by keyword"
          />

          <div>
            <label className={common.label} htmlFor="job-location">Location</label>
            <input
              id="job-location"
              className={common.input}
              type="text"
              placeholder="Remote, London, EU, ..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Filter by location"
            />
          </div>

          <div>
            <label className={common.label} htmlFor="job-type">Type</label>
            <select
              id="job-type"
              className={common.select}
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Filter by job type"
            >
              <option value="">Any</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <button className={common.searchButton} type="button" aria-label="Apply filters">
            Search
          </button>
        </div>

        <div
          ref={gridRef}
          className={cn(common.grid, gridVisible ? common.isVisible : common.isNotVisible)}
          role="list"
          aria-label="Job results"
        >
          {filtered.map((job) => (
            <article key={job.id} className={common.card} role="listitem" aria-labelledby={`job-${job.id}-title`}>
              <div className={common.cardHeader}>
                <h3 id={`job-${job.id}-title`} className={common.cardTitle}>{job.title}</h3>
                {job.featured && (
                  <span className={cn(common.cardBadge)} aria-label="Featured job">Featured</span>
                )}
              </div>
              <div className={common.cardMeta}>
                <span>{job.company}</span>
                <span>{job.location}</span>
                <span>{job.type}</span>
                <span>{job.budget}</span>
              </div>
              <p className={common.cardDesc}>{job.description}</p>
              <div className={common.cardFooter}>
                <button className={cn(common.cardButton)} aria-label={`View details for ${job.title}`}>View Details</button>
                <button className={cn(common.cardButton, common.cardButtonSecondary)} aria-label={`Save ${job.title}`}>Save</button>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && (
          <div role="status" aria-live="polite" className={common.headerText}>
            No jobs match your filters. Try adjusting your search.
          </div>
        )}
      </div>
    </main>
  );
};

export default Jobs;
