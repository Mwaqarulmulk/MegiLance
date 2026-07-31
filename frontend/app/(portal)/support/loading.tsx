// @AI-HINT: High-fidelity support & help route loading skeleton
'use client';

import React from 'react';
import { FormSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function SupportLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-6 animate-pulse max-w-4xl mx-auto"
      role="status"
      aria-label="Loading support center"
    >
      <div className="space-y-2 text-center sm:text-left">
        <Skeleton width={200} height={28} radius={8} />
        <Skeleton width={300} height={14} radius={6} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md space-y-2">
            <Skeleton width={40} height={40} radius="50%" />
            <Skeleton width="70%" height={18} radius={6} />
            <Skeleton width="90%" height={12} radius={4} />
          </div>
        ))}
      </div>

      <FormSkeleton fields={3} />
    </div>
  );
}
