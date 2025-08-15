// @AI-HINT: This component provides a modernized interface for admins to review and process freelancer withdrawal requests using a card-based UI with advanced filtering.
'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, MoreVertical, Copy, ArrowDownUp, Calendar, Inbox, Search, ChevronDown } from 'lucide-react';

import Button from '@/app/components/Button/Button';
import Badge from '@/app/components/Badge/Badge';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import ActionMenu, { type ActionMenuItem } from '@/app/components/ActionMenu/ActionMenu';
import baseStyles from './Withdrawals.base.module.css';
import lightStyles from './Withdrawals.light.module.css';
import darkStyles from './Withdrawals.dark.module.css';

// Types
type Status = 'Pending' | 'Approved' | 'Rejected';
type SortBy = 'date' | 'amount';

interface WithdrawalRequest {
  id: string;
  freelancerName: string;
  freelancerAvatarUrl?: string;
  amount: number;
  currency: string;
  destinationAddress: string;
  dateRequested: string;
  status: Status;
}

// Mock Data
const mockWithdrawals: WithdrawalRequest[] = [
  { id: 'wd_001', freelancerName: 'Alice Johnson', freelancerAvatarUrl: 'https://i.pravatar.cc/100?u=alice', amount: 500, currency: 'USDC', destinationAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', dateRequested: '2025-08-15', status: 'Pending' },
  { id: 'wd_002', freelancerName: 'Charlie Brown', freelancerAvatarUrl: 'https://i.pravatar.cc/100?u=charlie', amount: 1250, currency: 'ETH', destinationAddress: '0x1e6f4f2b2c1b9b1e6f4f2b2c1b9b1e6f4f2b2c1b', dateRequested: '2025-08-14', status: 'Pending' },
  { id: 'wd_003', freelancerName: 'Diana Prince', freelancerAvatarUrl: 'https://i.pravatar.cc/100?u=diana', amount: 75, currency: 'USDC', destinationAddress: '0x9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b', dateRequested: '2025-08-12', status: 'Approved' },
  { id: 'wd_004', freelancerName: 'Frank Wright', freelancerAvatarUrl: 'https://i.pravatar.cc/100?u=frank', amount: 3500, currency: 'USDC', destinationAddress: '0x...', dateRequested: '2025-08-10', status: 'Rejected' },
  { id: 'wd_005', freelancerName: 'Eve Adams', freelancerAvatarUrl: 'https://i.pravatar.cc/100?u=eve', amount: 800, currency: 'ETH', destinationAddress: '0x...', dateRequested: '2025-08-16', status: 'Pending' },
];

const StatusBadge = ({ status }: { status: Status }) => {
  const variant = {
    Pending: 'warning',
    Approved: 'success',
    Rejected: 'danger',
  }[status] as 'warning' | 'success' | 'danger';

  return <Badge variant={variant}>{status}</Badge>;
};

const Withdrawals: React.FC = () => {
  const { theme } = useTheme();
  const [requests, setRequests] = useState(mockWithdrawals);
  const [filter, setFilter] = useState<Status | 'All'>('Pending');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const handleProcess = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setRequests(requests.map(req => (req.id === id ? { ...req, status: newStatus } : req)));
  };

  const filteredAndSortedRequests = useMemo(() => {
    return requests
      .filter(req => filter === 'All' || req.status === filter)
      .sort((a, b) => {
        if (sortBy === 'amount') return b.amount - a.amount;
        return new Date(b.dateRequested).getTime() - new Date(a.dateRequested).getTime();
      });
  }, [requests, filter, sortBy]);

  const getActionItems = (request: WithdrawalRequest): ActionMenuItem[] => [
    {
      label: 'Approve',
      onClick: () => handleProcess(request.id, 'Approved'),
      icon: CheckCircle,
      disabled: request.status !== 'Pending',
    },
    {
      label: 'Reject',
      onClick: () => handleProcess(request.id, 'Rejected'),
      icon: XCircle,
      disabled: request.status !== 'Pending',
    },
    { isSeparator: true },
    {
      label: 'Copy Address',
      onClick: () => navigator.clipboard.writeText(request.destinationAddress),
      icon: Copy,
    },
  ];

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(baseStyles.pageContainer, themeStyles.pageContainer)}>
      <div className={baseStyles.header}>
        <h1 className={baseStyles.headerTitle}>Withdrawal Requests</h1>
        <div className={baseStyles.headerActions}>
          <Button variant={sortBy === 'date' ? 'primary' : 'ghost'} size="sm" onClick={() => setSortBy('date')} iconBefore={<Calendar size={16} />}>Sort by Date</Button>
          <Button variant={sortBy === 'amount' ? 'primary' : 'ghost'} size="sm" onClick={() => setSortBy('amount')} iconBefore={<ArrowDownUp size={16} />}>Sort by Amount</Button>
        </div>
      </div>

      <div className={baseStyles.filterTabs}>
        {(['Pending', 'Approved', 'Rejected', 'All'] as const).map(status => (
          <button key={status} onClick={() => setFilter(status)} className={cn(baseStyles.filterTab, themeStyles.filterTab, { [baseStyles.activeTab]: filter === status, [themeStyles.activeTab]: filter === status })}>
            {status} <Badge variant="info">{status === 'All' ? requests.length : requests.filter(r => r.status === status).length}</Badge>
          </button>
        ))}
      </div>

      <div className={baseStyles.requestsGrid}>
        {filteredAndSortedRequests.length > 0 ? (
          filteredAndSortedRequests.map(req => (
            <div key={req.id} className={baseStyles.requestCard}>
              <div className={baseStyles.cardHeader}>
                <UserAvatar src={req.freelancerAvatarUrl} name={req.freelancerName} size={40} />
                <div className={baseStyles.cardHeaderText}>
                  <span className={baseStyles.freelancerName}>{req.freelancerName}</span>
                  <span className={baseStyles.requestDate}>{req.dateRequested}</span>
                </div>
                <ActionMenu
                  trigger={<Button variant="ghost" size="icon"><MoreVertical size={18} /></Button>}
                  items={getActionItems(req)}
                />
              </div>
              <div className={baseStyles.cardBody}>
                <div className={baseStyles.amount}>${req.amount.toLocaleString()} <Badge variant="info">{req.currency}</Badge></div>
                <div className={baseStyles.addressWrapper}>
                  <span className={baseStyles.addressLabel}>To:</span>
                  <code className={baseStyles.address}>{req.destinationAddress}</code>
                </div>
              </div>
              <div className={baseStyles.cardFooter}>
                <StatusBadge status={req.status} />
              </div>
            </div>
          ))
        ) : (
          <div className={baseStyles.emptyState}>
            <Inbox size={48} className={baseStyles.emptyStateIcon} />
            <h3 className={baseStyles.emptyStateTitle}>No {filter} Requests</h3>
            <p className={baseStyles.emptyStateText}>There are currently no withdrawal requests with this status.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdrawals;
