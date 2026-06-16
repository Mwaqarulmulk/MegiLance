// @AI-HINT: Animated number display. Wraps @number-flow/react for smooth count transitions used in AI result reveals.
'use client';

import React from 'react';
import NumberFlow, { type Format } from '@number-flow/react';
import { cn } from '@/lib/utils';

interface NumberTickerProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** when true, format as USD currency */
  currency?: string;
  format?: Format;
}

/**
 * Smoothly animates between numeric values (great for prices, scores, projections).
 * Falls back gracefully — @number-flow/react renders the final value if motion is off.
 */
export default function NumberTicker({
  value,
  className,
  prefix,
  suffix,
  decimals,
  currency,
  format,
}: NumberTickerProps) {
  const fmt: Format =
    format ??
    (currency
      ? { style: 'currency', currency, maximumFractionDigits: decimals ?? 0 }
      : {
          maximumFractionDigits: decimals ?? 0,
          minimumFractionDigits: decimals ?? 0,
        });

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      <NumberFlow value={value} format={fmt} />
      {suffix}
    </span>
  );
}
