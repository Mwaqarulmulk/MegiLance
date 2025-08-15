// @AI-HINT: Admin Support page. Theme-aware, accessible, animated tickets list with filters and a details panel.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useAdminData } from '@/hooks/useAdmin';
import Modal from '@/app/components/Modal/Modal';
import baseStyles from './AdminSupport.base.module.css';
import lightStyles from './AdminSupport.light.module.css';
import darkStyles from './AdminSupport.dark.module.css';
import AdminTopbar from '@/app/components/Admin/Layout/AdminTopbar';
import { toCSVFile } from '@/app/components/DataTable';
import { useDataTable } from '@/app/components/DataTable/hooks/useDataTable';
import type { Column as DTColumn } from '@/app/components/DataTable/types';

interface Ticket {
  id: string;
  subject: string;
  requester: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  created: string; // ISO
  assignee?: string;
  body: string;
}

const STATUSES = ['All', 'Open', 'In Progress', 'Resolved'] as const;
const PRIORITIES = ['All', 'Low', 'Medium', 'High'] as const;

const AdminSupport: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const { tickets, loading, error } = useAdminData();

  const [localTickets, setLocalTickets] = useState<Ticket[]>([]);

  const rows: Ticket[] = useMemo(() => {
    const base: Ticket[] = Array.isArray(tickets)
      ? (tickets as any[]).map((t, idx) => ({
          id: String(t.id ?? idx),
          subject: t.subject ?? '—',
          requester: t.requester ?? '—',
          priority: (t.priority as Ticket['priority']) ?? 'Low',
          status: (t.status as Ticket['status']) ?? 'Open',
          created: t.createdAt ?? t.created ?? '',
          assignee: t.assignee ?? undefined,
          body: t.body ?? t.message ?? '',
        }))
      : [];
    return [...base, ...localTickets];
  }, [tickets, localTickets]);

  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All');
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const listVisible = useIntersectionObserver(listRef, { threshold: 0.1 });
  const detailsVisible = useIntersectionObserver(detailsRef, { threshold: 0.1 });

  const locallyFiltered = useMemo(() => {
    return rows.filter(t =>
      (status === 'All' || t.status === status) &&
      (priority === 'All' || t.priority === priority)
    );
  }, [rows, status, priority]);

  const columns: DTColumn<Ticket>[] = useMemo(() => ([
    { key: 'subject', label: 'Subject', sortable: true },
    { key: 'requester', label: 'Requester', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'created', label: 'Created', sortable: true },
  ]), []);

  const tableState = useDataTable<Ticket>(locallyFiltered, columns, { initialSortKey: 'created', initialSortDir: 'desc', initialPageSize: 10 });

  React.useEffect(() => {
    if (!selectedId && tableState.rows.length > 0) {
      setSelectedId(tableState.rows[0].id);
    }
  }, [tableState.rows, selectedId]);

  const selectedTicket = useMemo(() => {
    return tableState.allRows.find(t => t.id === selectedId) || null;
  }, [selectedId, tableState.allRows]);

  // CSV export
  const exportCSV = () => {
    const header = ['ID','Subject','Requester','Priority','Status','Created','Assignee'];
    const data = tableState.allRows.map(t => [t.id, t.subject, t.requester, t.priority, t.status, t.created, t.assignee ?? '']);
    toCSVFile(`tickets_export_${new Date().toISOString().slice(0,10)}.csv`, header, data);
  };

  // New Ticket modal state
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newRequester, setNewRequester] = useState('');
  const [newPriority, setNewPriority] = useState<Ticket['priority']>('Low');
  const [newBody, setNewBody] = useState('');

  const resetNewForm = () => {
    setNewSubject('');
    setNewRequester('');
    setNewPriority('Low');
    setNewBody('');
  };

  const createTicket = () => {
    if (!newSubject.trim() || !newRequester.trim() || !newBody.trim()) return;
    const t: Ticket = {
      id: `local-${Date.now()}`,
      subject: newSubject.trim(),
      requester: newRequester.trim(),
      priority: newPriority,
      status: 'Open',
      created: new Date().toISOString(),
      body: newBody.trim(),
    };
    setLocalTickets(prev => [t, ...prev]);
    setSelectedId(t.id);
    setIsNewOpen(false);
    resetNewForm();
  };

  // Local-only actions for Assign/Resolve when applicable
  const assignSelected = () => {
    if (!selectedTicket) return;
    if (!String(selectedTicket.id).startsWith('local-')) {
      alert('Assign is a mock action for remote tickets.');
      return;
    }
    const name = prompt('Assign to (name):', selectedTicket.assignee ?? '');
    if (name === null) return;
    setLocalTickets(prev => prev.map(t => (t.id === selectedTicket.id ? { ...t, assignee: name.trim() || undefined } : t)));
  };

  const resolveSelected = () => {
    if (!selectedTicket) return;
    if (!String(selectedTicket.id).startsWith('local-')) {
      alert('Resolve is a mock action for remote tickets.');
      return;
    }
    setLocalTickets(prev => prev.map(t => (t.id === selectedTicket.id ? { ...t, status: 'Resolved' } : t)));
  };

  return (
    <main className={cn(baseStyles.page, themeStyles.themeWrapper)}>
      <div className={baseStyles.container}>
        <div ref={headerRef} className={cn(baseStyles.header, headerVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}>
          <AdminTopbar
            title="Support"
            subtitle="Triage and resolve support tickets. Filter by status and priority; select a ticket to view details."
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Support' },
            ]}
            right={(
              <div className={baseStyles.controls} aria-label="Support filters">
                <label className={baseStyles.srOnly} htmlFor="q">Search</label>
                <input id="q" className={cn(baseStyles.input, themeStyles.input)} type="search" placeholder="Search subject, requester, assignee…" value={tableState.query} onChange={(e) => tableState.setQuery(e.target.value)} />
                <label className={baseStyles.srOnly} htmlFor="status">Status</label>
                <select id="status" className={cn(baseStyles.select, themeStyles.select)} value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className={baseStyles.srOnly} htmlFor="priority">Priority</label>
                <select id="priority" className={cn(baseStyles.select, themeStyles.select)} value={priority} onChange={(e) => setPriority(e.target.value as (typeof PRIORITIES)[number])}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button type="button" className={cn(baseStyles.button, themeStyles.button)} onClick={() => setIsNewOpen(true)}>New Ticket</button>
              </div>
            )}
          />
        </div>

        <section className={cn(baseStyles.layout)}>
          <div ref={listRef} className={cn(baseStyles.listCard, themeStyles.listCard, listVisible ? baseStyles.isVisible : baseStyles.isNotVisible)} aria-label="Tickets list">
            <div className={cn(baseStyles.cardTitle)}>Tickets</div>
            <div className={cn(baseStyles.toolbar)}>
              <div className={baseStyles.controls}>
                <div className={baseStyles.sortButtons}>
                  {columns.map(c => c.sortable && (
                    <button
                      key={c.key}
                      type="button"
                      className={cn(baseStyles.button, themeStyles.button, tableState.sortKey === c.key ? 'active' : '')}
                      onClick={() => tableState.setSort(c.key as keyof Ticket)}
                      aria-label={`Sort by ${c.label}`}>
                      {c.label}
                      {tableState.sortKey === c.key && (
                        <span aria-hidden="true" className={baseStyles.sortIndicator}>
                          {tableState.sortDir === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <label className={baseStyles.srOnly} htmlFor="page-size">Rows per page</label>
                <select id="page-size" className={cn(baseStyles.select, themeStyles.select)} value={tableState.pageSize} onChange={(e) => tableState.setPageSize(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div>
                <button type="button" className={cn(baseStyles.button, themeStyles.button)} onClick={exportCSV}>Export CSV</button>
              </div>
            </div>
            {loading && <div className={baseStyles.skeletonRow} aria-busy={loading || undefined} />}
            {error && <div className={baseStyles.error}>Failed to load tickets.</div>}
            <div className={baseStyles.list} role="listbox" aria-label="Tickets">
              {tableState.rows.map(t => {
                const isSelected = selectedId === t.id;
                return (
                  <div
                    key={t.id}
                    role="option"
                    aria-selected={isSelected || undefined}
                    tabIndex={0}
                    className={cn(baseStyles.item)}
                    onClick={() => setSelectedId(t.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedId(t.id);
                      }
                    }}
                  >
                    <div className={baseStyles.itemHeader}>
                      <span>{t.subject}</span>
                      <span className={cn(baseStyles.badge, themeStyles.badge)}>{t.priority}</span>
                    </div>
                    <div className={baseStyles.meta}>
                      <span>{t.requester}</span>
                      <span>•</span>
                      <span>{t.status}</span>
                      <span>•</span>
                      <span>{t.created}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {tableState.allRows.length === 0 && !loading && (
              <div role="status" aria-live="polite">No tickets match your filters.</div>
            )}
            {tableState.allRows.length > 0 && (
              <div className={baseStyles.paginationBar} role="navigation" aria-label="Pagination">
                <button
                  type="button"
                  className={cn(baseStyles.button, themeStyles.button, 'secondary')}
                  onClick={() => tableState.setPage(Math.max(1, tableState.page - 1))}
                  disabled={tableState.page === 1}
                  aria-label="Previous page"
                >Prev</button>
                <span className={baseStyles.paginationInfo} aria-live="polite">Page {tableState.page} of {tableState.totalPages} · {tableState.allRows.length} result(s)</span>
                <button
                  type="button"
                  className={cn(baseStyles.button, themeStyles.button)}
                  onClick={() => tableState.setPage(Math.min(tableState.totalPages, tableState.page + 1))}
                  disabled={tableState.page === tableState.totalPages}
                  aria-label="Next page"
                >Next</button>
              </div>
            )}
          </div>

          <div ref={detailsRef} className={cn(baseStyles.detailsCard, themeStyles.detailsCard, detailsVisible ? baseStyles.isVisible : baseStyles.isNotVisible)} aria-label="Ticket details">
            <div className={cn(baseStyles.cardTitle)}>Details</div>
            {selectedTicket ? (
              <div className={baseStyles.detailsGrid}>
                <div className={baseStyles.kv}><div>Subject</div><div>{selectedTicket.subject}</div></div>
                <div className={baseStyles.kv}><div>Requester</div><div>{selectedTicket.requester}</div></div>
                <div className={baseStyles.kv}><div>Status</div><div>{selectedTicket.status}</div></div>
                <div className={baseStyles.kv}><div>Priority</div><div>{selectedTicket.priority}</div></div>
                <div className={baseStyles.kv}><div>Assignee</div><div>{selectedTicket.assignee ?? 'Unassigned'}</div></div>
                <div className={baseStyles.kv}><div>Created</div><div>{selectedTicket.created}</div></div>
                <div className={baseStyles.kv}><div>Message</div><div>{selectedTicket.body}</div></div>
                <div className={baseStyles.actions}>
                  <button type="button" className={cn(baseStyles.button, themeStyles.button)} onClick={assignSelected}>Assign</button>
                  <button type="button" className={cn(baseStyles.button, themeStyles.button, 'secondary')} onClick={resolveSelected}>Resolve</button>
                </div>
              </div>
            ) : (
              <div role="status" aria-live="polite">Select a ticket to view details.</div>
            )}
          </div>
        </section>
      </div>
      {isNewOpen && (
        <Modal isOpen={isNewOpen} onClose={() => { setIsNewOpen(false); }} title="New Support Ticket">
          <div className={baseStyles.field}>
            <label htmlFor="new-subject" className={baseStyles.label}>Subject</label>
            <input id="new-subject" className={cn(baseStyles.input, themeStyles.input)} value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Brief issue summary" />
          </div>
          <div className={baseStyles.row}>
            <div className={baseStyles.field}>
              <label htmlFor="new-requester" className={baseStyles.label}>Requester</label>
              <input id="new-requester" className={cn(baseStyles.input, themeStyles.input)} value={newRequester} onChange={(e) => setNewRequester(e.target.value)} placeholder="Requester name or email" />
            </div>
            <div className={baseStyles.field}>
              <label htmlFor="new-priority" className={baseStyles.label}>Priority</label>
              <select id="new-priority" className={cn(baseStyles.select, themeStyles.select)} value={newPriority} onChange={(e) => setNewPriority(e.target.value as Ticket['priority'])}>
                {(['Low','Medium','High'] as const).map(p => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
          </div>
          <div className={baseStyles.field}>
            <label htmlFor="new-body" className={baseStyles.label}>Message</label>
            <textarea id="new-body" className={cn(baseStyles.textarea, themeStyles.textarea)} rows={5} value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="Describe the issue in detail" />
          </div>
          <div className={baseStyles.modalActions}>
            <button type="button" className={cn(baseStyles.button, themeStyles.button, 'secondary')} onClick={() => { setIsNewOpen(false); }}>Cancel</button>
            <button type="button" className={cn(baseStyles.button, themeStyles.button)} onClick={createTicket} disabled={!newSubject.trim() || !newRequester.trim() || !newBody.trim()}>Create</button>
          </div>
        </Modal>
      )}
    </main>
  );
};

export default AdminSupport;
