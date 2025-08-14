// @AI-HINT: Portal Wallet page. Theme-aware, accessible, animated balance and transactions with filters, export, and toasts.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './Wallet.common.module.css';
import light from './Wallet.light.module.css';
import dark from './Wallet.dark.module.css';
import DensityToggle, { type Density } from '@/app/components/DataTableExtras/DensityToggle';
import ColumnVisibilityMenu, { type ColumnDef } from '@/app/components/DataTableExtras/ColumnVisibilityMenu';

interface Txn {
  id: string;
  date: string; // ISO-like
  description: string;
  type: 'Payout' | 'Payment' | 'Refund' | 'Fee';
  amount: number; // positive for credit, negative for debit
}

const MOCK_TXNS: Txn[] = [
  { id: 't1', date: '2025-08-06', description: 'Client payment — INV-204', type: 'Payment', amount: 2400 },
  { id: 't2', date: '2025-08-03', description: 'Platform fee', type: 'Fee', amount: -48 },
  { id: 't3', date: '2025-07-29', description: 'Payout to bank', type: 'Payout', amount: -1200 },
  { id: 't4', date: '2025-07-22', description: 'Refund to client — INV-199', type: 'Refund', amount: -200 },
  { id: 't5', date: '2025-07-20', description: 'Client payment — INV-198', type: 'Payment', amount: 1500 },
];

const TYPES = ['All', 'Payment', 'Payout', 'Refund', 'Fee'] as const;
const RANGES = ['Any time', 'Past week', 'Past month', 'Past year'] as const;

const Wallet: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const [type, setType] = useState<(typeof TYPES)[number]>('All');
  const [range, setRange] = useState<(typeof RANGES)[number]>('Past month');
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; msg: string } | null>(null);
  // Density & column visibility (non-persistent)
  const [density, setDensity] = useState<Density>('comfortable');
  const allColumns: ColumnDef[] = React.useMemo(() => ([
    { key: 'date', label: 'Date' },
    { key: 'description', label: 'Description' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount' },
  ]), []);
  const [visibleKeys, setVisibleKeys] = useState<string[]>(allColumns.map(c => c.key));
  const toggleColumn = (key: string) => setVisibleKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  const showAll = () => setVisibleKeys(allColumns.map(c => c.key));
  const hideAll = () => setVisibleKeys([]);
  const isVisible = (key: keyof Txn) => visibleKeys.includes(key);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const gridVisible = useIntersectionObserver(gridRef, { threshold: 0.1 });

  const balance = useMemo(() => 48895, []);

  const txns = useMemo(() => {
    const byType = type === 'All' ? MOCK_TXNS : MOCK_TXNS.filter(t => t.type === type);
    const dayMs = 24 * 60 * 60 * 1000;
    const within = (d: string) => {
      if (range === 'Any time') return true;
      const now = new Date();
      const dt = new Date(d);
      const diff = now.getTime() - dt.getTime();
      if (range === 'Past week') return diff <= 7 * dayMs;
      if (range === 'Past month') return diff <= 31 * dayMs;
      if (range === 'Past year') return diff <= 365 * dayMs;
      return true;
    };
    return byType.filter(t => within(t.date));
  }, [type, range]);

  const exportCSV = () => {
    try {
      const header = ['id', 'date', 'description', 'type', 'amount'];
      const rows = txns.map(t => [t.id, t.date, t.description, t.type, t.amount.toString()]);
      const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToast({ kind: 'success', msg: 'Transactions exported' });
    } catch (e) {
      setToast({ kind: 'error', msg: 'Export failed' });
    }
  };

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <div ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <div>
            <h1 className={common.title}>Wallet</h1>
            <p className={cn(common.subtitle, themed.subtitle)}>Manage your balance, payouts, and transactions.</p>
          </div>
          <div className={common.controls} aria-label="Wallet filters">
            <label className={common.srOnly} htmlFor="type">Type</label>
            <select id="type" className={cn(common.select, themed.select)} value={type} onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <label className={common.srOnly} htmlFor="range">Date range</label>
            <select id="range" className={cn(common.select, themed.select)} value={range} onChange={(e) => setRange(e.target.value as (typeof RANGES)[number])}>
              {RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <button type="button" className={cn(common.button, themed.button)} onClick={exportCSV}>Export CSV</button>
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
        </div>

        <div ref={gridRef} className={cn(common.grid, gridVisible ? common.isVisible : common.isNotVisible)}>
          <section className={cn(common.card, themed.card)} aria-label="Current balance">
            <div className={cn(common.cardTitle, themed.cardTitle)}>Balance</div>
            <div className={common.balance}>
              <div className={common.amount}>${balance.toLocaleString()}</div>
            </div>
          </section>

          <section className={cn(common.card, themed.card)} aria-label="Transactions">
            <div className={cn(common.cardTitle, themed.cardTitle)}>Transactions</div>
            <table className={common.table}>
              <thead>
                <tr>
                  {isVisible('date') && (<th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Date</th>)}
                  {isVisible('description') && (<th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Description</th>)}
                  {isVisible('type') && (<th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Type</th>)}
                  {isVisible('amount') && (<th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Amount</th>)}
                </tr>
              </thead>
              <tbody>
                {txns.map((t) => (
                  <tr key={t.id}>
                    {isVisible('date') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{t.date}</td>)}
                    {isVisible('description') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{t.description}</td>)}
                    {isVisible('type') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{t.type}</td>)}
                    {isVisible('amount') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }} aria-label={`Amount ${t.amount >= 0 ? '+' : ''}${t.amount.toLocaleString()}`}>
                      {(t.amount >= 0 ? '+' : '') + '$' + Math.abs(t.amount).toLocaleString()}
                    </td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(common.toast, themed.toast, toast.kind === 'success' ? themed.toastSuccess : themed.toastError)}
        >
          {toast.msg}
        </div>
      )}
    </main>
  );
};

export default Wallet;
