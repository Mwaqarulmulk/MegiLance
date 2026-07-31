// @AI-HINT: Reusable Skeleton layout presets for dashboards, cards, tables, forms, and messaging
'use client';

import React from 'react';
import Skeleton from './Skeleton';
import { cn } from '@/lib/utils';

export interface SkeletonPresetProps {
  className?: string;
  count?: number;
}

/** Stat card skeleton for dashboard KPI metrics */
export function StatCardSkeleton({ className }: SkeletonPresetProps) {
  return (
    <div className={cn('p-5 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Skeleton width="45%" height={16} radius={6} />
        <Skeleton width={36} height={36} radius={10} />
      </div>
      <Skeleton width="65%" height={28} radius={8} />
      <Skeleton width="35%" height={12} radius={4} />
    </div>
  );
}

/** Grid of Stat cards */
export function StatGridSkeleton({ count = 4, className }: SkeletonPresetProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Project card skeleton for marketplace grids */
export function ProjectCardSkeleton({ className }: SkeletonPresetProps) {
  return (
    <div className={cn('p-5 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md space-y-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <Skeleton width="70%" height={22} radius={6} />
        <Skeleton width={70} height={24} radius={12} />
      </div>
      <Skeleton lines={2} height={14} radius={6} />
      <div className="flex gap-2 pt-1">
        <Skeleton width={64} height={22} radius={12} />
        <Skeleton width={64} height={22} radius={12} />
        <Skeleton width={64} height={22} radius={12} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center gap-2">
          <Skeleton width={32} height={32} radius="50%" />
          <Skeleton width={90} height={14} radius={6} />
        </div>
        <Skeleton width={80} height={20} radius={6} />
      </div>
    </div>
  );
}

/** Grid of Project Cards */
export function ProjectGridSkeleton({ count = 6, className }: SkeletonPresetProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Table rows skeleton for data tables */
export function TableRowsSkeleton({ count = 5, cols = 5, className }: SkeletonPresetProps & { cols?: number }) {
  return (
    <div className={cn('w-full border border-gray-200/60 dark:border-gray-800/60 rounded-2xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-md', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/60 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-800/30">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={`${80 / cols}%`} height={16} radius={6} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: count }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800/40 last:border-0">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              width={colIndex === 0 ? '25%' : colIndex === cols - 1 ? '15%' : '18%'}
              height={14}
              radius={6}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Chat sidebar and message view skeleton */
export function ChatViewSkeleton({ className }: SkeletonPresetProps) {
  return (
    <div className={cn('flex h-[calc(100vh-5rem)] border border-gray-200/60 dark:border-gray-800/60 rounded-2xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-md', className)}>
      {/* Left sidebar */}
      <div className="w-80 border-r border-gray-200/60 dark:border-gray-800/60 p-4 space-y-4 hidden md:block">
        <Skeleton width="100%" height={40} radius={10} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-xl">
            <Skeleton width={44} height={44} radius="50%" />
            <div className="flex-1 space-y-2">
              <Skeleton width="65%" height={14} radius={4} />
              <Skeleton width="85%" height={12} radius={4} />
            </div>
          </div>
        ))}
      </div>

      {/* Main chat section */}
      <div className="flex-1 flex flex-col p-5">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center gap-3">
            <Skeleton width={40} height={40} radius="50%" />
            <div className="space-y-1">
              <Skeleton width={120} height={16} radius={4} />
              <Skeleton width={80} height={12} radius={4} />
            </div>
          </div>
          <Skeleton width={32} height={32} radius={8} />
        </div>

        <div className="flex-1 py-6 space-y-4 overflow-hidden">
          <div className="flex gap-3 items-end">
            <Skeleton width={32} height={32} radius="50%" />
            <Skeleton width="40%" height={56} radius={16} />
          </div>
          <div className="flex justify-end">
            <Skeleton width="45%" height={48} radius={16} />
          </div>
          <div className="flex gap-3 items-end">
            <Skeleton width={32} height={32} radius="50%" />
            <Skeleton width="35%" height={44} radius={16} />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200/60 dark:border-gray-800/60 flex items-center gap-3">
          <Skeleton width="100%" height={44} radius={12} />
        </div>
      </div>
    </div>
  );
}

/** Form skeleton */
export function FormSkeleton({ fields = 4, className }: SkeletonPresetProps & { fields?: number }) {
  return (
    <div className={cn('p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md space-y-6', className)}>
      <Skeleton width="40%" height={24} radius={8} />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton width="25%" height={14} radius={4} />
          <Skeleton width="100%" height={44} radius={10} />
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-4">
        <Skeleton width={90} height={40} radius={10} />
        <Skeleton width={120} height={40} radius={10} />
      </div>
    </div>
  );
}

/** Profile Header Skeleton */
export function ProfileHeaderSkeleton({ className }: SkeletonPresetProps) {
  return (
    <div className={cn('p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md space-y-6', className)}>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Skeleton width={96} height={96} radius="50%" />
        <div className="space-y-3 text-center sm:text-left flex-1">
          <Skeleton width="50%" height={26} radius={6} />
          <Skeleton width="30%" height={16} radius={4} />
          <div className="flex gap-2 justify-center sm:justify-start">
            <Skeleton width={70} height={22} radius={12} />
            <Skeleton width={70} height={22} radius={12} />
          </div>
        </div>
      </div>
      <Skeleton lines={3} height={14} radius={6} />
    </div>
  );
}
