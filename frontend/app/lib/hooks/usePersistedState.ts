// @AI-HINT: React hook to persist state to localStorage with a stable key. Great for remembering filters/sorts between visits.
'use client';

import { useEffect, useMemo, useState } from 'react';

export function usePersistedState<T>(key: string, initial: T) {
  const storageKey = useMemo(() => `megilance:${key}`, [key]);
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw != null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // ignore quota or serialization errors
    }
  }, [storageKey, value]);

  const reset = (next?: T) => setValue(next ?? initial);

  return [value, setValue, reset] as const;
}
