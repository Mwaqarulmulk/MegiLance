// @AI-HINT: Client Wallet component. Theme-aware, accessible wallet with payment history and balance information.
'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useClientData } from '@/hooks/useClient';
import TransactionRow from '@/app/components/TransactionRow/TransactionRow';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';
import common from './ClientWallet.common.module.css';
import light from './ClientWallet.light.module.css';
import dark from './ClientWallet.dark.module.css';

const ClientWallet: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const { payments, loading, error } = useClientData();

  const headerRef = useRef<HTMLDivElement | null>(null);
  const balanceRef = useRef<HTMLDivElement | null>(null);
  const transactionsRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const balanceVisible = useIntersectionObserver(balanceRef, { threshold: 0.1 });
  const transactionsVisible = useIntersectionObserver(transactionsRef, { threshold: 0.1 });

  const walletStats = useMemo(() => {
    if (!Array.isArray(payments)) return { totalSpent: 0, pendingAmount: 0, completedPayments: 0 };
    
    const totalSpent = payments.reduce((sum, p) => {
      const amount = parseFloat(p.amount?.replace(/[$,]/g, '') || '0');
      return sum + amount;
    }, 0);
    
    const pendingAmount = payments
      .filter(p => p.status === 'Pending')
      .reduce((sum, p) => {
        const amount = parseFloat(p.amount?.replace(/[$,]/g, '') || '0');
        return sum + amount;
      }, 0);
    
    const completedPayments = payments.filter(p => p.status === 'Completed').length;
    
    return {
      totalSpent,
      pendingAmount,
      completedPayments,
    };
  }, [payments]);

  type Txn = { id: string; amount: string; amountValue: number; date: string; description: string; status: string };
  const transactions = useMemo<Txn[]>(() => {
    if (!Array.isArray(payments)) return [];
    return payments.map((p, idx) => {
      const amountStr = String(p.amount ?? '0');
      const value = parseFloat(amountStr.replace(/[$,]/g, '') || '0');
      return {
        id: String(p.id ?? idx),
        amount: amountStr,
        amountValue: isFinite(value) ? value : 0,
        date: p.date ?? '',
        description: p.description ?? 'Unknown transaction',
        status: p.status ?? 'Unknown',
      };
    });
  }, [payments]);

  // Sorting
  type SortKey = 'date' | 'amount' | 'description' | 'status';
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const sorted = useMemo(() => {
    const list = [...transactions];
    list.sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      switch (sortKey) {
        case 'date': av = a.date; bv = b.date; break;
        case 'amount': av = a.amountValue; bv = b.amountValue; break;
        case 'description': av = a.description; bv = b.description; break;
        case 'status': av = a.status; bv = b.status; break;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [transactions, sortKey, sortDir]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageSafe, pageSize]);

  useEffect(() => { setPage(1); }, [sortKey, sortDir, pageSize]);

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <div ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <div>
            <h1 className={common.title}>Client Wallet</h1>
            <p className={cn(common.subtitle, themed.subtitle)}>Track your payment history and manage your spending.</p>
          </div>
        </div>

        {loading && <div className={common.loading} aria-busy="true">Loading wallet data...</div>}
        {error && <div className={common.error}>Failed to load wallet data.</div>}

        {loading ? (
          <div
            ref={balanceRef}
            className={cn(common.balanceSection, balanceVisible ? common.isVisible : common.isNotVisible)}
            aria-busy="true"
          >
            <div className={common.balanceGrid}>
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={common.balanceCard}>
                    <Skeleton height={16} width={140} />
                    <Skeleton height={28} width={120} />
                  </div>
                ))}
              </>
            </div>
          </div>
        ) : (
          <div
            ref={balanceRef}
            className={cn(common.balanceSection, balanceVisible ? common.isVisible : common.isNotVisible)}
          >
            <div className={common.balanceGrid}>
              <div className={common.balanceCard}>
                <h3 className={common.balanceTitle}>Total Spent</h3>
                <p className={common.balanceAmount}>${walletStats.totalSpent.toLocaleString()}</p>
              </div>
              <div className={common.balanceCard}>
                <h3 className={common.balanceTitle}>Pending Payments</h3>
                <p className={common.balanceAmount}>${walletStats.pendingAmount.toLocaleString()}</p>
              </div>
              <div className={common.balanceCard}>
                <h3 className={common.balanceTitle}>Completed Payments</h3>
                <p className={common.balanceAmount}>{walletStats.completedPayments}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div
            ref={transactionsRef}
            className={cn(common.transactionsSection, transactionsVisible ? common.isVisible : common.isNotVisible)}
            aria-busy="true"
          >
            <section className={common.section}>
              <h2 className={common.sectionTitle}>Recent Transactions</h2>
              <div className={common.toolbar}>
                <div className={common.controls}>
                  <label className={common.srOnly} htmlFor="sort-key">Sort by</label>
                  <select id="sort-key" className={cn(common.select)} value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="description">Description</option>
                    <option value="status">Status</option>
                  </select>
                  <label className={common.srOnly} htmlFor="sort-dir">Sort direction</label>
                  <select id="sort-dir" className={cn(common.select)} value={sortDir} onChange={(e) => setSortDir(e.target.value as 'asc'|'desc')}>
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                  </select>
                  <label className={common.srOnly} htmlFor="page-size">Rows per page</label>
                  <select id="page-size" className={cn(common.select)} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    className={cn(common.button)}
                    onClick={() => {
                      const header = ['ID','Date','Amount','Description','Status'];
                      const data = sorted.map(t => [t.id, t.date, t.amount, t.description, t.status]);
                      const csv = [header, ...data]
                        .map(row => row.map(val => '"' + String(val).replace(/"/g, '""') + '"').join(','))
                        .join('\n');
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `client_wallet_transactions_${new Date().toISOString().slice(0,10)}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >Export CSV</button>
                </div>
              </div>
              <div className={common.transactionList}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={common.rowSkeleton}>
                    <Skeleton height={14} width={'30%'} />
                    <Skeleton height={12} width={'20%'} />
                    <Skeleton height={12} width={'40%'} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div
            ref={transactionsRef}
            className={cn(common.transactionsSection, transactionsVisible ? common.isVisible : common.isNotVisible)}
          >
            <section className={common.section}>
              <h2 className={common.sectionTitle}>Recent Transactions</h2>
              <div className={common.toolbar}>
                <div className={common.controls}>
                  <label className={common.srOnly} htmlFor="sort-key">Sort by</label>
                  <select id="sort-key" className={cn(common.select)} value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="description">Description</option>
                    <option value="status">Status</option>
                  </select>
                  <label className={common.srOnly} htmlFor="sort-dir">Sort direction</label>
                  <select id="sort-dir" className={cn(common.select)} value={sortDir} onChange={(e) => setSortDir(e.target.value as 'asc'|'desc')}>
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                  </select>
                  <label className={common.srOnly} htmlFor="page-size">Rows per page</label>
                  <select id="page-size" className={cn(common.select)} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    className={cn(common.button)}
                    onClick={() => {
                      const header = ['ID','Date','Amount','Description','Status'];
                      const data = sorted.map(t => [t.id, t.date, t.amount, t.description, t.status]);
                      const csv = [header, ...data]
                        .map(row => row.map(val => '"' + String(val).replace(/"/g, '""') + '"').join(','))
                        .join('\n');
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `client_wallet_transactions_${new Date().toISOString().slice(0,10)}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >Export CSV</button>
                </div>
              </div>
              <div className={common.transactionList}>
                {paged.map(txn => (
                  <TransactionRow
                    key={txn.id}
                    amount={txn.amount}
                    date={txn.date}
                    description={txn.description}
                  />
                ))}
                {sorted.length === 0 && (
                  <div className={common.emptyState}>No transactions found.</div>
                )}
              </div>
              {sorted.length > 0 && (
                <div className={common.paginationBar} role="navigation" aria-label="Pagination">
                  <button
                    type="button"
                    className={cn(common.button, 'secondary')}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={pageSafe === 1}
                    aria-label="Previous page"
                  >Prev</button>
                  <span className={common.paginationInfo} aria-live="polite">Page {pageSafe} of {totalPages} · {sorted.length} result(s)</span>
                  <button
                    type="button"
                    className={cn(common.button)}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={pageSafe === totalPages}
                    aria-label="Next page"
                  >Next</button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default ClientWallet;