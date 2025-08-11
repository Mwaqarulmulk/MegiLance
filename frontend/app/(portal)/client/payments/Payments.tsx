// @AI-HINT: Client Payments history. Theme-aware, accessible filters, KPI summary, and animated payments table.
'use client';

// @AI-HINT: This is the modernized client payments page, using PaymentCard, DashboardWidget, and custom controls for a premium, data-rich experience.
'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useClientData } from '@/hooks/useClient';
import { DollarSign, Search, Download, TrendingUp, TrendingDown, AlertTriangle, SearchX } from 'lucide-react';

import PaymentCard, { PaymentCardProps } from '@/app/components/PaymentCard/PaymentCard';
import DashboardWidget from '@/app/components/DashboardWidget/DashboardWidget';
import Input from '@/app/components/Input/Input';
import Select from '@/app/components/Select/Select';
import Button from '@/app/components/Button/Button';
import Pagination from '@/app/components/Pagination/Pagination';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import Trend from '@/app/components/Trend/Trend';

import common from './Payments.common.module.css';
import light from './Payments.light.module.css';
import dark from './Payments.dark.module.css';

// Mock data transformation
const transformPaymentData = (payments: any[]): PaymentCardProps[] => {
  if (!Array.isArray(payments)) return [];
  return payments.map(p => ({
    id: p.id,
    date: p.date || new Date().toISOString(),
    project: p.project || 'Untitled Project',
    projectId: p.projectId || `proj_${p.id}`,
    freelancerName: p.freelancer || 'Unknown Freelancer',
    freelancerAvatarUrl: p.freelancerAvatarUrl, // Assuming this might exist
    amount: Number(p.amount?.replace(/[$,]/g, '')) || 0,
    status: p.status || 'Pending',
  }));
};

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Failed', label: 'Failed' },
];

const SORT_OPTIONS = [
  { value: 'date', label: 'Most Recent' },
  { value: 'amount_desc', label: 'Amount (High to Low)' },
  { value: 'amount_asc', label: 'Amount (Low to High)' },
  { value: 'project', label: 'Project Name' },
];

const Payments: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const { payments: rawPayments, loading, error } = useClientData();
  const payments = useMemo(() => transformPaymentData(rawPayments || []), [rawPayments]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const filteredPayments = useMemo(() => {
    return payments
      .filter(p => statusFilter === 'All' || p.status === statusFilter)
      .filter(p => 
        p.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.freelancerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [payments, statusFilter, searchQuery]);

  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      switch (sortKey) {
        case 'amount_desc': return b.amount - a.amount;
        case 'amount_asc': return a.amount - b.amount;
        case 'project': return a.project.localeCompare(b.project);
        case 'date':
        default: return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }, [filteredPayments, sortKey]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedPayments.slice(start, start + itemsPerPage);
  }, [sortedPayments, currentPage, itemsPerPage]);
  
  const kpis = useMemo(() => {
      const totalPaid = payments
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + p.amount, 0);
      const totalPending = payments
        .filter(p => p.status === 'Pending')
        .reduce((sum, p) => sum + p.amount, 0);
      return { totalPaid, totalPending };
  }, [payments]);

  if (error) {
    return <EmptyState title="Error Loading Payments" description="There was an issue retrieving your payment history. Please try again later." icon={<AlertTriangle size={48} />} />;
  }

  return (
    <div className={cn(common.page, themed.theme)}>
      <header className={common.header}>
        <div>
          <h1 className={common.title}>Payments</h1>
          <p className={common.subtitle}>Review your transaction history and manage payments.</p>
        </div>
        <div className={common.actions}>
          <Button variant="secondary" iconBefore={<Download size={16} />}>Export CSV</Button>
        </div>
      </header>

      <section className={common.kpiGrid}>
        <DashboardWidget icon={DollarSign} title="Total Paid" value={`$${kpis.totalPaid.toLocaleString()}`} trend={<Trend direction="up" value="+5.2%" />} />
        <DashboardWidget icon={TrendingUp} title="Avg. Payment" value={`$${(kpis.totalPaid / (payments.length || 1)).toFixed(2)}`} />
        <DashboardWidget icon={TrendingDown} title="Pending" value={`$${kpis.totalPending.toLocaleString()}`} trend={<Trend direction="down" value="-1.8%" />} />
      </section>

      <div className={common.controls}>
        <Input
          id="payment-search"
          iconBefore={<Search size={18} />}
          placeholder="Search by project or freelancer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={common.searchInput}
        />
        <div className={common.filters}>
          <Select id="status-filter" options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
          <Select id="sort-key" options={SORT_OPTIONS} value={sortKey} onChange={(e) => setSortKey(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className={common.grid}>
          {Array.from({ length: itemsPerPage }).map((_, i) => <div key={i} className={common.skeletonCard} />)}
        </div>
      ) : paginatedPayments.length > 0 ? (
        <main className={common.grid}>
          {paginatedPayments.map(payment => <PaymentCard key={payment.id} {...payment} />)}
        </main>
      ) : (
        <EmptyState
          title="No Payments Found"
          description="It looks like there are no payments matching your criteria. Try adjusting your filters."
          icon={<SearchX size={48} />}
        />
      )}

      {paginatedPayments.length > 0 && (
        <footer className={common.footer}>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(sortedPayments.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </footer>
      )}
    </div>
  );
};

export default Payments;
