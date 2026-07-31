// @AI-HINT: High-fidelity payments loading skeleton
'use client';

import React from 'react';
import { TableRowsSkeleton, StatGridSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function PaymentsLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto"
      role="status"
      aria-label="Loading payments"
    >
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton width={180} height={28} radius={8} />
          <Skeleton width={260} height={14} radius={6} />
        </div>
        <Skeleton width={130} height={40} radius={10} />
      </div>

      <StatGridSkeleton count={4} />
      <TableRowsSkeleton count={6} cols={5} />
    </div>
  );
}
