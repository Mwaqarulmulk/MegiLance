// @AI-HINT: Admin Users page. Theme-aware, accessible, animated user management with filters, selection, bulk actions, and modal.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useAdminData } from '@/hooks/useAdmin';
import baseStyles from './AdminUsers.base.module.css';
import lightStyles from './AdminUsers.light.module.css';
import darkStyles from './AdminUsers.dark.module.css';
import DensityToggle, { type Density } from '@/app/components/DataTableExtras/DensityToggle';
import ColumnVisibilityMenu, { type ColumnDef } from '@/app/components/DataTableExtras/ColumnVisibilityMenu';
import AdminTopbar from '@/app/components/Admin/Layout/AdminTopbar';
import { toCSVFile } from '@/app/components/DataTable';
import { useDataTable } from '@/app/components/DataTable/hooks/useDataTable';
import type { Column, ActionColumn } from '@/app/components/DataTable/types';
import { Table } from '@/app/components/DataTable/Table';
import type { Column as DTColumn } from '@/app/components/DataTable/types';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Client' | 'Freelancer';
  status: 'Active' | 'Suspended';
  joined: string;
}

const ROLES = ['All', 'Admin', 'Client', 'Freelancer'] as const;
const STATUSES = ['All', 'Active', 'Suspended'] as const;

const AdminUsers: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const { users, loading, error } = useAdminData();

  const [query, setQuery] = useState('');
  const [role, setRole] = useState<(typeof ROLES)[number]>('All');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All');
  const [rows, setRows] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<{ kind: 'suspend' | 'restore'; count: number } | null>(null);
  // Density and column visibility (non-persistent)
  const [density, setDensity] = useState<Density>('comfortable');
  const allColumns: ColumnDef[] = useMemo(() => ([
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'joined', label: 'Joined' },
  ]), []);
  const [visibleKeys, setVisibleKeys] = useState<string[]>(allColumns.map(c => c.key));
  const toggleColumn = (key: string) => setVisibleKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  const showAll = () => setVisibleKeys(allColumns.map(c => c.key));
  const hideAll = () => setVisibleKeys([]);
  const isVisible = (key: keyof UserRow) => visibleKeys.includes(key);

  React.useEffect(() => {
    if (users) setRows(users as unknown as UserRow[]);
  }, [users]);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const tableVisible = useIntersectionObserver(tableRef, { threshold: 0.1 });

  const locallyFiltered = useMemo(() => {
    return rows.filter(r =>
      (role === 'All' || r.role === role) &&
      (status === 'All' || r.status === status)
    );
  }, [rows, role, status]);

  const columns: (Column<UserRow> | ActionColumn<UserRow>)[] = useMemo(() => ([
    {
      key: 'select',
      label: '',
      render: (row) => (
        <input
          type="checkbox"
          checked={!!selected[row.id]}
          onChange={(e) => setSelected(prev => ({ ...prev, [row.id]: e.target.checked }))}
          aria-label={`Select user ${row.name}`}
        />
      ),
    },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'joined', label: 'Joined', sortable: true },
  ]), [selected]);

  const tableState = useDataTable<UserRow>(locallyFiltered, columns as Column<UserRow>[], { initialSortKey: 'name', initialSortDir: 'asc', initialPageSize: 10 });

  const allSelected = tableState.rows.length > 0 && tableState.rows.every(r => selected[r.id]);
  const selectedIds = Object.keys(selected).filter(id => selected[id]);

  const toggleAll = () => {
    const newSelectedState = !allSelected;
    const newSelected = { ...selected };
    tableState.rows.forEach(r => {
      newSelected[r.id] = newSelectedState;
    });
    setSelected(newSelected);
  };

  const openModal = (kind: 'suspend' | 'restore') => {
    const count = selectedIds.length;
    if (count === 0) return;
    setModal({ kind, count });
  };

  const applyBulk = () => {
    if (!modal) return;
    const kind = modal.kind;
    setRows(prev => prev.map(r => selected[r.id] ? { ...r, status: kind === 'suspend' ? 'Suspended' : 'Active' } : r));
    setSelected({});
    setModal(null);
  };

  const exportCSV = () => {
    const header = ['Name', 'Email', 'Role', 'Status', 'Joined'];
    const rowsCsv = tableState.allRows.map(r => [r.name, r.email, r.role, r.status, r.joined]);
    toCSVFile('users.csv', header, rowsCsv);
  };

  return (
    <main className={cn(baseStyles.page, themeStyles.themeWrapper)}>
      <div className={baseStyles.container}>
        <div ref={headerRef} className={cn(headerVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}>
          <AdminTopbar
            title="Users"
            subtitle="Manage all platform users. Filter by role and status, select multiple, and apply bulk actions."
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Users' },
            ]}
            right={(
              <div className={baseStyles.controls} aria-label="User filters">
                <label className={baseStyles.srOnly} htmlFor="q">Search</label>
                <input id="q" className={cn(baseStyles.input, themeStyles.input)} type="search" placeholder="Search users…" value={tableState.query} onChange={(e) => tableState.setQuery(e.target.value)} />
                <label className={baseStyles.srOnly} htmlFor="role">Role</label>
                <select id="role" className={cn(baseStyles.select, themeStyles.select)} value={role} onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <label className={baseStyles.srOnly} htmlFor="status">Status</label>
                <select id="status" className={cn(baseStyles.select, themeStyles.select)} value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="button" className={cn(baseStyles.button, themeStyles.button)} onClick={() => openModal('suspend')} disabled={selectedIds.length === 0}>Suspend</button>
                <button type="button" className={cn(baseStyles.button, themeStyles.button, 'secondary')} onClick={() => openModal('restore')} disabled={selectedIds.length === 0}>Restore</button>
                <button type="button" className={cn(baseStyles.button, themeStyles.button, 'secondary')} onClick={exportCSV} disabled={tableState.allRows.length === 0}>Export CSV</button>
                <label className={baseStyles.srOnly} htmlFor="pageSize">Rows per page</label>
                <select
                  id="pageSize"
                  className={cn(baseStyles.select, themeStyles.select)}
                  value={tableState.pageSize}
                  onChange={(e) => { tableState.setPageSize(Number(e.target.value)); }}
                  aria-label="Rows per page"
                >
                  {[10, 20, 50].map(sz => <option key={sz} value={sz}>{sz}/page</option>)}
                </select>
                <DensityToggle value={density} onChange={setDensity} />
                <ColumnVisibilityMenu
                  columns={allColumns}
                  visibleKeys={visibleKeys}
                  onToggle={toggleColumn}
                  onShowAll={showAll}
                  onHideAll={hideAll}
                  aria-label="Column visibility"
                />
                <button
                  type="button"
                  className={cn(baseStyles.button, themeStyles.button, 'secondary')}
                  onClick={() => { setDensity('comfortable'); showAll(); }}
                  aria-label="Reset table settings"
                >Reset</button>
              </div>
            )}
          />
        </div>

        {selectedIds.length > 0 && (
          <div className={cn(baseStyles.bulkBar, themeStyles.bulkBar)} role="status" aria-live="polite">
            {selectedIds.length} selected
          </div>
        )}

        <div ref={tableRef} className={cn(baseStyles.tableWrap, tableVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}>
          {loading && <div className={baseStyles.skeletonRow} aria-busy={loading || undefined} />}
          {error && <div className={baseStyles.error}>Failed to load users.</div>}
          <Table<UserRow>
            state={tableState}
            columns={columns.slice(1).filter(c => isVisible(c.key as keyof UserRow))}
            className={cn(baseStyles.table, themeStyles.table)}
            density={density}
            headerCheckbox={(
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all users on this page"
              />
            )}
          />
          {tableState.allRows.length === 0 && !loading && (
            <div role="status" aria-live="polite" className={cn(baseStyles.bulkBar, themeStyles.bulkBar)}>
              No users match your filters.
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className={baseStyles.modalOverlay} role="presentation" onClick={() => setModal(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={cn(baseStyles.modal, themeStyles.modal)}
            onClick={(e) => e.stopPropagation()}
          >
            <div id="modal-title" className={cn(baseStyles.modalTitle)}>
              {modal.kind === 'suspend' ? 'Suspend users' : 'Restore users'}
            </div>
            <p>{modal.count} selected user(s). Are you sure?</p>
            <div className={baseStyles.modalActions}>
              <button type="button" className={cn(baseStyles.button, themeStyles.button)} onClick={applyBulk}>
                Confirm
              </button>
              <button type="button" className={cn(baseStyles.button, themeStyles.button, 'secondary')} onClick={() => setModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminUsers;
