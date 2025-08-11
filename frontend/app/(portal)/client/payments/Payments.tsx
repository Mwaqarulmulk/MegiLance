// @AI-HINT: Client Payments history. Theme-aware, accessible filters, KPI summary, and animated payments table.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useClientData } from '@/hooks/useClient';
import common from './Payments.common.module.css';
import light from './Payments.light.module.css';
import dark from './Payments.dark.module.css';

interface Payment {
  id: string;
  date: string; // YYYY-MM-DD
  project: string;
  freelancer: string;
  amount: number; // USD
  status: 'Paid' | 'Pending' | 'Failed';
}

const STATUSES = ['All', 'Paid', 'Pending', 'Failed'] as const;

const Payments: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const { payments, loading, error } = useClientData();

  const rows: Payment[] = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    return (payments as any[]).map((p, idx) => ({
      id: String(p.id ?? idx),
      date: p.date ?? p.createdAt ?? '',
      project: p.project ?? p.description ?? 'Unknown Project',
      freelancer: p.freelancer ?? p.user ?? 'Unknown',
      amount: Number(p.amount?.replace(/[$,]/g, '')) || 0,
      status: (p.status as Payment['status']) ?? 'Pending',
    }));
  }, [payments]);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All');

  const headerRef = useRef<HTMLElement | null>(null);
  const summaryRef = useRef<HTMLElement | null>(null);
  const tableRef = useRef<HTMLElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const summaryVisible = useIntersectionObserver(summaryRef, { threshold: 0.1 });
  const tableVisible = useIntersectionObserver(tableRef, { threshold: 0.1 });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(p =>
      (status === 'All' || p.status === status) &&
      (!q || p.project.toLowerCase().includes(q) || p.freelancer.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
    );
  }, [rows, query, status]);

  const kpiTotal = useMemo(() => rows.reduce((s, p) => s + p.amount, 0), [rows]);
  const kpiPaid = useMemo(() => rows.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0), [rows]);
  const kpiPending = useMemo(() => rows.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0), [rows]);

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

  // Sorting
  type SortKey = 'id' | 'date' | 'project' | 'freelancer' | 'amount' | 'status';
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      switch (sortKey) {
        case 'id': av = a.id; bv = b.id; break;
        case 'date': av = a.date; bv = b.date; break;
        case 'project': av = a.project; bv = b.project; break;
        case 'freelancer': av = a.freelancer; bv = b.freelancer; break;
        case 'amount': av = a.amount; bv = b.amount; break;
        case 'status': av = a.status; bv = b.status; break;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageSafe, pageSize]);

  const getSortAria = (key: SortKey): 'ascending' | 'descending' | 'none' => {
    if (key !== sortKey) return 'none';
    return sortDir === 'asc' ? 'ascending' : 'descending';
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc'); // Default to descending for new columns
    }
    setPage(1); // Reset to first page on sort
  };

  React.useEffect(() => { setPage(1); }, [sortKey, sortDir, query, status, pageSize]);

  return (
    <main className={cn(common.page, themed.themeWrapper)} role="application">
      <div className={common.container}>
        <section ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)} aria-labelledby="payments-title" role="banner">
          <div id="payments-title">
            <h1 className={common.title}>Payments</h1>
            <p className={common.subtitle}>Review your transaction history.</p>
          </div>
        </section>

        <div className={common.controlsWrapper}>
          <section aria-labelledby="payments-controls-title" role="form">
            <h2 id="payments-controls-title" className={common.srOnly}>Payment Controls</h2>
            <div className={common.controls}>
              <input type="search" placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} className={cn(common.input, themed.input)} title="Search by project, freelancer, or ID" aria-label="Search payments" />
              <select value={status} onChange={e => setStatus(e.target.value as any)} className={cn(common.select, themed.select)} title="Filter by status" aria-label="Filter by status">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className={cn(common.toolbar)}>
              <div className={common.controls}>
                <label className={common.srOnly} htmlFor="sort-key">Sort by</label>
                <select id="sort-key" className={cn(common.select, themed.select)} value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} title="Sort by" aria-label="Sort by">
                  <option value="date">Date</option>
                  <option value="project">Project</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="amount">Amount</option>
                  <option value="status">Status</option>
                </select>
                <button type="button" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} className={cn(common.button, themed.button)} title={`Sort ${sortDir === 'asc' ? 'descending' : 'ascending'}`} aria-label={`Sort ${sortDir === 'asc' ? 'descending' : 'ascending'}`}>
                  {sortDir === 'asc' ? '↑' : '↓'}
                </button>
                <label className={common.srOnly} htmlFor="page-size">Payments per page</label>
                <select id="page-size" className={cn(common.select, themed.select)} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} title="Results per page" aria-label="Results per page">
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div>
                <button
                  type="button"
                  className={cn(common.button, themed.button)}
                  onClick={() => {
                    const header = ['ID','Date','Project','Freelancer','Amount','Status'];
                    const data = sorted.map(p => [p.id, p.date, p.project, p.freelancer, p.amount, p.status]);
                    const csv = [header, ...data]
                      .map(row => row.map(val => '"' + String(val).replace(/"/g, '""') + '"').join(','))
                      .join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `client_payments_${new Date().toISOString().slice(0,10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  title="Export all filtered transactions to a CSV file"
                  aria-label="Export all filtered transactions to a CSV file"
                >Export CSV</button>
              </div>
            </div>
          </section>
        </div>

        <section ref={summaryRef} className={cn(common.summary, summaryVisible ? common.isVisible : common.isNotVisible)} aria-labelledby="summary-title" role="region">
          <h2 id="summary-title" className={common.srOnly}>Payments Summary</h2>
          <div className={cn(common.card, themed.card)}>
            <div className={cn(common.cardTitle, themed.cardTitle)}>Total</div>
            <div className={cn(common.cardValue, themed.cardValue)}>{fmt(kpiTotal)}</div>
          </div>
          <div className={cn(common.card, themed.card)}>
            <div className={cn(common.cardTitle, themed.cardTitle)}>Paid</div>
            <div className={cn(common.cardValue, themed.cardValue)}>{fmt(kpiPaid)}</div>
          </div>
          <div className={cn(common.card, themed.card)}>
            <div className={cn(common.cardTitle, themed.cardTitle)}>Pending</div>
            <div className={cn(common.cardValue, themed.cardValue)}>{fmt(kpiPending)}</div>
          </div>
        </section>

        <section ref={tableRef} className={cn(common.tableWrap, tableVisible ? common.isVisible : common.isNotVisible)} aria-labelledby="payments-table-title">
          <h2 id="payments-table-title" className={common.srOnly}>Payments Table</h2>
          <div className={common.srOnly} role="status" aria-live="polite">
            {paged.length > 0 ? `Showing ${paged.length} of ${sorted.length} payments.` : 'No payments match your criteria.'}
          </div>
          {loading && <div className={common.skeletonRow} aria-busy={loading} />} 
          {error && <div className={common.error}>Failed to load payments.</div>}
          <table className={cn(common.table)} aria-busy={loading}>
            <thead>
              <tr className={common.tr}>
                <th scope="col" className={common.th} aria-sort={getSortAria('id')} onClick={() => handleSort('id')} title="Sort by ID">ID</th>
                <th scope="col" className={common.th} aria-sort={getSortAria('date')} onClick={() => handleSort('date')} title="Sort by Date">Date</th>
                <th scope="col" className={common.th} aria-sort={getSortAria('project')} onClick={() => handleSort('project')} title="Sort by Project">Project</th>
                <th scope="col" className={common.th} aria-sort={getSortAria('freelancer')} onClick={() => handleSort('freelancer')} title="Sort by Freelancer">Freelancer</th>
                <th scope="col" className={common.th} aria-sort={getSortAria('amount')} onClick={() => handleSort('amount')} title="Sort by Amount">Amount</th>
                <th scope="col" className={common.th} aria-sort={getSortAria('status')} onClick={() => handleSort('status')} title="Sort by Status">Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(p => (
                <tr key={p.id} className={common.tr}>
                  <td className={common.td}>{p.id}</td>
                  <td className={common.td}>{p.date}</td>
                  <td className={common.td}>{p.project}</td>
                  <td className={common.td}>{p.freelancer}</td>
                  <td className={common.td}>{fmt(p.amount)}</td>
                  <td className={common.td}>
                    <span className={cn(common.status, themed.status)}><span className={common.srOnly}>Status: </span>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && !loading && (
            <div role="status" aria-live="polite" className={common.emptyState}>No transactions match your filters.</div>
          )}
        </section>
        {sorted.length > 0 && (
          <div className={common.paginationBar} role="navigation" aria-label="Pagination">
            <button
              type="button"
              className={cn(common.button, themed.button, 'secondary')}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
              aria-label="Previous page"
              title="Go to previous page"
            >Prev</button>
            <span className={common.paginationInfo} aria-live="polite">Page {pageSafe} of {totalPages} · {sorted.length} result(s)</span>
            <button
              type="button"
              className={cn(common.button, themed.button)}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
              aria-label="Next page"
              title="Go to next page"
            >Next</button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Payments;
