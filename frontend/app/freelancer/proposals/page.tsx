// @AI-HINT: This is the Freelancer Proposals page. It provides search, sorting, pagination, CSV export, and accessible empty states. Styling is per-component via .common/.light/.dark CSS modules.
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import Button from '@/app/components/Button/Button';
import { exportCSV } from '@/app/lib/csv';
import DataToolbar, { SortOption } from '@/app/components/DataToolbar/DataToolbar';
import PaginationBar from '@/app/components/PaginationBar/PaginationBar';
import { usePersistedState } from '@/app/lib/hooks/usePersistedState';
import { useColumnVisibility } from '@/app/lib/hooks/useColumnVisibility';
import { useSelection } from '@/app/lib/hooks/useSelection';
import ColumnVisibilityMenu from '@/app/components/DataTableExtras/ColumnVisibilityMenu';
import DensityToggle, { Density } from '@/app/components/DataTableExtras/DensityToggle';
import SelectionBar from '@/app/components/DataTableExtras/SelectionBar';
import TableSkeleton from '@/app/components/DataTableExtras/TableSkeleton';
import SavedViewsMenu from '@/app/components/DataTableExtras/SavedViewsMenu';
import commonStyles from './Proposals.common.module.css';
import lightStyles from './Proposals.light.module.css';
import darkStyles from './Proposals.dark.module.css';

interface Proposal {
  id: string;
  jobTitle: string;
  clientName: string;
  status: 'Draft' | 'Submitted' | 'Interview' | 'Rejected';
  dateSubmitted: string; // ISO or YYYY-MM-DD
  bidAmount: number; // USD
}

// Mock proposals data for UI polish
const mockProposals: Proposal[] = [
  { id: 'p1', jobTitle: 'Build Marketing Website', clientName: 'Acme Corp', status: 'Submitted', dateSubmitted: '2025-08-01', bidAmount: 2500 },
  { id: 'p2', jobTitle: 'AI Content Generator', clientName: 'ContentAI', status: 'Interview', dateSubmitted: '2025-08-04', bidAmount: 5200 },
  { id: 'p3', jobTitle: 'Dashboard Revamp', clientName: 'DataViz Ltd', status: 'Rejected', dateSubmitted: '2025-07-26', bidAmount: 1800 },
  { id: 'p4', jobTitle: 'Mobile App MVP', clientName: 'StartHub', status: 'Draft', dateSubmitted: '2025-08-08', bidAmount: 8000 },
];

const ProposalsPage: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const [q, setQ] = usePersistedState<string>('freelancer:proposals:q', '');
  const [sortKey, setSortKey] = usePersistedState<'jobTitle' | 'clientName' | 'status' | 'dateSubmitted' | 'bidAmount'>('freelancer:proposals:sortKey', 'dateSubmitted');
  const [sortDir, setSortDir] = usePersistedState<'asc' | 'desc'>('freelancer:proposals:sortDir', 'desc');
  const [page, setPage] = usePersistedState<number>('freelancer:proposals:page', 1);
  const [pageSize, setPageSize] = usePersistedState<number>('freelancer:proposals:pageSize', 10);
  const [density, setDensity] = usePersistedState<Density>('freelancer:proposals:density', 'comfortable');
  const [loading, setLoading] = useState(false);

  // Strongly-typed helper to satisfy aria-sort lints with literal values only
  const ariaSortFor = (col: typeof sortKey): 'ascending' | 'descending' | 'none' => {
    if (sortKey === col) return sortDir === 'asc' ? 'ascending' : 'descending';
    return 'none';
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return mockProposals.filter(p =>
      !query ||
      p.jobTitle.toLowerCase().includes(query) ||
      p.clientName.toLowerCase().includes(query) ||
      p.status.toLowerCase().includes(query)
    );
  }, [q]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      if (sortKey === 'bidAmount') {
        return sortDir === 'asc' ? a.bidAmount - b.bidAmount : b.bidAmount - a.bidAmount;
      }
      if (sortKey === 'dateSubmitted') {
        const av = new Date(a.dateSubmitted).getTime();
        const bv = new Date(b.dateSubmitted).getTime();
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const av = String(a[sortKey]).toLowerCase();
      const bv = String(b[sortKey]).toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageSafe, pageSize]);

  // Simulated lightweight loading skeleton to avoid layout jank on control changes
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 120);
    return () => clearTimeout(t);
  }, [q, sortKey, sortDir, pageSafe, pageSize]);

  // Column visibility
  const allColumns = ['jobTitle', 'clientName', 'status', 'dateSubmitted', 'bidAmount'] as const;
  const { visible, toggle: toggleCol, setAll: setAllCols } = useColumnVisibility('freelancer:proposals', allColumns as unknown as string[]);
  const show = (key: typeof allColumns[number]) => visible.includes(key);

  // Selection across filtered set
  const allFilteredIds = useMemo(() => filtered.map(p => p.id), [filtered]);
  const { selected, isSelected, toggle: toggleRow, clear, selectMany, deselectMany, count } = useSelection<string>(allFilteredIds);
  const pageIds = paged.map(p => p.id);
  const headerCheckboxChecked = pageIds.length > 0 && pageIds.every(id => isSelected(id));
  const headerCheckboxIndeterminate = !headerCheckboxChecked && pageIds.some(id => isSelected(id));
  const togglePageSelection = () => {
    if (headerCheckboxChecked) {
      deselectMany(pageIds);
    } else {
      selectMany(pageIds);
    }
  };

  const onExportCSV = () => {
    const header = ['Job Title', 'Client', 'Status', 'Date Submitted', 'Bid (USD)'];
    const rows = sorted.map(p => [p.jobTitle, p.clientName, p.status, p.dateSubmitted, p.bidAmount]);
    exportCSV(header, rows, 'proposals');
  };

  const onExportSelected = () => {
    const selectedSet = new Set(selected);
    const selectedRows = filtered.filter(p => selectedSet.has(p.id));
    const header = ['Job Title', 'Client', 'Status', 'Date Submitted', 'Bid (USD)'];
    const rows = selectedRows.map(p => [p.jobTitle, p.clientName, p.status, p.dateSubmitted, p.bidAmount]);
    exportCSV(header, rows, 'proposals-selected');
  };

  const sortOptions: SortOption[] = [
    { value: 'dateSubmitted:desc', label: 'Newest' },
    { value: 'dateSubmitted:asc', label: 'Oldest' },
    { value: 'jobTitle:asc', label: 'Job A–Z' },
    { value: 'jobTitle:desc', label: 'Job Z–A' },
    { value: 'clientName:asc', label: 'Client A–Z' },
    { value: 'clientName:desc', label: 'Client Z–A' },
    { value: 'status:asc', label: 'Status A–Z' },
    { value: 'status:desc', label: 'Status Z–A' },
    { value: 'bidAmount:asc', label: 'Bid Low–High' },
    { value: 'bidAmount:desc', label: 'Bid High–Low' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Proposals</h1>
        <p className={styles.subtitle}>Manage your drafts and track submitted proposals.</p>
      </header>

      <DataToolbar
        query={q}
        onQueryChange={(v) => { setQ(v); setPage(1); }}
        sortValue={`${sortKey}:${sortDir}`}
        onSortChange={(val) => {
          const [k, d] = val.split(':') as [typeof sortKey, typeof sortDir];
          setSortKey(k);
          setSortDir(d);
          setPage(1);
        }}
        pageSize={pageSize}
        onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
        sortOptions={sortOptions}
        onExportCSV={onExportCSV}
        exportLabel="Export CSV"
        aria-label="Proposals filters and actions"
      />

      <div className={styles.extrasRow} role="group" aria-label="Table view options">
        <ColumnVisibilityMenu
          columns={[
            { key: 'jobTitle', label: 'Job Title' },
            { key: 'clientName', label: 'Client' },
            { key: 'status', label: 'Status' },
            { key: 'dateSubmitted', label: 'Submitted' },
            { key: 'bidAmount', label: 'Bid (USD)' },
          ]}
          visibleKeys={visible}
          onToggle={toggleCol}
          onShowAll={() => setAllCols(allColumns as unknown as string[])}
          onHideAll={() => setAllCols([])}
          aria-label="Toggle table columns"
        />
        <DensityToggle value={density} onChange={setDensity} />
        <SavedViewsMenu
          storageKey="freelancer:proposals:savedViews"
          buildPayload={() => ({
            q,
            sortKey,
            sortDir,
            pageSize,
            density,
            visible,
          })}
          onApply={(p: { q: string; sortKey: typeof sortKey; sortDir: typeof sortDir; pageSize: number; density: typeof density; visible: string[]; }) => {
            setQ(p.q ?? '');
            setSortKey(p.sortKey ?? 'dateSubmitted');
            setSortDir(p.sortDir ?? 'desc');
            setPageSize(p.pageSize ?? 10);
            setDensity(p.density ?? 'comfortable');
            setAllCols((p.visible ?? allColumns) as unknown as string[]);
            setPage(1);
          }}
        />
      </div>

      <SelectionBar count={count} onClear={clear} onExportCSV={count > 0 ? onExportSelected : undefined} />

      <div className={styles.tableWrap}>
        <table className={styles.table} role="table" data-density={density}>
          <thead>
            <tr>
              <th scope="col" className={styles.checkboxCell}>
                <input
                  type="checkbox"
                  aria-label="Select page rows"
                  checked={headerCheckboxChecked}
                  ref={el => { if (el) el.indeterminate = headerCheckboxIndeterminate; }}
                  onChange={togglePageSelection}
                />
              </th>
              {show('jobTitle') && (
                <th scope="col" aria-sort={ariaSortFor('jobTitle')}>Job Title</th>
              )}
              {show('clientName') && (
                <th scope="col" aria-sort={ariaSortFor('clientName')}>Client</th>
              )}
              {show('status') && (
                <th scope="col" aria-sort={ariaSortFor('status')}>Status</th>
              )}
              {show('dateSubmitted') && (
                <th scope="col" aria-sort={ariaSortFor('dateSubmitted')}>Submitted</th>
              )}
              {show('bidAmount') && (
                <th scope="col" aria-sort={ariaSortFor('bidAmount')}>Bid (USD)</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={1 + allColumns.length}>
                  <TableSkeleton rows={6} cols={6} dense={density==='compact'} />
                </td>
              </tr>
            ) : paged.map(p => (
              <tr key={p.id}>
                <td className={styles.checkboxCell}>
                  <input type="checkbox" aria-label={`Select ${p.jobTitle}`} checked={isSelected(p.id)} onChange={() => toggleRow(p.id)} />
                </td>
                {show('jobTitle') && <td>{p.jobTitle}</td>}
                {show('clientName') && <td>{p.clientName}</td>}
                {show('status') && <td><span className={styles.status}>{p.status}</span></td>}
                {show('dateSubmitted') && <td>{new Date(p.dateSubmitted).toLocaleDateString()}</td>}
                {show('bidAmount') && <td>${p.bidAmount.toLocaleString()}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className={styles.emptyState} role="status" aria-live="polite">No proposals found.</div>
        )}
      </div>

      {sorted.length > 0 && (
        <PaginationBar
          currentPage={pageSafe}
          totalPages={totalPages}
          totalResults={sorted.length}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => Math.min(totalPages, p + 1))}
        />
      )}
    </div>
  );
};

export default ProposalsPage;
