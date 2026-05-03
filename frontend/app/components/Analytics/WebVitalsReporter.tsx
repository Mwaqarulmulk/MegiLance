// @AI-HINT: Web Vitals reporting component using Next.js useReportWebVitals hook
// Tracks Core Web Vitals (LCP, FID, CLS, TTFB, INP) for performance monitoring
// Vercel best practice: https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals
'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useCallback } from 'react';

/**
 * Performance thresholds based on Google's Web Vitals recommendations
 * https://web.dev/vitals/
 */
const VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },    // Largest Contentful Paint
  FID: { good: 100, poor: 300 },       // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },     // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 },     // Time to First Byte
  INP: { good: 200, poor: 500 },       // Interaction to Next Paint
  FCP: { good: 1800, poor: 3000 },     // First Contentful Paint
} as const;

type VitalName = keyof typeof VITALS_THRESHOLDS;

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = VITALS_THRESHOLDS[name as VitalName];
  if (!threshold) return 'good';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

export function WebVitalsReporter() {
  const reportVitals = useCallback(
    (metric: { id: string; name: string; value: number; delta: number; rating: string }) => {
      const rating = getRating(metric.name, metric.value);
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        const color = rating === 'good' ? '#22c55e' : rating === 'needs-improvement' ? '#f59e0b' : '#ef4444';
        console.info(
          `%c[Web Vital] ${metric.name}: ${Math.round(metric.value)}ms (${rating})`,
          `color: ${color}; font-weight: bold;`
        );
      }

      // Send to Google Analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.delta * 1000 : metric.delta),
          event_label: metric.id,
          metric_rating: rating,
          non_interaction: true,
        });
      }

      // Send to custom analytics endpoint (if configured)
      if (process.env.NEXT_PUBLIC_VITALS_ENDPOINT) {
        const body = JSON.stringify({
          id: metric.id,
          name: metric.name,
          value: metric.value,
          delta: metric.delta,
          rating,
          page: window.location.pathname,
          timestamp: Date.now(),
        });

        // Use sendBeacon for reliability (won't block page unload)
        if (navigator.sendBeacon) {
          navigator.sendBeacon(process.env.NEXT_PUBLIC_VITALS_ENDPOINT, body);
        } else {
          fetch(process.env.NEXT_PUBLIC_VITALS_ENDPOINT, {
            body,
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
          }).catch(() => {
            // Silently fail - vitals reporting should never break the app
          });
        }
      }
    },
    []
  );

  useReportWebVitals(reportVitals);

  return null; // This component renders nothing
}

export default WebVitalsReporter;
