// @AI-HINT: This is the Freelancer Dashboard root component. It serves as the main hub for freelancers, now fully refactored with theme-aware CSS modules for a premium, responsive experience.
'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import DashboardWidget from '@/app/components/DashboardWidget/DashboardWidget';
import ProjectCard from '@/app/components/ProjectCard/ProjectCard';
import TransactionRow from '@/app/components/TransactionRow/TransactionRow';
import { useFreelancerData } from '@/hooks/useFreelancer';

import commonStyles from './Dashboard.common.module.css';
import lightStyles from './Dashboard.light.module.css';
import darkStyles from './Dashboard.dark.module.css';
import FreelancerRankVisualizer from '@/app/components/AI/FreelancerRankVisualizer/FreelancerRankVisualizer';

const rankToScore: { [key: string]: number } = {
  'Bronze': 250,
  'Silver': 450,
  'Gold': 650,
  'Platinum': 850,
  'Diamond': 950,
  'N/A': 0,
};

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const { analytics, jobs, transactions, loading, error } = useFreelancerData();

  const styles = useMemo(() => {
    const themeStyles = theme === 'light' ? lightStyles : darkStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const recentJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    return jobs.slice(0, 2).map((job, idx) => ({
      id: String(job.id ?? idx),
      title: job.title ?? 'Untitled Job',
      clientName: job.clientName ?? 'Unknown Client',
      budget: job.budget ?? '$0',
      postedTime: job.postedTime ?? 'Unknown',
      tags: Array.isArray(job.skills) ? job.skills : [],
    }));
  }, [jobs]);

  const recentTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.slice(0, 2).map((txn, idx) => ({
      id: String(txn.id ?? idx),
      amount: txn.amount ?? '0',
      date: txn.date ?? '',
      description: txn.description ?? 'Unknown transaction',
    }));
  }, [transactions]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome back, Freelancer!</h1>
        <p className={styles.subtitle}>Here&apos;s what&apos;s happening with your projects today.</p>
      </header>

      {loading && <div className={styles.loading} aria-busy="true">Loading dashboard...</div>}
      {error && <div className={styles.error}>Failed to load dashboard data.</div>}

      <div className={styles.widgetsGrid} role="region" aria-label="Key metrics" title="Key metrics">
        <DashboardWidget title="Active Projects" value={String(analytics?.activeProjects ?? 0)} />
        <DashboardWidget title="Pending Proposals" value={String(analytics?.pendingProposals ?? 0)} />
        <DashboardWidget title="Wallet Balance" value={analytics?.walletBalance ?? '$0.00'} />
        <FreelancerRankVisualizer rank={analytics?.rank as any ?? 'N/A'} score={rankToScore[analytics?.rank ?? 'N/A']} />
      </div>

      <div className={styles.mainContent}>
        <span className={styles.srOnly} aria-live="polite">
          {`Active projects ${String(analytics?.activeProjects ?? 0)}. Pending proposals ${String(analytics?.pendingProposals ?? 0)}. `}
          {`Wallet balance ${String(analytics?.walletBalance ?? '$0.00')}. Rank ${String(analytics?.rank ?? 'N/A')}.`}
        </span>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Job Postings</h2>
          <div className={styles.projectList} role="region" aria-label="Recent job postings" title="Recent job postings">
            {recentJobs.map(job => (
              <ProjectCard
                key={job.id}
                title={job.title}
                clientName={job.clientName}
                budget={job.budget}
                postedTime={job.postedTime}
                tags={job.tags}
              />
            ))}
            {recentJobs.length === 0 && !loading && (
              <div className={styles.emptyState}>No recent job postings found.</div>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Transactions</h2>
          <div className={styles.transactionList} role="region" aria-label="Recent transactions" title="Recent transactions">
            {recentTransactions.map(txn => (
              <TransactionRow
                key={txn.id}
                amount={txn.amount}
                date={txn.date}
                description={txn.description}
              />
            ))}
            {recentTransactions.length === 0 && !loading && (
              <div className={styles.emptyState}>No recent transactions found.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
