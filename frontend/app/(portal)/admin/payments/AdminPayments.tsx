// @AI-HINT: Admin Payments page. Theme-aware, accessible, animated with summary KPIs, filters, and transactions table.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useAdminData } from '@/hooks/useAdmin';
import baseStyles from './AdminPayments.base.module.css';
import lightStyles from './AdminPayments.light.module.css';
import darkStyles from './AdminPayments.dark.module.css';
import DensityToggle, { type Density } from '@/app/components/DataTableExtras/DensityToggle';
import ColumnVisibilityMenu, { type ColumnDef } from '@/app/components/DataTableExtras/ColumnVisibilityMenu';
import AdminTopbar from '@/app/components/Admin/Layout/AdminTopbar';
import { toCSVFile } from '@/app/components/DataTable';
import { useDataTable } from '@/app/components/DataTable/hooks/useDataTable';
import { Table } from '@/app/components/DataTable/Table';
import type { Column as DTColumn } from '@/app/components/DataTable/types';

interface Txn {
  id: string;
  date: string; // ISO
  user: string;
  role: 'Client' | 'Freelancer';
  amount: string; // formatted
  type: 'Payout' | 'Deposit' | 'Refund';
  status: 'Completed' | 'Pending' | 'Failed';
}

const TYPES = ['All', 'Payout', 'Deposit', 'Refund'] as const;
const STATUSES = ['All', 'Completed', 'Pending', 'Failed'] as const;
const ROLES = ['All', 'Client', 'Freelancer'] as const;

const AdminPayments: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const { payments, loading, error } = useAdminData();

  const rows: Txn[] = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    return (payments as any[]).map((t, idx) => ({
      id: String(t.id ?? idx),
      date: t.date ?? '',
      user: t.user ?? t.description ?? '—',
      role: (t.role as Txn['role']) ?? 'Client',
      amount: t.amount ?? '$0.00',
      type: (t.type as Txn['type']) ?? 'Deposit',
      status: (t.status as Txn['status']) ?? 'Completed',
    }));
  }, [payments]);

  const [type, setType] = useState<(typeof TYPES)[number]>('All');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All');
  const [role, setRole] = useState<(typeof ROLES)[number]>('All');
  // Density & column visibility (non-persistent)
  const [density, setDensity] = useState<Density>('comfortable');
  const allColumns: ColumnDef[] = useMemo(() => ([
    { key: 'date', label: 'Date' },
    { key: 'user', label: 'User' },
    { key: 'role', label: 'Role' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'amount', label: 'Amount' },
  ]), []);
  const [visibleKeys, setVisibleKeys] = useState<string[]>(allColumns.map(c => c.key));
  const toggleColumn = (key: string) => setVisibleKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  const showAll = () => setVisibleKeys(allColumns.map(c => c.key));
  const hideAll = () => setVisibleKeys([]);
  const isVisible = (key: keyof Txn) => visibleKeys.includes(key);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const summaryVisible = useIntersectionObserver(summaryRef, { threshold: 0.1 });
  const tableVisible = useIntersectionObserver(tableRef, { threshold: 0.1 });

  // Shared DataTable state
  const columns: DTColumn<Txn>[] = useMemo(() => ([
    { key: 'date', label: 'Date', sortable: true },
    { key: 'user', label: 'User', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (t) => (
      <span className={cn(baseStyles.badge, themeStyles.badge)}>{t.status}</span>
    ) },
    { key: 'amount', label: 'Amount', sortable: true },
  ]), [themeStyles]);

  // Apply only local filters here; search is handled inside useDataTable via tableState.query
  const locallyFiltered = useMemo(() => {
    return rows.filter(t =>
      (type === 'All' || t.type === type) &&
      (status === 'All' || t.status === status) &&
      (role === 'All' || t.role === role)
    );
  }, [rows, type, status, role]);

  const tableState = useDataTable<Txn>(locallyFiltered, columns, { initialSortKey: 'date', initialSortDir: 'desc', initialPageSize: 10 });

  const metrics = useMemo(() => {
    const total = tableState.allRows.reduce((acc, t) => acc + Number(t.amount.replace(/[$,]/g, '')), 0);
    const completed = tableState.allRows.filter(t => t.status === 'Completed').length;
    const pending = tableState.allRows.filter(t => t.status === 'Pending').length;
    return {
      volume: `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      completed,
      pending,
    };
  }, [tableState.allRows]);

  return (
    <main className={cn(baseStyles.page, themeStyles.themeWrapper)}>
      <div className={baseStyles.container}>
        <div ref={headerRef} className={cn(headerVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}>
          <AdminTopbar
            title="Payments"
            subtitle="Monitor platform-wide transactions. Filter by type, status, role, and search users."
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Payments' },
            ]}
            right={(
              <div className={baseStyles.controls} aria-label="Payment filters">
                <label className={baseStyles.srOnly} htmlFor="q">Search</label>
                <input id="q" className={cn(baseStyles.input, themeStyles.input)} type="search" placeholder="Search users or amounts…" value={tableState.query} onChange={(e) => tableState.setQuery(e.target.value)} />
                <label className={baseStyles.srOnly} htmlFor="type">Type</label>
                <select id="type" className={cn(baseStyles.select, themeStyles.select)} value={type} onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}>
                  {TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className={baseStyles.srOnly} htmlFor="status">Status</label>
                <select id="status" className={cn(baseStyles.select, themeStyles.select)} value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className={baseStyles.srOnly} htmlFor="role">Role</label>
                <select id="role" className={cn(baseStyles.select, themeStyles.select)} value={role} onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}>
                  {ROLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                  type="button"
                  className={cn(baseStyles.button, themeStyles.button)}
                  onClick={() => {
                    const headers = ['Date','User','Role','Type','Status','Amount'];
                    const data = tableState.allRows.map(t => [t.date, t.user, t.role, t.type, t.status, t.amount]);
                    toCSVFile(`payments_${new Date().toISOString().slice(0,10)}.csv`, headers, data);
                  }}
                >Export CSV</button>
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

        <section ref={summaryRef} className={cn(baseStyles.summary, summaryVisible ? baseStyles.isVisible : baseStyles.isNotVisible)} aria-label="Payments summary">
          <div className={cn(baseStyles.card, themeStyles.card)} tabIndex={0} aria-labelledby="m1">
            <div id="m1" className={cn(baseStyles.cardTitle, themeStyles.cardTitle)}>Total Volume</div>
            <div className={baseStyles.metric}>{metrics.volume}</div>
          </div>
          <div className={cn(baseStyles.card, themeStyles.card)} tabIndex={0} aria-labelledby="m2">
            <div id="m2" className={cn(baseStyles.cardTitle, themeStyles.cardTitle)}>Completed</div>
            <div className={baseStyles.metric}>{metrics.completed}</div>
          </div>
          <div className={cn(baseStyles.card, themeStyles.card)} tabIndex={0} aria-labelledby="m3">
            <div id="m3" className={cn(baseStyles.cardTitle, themeStyles.cardTitle)}>Pending</div>
            <div className={baseStyles.metric}>{metrics.pending}</div>
          </div>
        </section>

        <div ref={tableRef} className={cn(baseStyles.tableWrap, tableVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}>
          {loading && <div className={baseStyles.skeletonRow} aria-busy="true" />}
          {error && <div className={baseStyles.error}>Failed to load transactions.</div>}
          {/* Page size control and column visibility */}
          <div className={cn(baseStyles.toolbar)}>
            <div className={baseStyles.controls}>
              <label className={baseStyles.srOnly} htmlFor="page-size">Rows per page</label>
              <select id="page-size" className={cn(baseStyles.select, themeStyles.select)} value={tableState.pageSize} onChange={(e) => tableState.setPageSize(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
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
          </div>
          {/* Shared DataTable */}
          <Table<Txn>
            columns={useMemo(() => columns.filter(c => isVisible(c.key as keyof Txn)), [columns, visibleKeys])}
            state={tableState}
            className={cn(baseStyles.table, themeStyles.table)}
          />
          {tableState.allRows.length === 0 && !loading && (
            <div role="status" aria-live="polite" className={cn(baseStyles.card, themeStyles.card)}>
              No transactions match your filters.
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminPayments;
