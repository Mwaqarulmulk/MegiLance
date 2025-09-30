// @AI-HINT: Minimal RecentActivityFeed used by the Freelancer Dashboard to render a list of items using a provided render function.
'use client';

import React from 'react';

export interface RecentActivityFeedProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  loading?: boolean;
  emptyStateMessage?: string;
}

function RecentActivityFeed<T>({ title, items, renderItem, loading, emptyStateMessage = 'No items found.' }: RecentActivityFeedProps<T>) {
  return (
    <section style={{ marginTop: 16 }} aria-label={title}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
      {loading ? (
        <div role="status" aria-busy="true" style={{ display: 'grid', gap: 8 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 64, borderRadius: 10, background: 'var(--surface-f5f7fa, #f5f7fa)' }} />
          ))}
        </div>
      ) : items?.length ? (
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map((it, idx) => (
            <div key={idx}>{renderItem(it)}</div>
          ))}
        </div>
      ) : (
        <div role="note" style={{ opacity: 0.8 }}>{emptyStateMessage}</div>
      )}
    </section>
  );
}

export default RecentActivityFeed;
