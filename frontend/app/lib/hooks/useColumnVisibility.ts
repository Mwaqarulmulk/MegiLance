// @AI-HINT: Persisted column visibility hook for tables
'use client';

import { usePersistedState } from './usePersistedState';

export type ColumnKey = string;

export function useColumnVisibility(pageKey: string, allColumns: ColumnKey[], defaultVisible?: ColumnKey[]) {
  const [visible, setVisible] = usePersistedState<ColumnKey[]>(`${pageKey}:columns`, defaultVisible ?? allColumns);
  const toggle = (key: ColumnKey) => {
    setVisible(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  const isVisible = (key: ColumnKey) => visible.includes(key);
  const setAll = (keys: ColumnKey[]) => setVisible(keys);
  return { visible, setVisible, toggle, isVisible, setAll } as const;
}
