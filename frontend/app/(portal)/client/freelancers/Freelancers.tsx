// @AI-HINT: Client Freelancers page. Theme-aware, accessible filters and animated freelancers grid.
'use client';

import React, { useId, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useClientData } from '@/hooks/useClient';
import FreelancerCard, { Freelancer } from './components/FreelancerCard/FreelancerCard';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';
import Input from '@/app/components/Input/Input';
import Select from '@/app/components/Select/Select';
import Button from '@/app/components/Button/Button';
import { Search, Download } from 'lucide-react';

import common from './Freelancers.common.module.css';
import light from './Freelancers.light.module.css';
import dark from './Freelancers.dark.module.css';

const AVAILABILITIES = ['All', 'Full-time', 'Part-time', 'Contract'] as const;
type Availability = (typeof AVAILABILITIES)[number];

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
      avatarUrl: f.avatarUrl ?? '', // Mocked for now
      title: f.title ?? f.role ?? 'Freelancer',
      rate: f.hourlyRate ?? f.rate ?? '$0/hr',
      location: f.location ?? 'Remote',
      skills: Array.isArray(f.skills) ? f.skills : ['UI/UX', 'Web Design', 'Prototyping'],
      rating: f.rating ?? (4.5 + Math.random() * 0.5),
      availability: (f.availability as Freelancer['availability']) ?? 'Contract',
    }));
  }, [freelancers]);

  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState<Availability>('All');
  type SortKey = 'name' | 'title' | 'rate' | 'location' | 'availability' | 'rating';
  const [sortKey, setSortKey] = useState<SortKey>('name');

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
    <main className={cn(common.page, themed.page)}>
      <div className={cn(common.container)}>
        <header ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <h1 className={cn(common.title, themed.title)}>Find Freelancers</h1>
          <p className={cn(common.subtitle, themed.subtitle)}>Search, filter, and connect with the perfect talent for your project.</p>
        </header>

        <section className={cn(common.controlsSection, themed.controlsSection)}>
          <div className={cn(common.filters)}>
            <Input
              id="search-query"
              type="search"
              placeholder="Search by name, title, or skills..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              iconBefore={<Search size={18} />}
              className={common.searchInput}
            />
            <Select
              id="availability-filter"
              value={availability}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAvailability(e.target.value as Availability)}
              options={AVAILABILITIES.map(a => ({ value: a, label: a }))}
              aria-label="Filter by availability"
            />
            <Select
              id="sort-key"
              value={sortKey}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortKey(e.target.value as SortKey)}
              options={[
                { value: 'name', label: 'Sort by Name' },
                { value: 'rate', label: 'Sort by Rate' },
                { value: 'rating', label: 'Sort by Rating' },
              ]}
              aria-label="Sort by field"
            />
            <Select
              id="sort-dir"
              value={sortDir}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortDir(e.target.value as 'asc' | 'desc')}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              aria-label="Sort direction"
            />
            <Button
              variant="secondary"
              onClick={() => {
                const header = ['ID','Name','Title','Rate','Location','Availability','Skills', 'Rating'];
                const data = sorted.map(f => [f.id, f.name, f.title, f.rate, f.location, f.availability, f.skills.join(' | '), f.rating.toFixed(1)]);
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
              iconBefore={<Download size={16} />}
            >
              Export CSV
            </Button>
          </div>
        </section>

        <section ref={gridRef} className={cn(common.grid, gridVisible ? common.isVisible : common.isNotVisible)} aria-live="polite">
          {loading && (
            [...Array(12)].map((_, i) => (
              <div key={i} className={common.skeletonCard}>
                <div className={common.skeletonHeader}>
                  <Skeleton height={64} width={64} shape="circle" />
                  <div className={common.skeletonHeaderText}>
                    <Skeleton height={24} width="70%" />
                    <Skeleton height={18} width="50%" />
                  </div>
                </div>
                <Skeleton height={20} width="90%" />
                <Skeleton height={40} width="100%" />
                <Skeleton height={40} width="100%" />
              </div>
            ))
          )}
          {!loading && error && <div className={common.error}>Failed to load freelancers.</div>}
          {!loading && !error && paged.map(f => (
            <FreelancerCard key={f.id} freelancer={f} />
          ))}
          {!loading && sorted.length === 0 && (
            <div className={cn(common.emptyState, themed.emptyState)}>
              <h3>No Freelancers Found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </section>

        {totalPages > 1 && (
          <div className={common.paginationBar}>
            <Button
              variant='secondary'
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
            >Previous</Button>
            <span className={cn(common.paginationInfo, themed.paginationInfo)}>Page {pageSafe} of {totalPages}</span>
            <Button
              variant='secondary'
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
            >Next</Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Freelancers;
