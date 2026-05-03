// @AI-HINT: Minimal RecentActivityFeed used by the Freelancer Dashboard to render a list of items using a provided render function.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './RecentActivityFeed.common.module.css';
import lightStyles from './RecentActivityFeed.light.module.css';
import darkStyles from './RecentActivityFeed.dark.module.css';

export interface RecentActivityFeedProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  loading?: boolean;
  emptyStateMessage?: string;
}

function RecentActivityFeed<T>({ title, items, renderItem, loading, emptyStateMessage = 'No items found.' }: RecentActivityFeedProps<T>) {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <section 
      className={cn(commonStyles.container, themeStyles.container)} 
      aria-label={title}
    >
      <div className={commonStyles.header}>
        <h2 className={commonStyles.title}>{title}</h2>
      </div>
      
      {loading ? (
        <div role="status" aria-busy="true" className={commonStyles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i} 
              className={commonStyles.skeletonItem}
            />
          ))}
        </div>
      ) : items?.length ? (
        <div className={commonStyles.list}>
          {items.map((it, idx) => (
            <div key={idx}>{renderItem(it)}</div>
          ))}
        </div>
      ) : (
        <div className={commonStyles.emptyState} role="note">
          {emptyStateMessage}
        </div>
      )}
    </section>
  );
}

export default RecentActivityFeed;
