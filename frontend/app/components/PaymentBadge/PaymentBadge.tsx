// @AI-HINT: This is the PaymentBadge component for displaying payment status (e.g., Paid, Pending) in lists and cards. All styles are per-component only. See PaymentBadge.common.css, PaymentBadge.light.css, and PaymentBadge.dark.css for theming.
import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './PaymentBadge.common.module.css';
import lightStyles from './PaymentBadge.light.module.css';
import darkStyles from './PaymentBadge.dark.module.css';

// @AI-HINT: This is the PaymentBadge component for displaying payment status. It is fully theme-aware and uses CSS modules.

export type PaymentStatus = 'paid' | 'pending' | 'failed';

export interface PaymentBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const statusLabels: Record<PaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
};

const PaymentBadge: React.FC<PaymentBadgeProps> = ({ status, className }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const statusClass = commonStyles[status];

  return (
    <span
      className={cn(
        commonStyles.paymentBadge,
        themeStyles.themeWrapper,
        statusClass,
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
};

export default PaymentBadge;
