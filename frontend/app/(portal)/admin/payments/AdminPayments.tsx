// @AI-HINT: Admin Payments page. Theme-aware, accessible, animated with summary KPIs, filters, and transactions table.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './AdminPayments.common.module.css';
import light from './AdminPayments.light.module.css';
import dark from './AdminPayments.dark.module.css';

interface Txn {
  id: string;
  date: string; // ISO
  user: string;
  role: 'Client' | 'Freelancer';
  amount: string; // formatted
  type: 'Payout' | 'Deposit' | 'Refund';
  status: 'Completed' | 'Pending' | 'Failed';
}

const TXNS: Txn[] = [
  { id: 't1', date: '2025-08-05', user: 'Hannah Lee', role: 'Client', amount: '$2,400.00', type: 'Deposit', status: 'Completed' },
  { id: 't2', date: '2025-08-03', user: 'Sofia Gomez', role: 'Freelancer', amount: '$1,200.00', type: 'Payout', status: 'Pending' },
  { id: 't3', date: '2025-07-31', user: 'Alex Carter', role: 'Client', amount: '$450.00', type: 'Refund', status: 'Completed' },
  { id: 't4', date: '2025-07-29', user: 'Diego Ramos', role: 'Freelancer', amount: '$980.00', type: 'Payout', status: 'Failed' },
];

const TYPES = ['All', 'Payout', 'Deposit', 'Refund'] as const;
const STATUSES = ['All', 'Completed', 'Pending', 'Failed'] as const;
const ROLES = ['All', 'Client', 'Freelancer'] as const;

const AdminPayments: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const [query, setQuery] = useState('');
  const [type, setType] = useState<(typeof TYPES)[number]>('All');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All');
  const [role, setRole] = useState<(typeof ROLES)[number]>('All');

  const headerRef = useRef<HTMLDivElement | null>(null);
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const summaryVisible = useIntersectionObserver(summaryRef, { threshold: 0.1 });
  const tableVisible = useIntersectionObserver(tableRef, { threshold: 0.1 });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TXNS.filter(t =>
      (type === 'All' || t.type === type) &&
      (status === 'All' || t.status === status) &&
      (role === 'All' || t.role === role) &&
      (!q || t.user.toLowerCase().includes(q) || t.amount.toLowerCase().includes(q))
    );
  }, [query, type, status, role]);

  // Simple derived metrics from filtered (mocked finance cards)
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
        <div ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <div>
            <h1 className={common.title}>Payments</h1>
            <p className={cn(common.subtitle, themed.subtitle)}>Monitor platform-wide transactions. Filter by type, status, role, and search users.</p>
          </div>
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
          </div>
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
          <table className={cn(common.table, themed.table)}>
            <thead>
              <tr>
                <th scope="col" className={themed.th + ' ' + common.th}>Date</th>
                <th scope="col" className={themed.th + ' ' + common.th}>User</th>
                <th scope="col" className={themed.th + ' ' + common.th}>Role</th>
                <th scope="col" className={themed.th + ' ' + common.th}>Type</th>
                <th scope="col" className={themed.th + ' ' + common.th}>Status</th>
                <th scope="col" className={themed.th + ' ' + common.th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className={common.row}>
                  <td className={themed.td + ' ' + common.td}>{t.date}</td>
                  <td className={themed.td + ' ' + common.td}>{t.user}</td>
                  <td className={themed.td + ' ' + common.td}>{t.role}</td>
                  <td className={themed.td + ' ' + common.td}>{t.type}</td>
                  <td className={themed.td + ' ' + common.td}>
                    <span className={cn(common.badge, themed.badge)}>{t.status}</span>
                  </td>
                  <td className={themed.td + ' ' + common.td}>{t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
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
