// @AI-HINT: This page displays performance analytics for the freelancer. It's now fully theme-aware and built with a premium, responsive grid layout.
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import LineChart from '@/app/components/DataViz/LineChart/LineChart';
import { useFreelancerData } from '@/hooks/useFreelancer';
import { usePersistedState } from '@/app/lib/hooks/usePersistedState';
import { exportCSV, exportData } from '@/app/lib/csv';
import TableSkeleton from '@/app/components/DataTableExtras/TableSkeleton';
import SavedViewsMenu from '@/app/components/DataTableExtras/SavedViewsMenu';
import commonStyles from './Analytics.common.module.css';
import lightStyles from './Analytics.light.module.css';
import darkStyles from './Analytics.dark.module.css';

const AnalyticsPage: React.FC = () => {
  const { theme } = useTheme();
  const { analytics, loading, error } = useFreelancerData();
  const [range, setRange] = usePersistedState<'7d' | '30d' | '90d'>('freelancer:analytics:range', '30d');
  const [uiLoading, setUiLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv');
  
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const analyticsData = useMemo(() => {
    if (!analytics) return null;
    
    const totalEarned = parseFloat(analytics.totalEarnings?.replace(/[$,]/g, '') || '0');
    const activeProjects = analytics.activeProjects || 0;
    const completedProjects = analytics.completedProjects || 0;
    const hireRate = completedProjects > 0 ? ((completedProjects / (activeProjects + completedProjects)) * 100).toFixed(1) + '%' : '0%';
    
    // Create synthetic time series based on selected range
    const rangeLen = range === '7d' ? 7 : range === '30d' ? 12 : 12; // 12 points for 30/90 for chart simplicity
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const labels = range === '7d' ? Array.from({length: 7}, (_, i) => `D${i+1}`) : months.slice(0, rangeLen);
    const viewsBase = analytics.profileViews || 1200;
    const viewsSeries = labels.map((_, i) => Math.max(50, Math.round((viewsBase / rangeLen) * (0.6 + 0.8 * Math.sin(i/2 + 1)))));
    const earningsSeries = labels.map((_, i) => Math.max(100, Math.round((totalEarned / rangeLen) * (0.5 + 0.9 * Math.cos(i/3 + 0.5)))));
    
    return {
      kpis: {
        profileViews: analytics.profileViews || 0,
        applicationsSent: analytics.pendingProposals || 0,
        hireRate,
        totalEarned,
      },
      viewsOverTime: {
        labels,
        data: viewsSeries,
      },
      earningsOverTime: {
        labels,
        data: earningsSeries,
      },
    };
  }, [analytics, range]);

  // Smooth UI transition on control changes
  useEffect(() => {
    setUiLoading(true);
    const t = setTimeout(() => setUiLoading(false), 120);
    return () => clearTimeout(t);
  }, [range]);

  const onExportCSV = () => {
    if (!analyticsData) return;
    const header = ['Label', 'Views', 'Earnings'];
    const rows = analyticsData.viewsOverTime.labels.map((label, idx) => [
      label,
      String(analyticsData.viewsOverTime.data[idx] ?? ''),
      String(analyticsData.earningsOverTime.data[idx] ?? ''),
    ]);
    exportCSV(header, rows, `analytics-${range}`);
  };

  const onExport = () => {
    if (!analyticsData) return;
    const header = ['Label', 'Views', 'Earnings'];
    const rows = analyticsData.viewsOverTime.labels.map((label, idx) => [
      label,
      String(analyticsData.viewsOverTime.data[idx] ?? ''),
      String(analyticsData.earningsOverTime.data[idx] ?? ''),
    ]);
    exportData(exportFormat, header, rows, `analytics-${range}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your Analytics</h1>
        <p className={styles.subtitle}>Track your performance and find new opportunities for growth.</p>
      </header>

      {loading && <div className={styles.loading} aria-busy="true">Loading analytics...</div>}
      {error && <div className={styles.error}>Failed to load analytics data.</div>}

      {analyticsData && (
        <main className={styles.mainContent}>
          <div className={styles.toolbar} role="group" aria-label="Analytics filters and actions">
            <label htmlFor="range" className={styles.srOnly}>Date range</label>
            <select
              id="range"
              className={styles.select}
              value={range}
              onChange={(e) => setRange(e.target.value as typeof range)}
              aria-label="Select date range"
              title="Select date range"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <label htmlFor="analytics-export-format" className={styles.srOnly}>Export format</label>
            <select
              id="analytics-export-format"
              className={styles.select}
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as typeof exportFormat)}
              aria-label="Select export format"
              title="Select export format"
            >
              <option value="csv">CSV</option>
              <option value="xlsx">XLSX</option>
              <option value="pdf">PDF</option>
            </select>
            <button type="button" onClick={onExport} className={styles.button} aria-label={`Export analytics ${exportFormat.toUpperCase()}`} title={`Export analytics as ${exportFormat.toUpperCase()}`}>Export</button>
            <span className={styles.toolbarInfo} role="status" aria-live="polite">Showing {range === '7d' ? '7' : range === '30d' ? '30' : '90'}-day trend</span>

            <div aria-label="Saved views" role="group" className={styles.savedViewsSlot}>
              <SavedViewsMenu
                storageKey="freelancer:analytics:savedViews"
                buildPayload={() => ({ range })}
                onApply={(p: { range: typeof range }) => {
                  if (p?.range) setRange(p.range);
                }}
              />
            </div>
          </div>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Profile Views</span>
              <span className={styles.kpiValue}>{analyticsData.kpis.profileViews}</span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Applications Sent</span>
              <span className={styles.kpiValue}>{analyticsData.kpis.applicationsSent}</span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Hire Rate</span>
              <span className={styles.kpiValue}>{analyticsData.kpis.hireRate}</span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Total Earned (USD)</span>
              <span className={styles.kpiValue}>${analyticsData.kpis.totalEarned.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.chartGrid}>
            <div className={styles.chartCard}>
              <h2 className={styles.cardTitle}>Profile Views Over Time</h2>
              {uiLoading ? (
                <TableSkeleton rows={6} cols={6} />
              ) : (
                <LineChart data={analyticsData.viewsOverTime.data} labels={analyticsData.viewsOverTime.labels} />
              )}
            </div>

            <div className={styles.chartCard}>
              <h2 className={styles.cardTitle}>Earnings Over Time</h2>
              {uiLoading ? (
                <TableSkeleton rows={6} cols={6} />
              ) : (
                <LineChart data={analyticsData.earningsOverTime.data} labels={analyticsData.earningsOverTime.labels} />
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default AnalyticsPage;
