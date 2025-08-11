// @AI-HINT: This component displays a fully theme-aware, interactive audit log. It features advanced filtering, sorting, pagination, and a modern data grid presentation, all built with per-component CSS modules for maintainability.
'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Card from '@/app/components/Card/Card';
import Badge from '@/app/components/Badge/Badge';
import Select from '@/app/components/Select/Select';
import Input from '@/app/components/Input/Input';
import Button from '@/app/components/Button/Button';
import { ChevronDown, ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react';

import commonStyles from './AuditLog.common.module.css';
import lightStyles from './AuditLog.light.module.css';
import darkStyles from './AuditLog.dark.module.css';

interface LogEntry {
  id: string;
  timestamp: string;
  actor: { name: string; role: 'Admin' | 'Moderator' | 'System' | 'Support' };
  action: 'Update' | 'Create' | 'Delete' | 'Suspend' | 'Resolve' | 'Approve';
  target: { type: 'User' | 'Job' | 'Setting' | 'Flag' | 'Payment'; id: string };
  details: string;
  ipAddress: string;
}

// Expanded mock data for a more realistic and feature-rich audit log
const mockLogs: LogEntry[] = [
  { id: 'log_001', timestamp: '2025-08-08 14:30:15', actor: { name: 'j.doe@megilance.com', role: 'Admin' }, action: 'Suspend', target: { type: 'User', id: 'charlie@example.com' }, details: 'Violation of ToS section 4.2.', ipAddress: '192.168.1.101' },
  { id: 'log_002', timestamp: '2025-08-08 12:15:00', actor: { name: 's.smith@megilance.com', role: 'Moderator' }, action: 'Approve', target: { type: 'Job', id: 'job_002' }, details: 'Job approved after manual review.', ipAddress: '203.0.113.45' },
  { id: 'log_003', timestamp: '2025-08-07 18:00:45', actor: { name: 'j.doe@megilance.com', role: 'Admin' }, action: 'Update', target: { type: 'Setting', id: 'Fraud Detection' }, details: 'Threshold lowered to 0.85.', ipAddress: '192.168.1.101' },
  { id: 'log_004', timestamp: '2025-08-07 10:05:20', actor: { name: 'r.jones@megilance.com', role: 'Support' }, action: 'Resolve', target: { type: 'Flag', id: 'txn_a1b2c3d4' }, details: 'Flag dismissed as false positive.', ipAddress: '198.51.100.2' },
  { id: 'log_005', timestamp: '2025-08-06 22:10:00', actor: { name: 'system', role: 'System' }, action: 'Delete', target: { type: 'User', id: 'temp_user_123' }, details: 'Expired temporary user account removed.', ipAddress: '127.0.0.1' },
  { id: 'log_006', timestamp: '2025-08-06 15:45:30', actor: { name: 's.smith@megilance.com', role: 'Moderator' }, action: 'Update', target: { type: 'Job', id: 'job_005' }, details: 'Edited job description for clarity.', ipAddress: '203.0.113.45' },
  { id: 'log_007', timestamp: '2025-08-05 09:00:10', actor: { name: 'j.doe@megilance.com', role: 'Admin' }, action: 'Create', target: { type: 'User', id: 'new.admin@megilance.com' }, details: 'New admin account created.', ipAddress: '192.168.1.101' },
  { id: 'log_008', timestamp: '2025-08-04 11:20:55', actor: { name: 'system', role: 'System' }, action: 'Update', target: { type: 'Payment', id: 'payout_987' }, details: 'Payout processed successfully.', ipAddress: '127.0.0.1' },
];

const ITEMS_PER_PAGE = 5;

const AuditLog: React.FC = () => {
  const { theme } = useTheme();
  const [filters, setFilters] = useState({ search: '', actor: '', action: '' });
  const [sort, setSort] = useState<{ key: keyof LogEntry; direction: 'asc' | 'desc' }>({ key: 'timestamp', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const handleSort = (key: keyof LogEntry) => {
    setSort(prevSort => ({
      key,
      direction: prevSort.key === key && prevSort.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredLogs = useMemo(() => {
    return mockLogs
      .filter(log => 
        (log.actor.name.toLowerCase().includes(filters.search.toLowerCase()) || 
         log.target.id.toLowerCase().includes(filters.search.toLowerCase()) ||
         log.details.toLowerCase().includes(filters.search.toLowerCase())) &&
        (filters.actor ? log.actor.role === filters.actor : true) &&
        (filters.action ? log.action === filters.action : true)
      )
      .sort((a, b) => {
        const aVal = a[sort.key];
        const bVal = b[sort.key];
        if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [filters, sort]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'Create':
      case 'Approve':
        return 'success';
      case 'Update':
        return 'info';
      case 'Delete':
      case 'Suspend':
        return 'danger';
      default:
        return 'default';
    }
  };

  const SortableHeader: React.FC<{ tkey: keyof LogEntry; label: string }> = ({ tkey, label }) => (
    <th onClick={() => handleSort(tkey)}>
      <div className={commonStyles.headerCell}>
        {label}
        {sort.key === tkey ? (
          sort.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
        ) : (
          <ChevronsUpDown size={14} />
        )}
      </div>
    </th>
  );

  return (
    <Card className={cn(commonStyles.auditLogCard, themeStyles.auditLogCard)}>
      <header className={commonStyles.cardHeader}>
        <h2 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>System Audit Log</h2>
        <p className={cn(commonStyles.cardDescription, themeStyles.cardDescription)}>
          An immutable log of all system and user actions.
        </p>
      </header>

      <div className={commonStyles.filterToolbar}>
        <Input
          name="search"
          placeholder="Search logs..."
          value={filters.search}
          onChange={handleFilterChange}
          className={commonStyles.searchInput}
        />
        <Select
          id="actor-filter"
          name="actor"
          value={filters.actor}
          onChange={handleFilterChange}
          options={[
            { value: '', label: 'All Roles' },
            { value: 'Admin', label: 'Admin' },
            { value: 'Moderator', label: 'Moderator' },
            { value: 'Support', label: 'Support' },
            { value: 'System', label: 'System' },
          ]}
        />
        <Select
          id="action-filter"
          name="action"
          value={filters.action}
          onChange={handleFilterChange}
          options={[
            { value: '', label: 'All Actions' },
            { value: 'Create', label: 'Create' },
            { value: 'Update', label: 'Update' },
            { value: 'Delete', label: 'Delete' },
            { value: 'Approve', label: 'Approve' },
            { value: 'Resolve', label: 'Resolve' },
            { value: 'Suspend', label: 'Suspend' },
          ]}
        />
      </div>

      <div className={commonStyles.tableWrapper}>
        <table className={cn(commonStyles.auditLogTable, themeStyles.auditLogTable)}>
          <thead>
            <tr>
              <SortableHeader tkey="timestamp" label="Timestamp" />
              <SortableHeader tkey="actor" label="Actor" />
              <SortableHeader tkey="action" label="Action" />
              <th>Target</th>
              <th>Details</th>
              <SortableHeader tkey="ipAddress" label="IP Address" />
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map(log => (
              <tr key={log.id}>
                <td className={commonStyles.timestampCell}>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.actor.name} <Badge variant="secondary">{log.actor.role}</Badge></td>
                <td><Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge></td>
                <td>{log.target.type}: {log.target.id}</td>
                <td className={commonStyles.detailsCell}>{log.details}</td>
                <td>{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className={commonStyles.paginationFooter}>
        <span className={cn(commonStyles.paginationInfo, themeStyles.paginationInfo)}>
          Page {currentPage} of {totalPages}
        </span>
        <div className={commonStyles.paginationControls}>
          <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
            Previous
          </Button>
          <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      </footer>
    </Card>
  );
};

export default AuditLog;
