// @AI-HINT: This is the Wallet page for clients to manage funds and view transactions. All styles are per-component only.
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
  // Mock data for client wallet
  const balance = 4200.00;
  const transactions = [
    { type: 'payment', amount: -5000, date: '2025-08-01', description: 'Milestone Payment for AI Chatbot' },
    { type: 'payment', amount: -8000, date: '2025-07-15', description: 'Final Payment for E-commerce UI/UX' },
    { type: 'deposit', amount: 15000, date: '2025-07-10', description: 'Wallet Deposit via Credit Card' },
    { type: 'fee', amount: -250, date: '2025-08-01', description: 'Platform fee for AI Chatbot milestone' },
  ];

  return (
    <div className={`Wallet Wallet--${theme}`}>
      <div className="Wallet-container">
        <header className="Wallet-header">
          <h1>My Wallet</h1>
          <p>Manage your balance, payment methods, and view transaction history.</p>
        </header>

        <div className="Wallet-main-layout">
          <div className="Wallet-balance-section">
            <div className={`Wallet-balance-card Wallet-balance-card--${theme}`}>
              <h2>Current Balance</h2>
              <p className="Wallet-balance-amount">${balance.toLocaleString()}</p>
              <Button theme={theme} variant="primary">Add Funds</Button>
            </div>
            <div className={`Payment-methods-card Payment-methods-card--${theme}`}>
              <h3>Payment Methods</h3>
              <div className="Payment-method">
                <span>Visa **** 4242</span>
                <Button theme={theme} variant="outline" size="small">Remove</Button>
              </div>
              <Button theme={theme} variant="outline">Add New Method</Button>
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
    </div>
  );
};

export default Wallet;
