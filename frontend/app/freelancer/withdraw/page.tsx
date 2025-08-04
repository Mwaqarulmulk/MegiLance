// @AI-HINT: This page allows freelancers to withdraw their earnings to their crypto wallet.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import Badge from '@/app/components/Badge/Badge';
import './WithdrawPage.common.css';
import './WithdrawPage.light.css';
import './WithdrawPage.dark.css';

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

  return (
    <div className={`WithdrawPage-container WithdrawPage-container--${theme}`}>
      <header className="WithdrawPage-header">
        <h1 className="WithdrawPage-title">Withdraw Funds</h1>
        <p className="WithdrawPage-subtitle">Transfer your earnings to your personal crypto wallet.</p>
      </header>

      <main className="WithdrawPage-main">
        <div className={`WithdrawPage-card WithdrawPage-card--${theme}`}>
          <div className="WithdrawPage-balance-card">
            <span className="WithdrawPage-balance-label">Available Balance</span>
            <span className="WithdrawPage-balance-value">{withdrawData.availableBalance.toFixed(2)} USDC</span>
          </div>
          <form className="WithdrawPage-form">
            <div className="WithdrawPage-form-group">
              <label htmlFor="amount">Amount (USDC)</label>
              <input type="number" id="amount" placeholder="0.00" className={`WithdrawPage-input WithdrawPage-input--${theme}`} />
            </div>
            <div className="WithdrawPage-form-group">
              <label htmlFor="walletAddress">Wallet Address</label>
              <input type="text" id="walletAddress" placeholder="0x..." className={`WithdrawPage-input WithdrawPage-input--${theme}`} />
            </div>
            <Button theme={theme} variant="primary" fullWidth>Request Withdrawal</Button>
          </form>
        </div>

        <div className={`WithdrawPage-card WithdrawPage-card--${theme}`}>
          <h2 className="WithdrawPage-card-title">Withdrawal History</h2>
          <div className="WithdrawPage-history-table">
            <div className="WithdrawPage-history-header">
              <span>Date</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Address</span>
            </div>
            <div className="WithdrawPage-history-body">
              {withdrawData.withdrawalHistory.map(tx => (
                <div key={tx.id} className="WithdrawPage-history-row">
                  <span>{tx.date}</span>
                  <span>{tx.amount.toFixed(2)} USDC</span>
                  <span><Badge theme={theme} variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge></span>
                  <span className="WithdrawPage-address">{tx.address}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WithdrawPage;
