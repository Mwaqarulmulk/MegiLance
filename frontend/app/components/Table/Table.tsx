// @AI-HINT: This is a Table component, an organism for displaying structured data.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Table.common.css';
import './Table.light.css';
import './Table.dark.css';

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

  return (
    <div className={`Table-container Table-container--${theme}`}>
      <table className={`Table Table--${theme}`}>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {columns.map((col) => (
                <td key={`${col.key}-${rowIndex}`}>
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
