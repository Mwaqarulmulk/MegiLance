// @AI-HINT: Animated meteor shower overlay for premium AI hero sections.
'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MeteorsProps {
  number?: number;
  className?: string;
}

export default function Meteors({ number = 18, className }: MeteorsProps) {
  const [styles, setStyles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const arr = Array.from({ length: number }).map(() => ({
      top: '-5%',
      left: `${Math.floor(Math.random() * 100)}%`,
      animationDelay: `${Math.random() * 4}s`,
      animationDuration: `${Math.floor(Math.random() * 6 + 4)}s`,
    }));
    setStyles(arr);
  }, [number]);

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {styles.map((style, idx) => (
        <span
          key={idx}
          className="absolute size-0.5 rotate-[215deg] animate-meteor rounded-full bg-primary-light shadow-[0_0_0_1px_#ffffff10]"
          style={style}
        >
          <span className="absolute top-1/2 -z-10 h-px w-[60px] -translate-y-1/2 bg-gradient-to-r from-primary-light to-transparent" />
        </span>
      ))}
    </div>
  );
}
