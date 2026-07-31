// @AI-HINT: High-fidelity complete-profile route loading skeleton
'use client';

import React from 'react';
import { ProfileHeaderSkeleton, FormSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';

export default function CompleteProfileLoading() {
  return (
    <div
      className="p-6 md:p-8 space-y-6 animate-pulse max-w-4xl mx-auto"
      role="status"
      aria-label="Loading profile completion wizard"
    >
      <ProfileHeaderSkeleton />
      <FormSkeleton fields={4} />
    </div>
  );
}
