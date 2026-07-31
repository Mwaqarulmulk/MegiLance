// @AI-HINT: High-fidelity dashboard loading skeleton
'use client';

import React from 'react';
import { StatGridSkeleton, TableRowsSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function DashboardLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-8 animate-pulse max-w-7xl mx-auto"
      role="status"
      aria-label="Loading main dashboard"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width={220} height={28} radius={8} />
          <Skeleton width={300} height={14} radius={6} />
        </div>
        <Skeleton width={130} height={40} radius={10} />
      </div>

      <StatGridSkeleton count={4} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton width={180} height={20} radius={6} />
            <Skeleton width={100} height={30} radius={8} />
          </div>
          <Skeleton width="100%" height={220} radius={12} />
        </div>

        <div className="p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md space-y-4">
          <Skeleton width={140} height={20} radius={6} />
          <Skeleton lines={4} height={16} radius={6} />
        </div>
      </div>

      <TableRowsSkeleton count={5} cols={5} />
    </div>
  );
}
