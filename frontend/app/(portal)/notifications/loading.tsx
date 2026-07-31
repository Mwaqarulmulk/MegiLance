// @AI-HINT: High-fidelity notifications route loading skeleton
'use client';

import React from 'react';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function NotificationsLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-6 animate-pulse max-w-4xl mx-auto"
      role="status"
      aria-label="Loading notifications"
    >
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton width={180} height={28} radius={8} />
          <Skeleton width={240} height={14} radius={6} />
        </div>
        <Skeleton width={110} height={36} radius={8} />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md flex items-center gap-4">
            <Skeleton width={40} height={40} radius="50%" />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" height={16} radius={4} />
              <Skeleton width="85%" height={14} radius={4} />
            </div>
            <Skeleton width={60} height={12} radius={4} />
          </div>
        ))}
      </div>
    </div>
  );
}
