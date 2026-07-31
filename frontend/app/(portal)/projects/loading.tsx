// @AI-HINT: High-fidelity loading skeleton for projects route
'use client';

import React from 'react';
import { ProjectGridSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function ProjectsLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto"
      role="status"
      aria-label="Loading projects list"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width={180} height={28} radius={8} />
          <Skeleton width={280} height={14} radius={6} />
        </div>
        <Skeleton width={140} height={42} radius={12} />
      </div>

      {/* Filter and search bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton width="100%" height={44} radius={12} className="flex-1" />
        <Skeleton width={130} height={44} radius={12} />
        <Skeleton width={130} height={44} radius={12} />
      </div>

      {/* Project Cards Grid Skeleton */}
      <ProjectGridSkeleton count={6} />
    </div>
  );
}
