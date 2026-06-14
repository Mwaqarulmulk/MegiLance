// @AI-HINT: Admin Projects page. Theme-aware, accessible, animated list with filters and row actions.
'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useToaster } from '@/app/components/molecules/Toast/ToasterProvider';
import { PageTransition, ScrollReveal } from '@/app/components/Animations'
import { useAdminData } from '@/hooks/useAdmin';
import common from './AdminProjects.common.module.css';
import light from './AdminProjects.light.module.css';
import dark from './AdminProjects.dark.module.css';

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
    case 'Planned': return common.badgeDotPlanned;
    case 'In Progress': return common.badgeDotInProgress;
    case 'Blocked': return common.badgeDotBlocked;
    case 'Completed': return common.badgeDotCompleted;
  }
  return undefined;
};

const AdminProjects: React.FC = () => {
  const router = useRouter();
  const toaster = useToaster();
  const { resolvedTheme } = useTheme();
  const themed = resolvedTheme === 'dark' ? dark : light;
  const { projects, loading, error } = useAdminData();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All');

  // Assign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignProjectId, setAssignProjectId] = useState<string | null>(null);
  const [freelancerSearch, setFreelancerSearch] = useState('');
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);
  const [assigning, setAssigning] = useState(false);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(p =>
      (status === 'All' || p.status === status) &&
      (!q || p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q))
    );
  }, [rows, query, status]);

  // Sorting
  type SortKey = 'name' | 'client' | 'budget' | 'status' | 'updated';
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let av: string = '';
      let bv: string = '';
      switch (sortKey) {
        case 'name': av = a.name || ''; bv = b.name || ''; break;
        case 'client': av = a.client || ''; bv = b.client || ''; break;
        case 'budget': av = a.budget || ''; bv = b.budget || ''; break;
        case 'status': av = a.status || ''; bv = b.status || ''; break;
        case 'updated': av = a.updated || ''; bv = b.updated || ''; break;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageSafe, pageSize]);

  React.useEffect(() => { setPage(1); }, [sortKey, sortDir, query, status, pageSize]);

  const openAssignModal = (projectId: string) => {
    setAssignProjectId(projectId);
    setAssignModalOpen(true);
    setFreelancerSearch('');
    setFreelancers([]);
    setSelectedFreelancer(null);
  };

  const searchFreelancers = async () => {
    if (!freelancerSearch.trim()) return;
    try {
      const response = await fetch(`/api/v1/admin/users?role=freelancer&search=${encodeURIComponent(freelancerSearch)}&page_size=10`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await response.json();
      setFreelancers(data?.users || data || []);
    } catch (err) {
      console.error('Failed to search freelancers:', err);
    }
  };

  const handleAssign = async () => {
    if (!assignProjectId || !selectedFreelancer) return;
    setAssigning(true);
    try {
      await fetch(`/api/v1/admin/projects/${assignProjectId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ freelancer_id: selectedFreelancer.id })
      });
      toaster?.notify?.({ title: 'Assigned', description: `Freelancer assigned to project #${assignProjectId}`, variant: 'success' });
      setAssignModalOpen(false);
    } catch (err) {
      toaster?.notify?.({ title: 'Error', description: 'Failed to assign freelancer', variant: 'error' });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <PageTransition className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <ScrollReveal className={common.header}>
          <div>
            <h1 className={common.title}>Projects</h1>
            <p className={cn(common.subtitle, themed.subtitle)}>Platform-wide projects overview. Filter by status and search by name/client.</p>
          </div>
          <div className={common.controls} aria-label="Project filters">
            <label className={common.srOnly} htmlFor="q">Search</label>
            <input id="q" className={cn(common.input, themed.input)} type="search" placeholder="Search projects…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <label className={common.srOnly} htmlFor="status">Status</label>
            <select id="status" className={cn(common.select, themed.select)} value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="button" className={cn(common.button, themed.button)}>Create Project</button>
          </div>
        </ScrollReveal>

        <ScrollReveal className={common.tableWrap} aria-busy={loading || undefined} delay={0.2}>
          {error && <div className={common.error}>Failed to load projects.</div>}
          <div className={cn(common.toolbar)}>
            <div className={common.controls}>
              <label className={common.srOnly} htmlFor="sort-key">Sort by</label>
              <select id="sort-key" className={cn(common.select, themed.select)} value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
                <option value="updated">Updated</option>
                <option value="status">Status</option>
                <option value="name">Name</option>
                <option value="client">Client</option>
                <option value="budget">Budget</option>
              </select>
              <label className={common.srOnly} htmlFor="sort-dir">Sort direction</label>
              <select id="sort-dir" className={cn(common.select, themed.select)} value={sortDir} onChange={(e) => setSortDir(e.target.value as 'asc'|'desc')}>
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
              <label className={common.srOnly} htmlFor="page-size">Rows per page</label>
              <select id="page-size" className={cn(common.select, themed.select)} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div>
              <button
                type="button"
                className={cn(common.button, themed.button, 'secondary')}
                onClick={() => {
                  const header = ['ID','Name','Client','Budget','Status','Updated'];
                  const data = sorted.map(p => [p.id, p.name, p.client, p.budget, p.status, p.updated]);
                  const csv = [header, ...data]
                    .map(r => r.map(val => '"' + String(val).replace(/"/g, '""') + '"').join(','))
                    .join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `projects_export_${new Date().toISOString().slice(0,10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >Export CSV</button>
            </div>
          </div>
          <table className={cn(common.table, themed.table)}>
            <thead>
              <tr>
                <th scope="col" className={themed.th + ' ' + common.th}>Name</th>
                <th scope="col" className={themed.th + ' ' + common.th}>Client</th>
                <th scope="col" className={themed.th + ' ' + common.th}>Budget</th>
                <th scope="col" className={themed.th + ' ' + common.th}>Status</th>
                <th scope="col" className={themed.th + ' ' + common.th}>Updated</th>
                <th scope="col" className={themed.th + ' ' + common.th} aria-label="Actions">Actions</th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className={common.row}>
                    <td className={themed.td + ' ' + common.td} colSpan={6}>
                      <div className={common.skeletonRow}>
                        <Skeleton height={14} width={'40%'} />
                        <Skeleton height={12} width={'70%'} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                {paged.map(p => (
                  <tr key={p.id} className={common.row}>
                    <td className={themed.td + ' ' + common.td}>{p.name}</td>
                    <td className={themed.td + ' ' + common.td}>{p.client}</td>
                    <td className={themed.td + ' ' + common.td}>{p.budget}</td>
                    <td className={themed.td + ' ' + common.td}>
                      <span className={cn(common.badge, themed.badge)}>
                        <span className={cn(common.badgeDot, statusDotClass(p.status))} aria-hidden="true" />
                        {p.status}
                      </span>
                    </td>
                    <td className={themed.td + ' ' + common.td}>{p.updated}</td>
                    <td className={themed.td + ' ' + common.td}>
                      <div className={common.rowActions}>
                        <button 
                          type="button" 
                          className={cn(common.button, themed.button, 'secondary')}
                          onClick={() => router.push(`/admin/projects/${p.id}`)}
                        >
                          Open
                        </button>
                        <button 
                          type="button" 
                          className={cn(common.button, themed.button)}
                          onClick={() => openAssignModal(p.id)}
                        >
                          Assign
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {sorted.length === 0 && !loading && (
            <div className={cn(common.empty)} role="status" aria-live="polite">No projects match your filters.</div>
          )}
          {sorted.length > 0 && (
            <div className={common.paginationBar} role="navigation" aria-label="Pagination">
              <button
                type="button"
                className={cn(common.button, themed.button, 'secondary')}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pageSafe === 1}
                aria-label="Previous page"
              >Prev</button>
              <span className={common.paginationInfo} aria-live="polite">Page {pageSafe} of {totalPages} · {sorted.length} result(s)</span>
              <button
                type="button"
                className={cn(common.button, themed.button)}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={pageSafe === totalPages}
                aria-label="Next page"
              >Next</button>
            </div>
          )}
        </ScrollReveal>
      </div>

      {/* Assign Freelancer Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setAssignModalOpen(false); }}>
          <div className={cn(common.container, themed.themeWrapper, 'max-w-lg w-full mx-4 rounded-xl shadow-xl')} style={{ background: 'var(--bg-primary, #fff)' }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color, #e5e7eb)' }}>
              <h2 className="text-lg font-semibold">Assign Freelancer to Project #{assignProjectId}</h2>
              <button onClick={() => setAssignModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Search Freelancer</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className={cn(common.input, themed.input, 'flex-1')}
                    placeholder="Search by name or email..."
                    value={freelancerSearch}
                    onChange={(e) => setFreelancerSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchFreelancers()}
                  />
                  <button type="button" className={cn(common.button, themed.button)} onClick={searchFreelancers}>
                    Search
                  </button>
                </div>
              </div>
              {freelancers.length > 0 && (
                <div className="max-h-48 overflow-y-auto border rounded-lg" style={{ borderColor: 'var(--border-color, #e5e7eb)' }}>
                  {freelancers.map((f) => (
                    <div
                      key={f.id}
                      className={cn(
                        'p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border-b last:border-b-0',
                        selectedFreelancer?.id === f.id && 'bg-blue-50 dark:bg-blue-900/20'
                      )}
                      style={{ borderColor: 'var(--border-color, #e5e7eb)' }}
                      onClick={() => setSelectedFreelancer(f)}
                    >
                      <div className="font-medium">{f.name || f.email}</div>
                      <div className="text-sm text-gray-500">{f.email}</div>
                    </div>
                  ))}
                </div>
              )}
              {selectedFreelancer && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200">Selected:</div>
                  <div className="font-medium">{selectedFreelancer.name || selectedFreelancer.email}</div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t" style={{ borderColor: 'var(--border-color, #e5e7eb)' }}>
              <button type="button" className={cn(common.button, themed.button, 'secondary')} onClick={() => setAssignModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={cn(common.button, themed.button)}
                onClick={handleAssign}
                disabled={!selectedFreelancer || assigning}
              >
                {assigning ? 'Assigning...' : 'Assign Freelancer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default AdminProjects;
