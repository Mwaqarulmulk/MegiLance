// @AI-HINT: This component displays a fully theme-aware list of items flagged for fraud. It uses per-component CSS modules and the cn utility for robust, maintainable styling, allowing admins to review and take action.
'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Button from '@/app/components/Button/Button';
import Badge from '@/app/components/Badge/Badge';
import Card from '@/app/components/Card/Card';
import Input from '@/app/components/Input/Input';
import Select from '@/app/components/Select/Select';
import { User, CreditCard, ShieldCheck, ShieldOff, Search, ListFilter } from 'lucide-react';

import baseStyles from './FlaggedFraudList.base.module.css';
import lightStyles from './FlaggedFraudList.light.module.css';
import darkStyles from './FlaggedFraudList.dark.module.css';

interface FlaggedItem {
  id: string;
  type: 'User' | 'Transaction';
  identifier: string;
  reason: string;
  dateFlagged: string;
  status: 'Pending Review' | 'Resolved' | 'Dismissed';
  riskScore: number;
}

const mockFlaggedItems: FlaggedItem[] = [
  { id: 'fraud_001', type: 'User', identifier: 'suspicious_user@example.com', reason: 'Multiple failed login attempts from different IPs.', dateFlagged: '2025-08-08', status: 'Pending Review', riskScore: 92 },
  { id: 'fraud_002', type: 'Transaction', identifier: 'txn_a1b2c3d4', reason: 'Unusually large payment amount from a new account.', dateFlagged: '2025-08-07', status: 'Pending Review', riskScore: 78 },
  { id: 'fraud_003', type: 'User', identifier: 'another_user@example.com', reason: 'AI detected unusual messaging patterns.', dateFlagged: '2025-08-06', status: 'Resolved', riskScore: 65 },
  { id: 'fraud_004', type: 'User', identifier: 'scammer@example.com', reason: 'Reported by another user for phishing.', dateFlagged: '2025-08-05', status: 'Pending Review', riskScore: 88 },
  { id: 'fraud_005', type: 'Transaction', identifier: 'txn_e5f6g7h8', reason: 'Chargeback initiated by customer.', dateFlagged: '2025-08-04', status: 'Dismissed', riskScore: 40 },
];

const FlaggedFraudList: React.FC = () => {
  const { theme } = useTheme();
  const [items, setItems] = useState(mockFlaggedItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending Review');
  const [typeFilter, setTypeFilter] = useState('All');

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const handleAction = (id: string, newStatus: 'Resolved' | 'Dismissed') => {
    setItems(items.map(item => (item.id === id ? { ...item, status: newStatus } : item)));
  };

  const filteredItems = items
    .filter(item => statusFilter === 'All' || item.status === statusFilter)
    .filter(item => typeFilter === 'All' || item.type === typeFilter)
    .filter(item => item.identifier.toLowerCase().includes(searchTerm.toLowerCase()));

  const getRiskBadgeVariant = (score: number) => {
    if (score > 85) return 'danger';
    if (score > 60) return 'warning';
    return 'success';
  };

  return (
    <div className={cn(baseStyles.container, themeStyles.container)}>
      <header className={baseStyles.header}>
        <h2 className={cn(baseStyles.title, themeStyles.title)}>Flagged Fraud & Risk List</h2>
        <p className={cn(baseStyles.description, themeStyles.description)}>
          Showing {filteredItems.length} of {items.length} flagged items.
        </p>
      </header>

      <div className={cn(baseStyles.filterToolbar, themeStyles.filterToolbar)}>
        <Input
          id="search-filter"
          placeholder="Search by identifier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          iconBefore={<Search size={16} />}
        />
        <div className={baseStyles.selectFilters}>
          <Select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Pending Review', label: 'Pending Review' },
              { value: 'Resolved', label: 'Resolved' },
              { value: 'Dismissed', label: 'Dismissed' },
            ]}
          />
          <Select
            id="type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Types' },
              { value: 'User', label: 'Users' },
              { value: 'Transaction', label: 'Transactions' },
            ]}
          />
        </div>
      </div>

      <div className={baseStyles.itemList}>
        {filteredItems.map(item => (
          <Card key={item.id} className={cn(baseStyles.itemCard, themeStyles.itemCard)}>
            <div className={baseStyles.cardHeader}>
              <div className={baseStyles.identifier}>
                {item.type === 'User' ? <User size={18} /> : <CreditCard size={18} />}
                <span>{item.identifier}</span>
              </div>
              <Badge variant={getRiskBadgeVariant(item.riskScore)}>Risk: {item.riskScore}</Badge>
            </div>
            <p className={baseStyles.reason}>{item.reason}</p>
            <footer className={baseStyles.cardFooter}>
              <span className={baseStyles.date}>Flagged: {item.dateFlagged}</span>
              {item.status === 'Pending Review' ? (
                <div className={baseStyles.actions}>
                  <Button variant="success" size="small" onClick={() => handleAction(item.id, 'Resolved')}>
                    <ShieldCheck size={14} /> Resolve
                  </Button>
                  <Button variant="secondary" size="small" onClick={() => handleAction(item.id, 'Dismissed')}>
                    <ShieldOff size={14} /> Dismiss
                  </Button>
                </div>
              ) : (
                <Badge variant={item.status === 'Resolved' ? 'success' : 'secondary'}>{item.status}</Badge>
              )}
            </footer>
          </Card>
        ))}
        {filteredItems.length === 0 && (
          <div className={cn(baseStyles.emptyState, themeStyles.emptyState)}>
            <ListFilter size={48} />
            <h3>No Matching Items</h3>
            <p>Adjust your filters or clear the search to see more items.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlaggedFraudList;
