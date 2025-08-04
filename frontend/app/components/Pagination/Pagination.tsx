// @AI-HINT: This is a Pagination component, a molecular element for navigating through pages of data.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Pagination.common.css';
import './Pagination.light.css';
import './Pagination.dark.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const { theme } = useTheme();

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

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={`Pagination Pagination--${theme}`} aria-label="Pagination">
      <button onClick={handlePrevious} disabled={currentPage === 1} className="Pagination-button">
        Previous
      </button>
      <span className="Pagination-info">
        Page {currentPage} of {totalPages}
      </span>
      <button onClick={handleNext} disabled={currentPage === totalPages} className="Pagination-button">
        Next
      </button>
    </nav>
  );
};

export default Pagination;
