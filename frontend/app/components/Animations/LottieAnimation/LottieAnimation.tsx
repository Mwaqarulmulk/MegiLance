// @AI-HINT: Reusable Lottie animation wrapper component with lazy loading, accessibility, theme support, and error boundary protection.
'use client';

import React, { Suspense, lazy, useMemo, Component, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import commonStyles from './LottieAnimation.common.module.css';

// Lazy-load lottie-react for code splitting
const Lottie = lazy(() => import('lottie-react'));

// Safe error boundary to catch any lottie-web / canvas rendering errors locally
class LottieErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('LottieAnimation caught rendering error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// Utility to check if object is valid Lottie JSON data
export function isValidLottieData(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  // Unwrap default export if wrapped
  const target = (obj.default && typeof obj.default === 'object' ? obj.default : obj) as Record<string, unknown>;
  if (Array.isArray(target.layers) || (typeof target.v === 'string' && target.v.length > 0)) {
    return target;
  }
  return null;
}

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

  const validData = useMemo(() => isValidLottieData(animationData), [animationData]);

  if (!validData) {
    return <div className={cn('inline-flex items-center justify-center', className)} style={style} />;
  }

  return (
    <LottieErrorBoundary fallback={<div className={cn('inline-flex items-center justify-center', className)} style={style} />}>
      <div
        className={cn('inline-flex items-center justify-center', className)}
        role="img"
        aria-label={ariaLabel}
        style={style}
      >
        <Suspense fallback={<div style={style} />}>
          <Lottie
            animationData={validData}
            loop={keepLastFrame ? false : loop}
            autoplay={autoplay}
            className={commonStyles.lottieContainer}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice',
            }}
          />
        </Suspense>
      </div>
    </LottieErrorBoundary>
  );
};

export default LottieAnimation;

