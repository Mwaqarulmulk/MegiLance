// @AI-HINT: This is the Freelancer Proposals page. It provides search, sorting, pagination, CSV export, and accessible empty states. Styling is per-component via .common/.light/.dark CSS modules.
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import Button from '@/app/components/Button/Button';
import { exportCSV, exportData } from '@/app/lib/csv';
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
import VirtualTableBody from '@/app/components/DataTableExtras/VirtualTableBody';
import Modal from '@/app/components/Modal/Modal';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
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
  const toaster = useToaster();

  const [q, setQ] = usePersistedState<string>('freelancer:proposals:q', '');
  const [sortKey, setSortKey] = usePersistedState<'jobTitle' | 'clientName' | 'status' | 'dateSubmitted' | 'bidAmount'>('freelancer:proposals:sortKey', 'dateSubmitted');
  const [sortDir, setSortDir] = usePersistedState<'asc' | 'desc'>('freelancer:proposals:sortDir', 'desc');
  const [page, setPage] = usePersistedState<number>('freelancer:proposals:page', 1);
  const [pageSize, setPageSize] = usePersistedState<number>('freelancer:proposals:pageSize', 10);
  const [density, setDensity] = usePersistedState<Density>('freelancer:proposals:density', 'comfortable');
  const [loading, setLoading] = useState(false);
  const [statusFilters, setStatusFilters] = usePersistedState<Proposal['status'][]>('freelancer:proposals:statusFilters', []);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [pendingWithdrawId, setPendingWithdrawId] = useState<string | null>(null);
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const rowHeight = density === 'compact' ? 40 : 48;

  // Strongly-typed helper to satisfy aria-sort lints with literal values only
  const ariaSortFor = (col: typeof sortKey): 'ascending' | 'descending' | 'none' => {
    if (sortKey === col) return sortDir === 'asc' ? 'ascending' : 'descending';
    return 'none';
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const byQuery = (p: Proposal) => (
      !query ||
      p.jobTitle.toLowerCase().includes(query) ||
      p.clientName.toLowerCase().includes(query) ||
      p.status.toLowerCase().includes(query)
    );
    const byStatus = (p: Proposal) => (statusFilters.length === 0 || statusFilters.includes(p.status));
    return mockProposals.filter(p => byQuery(p) && byStatus(p));
  }, [q, statusFilters]);

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
  const allColumns = ['jobTitle', 'clientName', 'status', 'dateSubmitted', 'bidAmount', 'actions'] as const;
  const { visible, toggle: toggleCol, setAll: setAllCols } = useColumnVisibility('freelancer:proposals', allColumns as unknown as string[]);
  const show = (key: typeof allColumns[number]) => visible.includes(key);

  // Selection across filtered set
  const allFilteredIds = useMemo(() => filtered.map(p => p.id), [filtered]);
  const { selected, isSelected, toggle: toggleRow, clear, selectMany, deselectMany, count } = useSelection<string>(allFilteredIds, { storageKey: 'freelancer:proposals:selected' });
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

  const onExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    const header = ['Job Title', 'Client', 'Status', 'Date Submitted', 'Bid (USD)'];
    const cols: (typeof allColumns[number])[] = ['jobTitle', 'clientName', 'status', 'dateSubmitted', 'bidAmount'];
    const rows = sorted.map(p => [p.jobTitle, p.clientName, p.status, p.dateSubmitted, p.bidAmount]);
    const visibleIndices = cols
      .map((key, idx) => (visible.includes(key) ? idx : -1))
      .filter(i => i >= 0);
    exportData(format, header, rows, 'proposals', { visibleIndices });
  };

  const onExportSelected = () => {
    const selectedSet = new Set(selected);
    const selectedRows = filtered.filter(p => selectedSet.has(p.id));
    const header = ['Job Title', 'Client', 'Status', 'Date Submitted', 'Bid (USD)'];
    const rows = selectedRows.map(p => [p.jobTitle, p.clientName, p.status, p.dateSubmitted, p.bidAmount]);
    exportCSV(header, rows, 'proposals-selected');
  };

  const onExportSelectedFormat = (format: 'csv' | 'xlsx' | 'pdf') => {
    const selectedSet = new Set(selected);
    const selectedRows = filtered.filter(p => selectedSet.has(p.id));
    const header = ['Job Title', 'Client', 'Status', 'Date Submitted', 'Bid (USD)'];
    const cols: (typeof allColumns[number])[] = ['jobTitle', 'clientName', 'status', 'dateSubmitted', 'bidAmount'];
    const rows = selectedRows.map(p => [p.jobTitle, p.clientName, p.status, p.dateSubmitted, p.bidAmount]);
    const visibleIndices = cols
      .map((key, idx) => (visible.includes(key) ? idx : -1))
      .filter(i => i >= 0);
    exportData(format, header, rows, 'proposals-selected', { visibleIndices });
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

  // Actions
  const openWithdraw = (id: string) => {
    setPendingWithdrawId(id);
    setWithdrawOpen(true);
  };
  const onConfirmWithdraw = async () => {
    if (!pendingWithdrawId) return;
    setWithdrawOpen(false);
    // Simulate async op
    await new Promise(r => setTimeout(r, 700));
    toaster.notify({
      title: 'Proposal withdrawn',
      description: 'The proposal was withdrawn successfully.',
      variant: 'warning',
      duration: 3500,
    });
    setPendingWithdrawId(null);
  };
  const viewProposal = (p: Proposal) => {
    toaster.notify({ title: 'Open proposal', description: `Viewing: ${p.jobTitle}`, variant: 'info' });
  };
  const editProposal = (p: Proposal) => {
    toaster.notify({ title: 'Edit proposal', description: `Editing: ${p.jobTitle}`, variant: 'info' });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Proposals</h1>
        <p className={styles.subtitle}>Manage your drafts and track submitted proposals.</p>
      </header>

      <DataToolbar
        query={q}
        onQueryChange={(val) => { setQ(val); setPage(1); }}
        sortValue={`${sortKey}:${sortDir}`}
        onSortChange={(val) => {
          const [k, d] = val.split(':') as [typeof sortKey, typeof sortDir];
          setSortKey(k); setSortDir(d); setPage(1);
        }}
        pageSize={pageSize}
        onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
        sortOptions={sortOptions}
        onExport={onExport}
        exportLabel="Export"
        aria-label="Proposals filters and actions"
        searchPlaceholder="Search proposals"
        searchTitle="Search proposals"
        sortTitle="Sort proposals by"
        pageSizeTitle="Proposals per page"
        exportFormatTitle="Export proposals as"
      />
      <span className={styles.srOnly} aria-live="polite">
        Filters updated. {q ? `Query: ${q}. ` : ''}Sort: {sortKey} {sortDir}. Page size: {pageSize}.
      </span>

      <div className={styles.extrasRow} role="group" aria-label="Table view options">
        <div className={styles.statusFilters} role="group" aria-label="Status filters">
          {(['Draft','Submitted','Interview','Rejected'] as Proposal['status'][]).map(st => {
            const active = statusFilters.includes(st);
            return (
              <Button
                key={st}
                variant={active ? 'primary' : 'outline'}
                size="small"
                aria-pressed={active}
                title={`${active ? 'Remove' : 'Add'} filter: ${st}`}
                onClick={() => setStatusFilters(active ? statusFilters.filter(s => s !== st) : [...statusFilters, st])}
              >
                {st}
              </Button>
            );
          })}
          {statusFilters.length > 0 && (
            <Button variant="secondary" size="small" onClick={() => setStatusFilters([])} aria-label="Clear status filters" title="Clear status filters">Clear</Button>
          )}
          <span className={styles.srOnly} aria-live="polite">
            {statusFilters.length === 0 ? 'No status filters active' : `Active filters: ${statusFilters.join(', ')}`}
          </span>
        </div>
        <ColumnVisibilityMenu
          columns={[
            { key: 'jobTitle', label: 'Job Title' },
            { key: 'clientName', label: 'Client' },
            { key: 'status', label: 'Status' },
            { key: 'dateSubmitted', label: 'Submitted' },
            { key: 'bidAmount', label: 'Bid (USD)' },
            { key: 'actions', label: 'Actions' },
          ]}
          visibleKeys={visible}
          onToggle={toggleCol}
          onShowAll={() => setAllCols(allColumns as unknown as string[])}
          onHideAll={() => setAllCols([])}
          aria-label="Proposals columns"
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
            statusFilters,
          })}
          onApply={(p: any) => {
            if (!p) return;
            setQ(typeof p.q === 'string' ? p.q : '');
            if (p.sortKey && p.sortDir) { setSortKey(p.sortKey); setSortDir(p.sortDir); }
            if (typeof p.pageSize === 'number') setPageSize(p.pageSize);
            if (p.density) setDensity(p.density);
            if (Array.isArray(p.visible)) setAllCols(p.visible as unknown as string[]);
            if (Array.isArray(p.statusFilters)) setStatusFilters(p.statusFilters);
            setPage(1);
          }}
          aria-label="Proposals saved views"
        />
      </div>

      <SelectionBar count={count} onClear={clear} onExport={onExportSelectedFormat} onExportCSV={onExportSelected} />

      <div className={styles.tableWrap} ref={tableWrapRef}>
        <table className={styles.table} role="table" data-density={density}>
          <thead>
            <tr>
              <th scope="col" className={styles.checkboxCell}>
                <input
                  type="checkbox"
                  aria-label="Select page rows"
                  checked={headerCheckboxChecked}
                  ref={el => { if (el) el.indeterminate = headerCheckboxIndeterminate; }}
                  {...(headerCheckboxIndeterminate ? { 'aria-checked': 'mixed' } : {})}
                  onChange={togglePageSelection}
                />
              </th>
              {show('jobTitle') && (
                <th
                  scope="col"
                  {...(sortKey === 'jobTitle' ? { 'aria-sort': (sortDir === 'asc' ? 'ascending' : 'descending') } : {})}
                >Job Title</th>
              )}
              {show('clientName') && (
                <th
                  scope="col"
                  {...(sortKey === 'clientName' ? { 'aria-sort': (sortDir === 'asc' ? 'ascending' : 'descending') } : {})}
                >Client</th>
              )}
              {show('status') && (
                <th
                  scope="col"
                  {...(sortKey === 'status' ? { 'aria-sort': (sortDir === 'asc' ? 'ascending' : 'descending') } : {})}
                >Status</th>
              )}
              {show('dateSubmitted') && (
                <th
                  scope="col"
                  {...(sortKey === 'dateSubmitted' ? { 'aria-sort': (sortDir === 'asc' ? 'ascending' : 'descending') } : {})}
                >Submitted</th>
              )}
              {show('bidAmount') && (
                <th
                  scope="col"
                  {...(sortKey === 'bidAmount' ? { 'aria-sort': (sortDir === 'asc' ? 'ascending' : 'descending') } : {})}
                >Bid (USD)</th>
              )}
              {show('actions') && (
                <th scope="col">Actions</th>
              )}
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr>
                <td colSpan={1 + allColumns.length}>
                  <TableSkeleton rows={6} cols={6} dense={density==='compact'} />
                </td>
              </tr>
            </tbody>
          ) : (
            <VirtualTableBody
              items={paged}
              rowHeight={rowHeight}
              overscan={6}
              containerRef={tableWrapRef}
              renderRow={(p) => (
                <tr
                  key={p.id}
                  tabIndex={0}
                  {...(isSelected(p.id) ? { 'aria-selected': 'true' } : {})}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      toggleRow(p.id);
                    }
                  }}
                >
                  <td className={styles.checkboxCell}>
                    <input type="checkbox" aria-label={`Select ${p.jobTitle}`} checked={isSelected(p.id)} onChange={() => toggleRow(p.id)} />
                  </td>
                  {show('jobTitle') && <td>{p.jobTitle}</td>}
                  {show('clientName') && <td>{p.clientName}</td>}
                  {show('status') && <td><span className={styles.status}>{p.status}</span></td>}
                  {show('dateSubmitted') && <td>{new Date(p.dateSubmitted).toLocaleDateString()}</td>}
                  {show('bidAmount') && <td>${p.bidAmount.toLocaleString()}</td>}
                  {show('actions') && (
                    <td>
                      <div className={styles.rowActions} role="group" aria-label={`Actions for ${p.jobTitle}`}>
                        <Button size="small" variant="outline" onClick={() => viewProposal(p)} aria-label={`View ${p.jobTitle}`} title={`View ${p.jobTitle}`}>View</Button>
                        <Button size="small" variant="secondary" onClick={() => editProposal(p)} aria-label={`Edit ${p.jobTitle}`} title={`Edit ${p.jobTitle}`}>Edit</Button>
                        {(p.status === 'Submitted' || p.status === 'Draft') && (
                          <Button size="small" variant="danger" onClick={() => openWithdraw(p.id)} aria-label={`Withdraw ${p.jobTitle}`} title={`Withdraw ${p.jobTitle}`}>Withdraw</Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )}
            />
          )}
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
      {sorted.length > 0 && (
        <span className={styles.srOnly} aria-live="polite">
          Page {pageSafe} of {totalPages}. {sorted.length} result{sorted.length === 1 ? '' : 's'}.
        </span>
      )}

      <Modal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        title="Withdraw Proposal"
        size="small"
      >
        <div className={styles.modalBodyCopy}>
          Are you sure you want to withdraw this proposal? This action cannot be undone.
        </div>
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={onConfirmWithdraw}>Confirm Withdraw</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProposalsPage;
