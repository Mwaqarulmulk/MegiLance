// @AI-HINT: High-fidelity settings route loading skeleton
'use client';

import React from 'react';
import { FormSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function SettingsLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-6 animate-pulse max-w-4xl mx-auto"
      role="status"
      aria-label="Loading settings"
    >
      <div className="space-y-2">
        <Skeleton width={180} height={28} radius={8} />
        <Skeleton width={260} height={14} radius={6} />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 border-b border-gray-200/60 dark:border-gray-800/60 pb-3">
        <Skeleton width={100} height={36} radius={8} />
        <Skeleton width={100} height={36} radius={8} />
        <Skeleton width={100} height={36} radius={8} />
        <Skeleton width={100} height={36} radius={8} />
      </div>

      <FormSkeleton fields={5} />
    </div>
  );
}
