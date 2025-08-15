"use client";
import React from 'react';
import { cn } from '@/lib/utils';
import type { Column, DataTableState, ActionColumn } from './types';
import type { Density } from '../DataTableExtras/DensityToggle';

interface TableProps<T> {
  columns: (Column<T> | ActionColumn<T>)[];
  state: DataTableState<T>;
  className?: string;
  rowKey?: (row: T, index: number) => string;
  density?: Density;
  headerCheckbox?: React.ReactNode;
}

export function Table<T extends Record<string, any>>({ columns, state, className, rowKey, density, headerCheckbox }: TableProps<T>) {
  const { rows, sortKey, sortDir, setSort, page, totalPages, setPage } = state;

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className={cn('w-full border-collapse')}
        role="table"
      >
        <thead>
          <tr className="border-b">
            {headerCheckbox && (
              <th scope="col" className={cn('text-left text-sm font-medium px-3 py-2 select-none', density === 'compact' ? 'py-1 px-2' : 'py-2 px-3')}>
                {headerCheckbox}
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{ width: col.width }}
                className={cn('text-left text-sm font-medium select-none', density === 'compact' ? 'py-1 px-2' : 'py-2 px-3', col.sortable && 'cursor-pointer')}
                onClick={() => {
                  if (col.sortable) {
                    const sortKey = col.key as keyof T & string;
                    if (typeof sortKey === 'string') {
                      setSort(sortKey);
                    }
                  }
                }}
                aria-sort={col.sortable && col.key === sortKey ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span aria-hidden className="text-xs opacity-60">
                      {col.key === sortKey ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey ? rowKey(row, i) : String((row as any).id ?? i)} className="border-b">
              {headerCheckbox && (
                <td className={cn('text-sm', density === 'compact' ? 'py-1 px-2' : 'py-2 px-3')}>
                  {/* This assumes the first column passed is the checkbox column when headerCheckbox is present */}
                  {columns[0]?.render?.(row)}
                </td>
              )}
              {columns.slice(headerCheckbox ? 1 : 0).map((col) => (
                <td key={col.key} className={cn('text-sm', density === 'compact' ? 'py-1 px-2' : 'py-2 px-3')}>
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between gap-2 px-2 py-2 text-sm">
        <span className="opacity-70">Page {page} of {totalPages}</span>
        <div className="flex items-center gap-2">
          <button className="border px-2 py-1 rounded"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
          >Prev</button>
          <button className="border px-2 py-1 rounded"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >Next</button>
        </div>
      </div>
    </div>
  );
}
