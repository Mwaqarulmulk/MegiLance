// @AI-HINT: This component provides a set of toggle buttons for filtering proposals by status. It's designed to be reusable and theme-aware.

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Proposal } from '../ProposalCard/ProposalCard';

import commonStyles from './StatusFilter.common.module.css';
import lightStyles from './StatusFilter.light.module.css';
import darkStyles from './StatusFilter.dark.module.css';

interface StatusFilterProps {
  allStatuses: Proposal['status'][];
  selectedStatuses: Proposal['status'][];
  onChange: (selected: Proposal['status'][]) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ allStatuses, selectedStatuses, onChange }) => {
  const { resolvedTheme } = useTheme();
  const styles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  const handleToggle = (status: Proposal['status']) => {
    const newSelection = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    onChange(newSelection);
  };

  return (
    <div className={cn(commonStyles.filterGroup)} role="group" aria-label="Filter proposals by status">
      {allStatuses.map(status => {
        const isSelected = selectedStatuses.includes(status);
        return (
          <button
            key={status}
            type="button"
            role="checkbox"
            aria-checked={isSelected ? 'true' : 'false'}
            onClick={() => handleToggle(status)}
            className={cn(
              commonStyles.filterButton,
              styles.filterButton,
              isSelected && commonStyles.selected,
              isSelected && styles.selected
            )}
          >
            {status}
          </button>
        );
      })}
    </div>
  );
};

export default StatusFilter;
