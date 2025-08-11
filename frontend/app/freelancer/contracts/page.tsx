// @AI-HINT: This page allows freelancers to view their smart contracts for ongoing and completed jobs, now with a premium, theme-aware, and accessible table layout.
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import Badge from '@/app/components/Badge/Badge';
import DataToolbar, { SortOption } from '@/app/components/DataToolbar/DataToolbar';
import PaginationBar from '@/app/components/PaginationBar/PaginationBar';
import { usePersistedState } from '@/app/lib/hooks/usePersistedState';
import { useColumnVisibility } from '@/app/lib/hooks/useColumnVisibility';
import { useSelection } from '@/app/lib/hooks/useSelection';
import { exportCSV, exportData } from '@/app/lib/csv';
import ColumnVisibilityMenu from '@/app/components/DataTableExtras/ColumnVisibilityMenu';
import DensityToggle, { Density } from '@/app/components/DataTableExtras/DensityToggle';
import SelectionBar from '@/app/components/DataTableExtras/SelectionBar';
import TableSkeleton from '@/app/components/DataTableExtras/TableSkeleton';
import SavedViewsMenu from '@/app/components/DataTableExtras/SavedViewsMenu';
import VirtualTableBody from '@/app/components/DataTableExtras/VirtualTableBody';
import Modal from '@/app/components/Modal/Modal';
import Button from '@/app/components/Button/Button';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
import commonStyles from './Contracts.common.module.css';
import lightStyles from './Contracts.light.module.css';
import darkStyles from './Contracts.dark.module.css';

// @AI-HINT: Mock data for contracts.
const mockContracts = [
  {
    id: 'contract_abc123',
    projectTitle: 'Build a Decentralized Exchange',
    clientName: 'DeFi Innovators Inc.',
    value: 5000, // USDC
    status: 'Active',
    contractAddress: '0x123...def',
  },
  {
    id: 'contract_def456',
    projectTitle: 'Create 3D NFT Avatars',
    clientName: 'Metaverse Creations',
    value: 2500,
    status: 'Completed',
    contractAddress: '0x456...abc',
  },
  {
    id: 'contract_ghi789',
    projectTitle: 'Audit a Smart Contract',
    clientName: 'SecureChain Labs',
    value: 1500,
    status: 'Disputed',
    contractAddress: '0x789...ghi',
  },
  {
    id: 'contract_jkl012',
    projectTitle: 'Develop a Web3 Wallet',
    clientName: 'Crypto Wallet Co.',
    value: 7500,
    status: 'Completed',
    contractAddress: '0x012...jkl',
  },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'info';
    case 'completed': return 'success';
    case 'disputed': return 'danger';
    default: return 'secondary';
  }
};

const ContractsPage: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);
  const toaster = useToaster();

  const [query, setQuery] = usePersistedState<string>('freelancer:contracts:q', '');
  const [sortKey, setSortKey] = usePersistedState<'projectTitle' | 'clientName' | 'value' | 'status'>('freelancer:contracts:sortKey', 'projectTitle');
  const [sortDir, setSortDir] = usePersistedState<'asc' | 'desc'>('freelancer:contracts:sortDir', 'asc');
  const [page, setPage] = usePersistedState<number>('freelancer:contracts:page', 1);
  const [pageSize, setPageSize] = usePersistedState<number>('freelancer:contracts:pageSize', 10);
  const [density, setDensity] = usePersistedState<Density>('freelancer:contracts:density', 'comfortable');
  const [statusFilters, setStatusFilters] = usePersistedState<string[]>('freelancer:contracts:statusFilters', []);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState<'extend' | 'dispute' | null>(null);
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowHeight = density === 'compact' ? 40 : 48;

  // Strongly-typed helper to satisfy aria-sort lints with literal values only
  const ariaSortFor = (col: typeof sortKey): 'ascending' | 'descending' | 'none' => {
    if (sortKey === col) return sortDir === 'asc' ? 'ascending' : 'descending';
    return 'none';
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockContracts.filter(c => {
      const qMatch = !q ||
        c.projectTitle.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q);
      const statusMatch = statusFilters.length === 0 || statusFilters.includes(c.status);
      return qMatch && statusMatch;
    });
  }, [query, statusFilters]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let av: string | number = (a as any)[sortKey] ?? '';
      let bv: string | number = (b as any)[sortKey] ?? '';
      // Numeric compare for value
      if (sortKey === 'value') {
        const na = Number(av);
        const nb = Number(bv);
        if (na < nb) return sortDir === 'asc' ? -1 : 1;
        if (na > nb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      }
      const sa = String(av).toLowerCase();
      const sb = String(bv).toLowerCase();
      if (sa < sb) return sortDir === 'asc' ? -1 : 1;
      if (sa > sb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageSafe, pageSize]);

  // Loading skeleton trigger on control changes
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 120);
    return () => clearTimeout(t);
  }, [query, sortKey, sortDir, page, pageSize]);

  // Column visibility
  const allColumns = ['projectTitle', 'clientName', 'value', 'status', 'contract', 'actions'] as const;
  const { visible, toggle: toggleCol, setAll: setAllCols } = useColumnVisibility('freelancer:contracts', allColumns as unknown as string[]);
  const show = (key: typeof allColumns[number]) => visible.includes(key);

  // Selection
  const allFilteredIds = useMemo(() => filtered.map(c => c.id), [filtered]);
  const { selected, isSelected, toggle: toggleRow, clear, selectMany, deselectMany, count } = useSelection<string>(allFilteredIds, { storageKey: 'freelancer:contracts:selected' });
  const pageIds = paged.map(c => c.id);
  const headerCheckboxChecked = pageIds.length > 0 && pageIds.every(id => isSelected(id));
  const headerCheckboxIndeterminate = !headerCheckboxChecked && pageIds.some(id => isSelected(id));
  const togglePageSelection = () => {
    if (headerCheckboxChecked) deselectMany(pageIds); else selectMany(pageIds);
  };

  // Row actions
  const viewContract = (c: typeof mockContracts[number]) => {
    toaster.notify({ title: 'Open contract', description: `Opening ${c.projectTitle}`, variant: 'info' });
  };
  const downloadContract = (c: typeof mockContracts[number]) => {
    toaster.notify({ title: 'Download', description: `Downloading ${c.projectTitle} PDF…`, variant: 'success' });
  };
  const openExtend = (id: string) => { setActionType('extend'); setActionTargetId(id); setActionOpen(true); };
  const openDispute = (id: string) => { setActionType('dispute'); setActionTargetId(id); setActionOpen(true); };
  const onConfirmAction = async () => {
    if (!actionType || !actionTargetId) return;
    setActionLoading(true);
    await new Promise(r => setTimeout(r, 900));
    if (actionType === 'extend') {
      toaster.notify({ title: 'Extension requested', description: 'We have notified the client about your extension request.', variant: 'success' });
    } else if (actionType === 'dispute') {
      toaster.notify({ title: 'Dispute opened', description: 'A dispute ticket has been created for this contract.', variant: 'warning' });
    }
    setActionLoading(false);
    setActionOpen(false);
    setActionType(null);
    setActionTargetId(null);
  };
  const onCancelAction = () => { setActionOpen(false); setActionType(null); setActionTargetId(null); };

  const onExportCSV = () => {
    const header = ['Project', 'Client', 'Value (USDC)', 'Status', 'Contract'];
    const rows = sorted.map(c => [c.projectTitle, c.clientName, String(c.value), c.status, c.contractAddress]);
    exportCSV(header, rows, 'contracts');
  };

  const onExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    const header = ['Project', 'Client', 'Value (USDC)', 'Status', 'Contract'];
    const cols: (typeof allColumns[number])[] = ['projectTitle', 'clientName', 'value', 'status', 'contract'];
    const rows = sorted.map(c => [c.projectTitle, c.clientName, String(c.value), c.status, c.contractAddress]);
    const visibleIndices = cols
      .map((key, idx) => (visible.includes(key) ? idx : -1))
      .filter(i => i >= 0);
    exportData(format, header, rows, 'contracts', { visibleIndices });
  };

  const onExportSelected = () => {
    const selectedSet = new Set(selected);
    const selectedRows = filtered.filter(c => selectedSet.has(c.id));
    const header = ['Project', 'Client', 'Value (USDC)', 'Status', 'Contract'];
    const rows = selectedRows.map(c => [c.projectTitle, c.clientName, String(c.value), c.status, c.contractAddress]);
    exportCSV(header, rows, 'contracts-selected');
  };

  const onExportSelectedFormat = (format: 'csv' | 'xlsx' | 'pdf') => {
    const selectedSet = new Set(selected);
    const selectedRows = filtered.filter(c => selectedSet.has(c.id));
    const header = ['Project', 'Client', 'Value (USDC)', 'Status', 'Contract'];
    const cols: (typeof allColumns[number])[] = ['projectTitle', 'clientName', 'value', 'status', 'contract'];
    const rows = selectedRows.map(c => [c.projectTitle, c.clientName, String(c.value), c.status, c.contractAddress]);
    const visibleIndices = cols
      .map((key, idx) => (visible.includes(key) ? idx : -1))
      .filter(i => i >= 0);
    exportData(format, header, rows, 'contracts-selected', { visibleIndices });
  };

  const sortOptions: SortOption[] = [
    { value: 'projectTitle:asc', label: 'Project A–Z' },
    { value: 'projectTitle:desc', label: 'Project Z–A' },
    { value: 'clientName:asc', label: 'Client A–Z' },
    { value: 'clientName:desc', label: 'Client Z–A' },
    { value: 'value:asc', label: 'Value Low–High' },
    { value: 'value:desc', label: 'Value High–Low' },
    { value: 'status:asc', label: 'Status A–Z' },
    { value: 'status:desc', label: 'Status Z–A' },
  ];

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your Contracts</h1>
        <p className={styles.subtitle}>View and manage all your smart contracts.</p>
      </header>

      <main>
        <DataToolbar
          query={query}
          onQueryChange={(v) => { setQuery(v); setPage(1); }}
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
          aria-label="Contracts filters and actions"
          searchPlaceholder="Search contracts"
          searchTitle="Search contracts"
          sortTitle="Sort contracts by"
          pageSizeTitle="Contracts per page"
          exportFormatTitle="Export contracts as"
        />
        <span className={styles.srOnly} aria-live="polite">
          Filters updated. {query ? `Query: ${query}. ` : ''}Sort: {sortKey} {sortDir}. Page size: {pageSize}.
        </span>

        <div className={styles.extrasRow} role="group" aria-label="Table view options">
          <div className={styles.statusFilters} role="group" aria-label="Filter by status">
            {['Active','Completed','Disputed'].map(s => {
              const active = statusFilters.includes(s);
              return (
                <Button
                  key={s}
                  size="small"
                  variant={active ? 'primary' : 'outline'}
                  aria-pressed={active}
                  title={`${active ? 'Remove' : 'Add'} filter: ${s}`}
                  onClick={() => setStatusFilters(prev => prev.includes(s) ? prev.filter(x => x!==s) : [...prev, s])}
                >{s}</Button>
              );
            })}
            {statusFilters.length>0 && (
              <Button size="small" variant="outline" onClick={() => setStatusFilters([])} aria-label="Clear status filters" title="Clear status filters">Clear</Button>
            )}
            <span className={styles.srOnly} aria-live="polite">
              {statusFilters.length === 0 ? 'No status filters active' : `Active filters: ${statusFilters.join(', ')}`}
            </span>
          </div>
          <ColumnVisibilityMenu
            columns={[
              { key: 'projectTitle', label: 'Project' },
              { key: 'clientName', label: 'Client' },
              { key: 'value', label: 'Value (USDC)' },
              { key: 'status', label: 'Status' },
              { key: 'contract', label: 'Contract' },
              { key: 'actions', label: 'Actions' },
            ]}
            visibleKeys={visible}
            onToggle={toggleCol}
            onShowAll={() => setAllCols(allColumns as unknown as string[])}
            onHideAll={() => setAllCols([])}
            aria-label="Contracts columns"
          />
          <DensityToggle value={density} onChange={setDensity} />
          <SavedViewsMenu
            storageKey="freelancer:contracts:savedViews"
            buildPayload={() => ({
              query,
              sortKey,
              sortDir,
              pageSize,
              density,
              visible,
              statusFilters,
            })}
            onApply={(p: { query: string; sortKey: typeof sortKey; sortDir: typeof sortDir; pageSize: number; density: typeof density; visible: string[]; statusFilters?: string[]; }) => {
              setQuery(p.query ?? '');
              setSortKey(p.sortKey ?? 'projectTitle');
              setSortDir(p.sortDir ?? 'asc');
              setPageSize(p.pageSize ?? 10);
              setDensity(p.density ?? 'comfortable');
              setAllCols((p.visible ?? allColumns) as unknown as string[]);
              setStatusFilters(p.statusFilters ?? []);
              setPage(1);
            }}
            aria-label="Contracts saved views"
          />
        </div>

        <SelectionBar count={count} onClear={clear} onExport={onExportSelectedFormat} onExportCSV={onExportSelected} />

        <div className={styles.tableContainer} ref={tableContainerRef}>
          <table className={styles.table} data-density={density}>
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
                {show('projectTitle') && (
                <th
                  scope="col"
                  {...(sortKey === 'projectTitle' ? { 'aria-sort': (sortDir === 'asc' ? 'ascending' : 'descending') } : {})}
                >
                  <button type="button" className={styles.sortBtn} onClick={() => { setSortKey('projectTitle'); setSortDir(d => d==='asc'?'desc':'asc'); setPage(1); }} aria-label="Sort by project">
                    Project {sortKey==='projectTitle' && <span aria-hidden="true" className={styles.sortIndicator}>{sortDir==='asc'?'▲':'▼'}</span>}
                  </button>
                </th>
                )}
                {show('clientName') && (
                <th
                  scope="col"
                  {...(sortKey === 'clientName' ? { 'aria-sort': (sortDir === 'asc' ? 'ascending' : 'descending') } : {})}
                >
                  <button type="button" className={styles.sortBtn} onClick={() => { setSortKey('clientName'); setSortDir(d => d==='asc'?'desc':'asc'); setPage(1); }} aria-label="Sort by client">
                    Client {sortKey==='clientName' && <span aria-hidden="true" className={styles.sortIndicator}>{sortDir==='asc'?'▲':'▼'}</span>}
                  </button>
                </th>
                )}
                {show('value') && (
                <th
                  scope="col"
                  {...(sortKey === 'value' ? { 'aria-sort': (sortDir === 'asc' ? 'ascending' : 'descending') } : {})}
                >
                  <button type="button" className={styles.sortBtn} onClick={() => { setSortKey('value'); setSortDir(d => d==='asc'?'desc':'asc'); setPage(1); }} aria-label="Sort by value">
                    Value {sortKey==='value' && <span aria-hidden="true" className={styles.sortIndicator}>{sortDir==='asc'?'▲':'▼'}</span>}
                  </button>
                </th>
                )}
                {show('status') && (
                <th
                  scope="col"
                  {...(sortKey === 'status' ? { 'aria-sort': (sortDir === 'asc' ? 'ascending' : 'descending') } : {})}
                >
                  <button type="button" className={styles.sortBtn} onClick={() => { setSortKey('status'); setSortDir(d => d==='asc'?'desc':'asc'); setPage(1); }} aria-label="Sort by status">
                    Status {sortKey==='status' && <span aria-hidden="true" className={styles.sortIndicator}>{sortDir==='asc'?'▲':'▼'}</span>}
                  </button>
                </th>
                )}
                {show('contract') && <th scope="col">Contract</th>}
                {show('actions') && <th scope="col">Actions</th>}
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
                containerRef={tableContainerRef}
                renderRow={(contract) => (
                  <tr
                    key={contract.id}
                    tabIndex={0}
                    {...(isSelected(contract.id) ? { 'aria-selected': 'true' } : {})}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        toggleRow(contract.id);
                      }
                    }}
                  >
                    <td className={styles.checkboxCell}>
                      <input type="checkbox" aria-label={`Select ${contract.projectTitle}`} checked={isSelected(contract.id)} onChange={() => toggleRow(contract.id)} />
                    </td>
                    {show('projectTitle') && (
                      <td><span className={styles.projectTitle}>{contract.projectTitle}</span></td>
                    )}
                    {show('clientName') && <td>{contract.clientName}</td>}
                    {show('value') && (
                      <td><span className={styles.value}>{contract.value} USDC</span></td>
                    )}
                    {show('status') && (
                      <td><Badge variant={getStatusBadgeVariant(contract.status)}>{contract.status}</Badge></td>
                    )}
                    {show('contract') && (
                      <td>
                        <a
                          href={`https://etherscan.io/address/${contract.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          View on Etherscan
                        </a>
                      </td>
                    )}
                    {show('actions') && (
                      <td>
                        <div className={styles.rowActions} role="group" aria-label={`Actions for ${contract.projectTitle}`}>
                          <Button size="small" variant="outline" onClick={() => viewContract(contract)} aria-label={`View ${contract.projectTitle}`} title={`View ${contract.projectTitle}`}>View</Button>
                          <Button size="small" variant="secondary" onClick={() => downloadContract(contract)} aria-label={`Download ${contract.projectTitle}`} title={`Download ${contract.projectTitle}`}>Download</Button>
                          {contract.status === 'Active' && (
                            <>
                              <Button size="small" variant="primary" onClick={() => openExtend(contract.id)} aria-label={`Extend ${contract.projectTitle}`} title={`Extend ${contract.projectTitle}`}>Extend</Button>
                              <Button size="small" variant="danger" onClick={() => openDispute(contract.id)} aria-label={`Dispute ${contract.projectTitle}`} title={`Dispute ${contract.projectTitle}`}>Dispute</Button>
                            </>
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
            <div role="status" aria-live="polite" className={styles.emptyState}>No contracts found.</div>
          )}
        </div>

        <Modal isOpen={actionOpen} onClose={onCancelAction} title={actionType === 'extend' ? 'Request Extension' : actionType === 'dispute' ? 'Open Dispute' : 'Confirm'}>
          <div className={styles.modalBodyCopy}>
            {actionType === 'extend' && (
              <p>Confirm you want to request an extension for this contract. The client will be notified to approve the new timeline.</p>
            )}
            {actionType === 'dispute' && (
              <p>Confirm you want to open a dispute. Our team will review the case and contact both parties.</p>
            )}
          </div>
          <div className={styles.modalActions}>
            <Button variant="outline" onClick={onCancelAction} aria-label="Cancel action">Cancel</Button>
            <Button variant={actionType === 'dispute' ? 'danger' : 'primary'} onClick={onConfirmAction} isLoading={actionLoading} aria-label="Confirm action">Confirm</Button>
          </div>
        </Modal>

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
      </main>
    </div>
  );
};

export default ContractsPage;
