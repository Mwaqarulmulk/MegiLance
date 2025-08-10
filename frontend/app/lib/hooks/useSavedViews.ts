// @AI-HINT: Generic saved views hook for data/table pages. Stores named views in localStorage per storageKey.
'use client';

import { useEffect, useState } from 'react';

export interface SavedView<T = any> {
  name: string;
  payload: T;
  createdAt: number;
}

interface UseSavedViews<T> {
  views: SavedView<T>[];
  save: (name: string, payload: T) => void;
  remove: (name: string) => void;
  clearAll: () => void;
  get: (name: string) => T | undefined;
}

export function useSavedViews<T = any>(storageKey: string): UseSavedViews<T> {
  const read = (): SavedView<T>[] => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (!raw) return [];
      const parsed = JSON.parse(raw) as SavedView<T>[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const [views, setViews] = useState<SavedView<T>[]>(read);

  useEffect(() => {
    // Sync across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) setViews(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  const write = (items: SavedView<T>[]) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
    setViews(items);
  };

  const save = (name: string, payload: T) => {
    const filtered = views.filter(v => v.name !== name);
    const next = [...filtered, { name, payload, createdAt: Date.now() }];
    write(next);
  };

  const remove = (name: string) => {
    const next = views.filter(v => v.name !== name);
    write(next);
  };

  const clearAll = () => write([]);

  const get = (name: string) => views.find(v => v.name === name)?.payload;

  return { views, save, remove, clearAll, get };
}
