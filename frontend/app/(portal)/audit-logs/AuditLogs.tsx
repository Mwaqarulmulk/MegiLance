// @AI-HINT: Audit Logs page. Theme-aware, accessible, animated table with filters and row details.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import baseStyles from './AuditLogs.base.module.css';
import lightStyles from './AuditLogs.light.module.css';
import darkStyles from './AuditLogs.dark.module.css';
import DensityToggle, { type Density } from '@/app/components/DataTableExtras/DensityToggle';
import ColumnVisibilityMenu, { type ColumnDef } from '@/app/components/DataTableExtras/ColumnVisibilityMenu';

interface LogItem {
  id: string;
  time: string; // ISO-like
  actor: string;
  action: 'Login' | 'Logout' | 'Role Change' | 'Password Reset' | 'Project Update' | 'Invoice Paid';
  resource: string;
  ip: string;
  meta?: Record<string, string>;
}

const MOCK_LOGS: LogItem[] = [
  { id: 'a1', time: '2025-08-08T05:10:00Z', actor: 'alex@megilance.com', action: 'Login', resource: 'Portal', ip: '203.0.113.5' },
  { id: 'a2', time: '2025-08-07T15:44:00Z', actor: 'sofia@megilance.com', action: 'Project Update', resource: 'E-commerce Redesign', ip: '198.51.100.21', meta: { field: 'status', from: 'In Progress', to: 'Review' } },
  { id: 'a3', time: '2025-08-06T12:30:00Z', actor: 'admin@megilance.com', action: 'Role Change', resource: 'User: hannah', ip: '192.0.2.11', meta: { role: 'Freelancer -> Admin' } },
  { id: 'a4', time: '2025-08-05T09:20:00Z', actor: 'hannah@megilance.com', action: 'Password Reset', resource: 'Account', ip: '203.0.113.18' },
  { id: 'a5', time: '2025-08-03T20:10:00Z', actor: 'finance@megilance.com', action: 'Invoice Paid', resource: 'INV-204', ip: '198.51.100.77' },
];

const ACTIONS = ['All', 'Login', 'Logout', 'Role Change', 'Password Reset', 'Project Update', 'Invoice Paid'] as const;
const RANGES = ['Any time', 'Past week', 'Past month', 'Past year'] as const;

const AuditLogs: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const [action, setAction] = useState<(typeof ACTIONS)[number]>('All');
  const [range, setRange] = useState<(typeof RANGES)[number]>('Past month');
  const [actor, setActor] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Density & column visibility (non-persistent)
  const [density, setDensity] = useState<Density>('comfortable');
  const allColumns: ColumnDef[] = useMemo(() => ([
    { key: 'time', label: 'Time' },
    { key: 'actor', label: 'Actor' },
    { key: 'action', label: 'Action' },
    { key: 'resource', label: 'Resource' },
    { key: 'ip', label: 'IP' },
  ]), []);
  const [visibleKeys, setVisibleKeys] = useState<string[]>(allColumns.map(c => c.key));
  const toggleColumn = (key: string) => setVisibleKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  const showAll = () => setVisibleKeys(allColumns.map(c => c.key));
  const hideAll = () => setVisibleKeys([]);
  const isVisible = (key: keyof LogItem) => visibleKeys.includes(key);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const tableVisible = useIntersectionObserver(tableRef, { threshold: 0.1 });

  const logs = useMemo(() => {
    const byAction = action === 'All' ? MOCK_LOGS : MOCK_LOGS.filter(l => l.action === action);
    const byActor = actor.trim() ? byAction.filter(l => l.actor.toLowerCase().includes(actor.trim().toLowerCase())) : byAction;
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
    return byActor.filter(l => within(l.time));
  }, [action, actor, range]);

  const selected = logs.find(l => l.id === selectedId) || MOCK_LOGS.find(l => l.id === selectedId) || null;

  return (
    <main className={cn(baseStyles.page, themeStyles.themeWrapper)}>
      <div className={baseStyles.container}>
        <div ref={headerRef} className={cn(baseStyles.header, headerVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}>
          <div>
            <h1 className={baseStyles.title}>Audit Logs</h1>
            <p className={cn(baseStyles.subtitle, themeStyles.subtitle)}>Track important security and activity events across your account.</p>
          </div>
          <div className={baseStyles.controls} aria-label="Audit log filters">
            <label className={baseStyles.srOnly} htmlFor="actor">Actor</label>
            <input id="actor" className={cn(baseStyles.input, themeStyles.input)} type="search" placeholder="Search actor…" value={actor} onChange={(e) => setActor(e.target.value)} />

            <label className={baseStyles.srOnly} htmlFor="action">Action</label>
            <select id="action" className={cn(baseStyles.select, themeStyles.select)} value={action} onChange={(e) => setAction(e.target.value as (typeof ACTIONS)[number])}>
              {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <label className={baseStyles.srOnly} htmlFor="range">Date range</label>
            <select id="range" className={cn(baseStyles.select, themeStyles.select)} value={range} onChange={(e) => setRange(e.target.value as (typeof RANGES)[number])}>
              {RANGES.map(r => <option key={r} value={r}>{r}</option>)}
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

        <div ref={tableRef} className={cn(baseStyles.tableWrap, tableVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}>
          <table className={cn(baseStyles.table, themeStyles.table)}>
            <thead>
              <tr>
                {isVisible('time') && (<th scope="col" className={cn(baseStyles.th, themeStyles.th)} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Time</th>)}
                {isVisible('actor') && (<th scope="col" className={cn(baseStyles.th, themeStyles.th)} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Actor</th>)}
                {isVisible('action') && (<th scope="col" className={cn(baseStyles.th, themeStyles.th)} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Action</th>)}
                {isVisible('resource') && (<th scope="col" className={cn(baseStyles.th, themeStyles.th)} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Resource</th>)}
                {isVisible('ip') && (<th scope="col" className={cn(baseStyles.th, themeStyles.th)} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>IP</th>)}
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr
                  key={l.id}
                  tabIndex={0}
                  className={cn(baseStyles.row)}
                  onClick={() => setSelectedId(l.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(l.id); } }}
                  aria-selected={selectedId === l.id}
                >
                  {isVisible('time') && (<td className={cn(baseStyles.td, themeStyles.td)} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{new Date(l.time).toLocaleString()}</td>)}
                  {isVisible('actor') && (<td className={cn(baseStyles.td, themeStyles.td)} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{l.actor}</td>)}
                  {isVisible('action') && (<td className={cn(baseStyles.td, themeStyles.td)} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{l.action}</td>)}
                  {isVisible('resource') && (<td className={cn(baseStyles.td, themeStyles.td)} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{l.resource}</td>)}
                  {isVisible('ip') && (<td className={cn(baseStyles.td, themeStyles.td)} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{l.ip}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div role="status" aria-live="polite" className={cn(baseStyles.details, themeStyles.details)}>
            No matching audit logs.
          </div>
        )}

        {selected && (
          <section className={cn(baseStyles.details, themeStyles.details)} aria-label={`Details for event ${selected.id}`}>
            <div className={cn(baseStyles.detailsTitle)}>Event Details</div>
            <div className={baseStyles.kv}><div>Event ID</div><div>{selected.id}</div></div>
            <div className={baseStyles.kv}><div>Time</div><div>{new Date(selected.time).toLocaleString()}</div></div>
            <div className={baseStyles.kv}><div>Actor</div><div>{selected.actor}</div></div>
            <div className={baseStyles.kv}><div>Action</div><div>{selected.action}</div></div>
            <div className={baseStyles.kv}><div>Resource</div><div>{selected.resource}</div></div>
            <div className={baseStyles.kv}><div>IP Address</div><div>{selected.ip}</div></div>
            {selected.meta && Object.entries(selected.meta).map(([k,v]) => (
              <div key={k} className={baseStyles.kv}><div>{k}</div><div>{v}</div></div>
            ))}
            <button type="button" className={cn(baseStyles.button, themeStyles.button, 'secondary')} onClick={() => setSelectedId(null)}>Close</button>
          </section>
        )}
      </div>
    </main>
  );
};

export default AuditLogs;
