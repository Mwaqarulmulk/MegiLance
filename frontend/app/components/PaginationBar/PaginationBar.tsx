// @AI-HINT: Reusable, theme-aware pagination bar with accessible labels and keyboard-friendly controls.
'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './PaginationBar.common.module.css';
import lightStyles from './PaginationBar.light.module.css';
import darkStyles from './PaginationBar.dark.module.css';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalResults?: number;
  onPrev: () => void;
  onNext: () => void;
}

const PaginationBar: React.FC<PaginationBarProps> = ({ currentPage, totalPages, totalResults, onPrev, onNext }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  return (
    <div className={styles.paginationBar} role="navigation" aria-label="Pagination" title="Pagination">
      <button
        type="button"
        className={styles.button}
        onClick={onPrev}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        title="Previous page"
      >
        Prev
      </button>
      <span className={styles.paginationInfo} aria-live="polite">
        Page {currentPage} of {totalPages}{typeof totalResults === 'number' ? ` · ${totalResults} result(s)` : ''}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={onNext}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        title="Next page"
      >
        Next
      </button>
    </div>
  );
};

export default PaginationBar;
