// @AI-HINT: This is the Payments Management page for admins to view all platform transactions. All styles are per-component only.
'use client';

import React from 'react';
import Input from '@/app/components/Input/Input';
import './Payments.common.css';
import './Payments.light.css';
import './Payments.dark.css';

interface PaymentsProps {
  theme?: 'light' | 'dark';
}

// Mock data for payments
const mockPayments = [
  { id: 'txn1', date: '2025-08-03', type: 'Milestone Release', from: 'Innovate Inc.', to: 'John D.', amount: 5000, status: 'Completed' },
  { id: 'txn2', date: '2025-08-02', type: 'Deposit', from: 'Shopify Plus Store', to: 'Platform Wallet', amount: 8000, status: 'Completed' },
  { id: 'txn3', date: '2025-08-01', type: 'Withdrawal', from: 'Mike R.', to: 'Bank Account', amount: 7500, status: 'Pending' },
  { id: 'txn4', date: '2025-07-31', type: 'Platform Fee', from: 'Innovate Inc.', to: 'Platform', amount: 250, status: 'Completed' },
  { id: 'txn5', date: '2025-07-30', type: 'Refund', from: 'Platform', to: 'Startup X', amount: 1500, status: 'Failed' },
];

const Payments: React.FC<PaymentsProps> = ({ theme = 'light' }) => {
  return (
    <div className={`Payments Payments--${theme}`}>
      <header className="Payments-header">
        <h1>Payments & Transactions</h1>
        <div className="Payments-actions">
          <Input theme={theme} type="search" placeholder="Search by user or transaction ID..." />
        </div>
      </header>

      <div className={`Payments-table-container Payments-table-container--${theme}`}>
        <table className="Payments-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockPayments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>{payment.date}</td>
                <td>{payment.type}</td>
                <td>{payment.from}</td>
                <td>{payment.to}</td>
                <td>${payment.amount.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-badge--${payment.status}`}>{payment.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
