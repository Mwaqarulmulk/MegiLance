// @AI-HINT: Premium skeleton loader component with per-component CSS modules for loading placeholders
'use client';

import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import styles from './Skeleton.common.module.css';
import light from './Skeleton.light.module.css';
import dark from './Skeleton.dark.module.css';

export type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  lines?: number;
  inline?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
  style?: React.CSSProperties;
};

export default function Skeleton({
  width,
  height = 14,
  radius = 8,
  lines = 1,
  inline = false,
  theme: themeProp,
  className,
  style,
}: SkeletonProps) {
  const { resolvedTheme } = useTheme();
  const currentTheme = themeProp || resolvedTheme;
  const themeClass = currentTheme === 'dark' ? dark.theme : light.theme;

  const count = Math.max(1, lines);
  const items = Array.from({ length: count });

  return (
    <div className={cn(styles.container, themeClass, inline && styles.inline, className)} style={style} aria-hidden>
      {items.map((_, i) => {
        const isLast = i === count - 1 && count > 1;
        const itemWidth = isLast && !width ? '75%' : width;
        return (
          <div
            key={i}
            className={styles.block}
            style={{
              width: typeof itemWidth === 'number' ? `${itemWidth}px` : itemWidth,
              height: typeof height === 'number' ? `${height}px` : height,
              borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
            }}
          />
        );
      })}
    </div>
  );
}

