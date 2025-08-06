import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './TransactionRow.common.module.css';
import lightStyles from './TransactionRow.light.module.css';
import darkStyles from './TransactionRow.dark.module.css';

// @AI-HINT: This component displays a single transaction row, styled according to the current theme.

export interface TransactionRowProps {
  date: string;
  description: string;
  amount: string;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ date, description, amount }) => {
  const { theme } = useTheme();

  if (!theme) {
    return null;
  }

  const themeStyles = theme === 'light' ? lightStyles : darkStyles;

  return (
    <div className={cn(commonStyles.transactionRow, themeStyles.transactionRow)}>
      <span className={cn(commonStyles.transactionRowDate, themeStyles.transactionRowDate)}>{date}</span>
      <span className={cn(commonStyles.transactionRowDescription, themeStyles.transactionRowDescription)}>{description}</span>
      <span className={cn(commonStyles.transactionRowAmount, themeStyles.transactionRowAmount)}>{amount}</span>
    </div>
  );
};

export default TransactionRow;
