// @AI-HINT: This is the enhanced Freelancer Dashboard root component. It adds tabs, time-range filters, charts, quick actions, and subtle animations for a premium, investor-grade feel without introducing global CSS.
'use client';

import React, { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useFreelancerData } from '@/hooks/useFreelancer';

import KeyMetricsGrid from '@/app/(portal)/freelancer/dashboard/components/KeyMetricsGrid/KeyMetricsGrid';
import RecentActivityFeed from '@/app/(portal)/freelancer/dashboard/components/RecentActivityFeed/RecentActivityFeed';
import ProjectCard from '@/app/components/ProjectCard/ProjectCard';
import TransactionRow from '@/app/components/TransactionRow/TransactionRow';
import BarChart from '@/app/components/BarChart/BarChart';
import RankGauge from '@/app/components/RankGauge/RankGauge';
import Tooltip from '@/app/components/Tooltip/Tooltip';

import { motion } from 'framer-motion';

import commonStyles from './Dashboard.common.module.css';
import lightStyles from './Dashboard.light.module.css';
import darkStyles from './Dashboard.dark.module.css';

type TabKey = 'overview' | 'performance' | 'workload';
type RangeKey = '7d' | '30d' | '90d';

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const { analytics, jobs, transactions, loading, error } = useFreelancerData();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [range, setRange] = useState<RangeKey>('30d');

  // Keyboard navigation handlers for tabs and radio groups
  const tabOrder: TabKey[] = ['overview', 'performance', 'workload'];
  const onTabsKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = tabOrder[(currentIndex + 1) % tabOrder.length];
      setActiveTab(next);
      const btn = document.getElementById(`tab-${next}`) as HTMLButtonElement | null;
      btn?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = tabOrder[(currentIndex - 1 + tabOrder.length) % tabOrder.length];
      setActiveTab(prev);
      const btn = document.getElementById(`tab-${prev}`) as HTMLButtonElement | null;
      btn?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab(tabOrder[0]);
      (document.getElementById(`tab-${tabOrder[0]}`) as HTMLButtonElement | null)?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveTab(tabOrder[tabOrder.length - 1]);
      (document.getElementById(`tab-${tabOrder[tabOrder.length - 1]}`) as HTMLButtonElement | null)?.focus();
    }
  };

  const ranges: RangeKey[] = ['7d', '30d', '90d'];
  const onRangeKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = ranges.indexOf(range);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = ranges[(currentIndex + 1) % ranges.length];
      setRange(next);
      (document.getElementById(`range-${next}`) as HTMLButtonElement | null)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = ranges[(currentIndex - 1 + ranges.length) % ranges.length];
      setRange(prev);
      (document.getElementById(`range-${prev}`) as HTMLButtonElement | null)?.focus();
    }
  };

  const renderJobItem = (job: any) => (
    <ProjectCard
      key={job.id}
      id={job.id ?? 'unknown'}
      title={job.title ?? 'Untitled Job'}
      status={job.status ?? 'Pending'}
      progress={job.progress ?? 0}
      budget={typeof job.budget === 'number' ? job.budget : 0}
      paid={job.paid ?? 0}
      freelancers={job.freelancers ?? []}
      updatedAt={job.updatedAt ?? ''}
      clientName={job.clientName ?? 'Unknown Client'}
      postedTime={job.postedTime ?? 'Unknown'}
      tags={Array.isArray(job.skills) ? job.skills : []}
    />
  );

  const renderTransactionItem = (txn: any) => (
    <TransactionRow
      key={txn.id}
      amount={txn.amount ?? '0'}
      date={txn.date ?? ''}
      description={txn.description ?? 'Unknown transaction'}
    />
  );

  // Mocked chart data (safe defaults if analytics missing). Values are percentages.
  const performanceData = useMemo(
    () => [
      { label: 'Win Rate', value: Math.min(100, Math.max(0, analytics?.winRate ?? 62)), color: 'var(--accent)' },
      { label: 'On-time', value: Math.min(100, Math.max(0, analytics?.onTime ?? 88)), color: 'var(--success)' },
      { label: 'Quality', value: Math.min(100, Math.max(0, analytics?.quality ?? 91)), color: 'var(--brand-blue, #4573df)' },
      { label: 'Response', value: Math.min(100, Math.max(0, analytics?.response ?? 73)), color: 'var(--warning)' },
    ],
    [analytics]
  );

  const workloadData = useMemo(
    () => [
      { label: 'Active', value: Math.min(100, Math.max(0, analytics?.activeProjectsPct ?? 54)), color: 'var(--accent)' },
      { label: 'In Review', value: Math.min(100, Math.max(0, analytics?.inReviewPct ?? 18)), color: 'var(--warning)' },
      { label: 'Blocked', value: Math.min(100, Math.max(0, analytics?.blockedPct ?? 6)), color: 'var(--error, #e81123)' },
      { label: 'Completed', value: Math.min(100, Math.max(0, analytics?.completedPct ?? 22)), color: 'var(--success)' },
    ],
    [analytics]
  );

  const renderTabs = () => (
    <div className={cn(commonStyles.tabsRow, themeStyles.tabsRow)}>
      <div role="tablist" aria-label="Dashboard sections" className={cn(commonStyles.tabsGroup)} onKeyDown={onTabsKeyDown}>
        {([
          { key: 'overview', label: 'Overview' },
          { key: 'performance', label: 'Performance' },
          { key: 'workload', label: 'Workload' },
        ] as { key: TabKey; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            className={cn(commonStyles.tabBtn, themeStyles.tabBtn, activeTab === tab.key && commonStyles.tabActive)}
            onClick={() => setActiveTab(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key ? true : false}
            aria-controls={`panel-${tab.key}`}
            tabIndex={activeTab === tab.key ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={cn(commonStyles.rangePicker)} role="radiogroup" aria-label="Time range" onKeyDown={onRangeKeyDown}>
        {(ranges as RangeKey[]).map((r) => (
          <button
            key={r}
            id={`range-${r}`}
            className={cn(commonStyles.rangeBtn, range === r && commonStyles.rangeActive)}
            onClick={() => setRange(r)}
            role="radio"
            aria-checked={range === r ? true : false}
            tabIndex={range === r ? 0 : -1}
            type="button"
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className={cn(commonStyles.quickActions, themeStyles.quickActions)}>
      <Tooltip text="Create a new, high-converting proposal fast.">
        <button className={cn(commonStyles.primaryBtn)}>New Proposal</button>
      </Tooltip>
      <Tooltip text="Log progress and share updates with your client.">
        <button className={cn(commonStyles.secondaryBtn)}>Update Project</button>
      </Tooltip>
      <Tooltip text="Generate and send a professional invoice.">
        <button className={cn(commonStyles.secondaryBtn)}>Create Invoice</button>
      </Tooltip>
    </div>
  );

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <header className={cn(commonStyles.header, themeStyles.header)}>
        <div>
          <h1 className={cn(commonStyles.title, themeStyles.title)}>Welcome back!</h1>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>Here&apos;s what&apos;s happening with your work today.</p>
        </div>
        <QuickActions />
      </header>

      {error && <div className={commonStyles.error}>Failed to load dashboard data. Please try again later.</div>}

      <KeyMetricsGrid analytics={analytics} loading={loading} />

      {renderTabs()}

      <motion.div
        key={activeTab + range}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={cn(commonStyles.mainContent, themeStyles.mainContent)}
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'overview' && (
          <>
            <RecentActivityFeed
              title="Recent Job Postings"
              items={jobs?.slice(0, 3) ?? []}
              renderItem={renderJobItem}
              loading={loading}
              emptyStateMessage="No recent job postings found."
            />
            <RecentActivityFeed
              title="Recent Transactions"
              items={transactions?.slice(0, 5) ?? []}
              renderItem={renderTransactionItem}
              loading={loading}
              emptyStateMessage="No recent transactions found."
            />
          </>
        )}

        {activeTab === 'performance' && (
          <div className={cn(commonStyles.grid2)}>
            <section className={cn(commonStyles.card, themeStyles.card)}>
              <div className={commonStyles.cardHeader}>
                <h3>KPIs</h3>
                <span className={commonStyles.cardSub}>Last {range.toUpperCase()}</span>
              </div>
              <BarChart data={performanceData} />
            </section>
            <section className={cn(commonStyles.card, themeStyles.card)}>
              <div className={commonStyles.cardHeader}>
                <h3>Pro Rank</h3>
                <span className={commonStyles.cardSub}>Benchmark vs peers</span>
              </div>
              <RankGauge score={Math.min(100, Math.max(0, analytics?.rankScore ?? 84))} />
            </section>
          </div>
        )}

        {activeTab === 'workload' && (
          <div className={cn(commonStyles.grid2)}>
            <section className={cn(commonStyles.card, themeStyles.card)}>
              <div className={commonStyles.cardHeader}>
                <h3>Project Distribution</h3>
                <span className={commonStyles.cardSub}>Live snapshot</span>
              </div>
              <BarChart data={workloadData} />
            </section>
            <section className={cn(commonStyles.card, themeStyles.card)}>
              <div className={commonStyles.cardHeader}>
                <h3>Pipeline</h3>
                <span className={commonStyles.cardSub}>Next up</span>
              </div>
              <RecentActivityFeed
                title="In Progress"
                items={jobs?.slice(0, 3) ?? []}
                renderItem={renderJobItem}
                loading={loading}
                emptyStateMessage="No items in progress."
              />
            </section>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
