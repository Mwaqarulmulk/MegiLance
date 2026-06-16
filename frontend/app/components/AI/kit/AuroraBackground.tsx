// @AI-HINT: Composable animated backdrop for AI tool pages — aurora blobs + animated grid + particles. Theme-aware, fixed behind content.
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Particles from './Particles';
import { AnimatedGridPattern } from './AnimatedGridPattern';

interface AuroraBackgroundProps {
  className?: string;
  isDark?: boolean;
  /** show interactive particle field */
  particles?: boolean;
  /** show animated grid */
  grid?: boolean;
  /** number of particles */
  particleCount?: number;
}

/**
 * Full-bleed premium backdrop. Render once near the top of a tool page,
 * absolutely positioned behind content (parent should be position:relative).
 */
export default function AuroraBackground({
  className,
  isDark = true,
  particles = true,
  grid = true,
  particleCount = 60,
}: AuroraBackgroundProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)} aria-hidden="true">
      {/* aurora blobs */}
      <div
        className="absolute -top-1/4 left-1/4 h-[40rem] w-[40rem] rounded-full opacity-60 blur-[120px] animate-aurora"
        style={{
          background: 'radial-gradient(circle at center, rgba(69,115,223,0.45), transparent 60%)',
        }}
      />
      <div
        className="absolute top-1/3 right-1/4 h-[34rem] w-[34rem] rounded-full opacity-50 blur-[120px] animate-aurora [animation-delay:-20s]"
        style={{
          background: 'radial-gradient(circle at center, rgba(155,89,182,0.4), transparent 60%)',
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full opacity-40 blur-[120px] animate-aurora [animation-delay:-40s]"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,152,0,0.32), transparent 60%)',
        }}
      />
      {/* grid */}
      {grid && (
        <AnimatedGridPattern
          numSquares={28}
          maxOpacity={isDark ? 0.18 : 0.12}
          duration={4}
          className={cn(
            '[mask-image:radial-gradient(60%_50%_at_50%_0%,white,transparent)]',
            isDark ? 'text-blue-300/40' : 'text-blue-500/30',
          )}
        />
      )}
      {/* particles */}
      {particles && (
        <Particles
          quantity={particleCount}
          color={isDark ? '#7aa2ff' : '#4573df'}
          ease={60}
          size={0.6}
          className="[mask-image:radial-gradient(80%_80%_at_50%_30%,white,transparent)]"
        />
      )}
      {/* vignette to blend into page bg */}
      <div
        className={cn(
          'absolute inset-0',
          isDark
            ? 'bg-gradient-to-b from-transparent via-[#0f172a]/40 to-[#0f172a]'
            : 'bg-gradient-to-b from-transparent via-white/40 to-white',
        )}
      />
    </div>
  );
}
