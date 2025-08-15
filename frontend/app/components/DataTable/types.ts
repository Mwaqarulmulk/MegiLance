export type SortDir = 'asc' | 'desc';

export interface Column<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  render?: (row: T) => React.ReactNode;
}

export interface ActionColumn<T> extends Omit<Column<T>, 'key' | 'sortable'> {
  key: string;
  sortable?: false;
}

export interface DataTableState<T> {
  query: string;
  setQuery: (q: string) => void;
  sortKey: keyof T & string;
  sortDir: SortDir;
  setSort: (key: keyof T & string) => void;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  setPageSize: (ps: number) => void;
  totalPages: number;
  rows: T[]; // paged rows
  allRows: T[]; // sorted+filtered rows (unpaged)
}
