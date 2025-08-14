// @AI-HINT: Admin Users page. Theme-aware, accessible, animated user management with filters, selection, bulk actions, and modal.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useAdminData } from '@/hooks/useAdmin';
import common from './AdminUsers.common.module.css';
import light from './AdminUsers.light.module.css';
import dark from './AdminUsers.dark.module.css';
import DensityToggle, { type Density } from '@/app/components/DataTableExtras/DensityToggle';
import ColumnVisibilityMenu, { type ColumnDef } from '@/app/components/DataTableExtras/ColumnVisibilityMenu';
import AdminTopbar from '@/app/components/Admin/Layout/AdminTopbar';

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
  const themed = theme === 'dark' ? dark : light;

  const { users, loading, error } = useAdminData();

  const [query, setQuery] = useState('');
  const [role, setRole] = useState<(typeof ROLES)[number]>('All');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All');
  const [rows, setRows] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<{ kind: 'suspend' | 'restore'; count: number } | null>(null);
  // Sorting & pagination
  const [sortKey, setSortKey] = useState<keyof UserRow>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r =>
      (role === 'All' || r.role === role) &&
      (status === 'All' || r.status === status) &&
      (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
    );
  }, [rows, query, role, status]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = String(a[sortKey] ?? '').toLowerCase();
      const bv = String(b[sortKey] ?? '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
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

  const allSelected = paged.length > 0 && paged.every(r => selected[r.id]);
  const selectedIds = Object.keys(selected).filter(id => selected[id]);

  const toggleAll = () => {
    if (allSelected) {
      const copy = { ...selected };
      paged.forEach(r => { copy[r.id] = false; });
      setSelected(copy);
    } else {
      const copy = { ...selected };
      paged.forEach(r => { copy[r.id] = true; });
      setSelected(copy);
    }
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

  const onSort = (key: keyof UserRow) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const exportCSV = () => {
    const header = ['Name', 'Email', 'Role', 'Status', 'Joined'];
    const rowsCsv = sorted.map(r => [r.name, r.email, r.role, r.status, r.joined]);
    const csv = [header, ...rowsCsv]
      .map(cols => cols.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <div ref={headerRef} className={cn(headerVisible ? common.isVisible : common.isNotVisible)}>
          <AdminTopbar
            title="Users"
            subtitle="Manage all platform users. Filter by role and status, select multiple, and apply bulk actions."
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Users' },
            ]}
            right={(
              <div className={common.controls} aria-label="User filters">
                <label className={common.srOnly} htmlFor="q">Search</label>
                <input id="q" className={cn(common.input, themed.input)} type="search" placeholder="Search users…" value={query} onChange={(e) => setQuery(e.target.value)} />
                <label className={common.srOnly} htmlFor="role">Role</label>
                <select id="role" className={cn(common.select, themed.select)} value={role} onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <label className={common.srOnly} htmlFor="status">Status</label>
                <select id="status" className={cn(common.select, themed.select)} value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="button" className={cn(common.button, themed.button)} onClick={() => openModal('suspend')} disabled={selectedIds.length === 0}>Suspend</button>
                <button type="button" className={cn(common.button, themed.button, 'secondary')} onClick={() => openModal('restore')} disabled={selectedIds.length === 0}>Restore</button>
                <button type="button" className={cn(common.button, themed.button, 'secondary')} onClick={exportCSV} disabled={sorted.length === 0}>Export CSV</button>
                <label className={common.srOnly} htmlFor="pageSize">Rows per page</label>
                <select
                  id="pageSize"
                  className={cn(common.select, themed.select)}
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
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
                  className={cn(common.button, themed.button, 'secondary')}
                  onClick={() => { setDensity('comfortable'); showAll(); }}
                  aria-label="Reset table settings"
                >Reset</button>
              </div>
            )}
          />
        </div>

        {selectedIds.length > 0 && (
          <div className={cn(common.bulkBar, themed.bulkBar)} role="status" aria-live="polite">
            {selectedIds.length} selected
          </div>
        )}

        <div ref={tableRef} className={cn(common.tableWrap, tableVisible ? common.isVisible : common.isNotVisible)}>
          {loading && <div className={common.skeletonRow} aria-busy={loading || undefined} />}
          {error && <div className={common.error}>Failed to load users.</div>}
          <table className={cn(common.table, themed.table)}>
            <thead>
              <tr>
                <th scope="col" className={themed.th + ' ' + common.th}>
                  <input type="checkbox" aria-label="Select all" checked={allSelected} onChange={toggleAll} />
                </th>
                {isVisible('name') && (
                <th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }} aria-sort={sortKey==='name' ? (sortDir==='asc'?'ascending':'descending') : undefined}>
                  <button type="button" className={common.sortBtn} onClick={() => onSort('name')} aria-label="Sort by name">
                    Name{sortKey==='name' && (
                      <span aria-hidden="true" className={common.sortIndicator}>
                        {sortDir==='asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </button>
                </th>)}
                {isVisible('email') && (
                <th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }} aria-sort={sortKey==='email' ? (sortDir==='asc'?'ascending':'descending') : undefined}>
                  <button type="button" className={common.sortBtn} onClick={() => onSort('email')} aria-label="Sort by email">
                    Email{sortKey==='email' && (
                      <span aria-hidden="true" className={common.sortIndicator}>
                        {sortDir==='asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </button>
                </th>)}
                {isVisible('role') && (
                <th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }} aria-sort={sortKey==='role' ? (sortDir==='asc'?'ascending':'descending') : undefined}>
                  <button type="button" className={common.sortBtn} onClick={() => onSort('role')} aria-label="Sort by role">
                    Role{sortKey==='role' && (
                      <span aria-hidden="true" className={common.sortIndicator}>
                        {sortDir==='asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </button>
                </th>)}
                {isVisible('status') && (
                <th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }} aria-sort={sortKey==='status' ? (sortDir==='asc'?'ascending':'descending') : undefined}>
                  <button type="button" className={common.sortBtn} onClick={() => onSort('status')} aria-label="Sort by status">
                    Status{sortKey==='status' && (
                      <span aria-hidden="true" className={common.sortIndicator}>
                        {sortDir==='asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </button>
                </th>)}
                {isVisible('joined') && (
                <th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }} aria-sort={sortKey==='joined' ? (sortDir==='asc'?'ascending':'descending') : undefined}>
                  <button type="button" className={common.sortBtn} onClick={() => onSort('joined')} aria-label="Sort by joined">
                    Joined{sortKey==='joined' && (
                      <span aria-hidden="true" className={common.sortIndicator}>
                        {sortDir==='asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </button>
                </th>)}
              </tr>
            </thead>
            <tbody>
              {paged.map(u => (
                <tr key={u.id} className={common.row}>
                  <td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${u.name}`}
                      checked={!!selected[u.id]}
                      onChange={(e) => setSelected(prev => ({ ...prev, [u.id]: e.target.checked }))}
                    />
                  </td>
                  {isVisible('name') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{u.name}</td>)}
                  {isVisible('email') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{u.email}</td>)}
                  {isVisible('role') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{u.role}</td>)}
                  {isVisible('status') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{u.status}</td>)}
                  {isVisible('joined') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{u.joined}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && !loading && (
            <div role="status" aria-live="polite" className={cn(common.bulkBar, themed.bulkBar)}>
              No users match your filters.
            </div>
          )}
          {/* Pagination controls */}
          {sorted.length > 0 && (
            <div className={common.paginationBar} role="navigation" aria-label="Pagination">
              <button
                type="button"
                className={cn(common.button, themed.button, 'secondary')}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pageSafe === 1}
                aria-label="Previous page"
              >
                Prev
              </button>
              <span className={common.paginationInfo} aria-live="polite">
                Page {pageSafe} of {totalPages} · {sorted.length} result(s)
              </span>
              <button
                type="button"
                className={cn(common.button, themed.button)}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={pageSafe === totalPages}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className={common.modalOverlay} role="presentation" onClick={() => setModal(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={cn(common.modal, themed.modal)}
            onClick={(e) => e.stopPropagation()}
          >
            <div id="modal-title" className={cn(common.modalTitle)}>
              {modal.kind === 'suspend' ? 'Suspend users' : 'Restore users'}
            </div>
            <p>{modal.count} selected user(s). Are you sure?</p>
            <div className={common.modalActions}>
              <button type="button" className={cn(common.button, themed.button)} onClick={applyBulk}>
                Confirm
              </button>
              <button type="button" className={cn(common.button, themed.button, 'secondary')} onClick={() => setModal(null)}>
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
