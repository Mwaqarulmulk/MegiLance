// @AI-HINT: Admin Payments page. Theme-aware, accessible, animated with summary KPIs, filters, and transactions table.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useAdminData } from '@/hooks/useAdmin';
import common from './AdminPayments.common.module.css';
import light from './AdminPayments.light.module.css';
import dark from './AdminPayments.dark.module.css';
import DensityToggle, { type Density } from '@/app/components/DataTableExtras/DensityToggle';
import ColumnVisibilityMenu, { type ColumnDef } from '@/app/components/DataTableExtras/ColumnVisibilityMenu';
import AdminTopbar from '@/app/components/Admin/Layout/AdminTopbar';

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
  const themed = theme === 'dark' ? dark : light;
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

  const [query, setQuery] = useState('');
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(t =>
      (type === 'All' || t.type === type) &&
      (status === 'All' || t.status === status) &&
      (role === 'All' || t.role === role) &&
      (!q || t.user.toLowerCase().includes(q) || t.amount.toLowerCase().includes(q))
    );
  }, [rows, query, type, status, role]);

  const metrics = useMemo(() => {
    const total = filtered.reduce((acc, t) => acc + Number(t.amount.replace(/[$,]/g, '')), 0);
    const completed = filtered.filter(t => t.status === 'Completed').length;
    const pending = filtered.filter(t => t.status === 'Pending').length;
    return {
      volume: `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      completed,
      pending,
    };
  }, [filtered]);

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <div ref={headerRef} className={cn(headerVisible ? common.isVisible : common.isNotVisible)}>
          <AdminTopbar
            title="Payments"
            subtitle="Monitor platform-wide transactions. Filter by type, status, role, and search users."
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Payments' },
            ]}
            right={(
              <div className={common.controls} aria-label="Payment filters">
                <label className={common.srOnly} htmlFor="q">Search</label>
                <input id="q" className={cn(common.input, themed.input)} type="search" placeholder="Search users or amounts…" value={query} onChange={(e) => setQuery(e.target.value)} />
                <label className={common.srOnly} htmlFor="type">Type</label>
                <select id="type" className={cn(common.select, themed.select)} value={type} onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}>
                  {TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className={common.srOnly} htmlFor="status">Status</label>
                <select id="status" className={cn(common.select, themed.select)} value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className={common.srOnly} htmlFor="role">Role</label>
                <select id="role" className={cn(common.select, themed.select)} value={role} onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}>
                  {ROLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="button" className={cn(common.button, themed.button)}>Export CSV</button>
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

        <section ref={summaryRef} className={cn(common.summary, summaryVisible ? common.isVisible : common.isNotVisible)} aria-label="Payments summary">
          <div className={cn(common.card, themed.card)} tabIndex={0} aria-labelledby="m1">
            <div id="m1" className={cn(common.cardTitle, themed.cardTitle)}>Total Volume</div>
            <div className={common.metric}>{metrics.volume}</div>
          </div>
          <div className={cn(common.card, themed.card)} tabIndex={0} aria-labelledby="m2">
            <div id="m2" className={cn(common.cardTitle, themed.cardTitle)}>Completed</div>
            <div className={common.metric}>{metrics.completed}</div>
          </div>
          <div className={cn(common.card, themed.card)} tabIndex={0} aria-labelledby="m3">
            <div id="m3" className={cn(common.cardTitle, themed.cardTitle)}>Pending</div>
            <div className={common.metric}>{metrics.pending}</div>
          </div>
        </section>

        <div ref={tableRef} className={cn(common.tableWrap, tableVisible ? common.isVisible : common.isNotVisible)}>
          {loading && <div className={common.skeletonRow} aria-busy="true" />}
          {error && <div className={common.error}>Failed to load transactions.</div>}
          <table className={cn(common.table, themed.table)}>
            <thead>
              <tr>
                {isVisible('date') && (<th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Date</th>)}
                {isVisible('user') && (<th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>User</th>)}
                {isVisible('role') && (<th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Role</th>)}
                {isVisible('type') && (<th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Type</th>)}
                {isVisible('status') && (<th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Status</th>)}
                {isVisible('amount') && (<th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Amount</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className={common.row}>
                  {isVisible('date') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{t.date}</td>)}
                  {isVisible('user') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{t.user}</td>)}
                  {isVisible('role') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{t.role}</td>)}
                  {isVisible('type') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{t.type}</td>)}
                  {isVisible('status') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>
                    <span className={cn(common.badge, themed.badge)}>{t.status}</span>
                  </td>)}
                  {isVisible('amount') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{t.amount}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div role="status" aria-live="polite" className={cn(common.card, themed.card)}>
              No transactions match your filters.
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminPayments;
