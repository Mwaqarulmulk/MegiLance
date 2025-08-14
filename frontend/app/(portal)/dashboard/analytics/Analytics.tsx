// @AI-HINT: Portal Analytics page. Theme-aware, accessible, animated KPIs and charts with filters.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './Analytics.common.module.css';
import light from './Analytics.light.module.css';
import dark from './Analytics.dark.module.css';
import DensityToggle, { type Density } from '@/app/components/DataTableExtras/DensityToggle';
import ColumnVisibilityMenu, { type ColumnDef } from '@/app/components/DataTableExtras/ColumnVisibilityMenu';

const RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days'] as const;
const SEGMENTS = ['All', 'Clients', 'Freelancers'] as const;

const Analytics: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const [range, setRange] = useState<(typeof RANGES)[number]>('Last 30 days');
  const [segment, setSegment] = useState<(typeof SEGMENTS)[number]>('All');
  // Density & column visibility  // Breakdown table: density & columns (non-persistent)
  const [density, setDensity] = useState<Density>('comfortable');
  const breakdownColumns: ColumnDef[] = React.useMemo(() => ([
    { key: 'metric', label: 'Metric' },
    { key: 'value', label: 'Value' },
  ]), []);
  const [visibleKeys, setVisibleKeys] = useState<string[]>(breakdownColumns.map(c => c.key));
  const toggleColumn = (key: string) => setVisibleKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  const showAll = () => setVisibleKeys(breakdownColumns.map(c => c.key));
  const hideAll = () => setVisibleKeys([]);
  const isVisible = (key: 'metric' | 'value') => visibleKeys.includes(key);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const kpisRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const kpisVisible = useIntersectionObserver(kpisRef, { threshold: 0.1 });
  const gridVisible = useIntersectionObserver(gridRef, { threshold: 0.1 });

  // Mock data influenced by filters
  const data = useMemo(() => {
    const mult = range === 'Last 7 days' ? 0.6 : range === 'Last 90 days' ? 1.2 : 1;
    const seg = segment === 'Clients' ? 1.1 : segment === 'Freelancers' ? 0.9 : 1;

    return {
      kpis: [
        { label: 'Revenue', value: `$${(48895 * mult * seg).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, delta: '+12.5%' },
        { label: 'Active Projects', value: Math.round(24 * mult * seg).toString(), delta: '+3' },
        { label: 'New Users', value: Math.round(120 * mult * seg).toString(), delta: '+18' },
        { label: 'Conversion Rate', value: `${(4.2 * mult).toFixed(1)}%`, delta: '+0.3%' },
      ],
      bars: Array.from({ length: 12 }, (_, i) => Math.round((30 + i * 5) * mult * seg)),
      points: Array.from({ length: 10 }, (_, i) => ({ x: (i + 1) * 10, y: 20 + Math.sin(i / 2) * 15 * mult * seg })),
      table: [
        { metric: 'Signups', value: Math.round(320 * mult * seg) },
        { metric: 'Trials Started', value: Math.round(170 * mult * seg) },
        { metric: 'Upgrades', value: Math.round(42 * mult * seg) },
        { metric: 'Churned', value: Math.round(9 * mult * seg) },
      ],
    };
  }, [range, segment]);

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <div ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <div>
            <h1 className={common.title}>Analytics</h1>
            <p className={themed.subtitle}>Track revenue, users, and performance across your workspace.</p>
          </div>
          <div className={common.controls} aria-label="Analytics filters">
            <label className={common.srOnly} htmlFor="range">Date range</label>
            <select id="range" className={themed.select + ' ' + common.select} value={range} onChange={(e) => setRange(e.target.value as (typeof RANGES)[number])}>
              {RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <label className={common.srOnly} htmlFor="segment">Segment</label>
            <select id="segment" className={themed.select + ' ' + common.select} value={segment} onChange={(e) => setSegment(e.target.value as (typeof SEGMENTS)[number])}>
              {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <DensityToggle value={density} onChange={setDensity} />
            <ColumnVisibilityMenu
              columns={breakdownColumns}
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

        <section aria-label="Key performance indicators">
          <div ref={kpisRef} className={cn(common.kpis, kpisVisible ? common.isVisible : common.isNotVisible)}>
            {data.kpis.map((k) => (
              <div key={k.label} tabIndex={0} className={cn(common.kpi, themed.kpi)}>
                <div className={cn(common.kpiLabel, themed.kpiLabel)}>{k.label}</div>
                <div className={common.kpiValue}>{k.value}</div>
                <div className={cn(common.kpiDelta, themed.kpiDelta)} aria-label={`Delta ${k.delta}`}>{k.delta}</div>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Analytics charts and breakdowns">
          <div ref={gridRef} className={cn(common.grid, gridVisible ? common.isVisible : common.isNotVisible)}>
            <div className={cn(common.card, themed.card)}>
              <div className={cn(common.cardTitle, themed.cardTitle)}>Monthly Revenue</div>
              {/* SVG bar chart to avoid inline styles */}
              <svg
                role="img"
                aria-label="Bar chart of monthly revenue"
                width="100%"
                height="220"
                viewBox="0 0 120 100"
                preserveAspectRatio="none"
              >
                {/* Bars */}
                {data.bars.map((val, i) => {
                  const x = i * (120 / data.bars.length) + 2; // spacing
                  const barWidth = (120 / data.bars.length) - 4;
                  const heightPct = Math.max(0, Math.min(100, val));
                  const h = (heightPct / 100) * 90; // leave some top padding
                  const y = 100 - h;
                  return (
                    <rect
                      key={i}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={h}
                      className={cn(common.bar, themed.bar)}
                      rx={1.5}
                      ry={1.5}
                      aria-hidden="true"
                    />
                  );
                })}
              </svg>
            </div>

            <div className={cn(common.card, themed.card)}>
              <div className={cn(common.cardTitle, themed.cardTitle)}>User Growth</div>
              {/* SVG line chart to avoid inline styles */}
              <svg
                role="img"
                aria-label="Line chart of user growth"
                width="100%"
                height="240"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Path */}
                {(() => {
                  const d = data.points
                    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${100 - p.y}`)
                    .join(' ');
                  return (
                    <path d={d} fill="none" stroke="var(--primary)" strokeWidth={1.5} aria-hidden="true" />
                  );
                })()}
                {/* Points */}
                {data.points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={100 - p.y}
                    r={1.5}
                    className={cn(common.point, themed.point)}
                    aria-hidden="true"
                  />)
                )}
              </svg>
            </div>
          </div>
        </section>

        <section aria-label="Metrics table">
          <div className={cn(common.card, themed.card)}>
            <div className={cn(common.cardTitle, themed.cardTitle)}>Breakdown</div>
            <table className={common.table}>
              <thead>
                <tr>
                  {isVisible('metric') && (<th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Metric</th>)}
                  {isVisible('value') && (<th scope="col" className={themed.th + ' ' + common.th} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>Value</th>)}
                </tr>
              </thead>
              <tbody>
                {data.table.map((row) => (
                  <tr key={row.metric}>
                    {isVisible('metric') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{row.metric}</td>)}
                    {isVisible('value') && (<td className={themed.td + ' ' + common.td} style={{ padding: density === 'compact' ? '6px 8px' : undefined }}>{row.value}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Analytics;
