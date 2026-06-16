// @AI-HINT: Flowing gradient text + gradient pill badge for premium AI headings.
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
  /** gradient color stops, css color list */
  colors?: string;
  speed?: string;
}

/** Flowing animated gradient applied to text. */
export function AnimatedGradientText({
  children,
  className,
  colors = '#4573df, #9b59b6, #ff9800, #27AE60, #4573df',
  speed = '6s',
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn('inline-block bg-clip-text text-transparent animate-gradient-x', className)}
      style={{
        backgroundImage: `linear-gradient(to right, ${colors})`,
        backgroundSize: '200% auto',
        animationDuration: speed,
      }}
    >
      {children}
    </span>
  );
}

interface ShineBadgeProps {
  children: React.ReactNode;
  className?: string;
}

/** Subtle shimmering pill badge ("✨ New"-style) used above hero headlines. */
export function ShineBadge({ children, className }: ShineBadgeProps) {
  return (
    <span
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md',
        'bg-[length:300%_100%] animate-shine',
        className,
      )}
      style={{
        backgroundImage:
          'linear-gradient(110deg, rgba(69,115,223,0.10), 45%, rgba(155,89,182,0.18), 55%, rgba(69,115,223,0.10))',
      }}
    >
      {children}
    </span>
  );
}

export default AnimatedGradientText;
