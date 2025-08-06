// @AI-HINT: This component provides an interface for admins to review and process freelancer withdrawal requests.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import Badge from '@/app/components/Badge/Badge';
import commonStyles from './Withdrawals.common.module.css';
import lightStyles from './Withdrawals.light.module.css';
import darkStyles from './Withdrawals.dark.module.css';

interface WithdrawalRequest {
  id: string;
  freelancerName: string;
  amount: number;
  currency: string;
  destinationAddress: string;
  dateRequested: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const mockWithdrawals: WithdrawalRequest[] = [
  { id: 'wd_001', freelancerName: 'Alice Johnson', amount: 500, currency: 'USDC', destinationAddress: '0x...a1b2', dateRequested: '2025-08-08', status: 'Pending' },
  { id: 'wd_002', freelancerName: 'Charlie Brown', amount: 1200, currency: 'ETH', destinationAddress: '0x...c3d4', dateRequested: '2025-08-07', status: 'Pending' },
  { id: 'wd_003', freelancerName: 'Frank Wright', amount: 350, currency: 'USDC', destinationAddress: '0x...e5f6', dateRequested: '2025-08-06', status: 'Approved' },
];

const Withdrawals: React.FC = () => {
  const { theme } = useTheme();
  const [requests, setRequests] = useState(mockWithdrawals);

  const handleProcess = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setRequests(requests.map(req => (req.id === id ? { ...req, status: newStatus } : req)));
  };

  const pendingRequests = requests.filter(req => req.status === 'Pending');

  const styles = {
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  };

  return (
    <div className={styles.withdrawalsContainer}>
      <h2 className={styles.withdrawalsTitle}>Withdrawal Requests</h2>
      <div className={styles.withdrawalsTableWrapper}>
        <table className={styles.withdrawalsTable}>
          <thead>
            <tr>
              <th>Freelancer</th>
              <th>Amount</th>
              <th>Destination</th>
              <th>Date Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map(req => (
              <tr key={req.id}>
                <td>{req.freelancerName}</td>
                <td>{req.amount} <Badge variant="info">{req.currency}</Badge></td>
                <td className={styles.withdrawalsAddress}>{req.destinationAddress}</td>
                <td>{req.dateRequested}</td>
                <td className={styles.withdrawalsActions}>
                  <Button variant="success" size="small" onClick={() => handleProcess(req.id, 'Approved')}>Approve</Button>
                  <Button variant="danger" size="small" onClick={() => handleProcess(req.id, 'Rejected')}>Reject</Button>
                </td>
              </tr>
            ))}
            {pendingRequests.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.withdrawalsEmpty}>No pending withdrawal requests.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Withdrawals;
