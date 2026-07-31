// @AI-HINT: High-fidelity loading skeleton for auth routes (login, signup, password reset)
'use client';

import React from 'react';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

export default function AuthLoading() {
  return (
    <div
      className="min-h-[80vh] flex items-center justify-center p-4"
      role="status"
      aria-label="Loading authentication page"
    >
      <div className="w-full max-w-md p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-2xl space-y-6 animate-pulse">
        {/* Brand logo & header skeleton */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Skeleton width={54} height={54} radius={16} />
          <Skeleton width={180} height={24} radius={8} />
          <Skeleton width={240} height={14} radius={6} />
        </div>

        {/* Input fields skeleton */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Skeleton width={80} height={14} radius={4} />
            <Skeleton width="100%" height={48} radius={12} />
          </div>
          <div className="space-y-2">
            <Skeleton width={90} height={14} radius={4} />
            <Skeleton width="100%" height={48} radius={12} />
          </div>
        </div>

        {/* Action button skeleton */}
        <div className="pt-2 space-y-3">
          <Skeleton width="100%" height={48} radius={14} />
          <div className="flex justify-center">
            <Skeleton width={140} height={14} radius={6} />
          </div>
        </div>
      </div>
    </div>
  );
}
