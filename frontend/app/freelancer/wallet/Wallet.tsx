// @AI-HINT: This is the Wallet page for freelancers to manage their earnings and transactions. All styles are per-component only.
'use client';

import React from 'react';
import TransactionRow from '@/app/components/TransactionRow/TransactionRow';
import Button from '@/app/components/Button/Button';
import './Wallet.common.css';
import './Wallet.light.css';
import './Wallet.dark.css';

interface WalletProps {
  theme?: 'light' | 'dark';
}

const Wallet: React.FC<WalletProps> = ({ theme = 'light' }) => {
  // Mock data for wallet
  const balance = 1234.56;
  const transactions = [
    { type: 'payment', amount: 500, date: '2025-08-03', description: 'Milestone 1 for Project X' },
    { type: 'withdrawal', amount: -200, date: '2025-08-01', description: 'Withdrawal to bank' },
    { type: 'payment', amount: 750, date: '2025-07-28', description: 'Final payment for Project Y' },
    { type: 'fee', amount: -75, date: '2025-07-28', description: 'Platform fee for Project Y' },
  ];

  return (
    <div className={`Wallet Wallet--${theme}`}>
      <div className="Wallet-container">
        <header className="Wallet-header">
          <h1>My Wallet</h1>
          <p>View your balance, transactions, and manage withdrawals.</p>
        </header>

        <div className="Wallet-overview">
          <div className={`Wallet-balance-card Wallet-balance-card--${theme}`}>
            <h2>Available Balance</h2>
            <p className="Wallet-balance-amount">${balance.toLocaleString()}</p>
            <Button theme={theme} variant="primary">Withdraw Funds</Button>
          </div>
        </div>

        <section className="Wallet-transactions">
          <h2>Transaction History</h2>
          <div className={`Transaction-list-header Transaction-list-header--${theme}`}>
            <span>Description</span>
            <span>Date</span>
            <span>Amount</span>
          </div>
          <div className="Transaction-list">
            {transactions.map((tx, index) => (
              <TransactionRow key={index} theme={theme} {...tx} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Wallet;
