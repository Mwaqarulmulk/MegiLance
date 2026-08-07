'use client';

import React, { useState, useEffect, Suspense, lazy, Component, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const Lottie = lazy(() => import('lottie-react'));

// Safe error boundary to catch any lottie rendering errors locally
class BrandLottieErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('BrandLottiePlayer caught rendering error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
            <span>Animation preview unavailable</span>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

function isValidLottie(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  const target = (obj.default && typeof obj.default === 'object' ? obj.default : obj) as Record<string, unknown>;
  if (Array.isArray(target.layers)) {
    return target;
  }
  return null;
}

export interface BrandLottiePlayerProps {
  /** Relative URL path to JSON in public folder e.g. '/lottie/01_ai_saas_dashboard.json' or pre-imported animationData object */
  src?: string;
  animationData?: Record<string, unknown>;
  /** Optional container class name */
  className?: string;
  /** Optional canvas/lottie element class name */
  lottieClassName?: string;
  /** Width override */
  width?: string | number;
  /** Height override */
  height?: string | number;
  /** Accessible ARIA label */
  ariaLabel?: string;
  /** Loop animation */
  loop?: boolean;
  /** Autoplay animation */
  autoplay?: boolean;
  /** Show glowing gradient ambient background */
  glow?: boolean;
  /** Card wrapper frame with subtle border and glass effect */
  framed?: boolean;
}

export function BrandLottiePlayer({
  src,
  animationData: directData,
  className = '',
  lottieClassName = '',
  width,
  height,
  ariaLabel = 'Interactive Animation',
  loop = true,
  autoplay = true,
  glow = true,
  framed = false,
}: BrandLottiePlayerProps) {
  const [data, setData] = useState<Record<string, unknown> | null>(() => isValidLottie(directData));
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(!directData && !!src);

  useEffect(() => {
    const validDirect = isValidLottie(directData);
    if (validDirect) {
      setData(validDirect);
      setLoading(false);
      return;
    }

    if (!src) return;

    let isMounted = true;
    setLoading(true);

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load lottie from ${src}`);
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          const validated = isValidLottie(json);
          if (validated) {
            setData(validated);
          } else {
            console.warn(`Invalid Lottie structure fetched from ${src}`);
            setError(true);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('BrandLottiePlayer load error:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src, directData]);

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    maxWidth: '100%',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden transition-all duration-300',
        framed && [
          'rounded-2xl border border-border/40 bg-background/60 backdrop-blur-md',
          'shadow-xl shadow-primary/5 p-4',
        ],
        className
      )}
      role="img"
      aria-label={ariaLabel}
      style={style}
    >
      {/* Background ambient glow effect */}
      {glow && (
        <>
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        </>
      )}

      {loading && (
        <div className="flex h-full w-full items-center justify-center min-h-[160px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {error && !loading && (
        <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
          <span>Animation preview unavailable</span>
        </div>
      )}

      {data && !loading && (
        <BrandLottieErrorBoundary>
          <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted/20 rounded-xl" />}>
            <Lottie
              animationData={data}
              loop={loop}
              autoplay={autoplay}
              className={cn('relative z-10 h-full w-full object-contain', lottieClassName)}
              rendererSettings={{
                preserveAspectRatio: 'xMidYMid meet',
              }}
            />
          </Suspense>
        </BrandLottieErrorBoundary>
      )}
    </div>
  );
}

export default BrandLottiePlayer;

