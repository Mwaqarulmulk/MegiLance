// @AI-HINT: High-fidelity create-project wizard route loading skeleton
'use client';

import React from 'react';
import { FormSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function CreateProjectLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-6 animate-pulse max-w-4xl mx-auto"
      role="status"
      aria-label="Loading project creation wizard"
    >
      <div className="space-y-2 text-center sm:text-left">
        <Skeleton width={220} height={28} radius={8} />
        <Skeleton width={320} height={14} radius={6} />
      </div>

      {/* Stepper bar skeleton */}
      <div className="flex items-center justify-between py-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <Skeleton width={32} height={32} radius="50%" />
            <Skeleton width={80} height={14} radius={4} className="hidden sm:block" />
          </div>
        ))}
      </div>

      <FormSkeleton fields={4} />
    </div>
  );
}
