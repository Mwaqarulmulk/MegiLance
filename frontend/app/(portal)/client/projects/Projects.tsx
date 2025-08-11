// @AI-HINT: Client Projects list page. Theme-aware, accessible filters and animated project cards grid.
'use client';

import React, { useMemo, useRef, useState, useId } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useClientData } from '@/hooks/useClient';
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

const STATUSES = ['All', 'Open', 'In Progress', 'Completed'] as const;

interface ProjectCardProps {
  project: Project;
  themed: { [key: string]: string };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project: p, themed }) => {
  const titleId = useId();
  return (
    <Link key={p.id} href={`/client/projects/${p.id}`} className={cn(common.card)}>
      <article aria-labelledby={titleId}>
        <h2 id={titleId} className={cn(common.cardTitle, themed.cardTitle)}>{p.title}</h2>
        <div className={cn(common.meta, themed.meta)}>
          <span className={cn(common.badge, themed.badge)}>{p.status}</span>
          <span aria-hidden="true">•</span>
          <span>{p.budget}</span>
          <span aria-hidden="true">•</span>
          <span>Updated {p.updated}</span>
        </div>
      </article>
    </Link>
  );
};

const Projects: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const { projects, loading, error } = useClientData();

  // Unique IDs for ARIA
  const headerId = useId();
  const gridId = useId();
  const resultsId = useId();

  const rows: Project[] = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    return (projects as any[]).map((p, idx) => ({
      id: String(p.id ?? idx),
      title: p.title ?? p.name ?? 'Untitled Project',
      status: (p.status as Project['status']) ?? 'Open',
      budget: p.budget ?? '$0',
      updated: p.updatedAt ?? p.updated ?? p.createdAt ?? '',
    }));
  }, [projects]);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All');

  const headerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const gridVisible = useIntersectionObserver(gridRef, { threshold: 0.1 });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(p =>
      (status === 'All' || p.status === status) &&
      (!q || p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
    );
  }, [rows, query, status]);

  // Sorting
  type SortKey = 'title' | 'status' | 'budget' | 'updated';
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let av = '' as string;
      let bv = '' as string;
      switch (sortKey) {
        case 'title': av = a.title; bv = b.title; break;
        case 'status': av = a.status; bv = b.status; break;
        case 'budget': av = a.budget; bv = b.budget; break;
        case 'updated': av = a.updated || ''; bv = b.updated || ''; break;
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

  React.useEffect(() => { setPage(1); }, [sortKey, sortDir, query, status, pageSize]);

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <section ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)} aria-labelledby={headerId}>
          <h1 id={headerId} className={common.srOnly}>Projects Dashboard</h1>
          <div className={common.titleBar}>
            <h2 className={common.title}>Projects</h2>
            <div id={resultsId} role="status" aria-live="polite" className={common.srOnly}>
              {loading ? 'Loading projects...' : `${sorted.length} project${sorted.length === 1 ? '' : 's'} found.`}
            </div>
          </div>
          <p className={cn(common.subtitle, themed.subtitle)}>Browse and manage your projects. Filter by status and search by title or ID.</p>
          <div className={common.controls} aria-label="Project filters">
            <label className={common.srOnly} htmlFor="q">Search</label>
            <input id="q" className={cn(common.input, themed.input)} type="search" placeholder="Search projects…" value={query} onChange={(e) => setQuery(e.target.value)} title="Search by project title or ID" />
            <label className={common.srOnly} htmlFor="status">Status</label>
            <select id="status" className={cn(common.select, themed.select)} value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])} title="Filter by project status">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Link className={cn(common.button, themed.button)} href="/client/post-job" title="Post a new project">Post New Project</Link>
          </div>
        </section>

        <div className={cn(common.toolbar)}>
          <div className={common.filterGroup}>
            <label className={common.srOnly} htmlFor="sort-key">Sort by</label>
            <select id="sort-key" className={cn(common.select, themed.select)} value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} title="Sort projects by">
              <option value="updated">Updated</option>
              <option value="status">Status</option>
              <option value="title">Title</option>
              <option value="budget">Budget</option>
            </select>
            <label className={common.srOnly} htmlFor="sort-dir">Sort direction</label>
            <select id="sort-dir" className={cn(common.select, themed.select)} value={sortDir} onChange={(e) => setSortDir(e.target.value as 'asc'|'desc')} title="Sort direction">
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
            <label className={common.srOnly} htmlFor="page-size">Cards per page</label>
            <select id="page-size" className={cn(common.select, themed.select)} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} title="Set number of projects per page">
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
                const header = ['ID','Title','Status','Budget','Updated'];
                const data = sorted.map(p => [p.id, p.title, p.status, p.budget, p.updated]);
                const csv = [header, ...data]
                  .map(r => r.map(val => '"' + String(val).replace(/"/g, '""') + '"').join(','))
                  .join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `client_projects_${new Date().toISOString().slice(0,10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              title="Export the filtered and sorted list of projects to a CSV file"
            >Export CSV</button>
          </div>
        </div>

        <section ref={gridRef} className={cn(common.grid, gridVisible ? common.isVisible : common.isNotVisible)} aria-labelledby={gridId}>
          <h2 id={gridId} className={common.srOnly}>Projects List</h2>
          {loading && <div className={common.skeletonRow} aria-busy={!!loading} />}
          {error && <div className={common.error}>Failed to load projects.</div>}
          {paged.map(p => (
            <ProjectCard key={p.id} project={p} themed={themed} />
          ))}
          {sorted.length === 0 && !loading && (
            <div role="status" aria-live="polite">No projects match your filters.</div>
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

export default Projects;
