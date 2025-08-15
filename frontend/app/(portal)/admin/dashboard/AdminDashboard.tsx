// @AI-HINT: Admin Dashboard page. Theme-aware, accessible, animated KPIs, charts, users table, and quick actions.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useAdminData } from '@/hooks/useAdmin';
import baseStyles from './AdminDashboard.base.module.css';
import lightStyles from './AdminDashboard.light.module.css';
import darkStyles from './AdminDashboard.dark.module.css';
import UserSearchTable from '@/app/components/Admin/UserSearchTable/UserSearchTable';
import ReviewSentimentDashboard from '@/app/components/Admin/ReviewSentimentDashboard/ReviewSentimentDashboard';
import JobModerationQueue from '@/app/components/Admin/JobModerationQueue/JobModerationQueue';
import FlaggedReviews from '@/app/components/Admin/FlaggedReviews/FlaggedReviews';
import FlaggedFraudList from '@/app/components/Admin/FlaggedFraudList/FlaggedFraudList';
import FraudAlertBanner from '@/app/components/AI/FraudAlertBanner/FraudAlertBanner';
import AdminTopbar from '@/app/components/Admin/Layout/AdminTopbar';

interface KPI { id: string; label: string; value: string; trend: string; }
interface UserRow { id: string; name: string; email: string; role: 'Admin' | 'Client' | 'Freelancer'; status: 'Active' | 'Suspended'; joined: string; }

const FALLBACK_KPIS: KPI[] = [
  { id: 'k1', label: 'Active Users', value: '12,418', trend: '+3.2% WoW' },
  { id: 'k2', label: 'New Projects', value: '287', trend: '+5.1% WoW' },
  { id: 'k3', label: 'Revenue', value: '$142k', trend: '+7.8% MoM' },
  { id: 'k4', label: 'Churn', value: '1.2%', trend: '-0.2% MoM' },
];

const FALLBACK_USERS: UserRow[] = [
  { id: 'u1', name: 'Alex Carter', email: 'alex@megilance.com', role: 'Admin', status: 'Active', joined: '2024-11-01' },
  { id: 'u2', name: 'Hannah Lee', email: 'hannah@client.io', role: 'Client', status: 'Active', joined: '2025-02-18' },
  { id: 'u3', name: 'Sofia Gomez', email: 'sofia@freelance.dev', role: 'Freelancer', status: 'Active', joined: '2025-05-03' },
  { id: 'u4', name: 'Priya Patel', email: 'priya@client.io', role: 'Client', status: 'Suspended', joined: '2025-06-22' },
];

const AdminDashboard: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const { users, kpis, loading, error } = useAdminData();
  const [role, setRole] = useState<'All' | 'Admin' | 'Client' | 'Freelancer'>('All');

  const headerRef = useRef<HTMLDivElement | null>(null);
  const kpiRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const kpisVisible = useIntersectionObserver(kpiRef, { threshold: 0.1 });
  const gridVisible = useIntersectionObserver(gridRef, { threshold: 0.1 });

  const effectiveKPIs: KPI[] = useMemo(() => {
    if (!kpis || !Array.isArray(kpis) || kpis.length === 0) return FALLBACK_KPIS;
    return kpis.map((k, idx) => ({ id: String(k.id ?? idx), label: k.label, value: k.value, trend: (k as any).trend ?? '' }));
  }, [kpis]);

  const effectiveUsers: UserRow[] = useMemo(() => {
    const source = users ?? FALLBACK_USERS;
    return source as UserRow[];
  }, [users]);

  const filteredUsers = useMemo(() => {
    return role === 'All' ? effectiveUsers : effectiveUsers.filter(u => u.role === role);
  }, [effectiveUsers, role]);

  return (
    <main className={cn(baseStyles.page, themeStyles.themeWrapper)}>
      <FraudAlertBanner message="Multiple high-risk activities have been detected. Please review the flagged items immediately."/>
      <div className={baseStyles.container}>
        <div ref={headerRef} className={cn(headerVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}>
          <AdminTopbar
            title="Admin Dashboard"
            subtitle="Global overview of platform metrics, users, and operations."
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Dashboard' },
            ]}
            right={(
              <div className={baseStyles.controls} aria-label="Admin dashboard controls">
                <label className={baseStyles.srOnly} htmlFor="role-filter">Filter by role</label>
                <select id="role-filter" className={cn(baseStyles.select, themeStyles.select)} value={role} onChange={(e) => setRole(e.target.value as any)} title="Filter users by role">
                  {['All','Admin','Client','Freelancer'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button type="button" className={cn(baseStyles.button, themeStyles.button)} title="Create a new platform-wide announcement">Create Announcement</button>
                <button type="button" className={cn(baseStyles.button, themeStyles.button, 'secondary')} title="Run system maintenance tasks">Run Maintenance</button>
              </div>
            )}
          />
        </div>

        <section ref={kpiRef} className={cn(baseStyles.kpis, kpisVisible ? baseStyles.isVisible : baseStyles.isNotVisible)} aria-labelledby="kpi-section-title">
          <h2 id="kpi-section-title" className={baseStyles.srOnly}>Key Performance Indicators</h2>
          {loading && (
            <div className={baseStyles.skeletonRow} aria-busy="true" />
          )}
          {!loading && effectiveKPIs.map(k => (
            <div key={k.id} className={cn(baseStyles.card, themeStyles.card)} tabIndex={0} aria-labelledby={`kpi-${k.id}-label`}>
              <div id={`kpi-${k.id}-label`} className={cn(baseStyles.cardTitle, themeStyles.cardTitle)}>{k.label}</div>
              <div className={baseStyles.metric}>{k.value}</div>
              {k.trend && <div className={baseStyles.trend}>{k.trend}</div>}
            </div>
          ))}
        </section>

        <div aria-live="polite" className={baseStyles.srOnly}>
          {role !== 'All' && `Showing ${filteredUsers.length} ${role} users.`}
        </div>
        <section ref={gridRef} className={cn(baseStyles.grid, gridVisible ? baseStyles.isVisible : baseStyles.isNotVisible)} aria-labelledby="main-content-title">
          <h2 id="main-content-title" className={baseStyles.srOnly}>Main Content</h2>
          <UserSearchTable />
          <ReviewSentimentDashboard />
          <JobModerationQueue />
          <FlaggedReviews />
          <FlaggedFraudList />

          <div className={cn(baseStyles.card, themeStyles.card)} aria-labelledby="activity-chart-title">
            <div id="activity-chart-title" className={cn(baseStyles.cardTitle, themeStyles.cardTitle)}>Activity</div>
            {/* SVG bar chart to avoid inline styles */}
            <svg width="100%" height="140" viewBox="0 0 200 140" preserveAspectRatio="none" role="img" aria-label="Weekly activity bars">
              <desc>Bar chart of weekly activity counts</desc>
              {/* background */}
              <rect x="0" y="0" width="200" height="140" fill="transparent" />
              {/* bars */}
              {([40, 68, 55, 90, 120, 70, 95] as const).map((h, i) => (
                <rect key={i} x={10 + i * 28} y={130 - h} width="18" height={h} rx="3" ry="3" className={cn(baseStyles.cardTitle)} fill="currentColor" opacity="0.8" />
              ))}
            </svg>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
