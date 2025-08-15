// @AI-HINT: Admin AI Monitoring page. Theme-aware, accessible, animated KPIs, SVG charts, and logs list.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useAdminData } from '@/hooks/useAdmin';
import baseStyles from './AIMonitoring.base.module.css';
import lightStyles from './AIMonitoring.light.module.css';
import darkStyles from './AIMonitoring.dark.module.css';
import AdminTopbar from '@/app/components/Admin/Layout/AdminTopbar';
import { toCSVFile } from '@/app/components/DataTable';
import { useDataTable } from '@/app/components/DataTable/hooks/useDataTable';
import { Table } from '@/app/components/DataTable/Table';
import type { Column as DTColumn } from '@/app/components/DataTable/types';

interface KPI { id: string; label: string; value: string; }
interface LogRow { id: string; ts: string; level: 'info' | 'warn' | 'error'; message: string; model: string; latencyMs: number; }

const LEVELS = ['All', 'info', 'warn', 'error'] as const;

const AIMonitoring: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const { ai, loading, error } = useAdminData();

  const kpis: KPI[] = useMemo(() => {
    if (!ai?.aiStats) return [];
    return [
      { id: 'k1', label: 'Rank Model Accuracy', value: ai.aiStats.rankModelAccuracy ?? '0%' },
      { id: 'k2', label: 'Fraud Detections', value: String(ai.aiStats.fraudDetections ?? 0) },
      { id: 'k3', label: 'Price Estimations', value: String(ai.aiStats.priceEstimations ?? 0) },
      { id: 'k4', label: 'Chatbot Sessions', value: String(ai.aiStats.chatbotSessions ?? 0) },
    ];
  }, [ai?.aiStats]);

  const logs: LogRow[] = useMemo(() => {
    if (!Array.isArray(ai?.recentFraudAlerts)) return [];
    return (ai.recentFraudAlerts as any[]).map((l, idx) => ({
      id: String(l.id ?? idx),
      ts: l.timestamp ?? '',
      level: 'warn' as LogRow['level'],
      message: l.reason ?? '',
      model: 'Fraud Detection',
      latencyMs: 0,
    }));
  }, [ai?.recentFraudAlerts]);

  const [level, setLevel] = useState<(typeof LEVELS)[number]>('All');

  const headerRef = useRef<HTMLDivElement | null>(null);
  const kpiRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const kpisVisible = useIntersectionObserver(kpiRef, { threshold: 0.1 });
  const gridVisible = useIntersectionObserver(gridRef, { threshold: 0.1 });

  const columns: DTColumn<LogRow>[] = useMemo(() => ([
    { key: 'ts', label: 'Timestamp', sortable: true },
    { key: 'level', label: 'Level', sortable: true },
    { key: 'model', label: 'Model', sortable: true },
    { key: 'latencyMs', label: 'Latency (ms)', sortable: true },
    { key: 'message', label: 'Message', sortable: true },
  ]), []);

  const locallyFiltered = useMemo(() => {
    return logs.filter(l => (level === 'All' || l.level === level));
  }, [logs, level]);

  const tableState = useDataTable<LogRow>(locallyFiltered, columns, { initialSortKey: 'ts', initialSortDir: 'desc' });

  return (
    <main className={cn(baseStyles.page, themeStyles.themeWrapper)}>
      <div className={baseStyles.container}>
        <div ref={headerRef} className={cn(baseStyles.header, headerVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}>
          <AdminTopbar
            title="AI Monitoring"
            subtitle="Track AI usage, latency, errors, and cost. Filter logs by level and search text."
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'AI Monitoring' },
            ]}
            right={(
              <div className={baseStyles.controls} aria-label="AI monitoring controls">
                <label className={baseStyles.srOnly} htmlFor="q">Search</label>
                <input id="q" className={cn(baseStyles.input, themeStyles.input)} type="search" placeholder="Search logs…" value={tableState.query} onChange={(e) => tableState.setQuery(e.target.value)} />
                <label className={baseStyles.srOnly} htmlFor="level">Level</label>
                <select id="level" className={cn(baseStyles.select, themeStyles.select)} value={level} onChange={(e) => setLevel(e.target.value as (typeof LEVELS)[number])}>
                  {LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                  type="button"
                  className={cn(baseStyles.button, themeStyles.button)}
                  onClick={() => {
                    const headers = ['Timestamp','Level','Model','Latency(ms)','Message'];
                    const data = tableState.allRows.map(l => [l.ts, l.level, l.model, String(l.latencyMs), l.message]);
                    toCSVFile(`ai_logs_${new Date().toISOString().slice(0,10)}.csv`, headers, data);
                  }}
                >Export Logs</button>
              </div>
            )}
          />
        </div>

        <section ref={kpiRef} className={cn(baseStyles.kpis, kpisVisible ? baseStyles.isVisible : baseStyles.isNotVisible)} aria-label="AI KPIs">
          {loading && <div className={baseStyles.skeletonRow} aria-busy="true" />}
          {error && <div className={baseStyles.error}>Failed to load AI metrics.</div>}
          {kpis.map(k => (
            <div key={k.id} className={cn(baseStyles.card)} tabIndex={0} aria-labelledby={`kpi-${k.id}-label`}>
              <div id={`kpi-${k.id}-label`} className={cn(baseStyles.cardTitle, themeStyles.cardTitle)}>{k.label}</div>
              <div className={cn(baseStyles.metric, themeStyles.metric)}>{k.value}</div>
            </div>
          ))}
        </section>

        <section ref={gridRef} className={cn(baseStyles.grid, gridVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}>
          <div className={cn(baseStyles.panel, themeStyles.panel)} aria-label="Latency chart">
            <div className={cn(baseStyles.cardTitle, themeStyles.cardTitle)}>Latency (ms)</div>
            {/* Inline SVG area chart */}
            <svg width="100%" height="180" viewBox="0 0 300 180" preserveAspectRatio="none" role="img" aria-label="Latency over time">
              <desc>Area chart showing latency over time</desc>
              <rect x="0" y="0" width="300" height="180" fill="transparent" />
              <polyline points="0,140 30,120 60,125 90,100 120,110 150,90 180,95 210,80 240,100 270,85 300,92" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.85" />
            </svg>
          </div>

          <div className={cn(baseStyles.panel, themeStyles.panel)} aria-label="Error rate">
            <div className={cn(baseStyles.cardTitle, themeStyles.cardTitle)}>Error Rate</div>
            <svg width="100%" height="180" viewBox="0 0 300 180" preserveAspectRatio="none" role="img" aria-label="Error rate">
              <desc>Bar chart of error rate</desc>
              {([5,3,4,2,6,4,3] as const).map((h, i) => (
                <rect key={i} x={15 + i * 40} y={160 - h * 20} width="24" height={h * 20} rx="3" ry="3" fill="currentColor" opacity="0.8" />
              ))}
            </svg>
          </div>
        </section>

        <section className={cn(baseStyles.panel, themeStyles.panel)} aria-label="Recent logs">
          <div className={cn(baseStyles.cardTitle, themeStyles.cardTitle)}>Recent Logs</div>
          {loading && <div className={baseStyles.skeletonRow} aria-busy="true" />}
          {error && <div className={baseStyles.error}>Failed to load logs.</div>}
          {!loading && !error && (
            <Table<LogRow>
              columns={columns}
              state={tableState}
              className={cn(baseStyles.table, themeStyles.table)}
            />
          )}
          {tableState.allRows.length === 0 && !loading && (
            <div role="status" aria-live="polite">No logs match your filters.</div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AIMonitoring;
