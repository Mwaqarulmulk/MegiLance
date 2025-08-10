// @AI-HINT: This is the Wallet page for freelancers to manage their earnings and transactions. It is now fully theme-aware and features a premium, investor-grade design.
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import TransactionRow from '@/app/components/TransactionRow/TransactionRow';
import Button from '@/app/components/Button/Button';
import { useFreelancerData } from '@/hooks/useFreelancer';
import DataToolbar, { SortOption } from '@/app/components/DataToolbar/DataToolbar';
import PaginationBar from '@/app/components/PaginationBar/PaginationBar';
import { usePersistedState } from '@/app/lib/hooks/usePersistedState';
import { exportCSV } from '@/app/lib/csv';
import TableSkeleton from '@/app/components/DataTableExtras/TableSkeleton';
import DensityToggle, { Density } from '@/app/components/DataTableExtras/DensityToggle';
import commonStyles from './Wallet.common.module.css';
import lightStyles from './Wallet.light.module.css';
import darkStyles from './Wallet.dark.module.css';

const Wallet: React.FC = () => {
  const { theme } = useTheme();
  const { analytics, transactions, loading, error } = useFreelancerData();
  
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const balance = useMemo(() => {
    if (!analytics?.walletBalance) return 0;
    const balanceStr = analytics.walletBalance.replace(/[$,]/g, '');
    return parseFloat(balanceStr) ?? 0;
  }, [analytics?.walletBalance]);

  const [q, setQ] = usePersistedState<string>('freelancer:wallet:q', '');
  const [sortKey, setSortKey] = usePersistedState<'date' | 'amount' | 'type'>('freelancer:wallet:sortKey', 'date');
  const [sortDir, setSortDir] = usePersistedState<'asc' | 'desc'>('freelancer:wallet:sortDir', 'desc');
  const [pageSize, setPageSize] = usePersistedState<number>('freelancer:wallet:pageSize', 10);
  const [page, setPage] = usePersistedState<number>('freelancer:wallet:page', 1);
  const [uiLoading, setUiLoading] = useState(false);
  const [density, setDensity] = usePersistedState<Density>('freelancer:wallet:density', 'comfortable');

  interface TxRow {
    id: string;
    type: string;
    amount: string;
    date: string;
    description: string;
  }

  const transactionRows: TxRow[] = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.map((txn, idx) => ({
      id: String(txn.id ?? idx),
      type: txn.type?.toLowerCase() ?? 'payment',
      amount: txn.amount ?? '0',
      date: txn.date ?? '',
      description: txn.description ?? 'Unknown transaction',
    }));
  }, [transactions]);

  const filtered = useMemo(() => {
    const lowerCaseQ = q.toLowerCase();
    return transactionRows.filter((tx) => {
      return tx.type.includes(lowerCaseQ) || tx.description.includes(lowerCaseQ);
    });
  }, [transactionRows, q]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    const sortFn = (a: TxRow, b: TxRow) => {
      if (sortKey === 'date') {
        const av = new Date(a.date).getTime();
        const bv = new Date(b.date).getTime();
        return sortDir === 'asc' ? av - bv : bv - av;
      } else if (sortKey === 'amount') {
        const av = parseFloat(a.amount);
        const bv = parseFloat(b.amount);
        return sortDir === 'asc' ? av - bv : bv - av;
      } else {
        return sortDir === 'asc' ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
      }
    };
    list.sort(sortFn);
    return list;
  }, [filtered, sortKey, sortDir]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return sorted.slice(start, end);
  }, [sorted, page, pageSize]);

  const totalPages = useMemo(() => {
    const t = Math.ceil(sorted.length / pageSize);
    return Math.max(1, t);
  }, [sorted, pageSize]);

  const pageSafe = useMemo(() => {
    return Math.min(Math.max(1, page), totalPages);
  }, [page, totalPages]);

  // Lightweight UI loading to avoid layout jank on control changes
  useEffect(() => {
    setUiLoading(true);
    const t = setTimeout(() => setUiLoading(false), 120);
    return () => clearTimeout(t);
  }, [q, sortKey, sortDir, page, pageSize]);

  const onExportCSV = () => {
    const header = ['Type', 'Amount', 'Date', 'Description'];
    const rows = sorted.map(tx => [tx.type, tx.amount, tx.date, tx.description]);
    exportCSV(header, rows, 'transactions');
  };

  const sortOptions: SortOption[] = [
    { value: 'date:desc', label: 'Newest' },
    { value: 'date:asc', label: 'Oldest' },
    { value: 'amount:desc', label: 'Amount High–Low' },
    { value: 'amount:asc', label: 'Amount Low–High' },
    { value: 'type:asc', label: 'Type A–Z' },
    { value: 'type:desc', label: 'Type Z–A' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Wallet</h1>
        <p className={styles.subtitle}>View your balance, transactions, and manage withdrawals.</p>
      </header>

      {loading && <div className={styles.loading} aria-busy="true">Loading wallet...</div>}
      {error && <div className={styles.error}>Failed to load wallet data.</div>}

      <div className={styles.contentGrid}>
        <div className={styles.balanceCard}>
          <h2 className={styles.cardTitle}>Available Balance</h2>
          <p className={styles.balanceAmount}>${balance.toLocaleString()}</p>
          <Button variant="primary" size="large" disabled={balance <= 0} aria-disabled={balance <= 0}>Withdraw Funds</Button>
        </div>

        <section className={styles.transactionsCard}>
          <h2 className={styles.cardTitle}>Transaction History</h2>
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
            onExportCSV={onExportCSV}
            exportLabel="Export CSV"
            aria-label="Transactions filters and actions"
          />

          <div className={styles.extrasRow} role="group" aria-label="View options">
            <DensityToggle value={density} onChange={setDensity} />
          </div>

          <div className={styles.transactionList} data-density={density}>
            {uiLoading ? (
              <TableSkeleton rows={Math.min(pageSize, 6)} cols={3} dense={density==='compact'} />
            ) : (
              <>
                {paged.map((tx) => (
                  <TransactionRow key={tx.id} {...tx} />
                ))}
                {sorted.length === 0 && !loading && (
                  <div className={styles.emptyState} role="status" aria-live="polite">No transactions found.</div>
                )}
              </>
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
        </section>
      </div>
    </div>
  );
};

export default Wallet;
