// @AI-HINT: This file defines a reusable, high-quality Table component system, fully refactored to use theme-aware CSS Modules. It provides a set of composable components to build complex and styled data tables that align with the MegiLance brand guidelines and support both light and dark themes.

'use client';

import { forwardRef } from 'react';
import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
// The CSS module imports are now relative to the new file location.
import commonStyles from './Table.common.module.css';
import lightStyles from './Table.light.module.css';
import darkStyles from './Table.dark.module.css';

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => {
  const { resolvedTheme } = useTheme();
  const styles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.tableWrapper, styles.tableWrapper)}>
      <table
        ref={ref}
        className={cn(commonStyles.table, className)}
        {...props}
      />
    </div>
  );
});
Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
  const { resolvedTheme } = useTheme();
  const styles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <thead
      ref={ref}
      className={cn(styles.header, className)}
      {...props}
    />
  );
});
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
  const { resolvedTheme } = useTheme();
  const styles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <tfoot
      ref={ref}
      className={cn(commonStyles.footer, styles.footer, className)}
      {...props}
    />
  );
});
TableFooter.displayName = 'TableFooter';

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => {
  const { resolvedTheme } = useTheme();
  const styles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <tr
      ref={ref}
      className={cn(commonStyles.row, styles.row, className)}
      {...props}
    />
  );
});
TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
  const { resolvedTheme } = useTheme();
  const styles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <th
      ref={ref}
      className={cn(commonStyles.head, styles.head, className)}
      {...props}
    />
  );
});
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
  const { resolvedTheme } = useTheme();
  const styles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <td
      ref={ref}
      className={cn(commonStyles.cell, styles.cell, className)}
      {...props}
    />
  );
});
TableCell.displayName = 'TableCell';

const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => {
  const { resolvedTheme } = useTheme();
  const styles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <caption
      ref={ref}
      className={cn(commonStyles.caption, styles.caption, className)}
      {...props}
    />
  );
});
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
