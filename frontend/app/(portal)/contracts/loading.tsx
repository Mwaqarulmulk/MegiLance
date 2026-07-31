// @AI-HINT: High-fidelity contracts loading skeleton
'use client';

import React from 'react';
import { TableRowsSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function ContractsLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto"
      role="status"
      aria-label="Loading contracts"
    >
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton width={180} height={28} radius={8} />
          <Skeleton width={260} height={14} radius={6} />
        </div>
        <Skeleton width={140} height={40} radius={10} />
      </div>

      <TableRowsSkeleton count={6} cols={5} />
    </div>
  );
}
