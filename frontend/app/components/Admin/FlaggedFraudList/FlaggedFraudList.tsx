// @AI-HINT: This component displays a list of users or transactions flagged for fraudulent activity, enabling admin review.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import Badge from '@/app/components/Badge/Badge';
import './FlaggedFraudList.common.css';
import './FlaggedFraudList.light.css';
import './FlaggedFraudList.dark.css';

interface FlaggedItem {
  id: string;
  type: 'User' | 'Transaction';
  identifier: string; // User email or Transaction ID
  reason: string;
  dateFlagged: string;
  status: 'Pending Review' | 'Resolved' | 'Dismissed';
}

const mockFlaggedItems: FlaggedItem[] = [
  { id: 'fraud_001', type: 'User', identifier: 'suspicious_user@example.com', reason: 'Multiple failed login attempts from different IPs.', dateFlagged: '2025-08-08', status: 'Pending Review' },
  { id: 'fraud_002', type: 'Transaction', identifier: 'txn_a1b2c3d4', reason: 'Unusually large payment amount.', dateFlagged: '2025-08-07', status: 'Pending Review' },
  { id: 'fraud_003', type: 'User', identifier: 'another_user@example.com', reason: 'AI detected unusual messaging patterns.', dateFlagged: '2025-08-06', status: 'Resolved' },
  { id: 'fraud_004', type: 'User', identifier: 'scammer@example.com', reason: 'Reported by another user for phishing.', dateFlagged: '2025-08-05', status: 'Pending Review' },
];

const FlaggedFraudList: React.FC = () => {
  const { theme } = useTheme();
  const [items, setItems] = useState(mockFlaggedItems);

  const handleAction = (id: string, newStatus: 'Resolved' | 'Dismissed') => {
    setItems(items.map(item => (item.id === id ? { ...item, status: newStatus } : item)));
  };

  const pendingItems = items.filter(item => item.status === 'Pending Review');

  return (
    <div className={`FlaggedFraudList-container FlaggedFraudList-container--${theme}`}>
      <h2 className="FlaggedFraudList-title">Flagged Fraud & Risk List</h2>
      <div className="FlaggedFraudList-table-wrapper">
        <table className={`FlaggedFraudList FlaggedFraudList--${theme}`}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Identifier</th>
              <th>Reason for Flag</th>
              <th>Date Flagged</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingItems.map(item => (
              <tr key={item.id}>
                <td><Badge theme={theme} variant={item.type === 'User' ? 'warning' : 'info'}>{item.type}</Badge></td>
                <td>{item.identifier}</td>
                <td>{item.reason}</td>
                <td>{item.dateFlagged}</td>
                <td className="FlaggedFraudList-actions">
                  <Button theme={theme} variant="success" size="small" onClick={() => handleAction(item.id, 'Resolved')}>Resolve</Button>
                  <Button theme={theme} variant="secondary" size="small" onClick={() => handleAction(item.id, 'Dismissed')}>Dismiss</Button>
                </td>
              </tr>
            ))}
            {pendingItems.length === 0 && (
              <tr>
                <td colSpan={5} className="FlaggedFraudList-empty">No items are currently pending review.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlaggedFraudList;
