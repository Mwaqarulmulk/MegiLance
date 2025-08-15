// @AI-HINT: Admin Projects page. Theme-aware, accessible, animated list with filters and row actions.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useAdminData } from '@/hooks/useAdmin';
import baseStyles from './AdminProjects.base.module.css';
import lightStyles from './AdminProjects.light.module.css';
import darkStyles from './AdminProjects.dark.module.css';
import DensityToggle, { type Density } from '@/app/components/DataTableExtras/DensityToggle';
import ColumnVisibilityMenu, { type ColumnDef } from '@/app/components/DataTableExtras/ColumnVisibilityMenu';
import AdminTopbar from '@/app/components/Admin/Layout/AdminTopbar';
import { toCSVFile } from '@/app/components/DataTable';
import { useDataTable } from '@/app/components/DataTable/hooks/useDataTable';
import { Table } from '@/app/components/DataTable/Table';
import type { Column as DTColumn } from '@/app/components/DataTable/types';

interface ProjectRow {
  id: string;
  name: string;
  client: string;
  budget: string;
  status: 'Planned' | 'In Progress' | 'Blocked' | 'Completed';
  updated: string;
}

const STATUSES = ['All', 'Planned', 'In Progress', 'Blocked', 'Completed'] as const;

const statusDotClass = (status: ProjectRow['status']) => {
  switch (status) {
    case 'Planned': return baseStyles.badgeDotPlanned;
    case 'In Progress': return baseStyles.badgeDotInProgress;
    case 'Blocked': return baseStyles.badgeDotBlocked;
    case 'Completed': return baseStyles.badgeDotCompleted;
  }
  return undefined;
};

const AdminProjects: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const { projects, loading, error } = useAdminData();

  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All');

  const headerRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const tableVisible = useIntersectionObserver(tableRef, { threshold: 0.1 });

  const rows: ProjectRow[] = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    return (projects as any[]).map((p, idx) => ({
      id: String(p.id ?? idx),
      name: p.title ?? p.name,
      client: p.client ?? '—',
      budget: p.budget ?? '—',
      status: (p.status as ProjectRow['status']) ?? 'In Progress',
      updated: p.updatedAt ?? p.updated ?? '',
    }));
  }, [projects]);

  const locallyFiltered = useMemo(() => {
    return rows.filter(p => (status === 'All' || p.status === status));
  }, [rows, status]);

  // Shared DataTable state
  const columns: DTColumn<ProjectRow>[] = useMemo(() => ([
    { key: 'name', label: 'Name', sortable: true },
    { key: 'client', label: 'Client', sortable: true },
    { key: 'budget', label: 'Budget', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (p) => (
      <span className={cn(baseStyles.badge, themeStyles.badge)}>
        <span className={cn(baseStyles.badgeDot, statusDotClass(p.status))} aria-hidden="true" />
        {p.status}
      </span>
    ) },
    { key: 'updated', label: 'Updated', sortable: true },
  ]), [themeStyles]);

  const tableState = useDataTable<ProjectRow>(locallyFiltered, columns, { initialSortKey: 'updated', initialSortDir: 'desc', initialPageSize: 10 });

  // Density & column visibility (non-persistent)
  const [density, setDensity] = useState<Density>('comfortable');
  const allColumns: ColumnDef[] = useMemo(() => ([
    { key: 'name', label: 'Name' },
    { key: 'client', label: 'Client' },
    { key: 'budget', label: 'Budget' },
    { key: 'status', label: 'Status' },
    { key: 'updated', label: 'Updated' },
  ]), []);
  const [visibleKeys, setVisibleKeys] = useState<string[]>(allColumns.map(c => c.key));
  const toggleColumn = (key: string) => setVisibleKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  const showAll = () => setVisibleKeys(allColumns.map(c => c.key));
  const hideAll = () => setVisibleKeys([]);
  const isVisible = (key: keyof ProjectRow) => visibleKeys.includes(key);
  const visibleColumns = useMemo(() => columns.filter(c => isVisible(c.key as keyof ProjectRow)), [columns, visibleKeys]);

  return (
    <main className={cn(baseStyles.page, themeStyles.themeWrapper)}>
      <div className={baseStyles.container}>
        <div ref={headerRef} className={cn(headerVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}>
          <AdminTopbar
            title="Projects"
            subtitle="Platform-wide projects overview. Filter by status and search by name/client."
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Projects' },
            ]}
            right={(
              <div className={baseStyles.controls} aria-label="Project filters">
                <label className={baseStyles.srOnly} htmlFor="q">Search</label>
                <input id="q" className={cn(baseStyles.input, themeStyles.input)} type="search" placeholder="Search projects…" value={tableState.query} onChange={(e) => tableState.setQuery(e.target.value)} />
                <label className={baseStyles.srOnly} htmlFor="status">Status</label>
                <select id="status" className={cn(baseStyles.select, themeStyles.select)} value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="button" className={cn(baseStyles.button, themeStyles.button)}>Create Project</button>
              </div>
            )}
          />
        </div>

        <div ref={tableRef} className={cn(baseStyles.tableWrap, tableVisible ? baseStyles.isVisible : baseStyles.isNotVisible)} aria-busy={loading || undefined}>
          {error && <div className={baseStyles.error}>Failed to load projects.</div>}
          <div className={cn(baseStyles.toolbar)}>
            <div className={baseStyles.controls}>
              <label className={baseStyles.srOnly} htmlFor="page-size">Rows per page</label>
              <select id="page-size" className={cn(baseStyles.select, themeStyles.select)} value={tableState.pageSize} onChange={(e) => tableState.setPageSize(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
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
            <div>
              <button
                type="button"
                className={cn(baseStyles.button, themeStyles.button, 'secondary')}
                onClick={() => {
                  const header = ['ID','Name','Client','Budget','Status','Updated'];
                  const data = tableState.allRows.map(p => [p.id, p.name, p.client, p.budget, p.status, p.updated]);
                  toCSVFile(`projects_export_${new Date().toISOString().slice(0,10)}.csv`, header, data);
                }}
              >Export CSV</button>
            </div>
          </div>
          {loading ? (
            <div className={baseStyles.skeletonRow} aria-busy="true" />
          ) : (
            <Table<ProjectRow>
              columns={visibleColumns}
              state={tableState}
              className={cn(baseStyles.table, themeStyles.table)}
              density={density}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminProjects;
