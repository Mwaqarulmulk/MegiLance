// @AI-HINT: Layout-aware loading skeleton for portal routes
'use client';

import React from 'react';
import { StatGridSkeleton, TableRowsSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function PortalLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-8 animate-pulse max-w-7xl mx-auto"
      role="status"
      aria-label="Loading portal workspace"
    >
      {/* Header bar skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width={220} height={28} radius={8} />
          <Skeleton width={320} height={14} radius={6} />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton width={110} height={40} radius={10} />
          <Skeleton width={130} height={40} radius={10} />
        </div>
      </div>

      {/* Stats KPI skeleton */}
      <StatGridSkeleton count={4} />

      {/* Main content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TableRowsSkeleton count={4} cols={4} />
        </div>
        <div className="p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md space-y-4 h-full">
          <Skeleton width="50%" height={20} radius={6} />
          <Skeleton lines={4} height={14} radius={6} />
          <Skeleton width="100%" height={40} radius={10} />
        </div>
      </div>
    </div>
  );
}
