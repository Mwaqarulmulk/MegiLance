// @AI-HINT: High-fidelity help center loading skeleton
'use client';

import React from 'react';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function HelpLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-6 animate-pulse max-w-4xl mx-auto"
      role="status"
      aria-label="Loading help center"
    >
      <div className="space-y-4 text-center">
        <Skeleton width={220} height={28} radius={8} className="mx-auto" />
        <Skeleton width="100%" height={48} radius={14} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md space-y-3">
            <Skeleton width="60%" height={20} radius={6} />
            <Skeleton lines={2} height={14} radius={4} />
          </div>
        ))}
      </div>
    </div>
  );
}
