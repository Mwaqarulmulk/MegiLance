// @AI-HINT: Tailored loading skeleton for Freelancer portal dashboard & routes
'use client';

import React from 'react';
import { StatGridSkeleton, ProjectGridSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function FreelancerLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-8 animate-pulse max-w-7xl mx-auto"
      role="status"
      aria-label="Loading freelancer portal"
    >
      {/* Welcome banner skeleton */}
      <div className="p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent space-y-3">
        <Skeleton width={260} height={28} radius={8} />
        <Skeleton width={380} height={14} radius={6} />
      </div>

      {/* Earnings & Proposal Stats */}
      <StatGridSkeleton count={4} />

      {/* Recommended Jobs Grid Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width={200} height={22} radius={6} />
          <Skeleton width={100} height={16} radius={4} />
        </div>
        <ProjectGridSkeleton count={3} />
      </div>
    </div>
  );
}
