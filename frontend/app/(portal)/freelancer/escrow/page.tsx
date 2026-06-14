// @AI-HINT: Freelancer escrow view page - view escrowed funds for active contracts
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Badge from '@/app/components/atoms/Badge/Badge';
import Loading from '@/app/components/atoms/Loading/Loading';
import { escrowApi } from '@/lib/api';
import { PageTransition, ScrollReveal } from '@/app/components/Animations';
import { CreditCard, Clock, CheckCircle, FileText, DollarSign, Wallet } from 'lucide-react';
import ErrorBanner from '@/app/components/molecules/ErrorBanner/ErrorBanner';
import commonStyles from './Escrow.common.module.css';
import lightStyles from './Escrow.light.module.css';
import darkStyles from './Escrow.dark.module.css';

interface EscrowTransaction {
  id: string;
  contract_id: string;
  project_title: string;
  client_name: string;
  amount: number;
  status: 'pending' | 'funded' | 'released' | 'disputed' | 'refunded';
  milestone?: string;
  created_at: string;
  release_date?: string;
}

export default function FreelancerEscrowPage() {
  const { resolvedTheme } = useTheme();
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const stats = useMemo(() => {
    const totalInEscrow = transactions
      .filter(t => t.status === 'funded')
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingRelease = transactions
      .filter(t => t.status === 'funded')
      .reduce((sum, t) => sum + t.amount, 0);
    const releasedTotal = transactions
      .filter(t => t.status === 'released')
      .reduce((sum, t) => sum + t.amount, 0);
    const activeContracts = new Set(transactions.filter(t => t.status === 'funded').map(t => t.contract_id)).size;
    return { total_in_escrow: totalInEscrow, pending_release: pendingRelease, released_total: releasedTotal, active_contracts: activeContracts };
  }, [transactions]);

  useEffect(() => {
    loadEscrowData();
  }, []);

  const loadEscrowData = async () => {
    try {
      setLoading(true);
      setError(null);
      const txResponse = await escrowApi.list() as { data?: EscrowTransaction[] };
      if (txResponse.data) {
        setTransactions(txResponse.data);
      } else if (Array.isArray(txResponse)) {
        setTransactions(txResponse as unknown as EscrowTransaction[]);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load escrow data:', err);
      }
      setError('Unable to load escrow data. Please try again later.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: EscrowTransaction['status']): 'warning' | 'success' | 'primary' | 'danger' | 'secondary' => {
    const map: Record<string, 'warning' | 'success' | 'primary' | 'danger' | 'secondary'> = {
      pending: 'warning',
      funded: 'success',
      released: 'primary',
      disputed: 'danger',
      refunded: 'secondary',
    };
    return map[status] || 'secondary';
  };

  const filteredTransactions = transactions.filter(tx =>
    filter === 'all' || tx.status === filter
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;

  return (
    <PageTransition>
      <div className={cn(commonStyles.container, themeStyles.container)}>
        <ScrollReveal>
          <div className={commonStyles.header}>
            <h1 className={cn(commonStyles.title, themeStyles.title)}>Escrow Overview</h1>
            <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
              View escrowed funds and payment status for your active contracts
            </p>
          </div>
        </ScrollReveal>

        {error && (
          <ErrorBanner
            title="Failed to load escrow data"
            message={error}
            onRetry={loadEscrowData}
            showGoHome={false}
          />
        )}

        {/* Stats Cards */}
        <ScrollReveal>
          <div className={commonStyles.statsGrid}>
            <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
              <div className={cn(commonStyles.statIcon, commonStyles.iconSuccess)}>
                <Wallet size={22} />
              </div>
              <div className={commonStyles.statInfo}>
                <span className={cn(commonStyles.statValue, themeStyles.statValue)}>
                  ${stats.total_in_escrow.toLocaleString()}
                </span>
                <span className={cn(commonStyles.statLabel, themeStyles.statLabel)}>Secured for You</span>
              </div>
            </div>

            <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
              <div className={cn(commonStyles.statIcon, commonStyles.iconWarning)}>
                <Clock size={22} />
              </div>
              <div className={commonStyles.statInfo}>
                <span className={cn(commonStyles.statValue, themeStyles.statValue)}>
                  ${stats.pending_release.toLocaleString()}
                </span>
                <span className={cn(commonStyles.statLabel, themeStyles.statLabel)}>Pending Release</span>
              </div>
            </div>

            <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
              <div className={cn(commonStyles.statIcon, commonStyles.iconPrimary)}>
                <CheckCircle size={22} />
              </div>
              <div className={commonStyles.statInfo}>
                <span className={cn(commonStyles.statValue, themeStyles.statValue)}>
                  ${stats.released_total.toLocaleString()}
                </span>
                <span className={cn(commonStyles.statLabel, themeStyles.statLabel)}>Total Released</span>
              </div>
            </div>

            <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
              <div className={cn(commonStyles.statIcon, commonStyles.iconSecondary)}>
                <FileText size={22} />
              </div>
              <div className={commonStyles.statInfo}>
                <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{stats.active_contracts}</span>
                <span className={cn(commonStyles.statLabel, themeStyles.statLabel)}>Active Contracts</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal>
          <div className={commonStyles.filters}>
            {['all', 'funded', 'released', 'disputed'].map(f => (
              <button
                key={f}
                className={cn(
                  commonStyles.filterBtn,
                  themeStyles.filterBtn,
                  filter === f && commonStyles.filterBtnActive,
                  filter === f && themeStyles.filterBtnActive
                )}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span className={commonStyles.filterCount}>
                    {transactions.filter(t => t.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Transactions Table */}
        {loading ? (
          <Loading text="Loading escrow data..." />
        ) : filteredTransactions.length === 0 ? (
          <div className={cn(commonStyles.emptyState, themeStyles.emptyState)}>
            <DollarSign size={48} strokeWidth={1.5} className={commonStyles.fadedIcon} />
            <h3>No Escrow Transactions</h3>
            <p>{filter !== 'all' ? `No ${filter} transactions found.` : 'Escrow transactions will appear here when clients fund contracts.'}</p>
          </div>
        ) : (
          <ScrollReveal>
            <div className={cn(commonStyles.tableWrapper, themeStyles.tableWrapper)}>
              <table className={commonStyles.table}>
                <thead>
                  <tr>
                    <th className={themeStyles.th}>Project</th>
                    <th className={themeStyles.th}>Client</th>
                    <th className={themeStyles.th}>Amount</th>
                    <th className={themeStyles.th}>Milestone</th>
                    <th className={themeStyles.th}>Status</th>
                    <th className={themeStyles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className={themeStyles.tr}>
                      <td className={cn(commonStyles.projectCell, themeStyles.td)}>
                        {tx.project_title}
                      </td>
                      <td className={themeStyles.td}>{tx.client_name}</td>
                      <td className={cn(commonStyles.amountCell, themeStyles.td)}>
                        ${tx.amount.toLocaleString()}
                      </td>
                      <td className={cn(commonStyles.milestoneCell, themeStyles.td)}>
                        {tx.milestone || '-'}
                      </td>
                      <td className={themeStyles.td}>
                        <Badge variant={getStatusVariant(tx.status)}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </Badge>
                      </td>
                      <td className={themeStyles.td}>{formatDate(tx.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        )}
      </div>
    </PageTransition>
  );
}
