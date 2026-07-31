// @AI-HINT: High-fidelity search route loading skeleton
'use client';

import React from 'react';
import { ProjectGridSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function SearchLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto"
      role="status"
      aria-label="Searching platform"
    >
      <div className="space-y-4">
        <Skeleton width="100%" height={52} radius={16} />
        <div className="flex gap-2">
          <Skeleton width={90} height={32} radius={12} />
          <Skeleton width={90} height={32} radius={12} />
          <Skeleton width={90} height={32} radius={12} />
        </div>
      </div>

      <ProjectGridSkeleton count={6} />
    </div>
  );
}
