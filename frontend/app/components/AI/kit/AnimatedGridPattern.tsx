// @AI-HINT: Subtle animated SVG grid + dot backgrounds for AI hero/section surfaces. Theme-neutral (uses currentColor).
'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GridProps {
  width?: number;
  height?: number;
  className?: string;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
}

/** Animated grid where random cells gently pulse — premium tech backdrop. */
export function AnimatedGridPattern({
  width = 40,
  height = 40,
  className,
  numSquares = 40,
  maxOpacity = 0.4,
  duration = 4,
}: GridProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [squares, setSquares] = useState<{ id: number; pos: [number, number] }[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const resize = () => {
      const el = containerRef.current;
      if (el) setDimensions({ width: el.offsetWidth, height: el.offsetHeight });
    };
    const ro = new ResizeObserver(resize);
    ro.observe(containerRef.current);
    resize();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (dimensions.width === 0) return;
    const cols = Math.floor(dimensions.width / width);
    const rows = Math.floor(dimensions.height / height);
    setSquares(
      Array.from({ length: numSquares }, (_, i) => ({
        id: i,
        pos: [Math.floor(Math.random() * cols), Math.floor(Math.random() * rows)] as [number, number],
      })),
    );
  }, [dimensions, width, height, numSquares]);

  return (
    <svg
      ref={containerRef as unknown as React.Ref<SVGSVGElement>}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full fill-current/[0.18] stroke-current/[0.18] text-primary',
        className,
      )}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse">
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x="0" y="0" className="overflow-visible">
        {squares.map(({ pos: [x, y], id: i }, index) => (
          <motion.rect
            key={`${x}-${y}-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{ duration, repeat: Infinity, repeatType: 'reverse', delay: index * 0.1, repeatDelay: 1 }}
            width={width - 1}
            height={height - 1}
            x={x * width + 1}
            y={y * height + 1}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  );
}

interface DotPatternProps {
  className?: string;
  glow?: boolean;
}

/** Static dotted background. */
export function DotPattern({ className, glow }: DotPatternProps) {
  const id = useId();
  return (
    <svg aria-hidden="true" className={cn('pointer-events-none absolute inset-0 h-full w-full fill-current/[0.25] text-primary', className)}>
      <defs>
        <pattern id={id} width={20} height={20} patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
          <circle cx={1.2} cy={1.2} r={glow ? 1.4 : 1} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export default AnimatedGridPattern;
