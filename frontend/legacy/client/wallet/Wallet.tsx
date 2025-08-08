'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import commonStyles from './Wallet.common.module.css';
import lightStyles from './Wallet.light.module.css';
import darkStyles from './Wallet.dark.module.css';
import { Button } from '@/components/ui/button';
import TransactionRow from '@/app/components/TransactionRow/TransactionRow';

// @AI-HINT: This is the Wallet page for clients. It has been fully refactored to use
// theme-aware CSS modules with camelCase conventions and modern import paths.

const Wallet: React.FC = () => {
  const { theme } = useTheme();
  const styles = {
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  };

  // Mock data for client wallet
  const balance = 4200.00;
  const transactions = [
    { type: 'payment', amount: -5000, date: '2025-08-01', description: 'Milestone Payment for AI Chatbot' },
    { type: 'payment', amount: -8000, date: '2025-07-15', description: 'Final Payment for E-commerce UI/UX' },
    { type: 'deposit', amount: 15000, date: '2025-07-10', description: 'Wallet Deposit via Credit Card' },
    { type: 'fee', amount: -250, date: '2025-08-01', description: 'Platform fee for AI Chatbot milestone' },
  ];

  return (
    <div className={`${styles.wallet} ${theme === 'dark' ? styles.walletDark : styles.walletLight}`}>
      <div className={styles.walletContainer}>
        <header className={styles.walletHeader}>
          <h1>My Wallet</h1>
          <p>Manage your balance, payment methods, and view transaction history.</p>
        </header>

        <div className={styles.walletMainLayout}>
          <div className={styles.walletBalanceSection}>
            <div className={styles.walletBalanceCard}>
              <h2>Current Balance</h2>
              <p className={styles.walletBalanceAmount}>${balance.toLocaleString()}</p>
              <Button>Add Funds</Button>
            </div>
            <div className={styles.paymentMethodsCard}>
              <h3>Payment Methods</h3>
              <div className={styles.paymentMethod}>
                <span>Visa **** 4242</span>
                <Button variant="secondary" size="sm">Withdraw</Button>
              </div>
              <Button variant="secondary">Add New Method</Button>
            </div>
          </div>

          <section className={styles.walletTransactions}>
            <h2>Transaction History</h2>
            <div className={styles.transactionListHeader}>
              <span>Description</span>
              <span>Date</span>
              <span>Amount</span>
            </div>
            <div className={styles.transactionList}>
              {transactions.map((tx, index) => (
                <TransactionRow key={index} amount={tx.amount.toString()} date={tx.date} description={tx.description} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
