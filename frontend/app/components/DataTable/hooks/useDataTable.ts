import { useMemo, useState } from 'react';
import type { Column, DataTableState, SortDir, ActionColumn } from '../types';

export function useDataTable<T extends Record<string, any>>(
  data: T[],
  columns: (Column<T> | ActionColumn<T>)[],
  opts?: { initialSortKey?: keyof T & string; initialSortDir?: SortDir; initialPageSize?: number }
): DataTableState<T> {
  const firstSortableColumn = columns.find(c => c.sortable) as Column<T> | undefined;
  const initialKey = (opts?.initialSortKey ?? firstSortableColumn?.key) as keyof T & string;
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof T & string>(initialKey);
  const [sortDir, setSortDir] = useState<SortDir>(opts?.initialSortDir ?? 'asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(opts?.initialPageSize ?? 10);

  const lower = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!lower) return data;
    return data.filter((row) =>
      Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(lower))
    );
  }, [data, lower]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = String(a[sortKey] ?? '').toLowerCase();
      const bv = String(b[sortKey] ?? '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const rows = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageSafe, pageSize]);

  const setSort = (key: keyof T & string) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
      setPage(1);
    }
  };

  return {
    query,
    setQuery,
    sortKey,
    sortDir,
    setSort,
    page: pageSafe,
    pageSize,
    setPage,
    setPageSize: (ps) => {
      setPageSize(ps);
      setPage(1);
    },
    totalPages,
    rows,
    allRows: sorted,
  } as DataTableState<T>;
}
