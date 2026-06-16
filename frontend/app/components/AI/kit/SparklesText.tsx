// @AI-HINT: Text with animated sparkles for marquee headlines / hero emphasis.
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Sparkle {
  id: string;
  x: string;
  y: string;
  color: string;
  delay: number;
  scale: number;
}

const COLORS = ['#4573df', '#9b59b6', '#ff9800', '#27AE60'];

function genSparkle(): Sparkle {
  return {
    id: `${Date.now()}-${Math.random()}`,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 2,
    scale: Math.random() * 1 + 0.3,
  };
}

export default function SparklesText({
  children,
  className,
  count = 8,
}: {
  children: React.ReactNode;
  className?: string;
  count?: number;
}) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    setSparkles(Array.from({ length: count }, genSparkle));
    const iv = setInterval(() => {
      setSparkles((prev) => prev.map((s) => (Math.random() > 0.7 ? genSparkle() : s)));
    }, 1200);
    return () => clearInterval(iv);
  }, [count]);

  return (
    <span className={cn('relative inline-block', className)}>
      {sparkles.map((s) => (
        <motion.svg
          key={s.id}
          className="pointer-events-none absolute z-10"
          style={{ left: s.x, top: s.y }}
          width="14"
          height="14"
          viewBox="0 0 21 21"
          initial={{ scale: 0, rotate: 0, opacity: 0 }}
          animate={{ scale: [0, s.scale, 0], rotate: [0, 120, 180], opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: s.delay }}
          aria-hidden="true"
        >
          <path
            d="M9.82 0.66 11.5 6.4 17.2 8.08 11.5 9.76 9.82 15.5 8.14 9.76 2.4 8.08 8.14 6.4z"
            fill={s.color}
          />
        </motion.svg>
      ))}
      <span className="relative z-0">{children}</span>
    </span>
  );
}
