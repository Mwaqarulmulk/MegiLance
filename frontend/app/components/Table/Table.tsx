// @AI-HINT: This is a Table component, an organism for displaying structured data.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './Table.common.module.css';
import lightStyles from './Table.light.module.css';
import darkStyles from './Table.dark.module.css';

// Generic type for row data to allow for flexible table data
export type TableRow = Record<string, unknown>;

export interface TableColumn {
  key: string;
  header: string;
  // Optional render function for custom cell content
  render?: (row: TableRow) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: TableRow[];
  caption?: string;
}

const Table: React.FC<TableProps> = ({ columns, data, caption }) => {
  const { theme } = useTheme();

  if (!theme) return null;

  const themeStyles = theme === 'light' ? lightStyles : darkStyles;

  return (
    <div className={cn(commonStyles.tableContainer, themeStyles.tableContainer)}>
      <table className={cn(commonStyles.table, themeStyles.table)}>
        {caption && <caption className={cn(commonStyles.caption, themeStyles.caption)}>{caption}</caption>}
        <thead className={cn(commonStyles.tableThead, themeStyles.tableThead)}>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn(commonStyles.tableTh, themeStyles.tableTh)}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className={cn(commonStyles.tableTbody, themeStyles.tableTbody)}>
          {data.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className={cn(commonStyles.tableTbodyTr, themeStyles.tableTbodyTr, rowIndex === data.length - 1 && commonStyles.tableTbodyTrLastChild)}>
              {columns.map((col) => (
                <td key={`${col.key}-${rowIndex}`} className={cn(commonStyles.tableTd, themeStyles.tableTd)}>
                  {col.render ? col.render(row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
