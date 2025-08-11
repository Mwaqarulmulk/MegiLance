// @AI-HINT: Client Freelancers page. Theme-aware, accessible filters and animated freelancers grid.
'use client';

import React, { useMemo, useRef, useState, useId } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useClientData } from '@/hooks/useClient';
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

const AVAILABILITIES = ['All', 'Full-time', 'Part-time', 'Contract'] as const;

interface FreelancerCardProps {
  freelancer: Freelancer;
  themed: { [key: string]: string };
}

const FreelancerCard: React.FC<FreelancerCardProps> = ({ freelancer: f, themed }) => {
  const nameId = useId();
  return (
    <article className={cn(common.card)} aria-labelledby={nameId}>
      <h2 id={nameId} className={cn(common.cardTitle, themed.cardTitle)}>{f.name}</h2>
      <div className={cn(common.meta, themed.meta)}>
        <span>{f.title}</span>
        <span aria-hidden="true">•</span>
        <span>{f.rate}</span>
        <span aria-hidden="true">•</span>
        <span>{f.location}</span>
      </div>
      <div className={cn(common.tags)}>
        <h3 className={common.srOnly}>Skills</h3>
        <ul aria-label={`Skills for ${f.name}`}>
          {f.skills.map(s => (
            <li key={s} className={cn(common.badge, themed.badge)}>{s}</li>
          ))}
        </ul>
      </div>
      <div className={cn(common.meta, themed.meta)}>
        <h3 className={common.srOnly}>Availability</h3>
        <p className={cn(common.badge, themed.badge)}>{f.availability}</p>
      </div>
      <div>
        <Link className={cn(common.button, themed.button)} href={`/client/hire?freelancer=${f.id}`} title={`Hire ${f.name}`}>Hire {f.name.split(' ')[0]}</Link>
      </div>
    </article>
  );
};

const Freelancers: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const { freelancers, loading, error } = useClientData();

  // Unique IDs for ARIA
  const headerId = useId();
  const gridId = useId();
  const resultsId = useId();

  const rows: Freelancer[] = useMemo(() => {
    if (!Array.isArray(freelancers)) return [];
    return (freelancers as any[]).map((f, idx) => ({
      id: String(f.id ?? idx),
      name: f.name ?? 'Unknown',
      title: f.title ?? f.role ?? 'Freelancer',
      rate: f.hourlyRate ?? f.rate ?? '$0/hr',
      location: f.location ?? 'Remote',
      skills: Array.isArray(f.skills) ? f.skills : [],
      availability: (f.availability as Freelancer['availability']) ?? 'Contract',
    }));
  }, [freelancers]);

  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState<(typeof AVAILABILITIES)[number]>('All');

  const headerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const gridVisible = useIntersectionObserver(gridRef, { threshold: 0.1 });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(f =>
      (availability === 'All' || f.availability === availability) &&
      (!q || f.name.toLowerCase().includes(q) || f.title.toLowerCase().includes(q) || f.skills.join(' ').toLowerCase().includes(q))
    );
  }, [rows, query, availability]);

  // Sorting
  type SortKey = 'name' | 'title' | 'rate' | 'location' | 'availability';
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const parseRate = (r: string) => {
    const m = r.replace(/[^0-9.]/g, '');
    const n = parseFloat(m);
    return Number.isFinite(n) ? n : 0;
  };
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      switch (sortKey) {
        case 'name': av = a.name; bv = b.name; break;
        case 'title': av = a.title; bv = b.title; break;
        case 'rate': av = parseRate(a.rate); bv = parseRate(b.rate); break;
        case 'location': av = a.location; bv = b.location; break;
        case 'availability': av = a.availability; bv = b.availability; break;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageSafe, pageSize]);

  React.useEffect(() => { setPage(1); }, [sortKey, sortDir, query, availability, pageSize]);

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <section ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)} aria-labelledby={headerId}>
          <h2 id={headerId} className={common.srOnly}>Freelancer Filters and Controls</h2>
          <div className={common.titleBar}>
            <h1 className={common.title}>My Freelancers</h1>
            <div id={resultsId} role="status" aria-live="polite" className={common.srOnly}>
              {loading ? 'Loading freelancers...' : `${sorted.length} freelancer${sorted.length === 1 ? '' : 's'} found.`}
            </div>
          </div>
          <p className={common.subtitle}>Search, filter, and manage your network of freelancers.</p>
          <div className={common.controls}>
            <div className={common.filterGroup}>
              <label className={common.srOnly} htmlFor="search-freelancers">Search by name, title, or skill</label>
              <input
                id="search-freelancers"
                type="search"
                placeholder="Search by name, title, or skill..."
                className={cn(common.input, themed.input)}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                title="Search by name, title, or skill"
              />
              <label className={common.srOnly} htmlFor="availability-filter">Filter by availability</label>
              <select
                id="availability-filter"
                className={cn(common.select, themed.select)}
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
                title="Filter by availability"
              >
                {AVAILABILITIES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className={common.filterGroup}>
              <label className={common.srOnly} htmlFor="sort-key">Sort by</label>
              <select id="sort-key" className={cn(common.select, themed.select)} value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} title="Sort by">
                <option value="name">Name</option>
                <option value="title">Title</option>
                <option value="rate">Rate</option>
                <option value="location">Location</option>
                <option value="availability">Availability</option>
              </select>
              <label className={common.srOnly} htmlFor="sort-dir">Sort direction</label>
              <select id="sort-dir" className={cn(common.select, themed.select)} value={sortDir} onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')} title="Sort direction">
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
              <label className={common.srOnly} htmlFor="page-size">Cards per page</label>
              <select id="page-size" className={cn(common.select, themed.select)} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} title="Cards per page">
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
            <div>
              <button
                type="button"
                className={cn(common.button, themed.button, 'secondary')}
                onClick={() => {
                  const header = ['ID','Name','Title','Rate','Location','Availability','Skills'];
                  const data = sorted.map(f => [f.id, f.name, f.title, f.rate, f.location, f.availability, f.skills.join(' | ')]);
                  const csv = [header, ...data]
                    .map(r => r.map(val => '"' + String(val).replace(/"/g, '""') + '"').join(','))
                    .join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `client_freelancers_${new Date().toISOString().slice(0,10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                title="Export the filtered and sorted list of freelancers to a CSV file"
              >Export CSV</button>
            </div>
          </div>
        </section>

        <section ref={gridRef} className={cn(common.grid, gridVisible ? common.isVisible : common.isNotVisible)} aria-labelledby={gridId}>
          <h2 id={gridId} className={common.srOnly}>Freelancers List</h2>
          {loading && <div className={common.skeletonRow} aria-busy={loading} />}
          {error && <div className={common.error}>Failed to load freelancers.</div>}
          {paged.map(f => (
            <FreelancerCard key={f.id} freelancer={f} themed={themed} />
          ))}
          {sorted.length === 0 && !loading && (
            <div role="status" aria-live="polite">No freelancers match your filters.</div>
          )}
        </section>
        {sorted.length > 0 && (
          <div className={common.paginationBar} role="navigation" aria-label="Pagination">
            <button
              type="button"
              className={cn(common.button, themed.button, 'secondary')}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
              aria-label="Previous page"
              title="Go to the previous page"
            >Prev</button>
            <span className={common.paginationInfo} aria-live="polite" aria-atomic="true">Page {pageSafe} of {totalPages}</span>
            <button
              type="button"
              className={cn(common.button, themed.button)}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
              aria-label="Next page"
              title="Go to the next page"
            >Next</button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Freelancers;
