// @AI-HINT: Tailored loading skeleton for Client portal dashboard & routes
'use client';

import React from 'react';
import { StatGridSkeleton, TableRowsSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function ClientLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-8 animate-pulse max-w-7xl mx-auto"
      role="status"
      aria-label="Loading client portal"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width={240} height={28} radius={8} />
          <Skeleton width={340} height={14} radius={6} />
        </div>
        <Skeleton width={140} height={44} radius={12} />
      </div>

      <StatGridSkeleton count={4} />

      <div className="space-y-4">
        <Skeleton width={180} height={22} radius={6} />
        <TableRowsSkeleton count={4} cols={5} />
      </div>
    </div>
  );
}
