// @AI-HINT: This is the refactored TransactionRow component, using premium, theme-aware styles and the useMemo hook for a polished and efficient implementation.
import React, { useMemo, useId } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './TransactionRow.common.module.css';
import lightStyles from './TransactionRow.light.module.css';
import darkStyles from './TransactionRow.dark.module.css';

export interface TransactionRowProps {
  date: string;
  description: string;
  amount: string | number;
  isPositive?: boolean;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ date, description, amount }) => {
  const { theme } = useTheme();
  const dateId = useId();
  const descriptionId = useId();
  const amountId = useId();

  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const isPositive = typeof amount === 'number' ? amount >= 0 : !String(amount).startsWith('-');
  const formattedAmount = typeof amount === 'number' 
    ? `${amount >= 0 ? '+' : ''}${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)}`
    : `${!String(amount).startsWith('-') ? '+' : ''}${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(String(amount)))}`;

  return (
    <div
      className={styles.row}
      aria-labelledby={`${dateId} ${descriptionId} ${amountId}`}
    >
      <span id={dateId} className={styles.date} title={`Date: ${date}`}>{date}</span>
      <span id={descriptionId} className={styles.description} title={description}>{description}</span>
      <span
        id={amountId}
        className={cn(styles.amount, isPositive ? styles.positive : styles.negative)}
        title={`Amount: ${formattedAmount}`}
      >
        {formattedAmount}
      </span>
    </div>
  );
};

export default TransactionRow;
