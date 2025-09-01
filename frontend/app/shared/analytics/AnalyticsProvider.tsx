// @AI-HINT: Basic analytics context capturing page views & custom events.
'use client';
import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsContextValue {
  track: (name: string, props?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

const queue: any[] = [];

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const search = useSearchParams();
  const lastRef = useRef<string | null>(null);

  const flush = () => {
    if (typeof window === 'undefined') return;
    if (queue.length) {
      // In real impl send to endpoint
      // navigator.sendBeacon('/api/analytics', JSON.stringify(queue.splice(0)));
      queue.splice(0); // clear
    }
  };

  const track = useCallback((name: string, props?: Record<string, any>) => {
    queue.push({ name, props, t: Date.now() });
  }, []);

  // Track page view
  useEffect(() => {
    const key = pathname + (search?.toString() ? '?' + search.toString() : '');
    if (lastRef.current !== key) {
      track('page_view', { path: pathname, search: search?.toString() });
      lastRef.current = key;
      flush();
    }
  }, [pathname, search, track]);

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return ctx;
};
