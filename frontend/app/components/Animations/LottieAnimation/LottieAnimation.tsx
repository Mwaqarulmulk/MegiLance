// @AI-HINT: Reusable Lottie animation wrapper component with lazy loading, accessibility, and theme support.
'use client';

import React, { Suspense, lazy, useMemo } from 'react';
import { cn } from '@/lib/utils';
import commonStyles from './LottieAnimation.common.module.css';

// Lazy-load lottie-react for code splitting
const Lottie = lazy(() => import('lottie-react'));

export interface LottieAnimationProps {
  /** Lottie JSON animation data object */
  animationData: Record<string, unknown>;
  /** Whether the animation should loop */
  loop?: boolean;
  /** Whether the animation should autoplay */
  autoplay?: boolean;
  /** CSS class name */
  className?: string;
  /** Width (CSS value) */
  width?: string | number;
  /** Height (CSS value) */
  height?: string | number;
  /** Accessible label */
  ariaLabel?: string;
  /** Playback speed (1 = normal) */
  speed?: number;
  /** Stop on last frame instead of looping */
  keepLastFrame?: boolean;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  loop = true,
  autoplay = true,
  className,
  width,
  height,
  ariaLabel = 'Animation',
  speed = 1,
  keepLastFrame = false,
}) => {
  const style = useMemo(
    () => ({
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      maxWidth: '100%',
    }),
    [width, height]
  );

  return (
    <div
      className={cn('inline-flex items-center justify-center', className)}
      role="img"
      aria-label={ariaLabel}
      style={style}
    >
      <Suspense fallback={<div style={style} />}>
        <Lottie
          animationData={animationData}
          loop={keepLastFrame ? false : loop}
          autoplay={autoplay}
          className={commonStyles.lottieContainer}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice',
          }}
        />
      </Suspense>
    </div>
  );
};

export default LottieAnimation;
