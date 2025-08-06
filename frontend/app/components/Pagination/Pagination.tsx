// @AI-HINT: This is a Pagination component, a molecular element for navigating through pages of data.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './Pagination.common.module.css';
import lightStyles from './Pagination.light.module.css';
import darkStyles from './Pagination.dark.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className }) => {
  const { theme } = useTheme();

  if (!theme || totalPages <= 1) {
    return null;
  }

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav className={cn(commonStyles.pagination, themeStyles.pagination, className)} aria-label="Pagination">
      <button onClick={handlePrevious} disabled={currentPage === 1} className={cn(commonStyles.paginationButton, themeStyles.paginationButton)}>
        Previous
      </button>
      <span className={cn(commonStyles.paginationInfo, themeStyles.paginationInfo)}>
        Page {currentPage} of {totalPages}
      </span>
      <button onClick={handleNext} disabled={currentPage === totalPages} className={cn(commonStyles.paginationButton, themeStyles.paginationButton)}>
        Next
      </button>
    </nav>
  );
};

export default Pagination;
