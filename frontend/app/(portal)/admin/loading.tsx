// @AI-HINT: Tailored loading skeleton for Admin management portal
'use client';

import React from 'react';
import { StatGridSkeleton, TableRowsSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function AdminLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-8 animate-pulse max-w-7xl mx-auto"
      role="status"
      aria-label="Loading admin management portal"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton width={220} height={28} radius={8} />
          <Skeleton width={300} height={14} radius={6} />
        </div>
        <div className="flex gap-2">
          <Skeleton width={90} height={36} radius={8} />
          <Skeleton width={110} height={36} radius={8} />
        </div>
      </div>

      <StatGridSkeleton count={4} />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton width={160} height={20} radius={6} />
          <Skeleton width={200} height={36} radius={8} />
        </div>
        <TableRowsSkeleton count={6} cols={6} />
      </div>
    </div>
  );
}
