// @AI-HINT: This is the refactored Freelancer Projects page, featuring a premium layout, advanced search/filter bar, and a grid of available projects.
'use client';

import React, { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import ProjectCard from '@/app/components/ProjectCard/ProjectCard';
import Input from '@/app/components/Input/Input';
import Button from '@/app/components/Button/Button';
import { useFreelancerData } from '@/hooks/useFreelancer';
import commonStyles from './Projects.common.module.css';
import lightStyles from './Projects.light.module.css';
import darkStyles from './Projects.dark.module.css';

const Projects: React.FC = () => {
  const { theme } = useTheme();
  const { jobs, loading, error } = useFreelancerData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'title' | 'clientName' | 'budget' | 'postedTime'>('postedTime');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const filteredProjects = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    const query = searchQuery.trim().toLowerCase();
    return jobs
      .filter(job => 
        !query || 
        job.title?.toLowerCase().includes(query) ||
        job.clientName?.toLowerCase().includes(query) ||
        job.skills?.some(skill => skill.toLowerCase().includes(query))
      )
      .map((job, idx) => ({
        id: String(job.id ?? idx),
        title: job.title ?? 'Untitled Project',
        clientName: job.clientName ?? 'Unknown Client',
        budget: job.budget ?? '$0',
        postedTime: job.postedTime ?? 'Unknown',
        tags: Array.isArray(job.skills) ? job.skills : [],
      }));
  }, [jobs, searchQuery]);

  const sortedProjects = useMemo(() => {
    const list = [...filteredProjects];
    list.sort((a, b) => {
      const av = String(a[sortKey] ?? '').toLowerCase();
      const bv = String(b[sortKey] ?? '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredProjects, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const pagedProjects = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sortedProjects.slice(start, start + pageSize);
  }, [sortedProjects, pageSafe, pageSize]);

  const onExportCSV = () => {
    const header = ['Title', 'Client', 'Budget', 'Posted'];
    const rows = sortedProjects.map(p => [p.title, p.clientName, p.budget, p.postedTime]);
    const csv = [header, ...rows]
      .map(cols => cols.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'freelancer-projects.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header} role="region" aria-label="Projects header" title="Projects header">
        <h1 className={styles.title}>Find Your Next Project</h1>
        <p className={styles.subtitle}>
          Browse thousands of jobs and find the perfect match for your skills.
        </p>
      </header>

      {loading && <div className={styles.loading} aria-busy="true">Loading projects...</div>}
      {error && <div className={styles.error}>Failed to load projects.</div>}

      <div className={styles.searchFilterBar}>
        <div className={styles.searchInput}>
          <label htmlFor="proj-search" className={styles.srOnly}>Search projects</label>
          <Input
            id="proj-search"
            type="text"
            placeholder="Search by keyword, skill, or company..."
            title="Search projects"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />
        </div>
        <div className={styles.toolbar} role="group" aria-label="Sorting and actions" title="Sorting and actions">
          <label htmlFor="sort" className={styles.srOnly}>Sort by</label>
          <select
            id="sort"
            className={styles.select}
            value={`${sortKey}:${sortDir}`}
            onChange={(e) => {
              const [k, d] = e.target.value.split(':') as [typeof sortKey, typeof sortDir];
              setSortKey(k);
              setSortDir(d);
              setPage(1);
            }}
            aria-label="Sort projects"
            title="Sort projects"
          >
            <option value="postedTime:desc">Newest</option>
            <option value="postedTime:asc">Oldest</option>
            <option value="title:asc">Title A–Z</option>
            <option value="title:desc">Title Z–A</option>
            <option value="clientName:asc">Client A–Z</option>
            <option value="clientName:desc">Client Z–A</option>
          </select>
          <Button variant="secondary" onClick={onExportCSV} aria-label="Export current results to CSV" title="Export current results to CSV">Export CSV</Button>
          <label htmlFor="pageSize" className={styles.srOnly}>Results per page</label>
          <select
            id="pageSize"
            className={styles.select}
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            aria-label="Results per page"
            title="Results per page"
          >
            {[12, 24, 48].map(sz => <option key={sz} value={sz}>{sz}/page</option>)}
          </select>
        </div>
        <span className={styles.srOnly} aria-live="polite">
          {`${sortedProjects.length} result${sortedProjects.length === 1 ? '' : 's'}. `}
          {searchQuery ? `Filter: "${searchQuery}". ` : ''}
          {`Sort: ${sortKey} ${sortDir}. Page size: ${pageSize}.`}
        </span>
      </div>

      <div className={styles.projectGrid} role="region" aria-label="Project results" title="Project results">
        {pagedProjects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
        {sortedProjects.length === 0 && !loading && (
          <div className={styles.emptyState}>
            {searchQuery ? 'No projects match your search.' : 'No projects available.'}
          </div>
        )}
      </div>

      {sortedProjects.length > 0 && (
        <div className={styles.paginationBar} role="navigation" aria-label="Pagination" title="Pagination">
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            aria-label="Previous page"
            title="Previous page"
            disabled={pageSafe === 1}
          >
            Prev
          </Button>
          <span className={styles.paginationInfo} aria-live="polite">Page {pageSafe} of {totalPages} · {sortedProjects.length} result(s)</span>
          <Button
            variant="primary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            aria-label="Next page"
            title="Next page"
            disabled={pageSafe === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Projects;
