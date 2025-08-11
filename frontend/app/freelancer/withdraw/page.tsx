// @AI-HINT: This page allows freelancers to withdraw their earnings. It's now fully theme-aware and built with premium, reusable components.
'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import Button from '@/app/components/Button/Button';
import Badge from '@/app/components/Badge/Badge';
import Input from '@/app/components/Input/Input';
import commonStyles from './Withdraw.common.module.css';
import lightStyles from './Withdraw.light.module.css';
import darkStyles from './Withdraw.dark.module.css';

// @AI-HINT: Mock data for withdrawal history and balance.
const withdrawData = {
  availableBalance: 1250.50, // in USDC
  withdrawalHistory: [
    { id: 'tx123', date: '2025-08-05', amount: 500.00, status: 'Completed', address: '0x...a1b2' },
    { id: 'tx124', date: '2025-07-20', amount: 300.00, status: 'Completed', address: '0x...a1b2' },
    { id: 'tx125', date: '2025-06-15', amount: 450.50, status: 'Completed', address: '0x...c3d4' },
  ],
};

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'failed': return 'danger';
    default: return 'secondary';
  }
};

const WithdrawPage: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Withdraw Funds</h1>
        <p className={styles.subtitle}>Transfer your earnings to your personal crypto wallet.</p>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.card} role="region" aria-label="Withdraw form" title="Withdraw form">
          <div className={styles.balanceInfo}>
            <span className={styles.balanceLabel}>Available Balance</span>
            <span className={styles.balanceValue}>{withdrawData.availableBalance.toFixed(2)} USDC</span>
          </div>
          <form className={styles.form}>
            <Input
              id="amount"
              label="Amount (USDC)"
              type="number"
              placeholder="0.00"
            />
            <Input
              id="walletAddress"
              label="Wallet Address"
              type="text"
              placeholder="0x..."
            />
            <Button variant="primary" fullWidth size="large" aria-label="Request withdrawal" title="Request withdrawal">Request Withdrawal</Button>
          </form>
        </div>

        <div className={styles.card} role="region" aria-label="Withdrawal history" title="Withdrawal history">
          <h2 className={styles.cardTitle}>Withdrawal History</h2>
          <table className={styles.table} aria-label="Withdrawal history table" title="Withdrawal history table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {withdrawData.withdrawalHistory.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>{tx.amount.toFixed(2)} USDC</td>
                  <td><Badge variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge></td>
                  <td><span className={styles.address}>{tx.address}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default WithdrawPage;
