// @AI-HINT: Freelancer Timesheets page. Interactive time entries with inline editing mock and filters. Uses portal AppLayout shell (no public navbar/footer).
'use client';

import React, { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import Table, { TableColumn, TableRow } from '@/app/components/Table/Table';
import Tooltip from '@/app/components/Tooltip/Tooltip';
import Modal from '@/app/components/Modal/Modal';
import { cn } from '@/lib/utils';
import commonStyles from './Timesheets.common.module.css';
import lightStyles from './Timesheets.light.module.css';
import darkStyles from './Timesheets.dark.module.css';

const mockEntries: TableRow[] = [
  { id: 'TS-1001', project: 'Website Redesign', date: '2025-08-01', hours: 3.5, notes: 'Hero section polish', billable: true },
  { id: 'TS-1002', project: 'Mobile App', date: '2025-08-02', hours: 5, notes: 'Onboarding flow', billable: true },
  { id: 'TS-1003', project: 'Internal R&D', date: '2025-08-03', hours: 2, notes: 'Prototype', billable: false },
];

export default function Page() {
  const { theme } = useTheme();
  const styles = theme === 'dark' ? darkStyles : lightStyles;
  const [q, setQ] = useState('');
  const [billable, setBillable] = useState<'All'|'Billable'|'Non-billable'>('All');
  const [localRows, setLocalRows] = useState<TableRow[]>(mockEntries);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [form, setForm] = useState<{project: string; date: string; hours: number; notes: string; billable: boolean}>({ project: '', date: '', hours: 1, notes: '', billable: true });

  const data = useMemo(() => {
    return localRows.filter((row) => {
      const matchQ = q.trim().length === 0 || String(row.project).toLowerCase().includes(q.toLowerCase()) || String(row.notes).toLowerCase().includes(q.toLowerCase());
      const matchB = billable === 'All' || (billable === 'Billable' ? row.billable : !row.billable);
      return matchQ && matchB;
    });
  }, [q, billable, localRows]);

  const updateHours = (id: string, value: number) => {
    setLocalRows((rows) => rows.map((r) => (r.id === id ? { ...r, hours: value } : r)));
  };

  const columns: TableColumn[] = [
    { key: 'date', header: 'Date' },
    { key: 'project', header: 'Project' },
    { key: 'hours', header: 'Hours', render: (row) => (
      <input
        type="number"
        min={0}
        step={0.25}
        defaultValue={Number(row.hours)}
        onBlur={(e) => updateHours(String(row.id), Number(e.target.value))}
        className="w-24 border rounded px-2 py-1"
        aria-label={`Edit hours for ${String(row.project)}`}
      />
    )},
    { key: 'billable', header: 'Billable', render: (row) => (
      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-sm', row.billable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700')}>
        {row.billable ? 'Yes' : 'No'}
      </span>
    )},
    { key: 'notes', header: 'Notes' },
  ];

  return (
    <div className={cn(commonStyles.container, styles.container)}>
      <header className={cn(commonStyles.header)}>
        <div>
          <h1 className={cn(commonStyles.title, styles.title)}>Timesheets</h1>
          <p className={cn(commonStyles.subtitle, styles.subtitle)}>Track and edit your time entries before invoicing.</p>
        </div>
        <div className={cn(commonStyles.actions)}>
          <Tooltip text="Add a new time entry">
            <button onClick={() => setIsNewOpen(true)} className={cn(commonStyles.primaryBtn, styles.primaryBtn)}>New Entry</button>
          </Tooltip>
          <Tooltip text="Submit selected entries for invoicing">
            <button className={cn(commonStyles.secondaryBtn, styles.secondaryBtn)}>Submit</button>
          </Tooltip>
        </div>
      </header>

      <div className={cn(commonStyles.controls)}>
        <input
          type="search"
          placeholder="Search projects or notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={cn(commonStyles.search, styles.search)}
          aria-label="Search timesheets"
        />
        <div
          role="radiogroup"
          aria-label="Billable filter"
          className={cn(commonStyles.radioGroup)}
          onKeyDown={(e) => {
            const options = ['All','Billable','Non-billable'] as const;
            const idx = options.indexOf(billable);
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              const next = options[(idx + 1) % options.length];
              setBillable(next);
              (document.getElementById(`ts-billable-${next}`) as HTMLButtonElement | null)?.focus();
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              const prev = options[(idx - 1 + options.length) % options.length];
              setBillable(prev);
              (document.getElementById(`ts-billable-${prev}`) as HTMLButtonElement | null)?.focus();
            }
          }}
        >
          {(['All','Billable','Non-billable'] as const).map((b) => (
            <button
              key={b}
              id={`ts-billable-${b}`}
              role="radio"
              aria-checked={billable === b ? true : false}
              onClick={() => setBillable(b)}
              className={cn(commonStyles.radio, styles.radio, billable === b && cn(commonStyles.radioActive, styles.radioActive))}
              tabIndex={billable === b ? 0 : -1}
              type="button"
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <Table columns={columns} data={data} caption="Your time entries" />

      <Modal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        title="New Time Entry"
        footer={(
          <div className={cn(commonStyles.footer, styles.footer)}>
            <button className={cn(commonStyles.secondaryBtn, styles.secondaryBtn)} onClick={() => setIsNewOpen(false)}>Cancel</button>
            <button
              className={cn(commonStyles.primaryBtn, styles.primaryBtn)}
              onClick={() => {
                setLocalRows((rows) => [{ id: `TS-${Math.floor(Math.random()*10000)}`, project: form.project || 'Untitled', date: form.date || new Date().toISOString().slice(0,10), hours: form.hours, notes: form.notes, billable: form.billable }, ...rows]);
                setIsNewOpen(false);
              }}
            >
              Add Entry
            </button>
          </div>
        )}
      >
        <form className={cn(commonStyles.modalForm)} onSubmit={(e) => e.preventDefault()}>
          <div className={cn(commonStyles.formRow)}>
            <label htmlFor="ts-project">Project</label>
            <input id="ts-project" className={cn(commonStyles.input, styles.input)} value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} />
          </div>
          <div className={cn(commonStyles.formRow)}>
            <label htmlFor="ts-date">Date</label>
            <input id="ts-date" type="date" className={cn(commonStyles.input, styles.input)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className={cn(commonStyles.formRow)}>
            <label htmlFor="ts-hours">Hours</label>
            <input id="ts-hours" type="number" min={0} step={0.25} className={cn(commonStyles.input, styles.input)} value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} />
          </div>
          <div className={cn(commonStyles.formRow)}>
            <label htmlFor="ts-notes">Notes</label>
            <input id="ts-notes" className={cn(commonStyles.input, styles.input)} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className={cn(commonStyles.formRow)}>
            <label htmlFor="ts-billable">Billable</label>
            <select id="ts-billable" className={cn(commonStyles.input, styles.input)} value={form.billable ? 'Yes' : 'No'} onChange={(e) => setForm({ ...form, billable: e.target.value === 'Yes' })}>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
