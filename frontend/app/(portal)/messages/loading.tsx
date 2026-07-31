// @AI-HINT: High-fidelity loading skeleton for messages & chat route
'use client';

import React from 'react';
import { ChatViewSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';

export default function MessagesLoading() {
  return (
    <div
      className="p-4 md:p-6 animate-pulse max-w-7xl mx-auto"
      role="status"
      aria-label="Loading messages panel"
    >
      <ChatViewSkeleton />
    </div>
  );
}
