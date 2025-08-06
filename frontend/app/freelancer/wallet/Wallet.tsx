// @AI-HINT: This is the Wallet page for freelancers to manage their earnings and transactions. All styles are per-component only.
'use client';

import React from 'react';
import TransactionRow from '@/app/components/TransactionRow/TransactionRow';
import Button from '@/app/components/Button/Button';
import commonStyles from './Wallet.common.module.css';
import lightStyles from './Wallet.light.module.css';
import darkStyles from './Wallet.dark.module.css';

// @AI-HINT: This is the Wallet page for freelancers to manage their earnings and transactions. All styles are per-component only. Now fully theme-switchable using global theme context.

const Wallet: React.FC = () => {
  // Mock data for wallet
  const balance = 1234.56;
  const transactions = [
    { type: 'payment', amount: '500', date: '2025-08-03', description: 'Milestone 1 for Project X' },
    { type: 'withdrawal', amount: '-200', date: '2025-08-01', description: 'Withdrawal to bank' },
    { type: 'payment', amount: '750', date: '2025-07-28', description: 'Final payment for Project Y' },
    { type: 'fee', amount: '-75', date: '2025-07-28', description: 'Platform fee for Project Y' },
  ];

  return (
    <div className={commonStyles.wallet}>
      <div className={commonStyles.container}>
        <header className={commonStyles.header}>
          <h1>My Wallet</h1>
          <p>View your balance, transactions, and manage withdrawals.</p>
        </header>

        <div className={commonStyles.overview}>
          <div className={commonStyles.balanceCard}>
            <h2>Available Balance</h2>
            <p className={commonStyles.balanceAmount}>${balance.toLocaleString()}</p>
            <Button variant="primary">Withdraw Funds</Button>
          </div>
        </div>

        <section className={commonStyles.transactions}>
          <h2>Transaction History</h2>
          <div className={commonStyles.transactionListHeader}>
            <span>Description</span>
            <span>Date</span>
            <span>Amount</span>
          </div>
          <div className={commonStyles.transactionList}>
            {transactions.map((tx, index) => (
              <TransactionRow key={index} {...tx} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Wallet;
