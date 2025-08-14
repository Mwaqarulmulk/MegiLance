// @AI-HINT: Freelancer Invoices page. Dynamic, interactive table with filters and quick actions. Uses portal AppLayout shell (no public navbar/footer).
'use client';

import React, { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import Table, { TableColumn, TableRow } from '@/app/components/Table/Table';
import Tooltip from '@/app/components/Tooltip/Tooltip';
import Modal from '@/app/components/Modal/Modal';
import { cn } from '@/lib/utils';
import commonStyles from './Invoices.common.module.css';
import lightStyles from './Invoices.light.module.css';
import darkStyles from './Invoices.dark.module.css';

const mockInvoices: TableRow[] = [
  { id: 'INV-0001', client: 'Acme Corp', amount: '$1,200', status: 'Paid', date: '2025-07-21' },
  { id: 'INV-0002', client: 'Globex', amount: '$850', status: 'Pending', date: '2025-07-28' },
  { id: 'INV-0003', client: 'Initech', amount: '$2,050', status: 'Overdue', date: '2025-08-01' },
];

export default function Page() {
  const { theme } = useTheme();
  const styles = theme === 'dark' ? darkStyles : lightStyles;

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [form, setForm] = useState({ id: 'INV-NEW', client: '', amount: '', status: 'Pending', date: '' });

  const data = useMemo(() => {
    return mockInvoices.filter((row) => {
      const matchQ = q.trim().length === 0 || String(row.id).toLowerCase().includes(q.toLowerCase()) || String(row.client).toLowerCase().includes(q.toLowerCase());
      const matchStatus = status === 'All' || row.status === status;
      return matchQ && matchStatus;
    });
  }, [q, status]);

  const columns: TableColumn[] = [
    { key: 'id', header: 'Invoice #'},
    { key: 'client', header: 'Client'},
    { key: 'amount', header: 'Amount'},
    { key: 'status', header: 'Status', render: (row) => (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 text-sm',
        )}
        aria-label={`Status ${String(row.status)}`}
      >
        {String(row.status)}
      </span>
    )},
    { key: 'date', header: 'Date'},
  ];

  return (
    <div className={cn(commonStyles.container, styles.container)}>
      <header className={cn(commonStyles.header)}>
        <div>
          <h1 className={cn(commonStyles.title, styles.title)}>Invoices</h1>
          <p className={cn(commonStyles.subtitle, styles.subtitle)}>Generate, track, and send invoices to your clients.</p>
        </div>
        <div className={cn(commonStyles.actions)}>
          <Tooltip text="Create and send a new invoice">
            <button onClick={() => setIsNewOpen(true)} className={cn(commonStyles.primaryBtn, styles.primaryBtn)}>New Invoice</button>
          </Tooltip>
          <Tooltip text="Export your invoices as CSV">
            <button className={cn(commonStyles.secondaryBtn, styles.secondaryBtn)}>Export CSV</button>
          </Tooltip>
        </div>
      </header>

      <div className={cn(commonStyles.controls)}>
        <input
          type="search"
          placeholder="Search invoices…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={cn(commonStyles.search, styles.search)}
          aria-label="Search invoices"
        />
        <div
          role="radiogroup"
          aria-label="Status filter"
          className={cn(commonStyles.radioGroup)}
          onKeyDown={(e) => {
            const options = ['All','Paid','Pending','Overdue'] as const;
            const idx = options.indexOf(status);
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              const next = options[(idx + 1) % options.length];
              setStatus(next);
              (document.getElementById(`inv-status-${next}`) as HTMLButtonElement | null)?.focus();
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              const prev = options[(idx - 1 + options.length) % options.length];
              setStatus(prev);
              (document.getElementById(`inv-status-${prev}`) as HTMLButtonElement | null)?.focus();
            }
          }}
        >
          {(['All', 'Paid', 'Pending', 'Overdue'] as const).map((s) => (
            <button
              key={s}
              id={`inv-status-${s}`}
              role="radio"
              aria-checked={status === s ? true : false}
              onClick={() => setStatus(s)}
              className={cn(commonStyles.radio, styles.radio, status === s && cn(commonStyles.radioActive, styles.radioActive))}
              tabIndex={status === s ? 0 : -1}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Table columns={columns} data={data} caption="Your invoices" />

      <Modal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        title="New Invoice"
        footer={(
          <div className={cn(commonStyles.footer, styles.footer)}>
            <button className={cn(commonStyles.secondaryBtn, styles.secondaryBtn)} onClick={() => setIsNewOpen(false)}>Cancel</button>
            <button
              className={cn(commonStyles.primaryBtn, styles.primaryBtn)}
              onClick={() => setIsNewOpen(false)}
            >
              Create
            </button>
          </div>
        )}
        size="large"
      >
        <form className={cn(commonStyles.modalForm)} onSubmit={(e) => e.preventDefault()}>
          <div className={cn(commonStyles.formRow)}>
            <label htmlFor="invoice-id">Invoice #</label>
            <input id="invoice-id" className={cn(commonStyles.input, styles.input)} value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
          </div>
          <div className={cn(commonStyles.formRow)}>
            <label htmlFor="invoice-client">Client</label>
            <input id="invoice-client" className={cn(commonStyles.input, styles.input)} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
          </div>
          <div className={cn(commonStyles.formRow)}>
            <label htmlFor="invoice-amount">Amount</label>
            <input id="invoice-amount" className={cn(commonStyles.input, styles.input)} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="$0.00" />
          </div>
          <div className={cn(commonStyles.formRow)}>
            <label htmlFor="invoice-status">Status</label>
            <select id="invoice-status" className={cn(commonStyles.input, styles.input)} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Pending</option>
              <option>Paid</option>
              <option>Overdue</option>
            </select>
          </div>
          <div className={cn(commonStyles.formRow)}>
            <label htmlFor="invoice-date">Date</label>
            <input id="invoice-date" type="date" className={cn(commonStyles.input, styles.input)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
