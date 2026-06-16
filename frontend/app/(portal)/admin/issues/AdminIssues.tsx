// @AI-HINT: Admin issue monitor — lists auto-captured runtime errors (frontend +
// backend) and manual user reports from /error-reports. Triage, copy full details,
// change status/severity, and delete. One-stop place to monitor and fix issues.
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Bug, RefreshCw, Search, Copy, Check, Trash2, X, Loader2,
  AlertTriangle, AlertCircle, Server, Monitor, Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api/core';
import Button from '@/app/components/atoms/Button/Button';
import { useToaster } from '@/app/components/molecules/Toast/ToasterProvider';
import { PageTransition } from '@/app/components/Animations/PageTransition';

interface ErrorRow {
  id: number;
  source: string;
  severity: string;
  error_type: string;
  message: string;
  path?: string;
  method?: string;
  status_code?: number;
  user_id?: number;
  user_email?: string;
  occurrences: number;
  status: string;
  first_seen?: string;
  last_seen?: string;
  stack?: string;
  user_agent?: string;
  context?: string;
  admin_notes?: string;
}

interface Stats {
  total: number; new: number; investigating: number; resolved: number; critical_open: number;
}

const STATUSES = ['new', 'investigating', 'resolved', 'ignored'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

const sevColor: Record<string, string> = {
  low: '#64748b', medium: '#f59e0b', high: '#ef4444', critical: '#b91c1c',
};
const statusColor: Record<string, string> = {
  new: '#3b82f6', investigating: '#f59e0b', resolved: '#10b981', ignored: '#64748b',
};

function sourceIcon(source: string) {
  if (source === 'backend') return <Server size={14} />;
  if (source === 'manual') return <Flag size={14} />;
  return <Monitor size={14} />;
}

export default function AdminIssues() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const toaster = useToaster();

  const [rows, setRows] = useState<ErrorRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<ErrorRow | null>(null);
  const [copied, setCopied] = useState(false);

  const card = isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200';
  const text = isDark ? 'text-gray-100' : 'text-gray-900';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-500';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page_size: '100' });
      if (statusFilter) params.set('status', statusFilter);
      if (sourceFilter) params.set('source', sourceFilter);
      if (severityFilter) params.set('severity', severityFilter);
      if (q.trim()) params.set('q', q.trim());
      const [list, st] = await Promise.all([
        apiFetch<{ items: ErrorRow[] }>(`/error-reports?${params.toString()}`, {}, true),
        apiFetch<Stats>('/error-reports/stats/overview', {}, true).catch(() => null),
      ]);
      setRows(list.items || []);
      if (st) setStats(st);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sourceFilter, severityFilter, q]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id: number) => {
    try {
      const full = await apiFetch<ErrorRow>(`/error-reports/${id}`, {}, true);
      setSelected(full);
    } catch {
      toaster.notify({ title: 'Error', description: 'Could not load issue details.', variant: 'danger' });
    }
  };

  const updateStatus = async (id: number, patch: Partial<Pick<ErrorRow, 'status' | 'severity'>>) => {
    try {
      await apiFetch(`/error-reports/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      setSelected((s) => (s && s.id === id ? { ...s, ...patch } : s));
      load();
    } catch {
      toaster.notify({ title: 'Error', description: 'Could not update issue.', variant: 'danger' });
    }
  };

  const remove = async (id: number) => {
    try {
      await apiFetch(`/error-reports/${id}`, { method: 'DELETE' });
      setRows((prev) => prev.filter((r) => r.id !== id));
      setSelected(null);
      toaster.notify({ title: 'Deleted', description: 'Issue removed.', variant: 'success' });
    } catch {
      toaster.notify({ title: 'Error', description: 'Could not delete issue.', variant: 'danger' });
    }
  };

  const copyDetails = (r: ErrorRow) => {
    let ctx = r.context;
    try { ctx = JSON.stringify(JSON.parse(r.context || '{}'), null, 2); } catch { /* keep raw */ }
    const block = `# Issue #${r.id} — ${r.error_type}
Source: ${r.source} | Severity: ${r.severity} | Status: ${r.status} | Occurrences: ${r.occurrences}
Path: ${r.path || '—'} ${r.method || ''} ${r.status_code ? `(HTTP ${r.status_code})` : ''}
User: ${r.user_email || r.user_id || 'anonymous'}
First seen: ${r.first_seen || '—'} | Last seen: ${r.last_seen || '—'}

## Message
${r.message}

## Stack
${r.stack || '—'}

## Context
${ctx || '—'}

## User agent
${r.user_agent || '—'}`;
    navigator.clipboard.writeText(block).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toaster.notify({ title: 'Copied', description: 'Full issue details copied to clipboard.', variant: 'success' });
    });
  };

  const statCards = [
    { label: 'Total', value: stats?.total ?? 0, color: '#6366f1', icon: Bug },
    { label: 'New', value: stats?.new ?? 0, color: '#3b82f6', icon: AlertCircle },
    { label: 'Investigating', value: stats?.investigating ?? 0, color: '#f59e0b', icon: Loader2 },
    { label: 'Critical open', value: stats?.critical_open ?? 0, color: '#b91c1c', icon: AlertTriangle },
    { label: 'Resolved', value: stats?.resolved ?? 0, color: '#10b981', icon: Check },
  ];

  return (
    <PageTransition>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className={cn('text-2xl font-bold flex items-center gap-2', text)}>
              <Bug size={24} /> Issues & Errors
            </h1>
            <p className={cn('text-sm', subtext)}>
              Auto-captured runtime errors and user-reported issues — monitor, copy, and resolve.
            </p>
          </div>
          <Button variant="secondary" onClick={load} type="button">
            <RefreshCw size={16} /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className={cn('rounded-xl border p-4', card)}>
              <div className="flex items-center gap-2" style={{ color: s.color }}>
                <s.icon size={18} />
                <span className={cn('text-2xl font-bold', text)}>{s.value}</span>
              </div>
              <div className={cn('text-xs mt-1', subtext)}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={cn('rounded-xl border p-3 flex flex-wrap items-center gap-2', card)}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className={cn('absolute left-3 top-1/2 -translate-y-1/2', subtext)} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search message, type, path…"
              className={cn(
                'w-full pl-9 pr-3 py-2 rounded-lg border text-sm bg-transparent',
                isDark ? 'border-gray-700 text-gray-100' : 'border-gray-300 text-gray-900',
              )}
            />
          </div>
          {[
            { val: statusFilter, set: setStatusFilter, opts: STATUSES, label: 'All statuses' },
            { val: severityFilter, set: setSeverityFilter, opts: SEVERITIES, label: 'All severities' },
            { val: sourceFilter, set: setSourceFilter, opts: ['frontend', 'backend', 'manual'], label: 'All sources' },
          ].map((f, i) => (
            <select
              key={i}
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              className={cn('px-3 py-2 rounded-lg border text-sm bg-transparent capitalize',
                isDark ? 'border-gray-700 text-gray-100 bg-gray-800' : 'border-gray-300 text-gray-900')}
            >
              <option value="">{f.label}</option>
              {f.opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>

        {/* List */}
        <div className={cn('rounded-xl border overflow-hidden', card)}>
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin" size={28} /></div>
          ) : rows.length === 0 ? (
            <div className={cn('p-12 text-center', subtext)}>
              <Check size={36} className="mx-auto mb-3 opacity-50" />
              No issues found. Everything looks healthy. 🎉
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
              {rows.map((r) => (
                <button
                  key={r.id}
                  onClick={() => openDetail(r.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-start gap-3 transition-colors',
                    isDark ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50',
                  )}
                >
                  <span className="mt-1" style={{ color: sevColor[r.severity] }} title={r.severity}>
                    {sourceIcon(r.source)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={cn('flex items-center gap-2 flex-wrap', text)}>
                      <span className="font-semibold text-sm">{r.error_type}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full text-white" style={{ background: sevColor[r.severity] }}>{r.severity}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full text-white" style={{ background: statusColor[r.status] }}>{r.status}</span>
                      {r.occurrences > 1 && <span className={cn('text-xs', subtext)}>×{r.occurrences}</span>}
                    </span>
                    <span className={cn('block text-sm truncate mt-0.5', subtext)}>{r.message}</span>
                    <span className={cn('block text-xs mt-0.5 truncate', subtext)}>
                      {r.path || '—'} · {r.last_seen ? new Date(r.last_seen).toLocaleString() : ''}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-[1000] flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className={cn('relative w-full max-w-lg h-full overflow-y-auto p-6 shadow-2xl', isDark ? 'bg-gray-900' : 'bg-white')}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className={cn('text-lg font-bold flex items-center gap-2', text)}>
                {sourceIcon(selected.source)} {selected.error_type}
              </h2>
              <button onClick={() => setSelected(null)} className={subtext}><X size={20} /></button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs px-2 py-1 rounded-full text-white" style={{ background: sevColor[selected.severity] }}>{selected.severity}</span>
              <span className="text-xs px-2 py-1 rounded-full text-white" style={{ background: statusColor[selected.status] }}>{selected.status}</span>
              <span className={cn('text-xs px-2 py-1 rounded-full border capitalize', isDark ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-600')}>{selected.source}</span>
              {selected.occurrences > 1 && <span className={cn('text-xs px-2 py-1', subtext)}>seen {selected.occurrences}×</span>}
            </div>

            <div className="space-y-3 text-sm">
              <Field label="Message" value={selected.message} text={text} subtext={subtext} mono />
              {selected.path && <Field label="Location" value={`${selected.path} ${selected.method || ''} ${selected.status_code ? `(HTTP ${selected.status_code})` : ''}`} text={text} subtext={subtext} />}
              <Field label="User" value={selected.user_email || (selected.user_id ? `#${selected.user_id}` : 'anonymous')} text={text} subtext={subtext} />
              <Field label="First / last seen" value={`${selected.first_seen ? new Date(selected.first_seen).toLocaleString() : '—'}  →  ${selected.last_seen ? new Date(selected.last_seen).toLocaleString() : '—'}`} text={text} subtext={subtext} />
              {selected.stack && <Field label="Stack trace" value={selected.stack} text={text} subtext={subtext} mono pre />}
              {selected.context && selected.context !== '{}' && <Field label="Context" value={selected.context} text={text} subtext={subtext} mono pre />}
              {selected.user_agent && <Field label="User agent" value={selected.user_agent} text={text} subtext={subtext} />}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <label className={cn('text-xs', subtext)}>Status</label>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, { status: e.target.value })}
                  className={cn('px-2 py-1.5 rounded-lg border text-sm capitalize bg-transparent', isDark ? 'border-gray-700 text-gray-100 bg-gray-800' : 'border-gray-300')}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className={cn('text-xs ml-2', subtext)}>Severity</label>
                <select
                  value={selected.severity}
                  onChange={(e) => updateStatus(selected.id, { severity: e.target.value })}
                  className={cn('px-2 py-1.5 rounded-lg border text-sm capitalize bg-transparent', isDark ? 'border-gray-700 text-gray-100 bg-gray-800' : 'border-gray-300')}
                >
                  {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="primary" onClick={() => copyDetails(selected)} type="button">
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy full details'}
                </Button>
                <Button variant="danger" onClick={() => remove(selected.id)} type="button">
                  <Trash2 size={16} /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}

function Field({ label, value, text, subtext, mono, pre }: {
  label: string; value: string; text: string; subtext: string; mono?: boolean; pre?: boolean;
}) {
  return (
    <div>
      <div className={cn('text-xs uppercase tracking-wide mb-1', subtext)}>{label}</div>
      {pre ? (
        <pre className={cn('text-xs whitespace-pre-wrap break-words rounded-lg p-3 max-h-60 overflow-auto', mono && 'font-mono', text)}
          style={{ background: 'rgba(127,127,127,0.1)' }}>{value}</pre>
      ) : (
        <div className={cn('break-words', mono && 'font-mono text-xs', text)}>{value}</div>
      )}
    </div>
  );
}
