'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table/table';
import commonStyles from './Payments.common.module.css';
import lightStyles from './Payments.light.module.css';
import darkStyles from './Payments.dark.module.css';

// @AI-HINT: This component displays the 'Payments' page for clients, showing a detailed history of their transactions in a premium Table-based UI.

const mockTransactions = [
  {
    id: 'txn1',
    date: '2024-07-15',
    description: 'Milestone 1: AI Chatbot Integration',
    freelancer: 'John D.',
    amount: '$5,000.00',
    status: 'Paid',
  },
  {
    id: 'txn2',
    date: '2024-07-10',
    description: 'Initial Deposit: Data Analytics Dashboard',
    freelancer: 'Jane S.',
    amount: '$10,000.00',
    status: 'Paid',
  },
  {
    id: 'txn3',
    date: '2024-07-01',
    description: 'Final Payment: E-commerce Platform UI/UX',
    freelancer: 'Mike R.',
    amount: '$12,500.00',
    status: 'Paid',
  },
  {
    id: 'txn4',
    date: '2024-06-25',
    description: 'Milestone 2: Mobile App Backend',
    freelancer: 'Sarah K.',
    amount: '$8,000.00',
    status: 'Pending',
  },
    {
    id: 'txn5',
    date: '2024-06-20',
    description: 'Service Fee Adjustment',
    freelancer: 'N/A',
    amount: '-$250.00',
    status: 'Refunded',
  },
];

const getStatusVariant = (status: string): React.ComponentProps<typeof Badge>['variant'] => {
  switch (status) {
    case 'Paid':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Failed':
      return 'destructive';
    case 'Refunded':
        return 'secondary';
    default:
      return 'outline';
  }
};

const Payments: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => ({
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  }), [theme]);

  return (
    <div className={styles.paymentsContainer}>
      <header className={styles.paymentsHeader}>
        <div className={styles.headerContent}>
            <h1 className={styles.headerTitle}>Payments</h1>
            <p className={styles.headerSubtitle}>Review your transaction history and manage payment methods.</p>
        </div>
        <Button>Add Payment Method</Button>
      </header>

      <main className={styles.paymentsMainContent}>
        <div className={styles.tableContainer}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Freelancer</TableHead>
                <TableHead className={styles.amountHeader}>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className={styles.descriptionCell}>{transaction.description}</TableCell>
                  <TableCell>{transaction.freelancer}</TableCell>
                  <TableCell className={styles.amountCell}>{transaction.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(transaction.status)}>{transaction.status}</Badge>
                  </TableCell>
                  <TableCell className={styles.actionsCell}>
                    <Button variant="secondary" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Payments;
