// @AI-HINT: High-fidelity refunds route loading skeleton
'use client';

import React from 'react';
import { TableRowsSkeleton, StatGridSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function RefundsLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto"
      role="status"
      aria-label="Loading refunds page"
    >
      <div className="space-y-2">
        <Skeleton width={180} height={28} radius={8} />
        <Skeleton width={260} height={14} radius={6} />
      </div>

      <StatGridSkeleton count={3} />
      <TableRowsSkeleton count={5} cols={5} />
    </div>
  );
}
