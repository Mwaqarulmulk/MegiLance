// @AI-HINT: Minimal KeyMetricsGrid used by the Freelancer Dashboard to display key KPIs.
'use client';

import React from 'react';

export interface KeyMetricsGridProps {
  analytics?: any;
  loading?: boolean;
}

const KeyMetricsGrid: React.FC<KeyMetricsGridProps> = ({ analytics, loading }) => {
  if (loading) {
    return (
      <div role="status" aria-busy="true" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ height: 84, borderRadius: 12, background: 'var(--surface-f5f7fa, #f5f7fa)' }} />
        ))}
      </div>
    );
  }

  const totalEarnings = analytics?.totalEarnings ?? '$0';
  const activeProjects = analytics?.activeProjects ?? 0;
  const completedProjects = analytics?.completedProjects ?? 0;
  const pendingProposals = analytics?.pendingProposals ?? 0;

  const items = [
    { label: 'Total Earnings', value: String(totalEarnings) },
    { label: 'Active Projects', value: String(activeProjects) },
    { label: 'Completed Projects', value: String(completedProjects) },
    { label: 'Pending Proposals', value: String(pendingProposals) },
  ];

  return (
    <section aria-label="Key metrics" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: 12 }}>
      {items.map((it, idx) => (
        <div key={idx} style={{ padding: 16, borderRadius: 12, background: 'var(--surface-f5f7fa, #f5f7fa)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>{it.label}</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{it.value}</div>
        </div>
      ))}
    </section>
  );
};

export default KeyMetricsGrid;
