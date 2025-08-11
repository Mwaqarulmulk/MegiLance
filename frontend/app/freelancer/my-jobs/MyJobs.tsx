// @AI-HINT: This is the refactored 'My Jobs' page, featuring a premium two-column layout and the specialized JobStatusCard for a clean, professional presentation.
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import JobStatusCard from './components/JobStatusCard/JobStatusCard';
import commonStyles from './MyJobs.common.module.css';
import lightStyles from './MyJobs.light.module.css';
import darkStyles from './MyJobs.dark.module.css';
import { usePersistedState } from '@/app/lib/hooks/usePersistedState';
import { exportCSV, exportData } from '@/app/lib/csv';
import DataToolbar, { SortOption } from '@/app/components/DataToolbar/DataToolbar';
import PaginationBar from '@/app/components/PaginationBar/PaginationBar';
import TableSkeleton from '@/app/components/DataTableExtras/TableSkeleton';
import SavedViewsMenu from '@/app/components/DataTableExtras/SavedViewsMenu';

const activeJobs = [
  {
    title: 'AI-Powered Content Generation Platform',
    client: 'ContentAI Solutions',
    status: 'Development',
    progress: 65,
  },
  {
    title: 'Real-Time IoT Data Visualization Dashboard',
    client: 'Connected Devices Inc.',
    status: 'Client Review',
    progress: 90,
  },
  {
    title: 'Mobile App for Financial Literacy',
    client: 'FinEd Mobile',
    status: 'UI/UX Design',
    progress: 40,
  },
];

const completedJobs = [
  {
    title: 'Corporate Website Redesign',
    client: 'Global Synergy Corp',
    status: 'Completed',
    progress: 100,
    completionDate: '2025-08-01',
  },
  {
    title: 'Cloud Migration & Infrastructure Setup',
    client: 'ScaleFast Startups',
    status: 'Completed',
    progress: 100,
    completionDate: '2025-07-22',
  },
];

const MyJobs: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  // Active section controls
  const [qActive, setQActive] = usePersistedState<string>('freelancer:my-jobs:active:q', '');
  const [sortActiveKey, setSortActiveKey] = usePersistedState<'title' | 'client' | 'status' | 'progress'>('freelancer:my-jobs:active:sortKey', 'title');
  const [sortActiveDir, setSortActiveDir] = usePersistedState<'asc' | 'desc'>('freelancer:my-jobs:active:sortDir', 'asc');
  const [pageActive, setPageActive] = usePersistedState<number>('freelancer:my-jobs:active:page', 1);
  const [pageActiveSize, setPageActiveSize] = usePersistedState<number>('freelancer:my-jobs:active:pageSize', 6);
  const [loadingActive, setLoadingActive] = useState(false);
  const [uiLoadingActive, setUiLoadingActive] = useState(false);

  const filteredActive = useMemo(() => {
    const q = qActive.trim().toLowerCase();
    return activeJobs.filter(j =>
      !q || j.title.toLowerCase().includes(q) || j.client.toLowerCase().includes(q) || j.status.toLowerCase().includes(q)
    );
  }, [qActive]);

  const sortedActive = useMemo(() => {
    const list = [...filteredActive];
    list.sort((a, b) => {
      if (sortActiveKey === 'progress') {
        if (a.progress < b.progress) return sortActiveDir === 'asc' ? -1 : 1;
        if (a.progress > b.progress) return sortActiveDir === 'asc' ? 1 : -1;
        return 0;
      }
      const av = String((a as any)[sortActiveKey]).toLowerCase();
      const bv = String((b as any)[sortActiveKey]).toLowerCase();
      if (av < bv) return sortActiveDir === 'asc' ? -1 : 1;
      if (av > bv) return sortActiveDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredActive, sortActiveKey, sortActiveDir]);

  const totalActivePages = Math.max(1, Math.ceil(sortedActive.length / pageActiveSize));
  const pageActiveSafe = Math.min(pageActive, totalActivePages);
  const pagedActive = useMemo(() => {
    const start = (pageActiveSafe - 1) * pageActiveSize;
    return sortedActive.slice(start, start + pageActiveSize);
  }, [sortedActive, pageActiveSafe, pageActiveSize]);

  const exportActiveCSV = () => {
    const header = ['Title', 'Client', 'Status', 'Progress'];
    const rows = sortedActive.map(j => [j.title, j.client, j.status, String(j.progress)]);
    exportCSV(header, rows, 'my-jobs-active');
  };

  const exportActive = (format: 'csv' | 'xlsx' | 'pdf') => {
    const header = ['Title', 'Client', 'Status', 'Progress'];
    const rows = sortedActive.map(j => [j.title, j.client, j.status, String(j.progress)]);
    exportData(format, header, rows, 'my-jobs-active');
  };

  useEffect(() => {
    setUiLoadingActive(true);
    const t = setTimeout(() => setUiLoadingActive(false), 120);
    return () => clearTimeout(t);
  }, [qActive, sortActiveKey, sortActiveDir, pageActive, pageActiveSize]);

  // Completed section controls
  const [qCompleted, setQCompleted] = usePersistedState<string>('freelancer:my-jobs:completed:q', '');
  const [sortCompletedKey, setSortCompletedKey] = usePersistedState<'title' | 'client' | 'completionDate'>('freelancer:my-jobs:completed:sortKey', 'completionDate');
  const [sortCompletedDir, setSortCompletedDir] = usePersistedState<'asc' | 'desc'>('freelancer:my-jobs:completed:sortDir', 'desc');
  const [pageCompleted, setPageCompleted] = usePersistedState<number>('freelancer:my-jobs:completed:page', 1);
  const [pageCompletedSize, setPageCompletedSize] = usePersistedState<number>('freelancer:my-jobs:completed:pageSize', 6);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [uiLoadingCompleted, setUiLoadingCompleted] = useState(false);

  const filteredCompleted = useMemo(() => {
    const q = qCompleted.trim().toLowerCase();
    return completedJobs.filter(j =>
      !q || j.title.toLowerCase().includes(q) || j.client.toLowerCase().includes(q)
    );
  }, [qCompleted]);

  const sortedCompleted = useMemo(() => {
    const list = [...filteredCompleted];
    list.sort((a, b) => {
      if (sortCompletedKey === 'completionDate') {
        const ta = Date.parse(a.completionDate as string);
        const tb = Date.parse(b.completionDate as string);
        if (ta < tb) return sortCompletedDir === 'asc' ? -1 : 1;
        if (ta > tb) return sortCompletedDir === 'asc' ? 1 : -1;
        return 0;
      }
      const av = String((a as any)[sortCompletedKey]).toLowerCase();
      const bv = String((b as any)[sortCompletedKey]).toLowerCase();
      if (av < bv) return sortCompletedDir === 'asc' ? -1 : 1;
      if (av > bv) return sortCompletedDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredCompleted, sortCompletedKey, sortCompletedDir]);

  const totalCompletedPages = Math.max(1, Math.ceil(sortedCompleted.length / pageCompletedSize));
  const pageCompletedSafe = Math.min(pageCompleted, totalCompletedPages);
  const pagedCompleted = useMemo(() => {
    const start = (pageCompletedSafe - 1) * pageCompletedSize;
    return sortedCompleted.slice(start, start + pageCompletedSize);
  }, [sortedCompleted, pageCompletedSafe, pageCompletedSize]);

  const exportCompletedCSV = () => {
    const header = ['Title', 'Client', 'Status', 'Completed On'];
    const rows = sortedCompleted.map(j => [j.title, j.client, j.status, j.completionDate ?? '']);
    exportCSV(header, rows, 'my-jobs-completed');
  };

  const exportCompleted = (format: 'csv' | 'xlsx' | 'pdf') => {
    const header = ['Title', 'Client', 'Status', 'Completed On'];
    const rows = sortedCompleted.map(j => [j.title, j.client, j.status, j.completionDate ?? '']);
    exportData(format, header, rows, 'my-jobs-completed');
  };

  useEffect(() => {
    setUiLoadingCompleted(true);
    const t = setTimeout(() => setUiLoadingCompleted(false), 120);
    return () => clearTimeout(t);
  }, [qCompleted, sortCompletedKey, sortCompletedDir, pageCompleted, pageCompletedSize]);

  useEffect(() => {
    setLoadingActive(true);
    const t = setTimeout(() => setLoadingActive(false), 120);
    return () => clearTimeout(t);
  }, [qActive, sortActiveKey, sortActiveDir, pageActive, pageActiveSize]);

  useEffect(() => {
    setLoadingCompleted(true);
    const t = setTimeout(() => setLoadingCompleted(false), 120);
    return () => clearTimeout(t);
  }, [qCompleted, sortCompletedKey, sortCompletedDir, pageCompleted, pageCompletedSize]);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Jobs</h1>
        <p className={styles.subtitle}>
          Track and manage all your active and completed projects from one place.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Active Jobs</h2>
        <DataToolbar
          query={qActive}
          onQueryChange={(val) => { setQActive(val); setPageActive(1); }}
          sortValue={`${sortActiveKey}:${sortActiveDir}`}
          onSortChange={(val) => {
            const [k, d] = val.split(':') as [typeof sortActiveKey, typeof sortActiveDir];
            setSortActiveKey(k); setSortActiveDir(d); setPageActive(1);
          }}
          pageSize={pageActiveSize}
          onPageSizeChange={(sz) => { setPageActiveSize(sz); setPageActive(1); }}
          sortOptions={([
            { value: 'title:asc', label: 'Title A–Z' },
            { value: 'title:desc', label: 'Title Z–A' },
            { value: 'client:asc', label: 'Client A–Z' },
            { value: 'client:desc', label: 'Client Z–A' },
            { value: 'status:asc', label: 'Status A–Z' },
            { value: 'status:desc', label: 'Status Z–A' },
            { value: 'progress:asc', label: 'Progress Low–High' },
            { value: 'progress:desc', label: 'Progress High–Low' },
          ]) as SortOption[]}
          onExport={exportActive}
          exportLabel="Export"
          aria-label="Active filters and actions"
          searchPlaceholder="Search active jobs"
          searchTitle="Search active jobs"
          sortTitle="Sort active jobs by"
          pageSizeTitle="Active jobs per page"
          exportFormatTitle="Export active jobs as"
        />
        <span className={styles.srOnly} aria-live="polite">
          Active filters updated. {qActive ? `Query: ${qActive}. ` : ''}Sort: {sortActiveKey} {sortActiveDir}. Page size: {pageActiveSize}.
        </span>
        <div className={styles.extrasRow} role="group" aria-label="Active saved views">
          <SavedViewsMenu
            storageKey="freelancer:my-jobs:active:savedViews"
            buildPayload={() => ({ q: qActive, sortKey: sortActiveKey, sortDir: sortActiveDir, pageSize: pageActiveSize })}
            onApply={(p: { q: string; sortKey: typeof sortActiveKey; sortDir: typeof sortActiveDir; pageSize: number; }) => {
              setQActive(p.q ?? '');
              setSortActiveKey(p.sortKey ?? 'title');
              setSortActiveDir(p.sortDir ?? 'asc');
              setPageActiveSize(p.pageSize ?? 6);
              setPageActive(1);
            }}
            aria-label="My Jobs active saved views"
          />
        </div>

        <div className={styles.jobGrid}>
          {uiLoadingActive ? (
            <TableSkeleton rows={Math.min(pageActiveSize, 6)} cols={3} />
          ) : (
            <>
              {pagedActive.map((job, index) => (
                <JobStatusCard key={`active-${index}`} {...job} />
              ))}
              {sortedActive.length === 0 && (
                <div role="status" aria-live="polite" className={styles.emptyState}>No active jobs found.</div>
              )}
            </>
          )}
        </div>

        {sortedActive.length > 0 && (
          <PaginationBar
            currentPage={pageActiveSafe}
            totalPages={totalActivePages}
            totalResults={sortedActive.length}
            onPrev={() => setPageActive(p => Math.max(1, p - 1))}
            onNext={() => setPageActive(p => Math.min(totalActivePages, p + 1))}
          />
        )}
        {sortedActive.length > 0 && (
          <span className={styles.srOnly} aria-live="polite">
            Page {pageActiveSafe} of {totalActivePages}. {sortedActive.length} active job{sortedActive.length === 1 ? '' : 's'}.
          </span>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Completed Jobs</h2>
        <DataToolbar
          query={qCompleted}
          onQueryChange={(val) => { setQCompleted(val); setPageCompleted(1); }}
          sortValue={`${sortCompletedKey}:${sortCompletedDir}`}
          onSortChange={(val) => {
            const [k, d] = val.split(':') as [typeof sortCompletedKey, typeof sortCompletedDir];
            setSortCompletedKey(k); setSortCompletedDir(d); setPageCompleted(1);
          }}
          pageSize={pageCompletedSize}
          onPageSizeChange={(sz) => { setPageCompletedSize(sz); setPageCompleted(1); }}
          sortOptions={([
            { value: 'completionDate:desc', label: 'Newest' },
            { value: 'completionDate:asc', label: 'Oldest' },
            { value: 'title:asc', label: 'Title A–Z' },
            { value: 'title:desc', label: 'Title Z–A' },
            { value: 'client:asc', label: 'Client A–Z' },
            { value: 'client:desc', label: 'Client Z–A' },
          ]) as SortOption[]}
          onExport={exportCompleted}
          exportLabel="Export"
          aria-label="Completed filters and actions"
          searchPlaceholder="Search completed jobs"
          searchTitle="Search completed jobs"
          sortTitle="Sort completed jobs by"
          pageSizeTitle="Completed jobs per page"
          exportFormatTitle="Export completed jobs as"
        />
        <span className={styles.srOnly} aria-live="polite">
          Completed filters updated. {qCompleted ? `Query: ${qCompleted}. ` : ''}Sort: {sortCompletedKey} {sortCompletedDir}. Page size: {pageCompletedSize}.
        </span>
        <div className={styles.extrasRow} role="group" aria-label="Completed saved views">
          <SavedViewsMenu
            storageKey="freelancer:my-jobs:completed:savedViews"
            buildPayload={() => ({ q: qCompleted, sortKey: sortCompletedKey, sortDir: sortCompletedDir, pageSize: pageCompletedSize })}
            onApply={(p: { q: string; sortKey: typeof sortCompletedKey; sortDir: typeof sortCompletedDir; pageSize: number; }) => {
              setQCompleted(p.q ?? '');
              setSortCompletedKey(p.sortKey ?? 'completionDate');
              setSortCompletedDir(p.sortDir ?? 'desc');
              setPageCompletedSize(p.pageSize ?? 6);
              setPageCompleted(1);
            }}
            aria-label="Manage saved views for completed jobs"
          />
        </div>
        <div className={styles.jobGrid}>
          {uiLoadingCompleted ? (
            <TableSkeleton rows={Math.min(pageCompletedSize, 6)} cols={3} />
          ) : (
            <>
              {pagedCompleted.map((job, index) => (
                <JobStatusCard key={`completed-${index}`} {...job} />
              ))}
              {sortedCompleted.length === 0 && (
                <div role="status" aria-live="polite" className={styles.emptyState}>No completed jobs found.</div>
              )}
            </>
          )}
        </div>
        {sortedCompleted.length > 0 && (
          <PaginationBar
            currentPage={pageCompletedSafe}
            totalPages={totalCompletedPages}
            totalResults={sortedCompleted.length}
            onPrev={() => setPageCompleted(p => Math.max(1, p - 1))}
            onNext={() => setPageCompleted(p => Math.min(totalCompletedPages, p + 1))}
          />
        )}
        {sortedCompleted.length > 0 && (
          <span className={styles.srOnly} aria-live="polite">
            Page {pageCompletedSafe} of {totalCompletedPages}. {sortedCompleted.length} completed job{sortedCompleted.length === 1 ? '' : 's'}.
          </span>
        )}
      </section>
    </div>
  );
};

export default MyJobs;
