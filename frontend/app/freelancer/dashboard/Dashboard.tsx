// @AI-HINT: This is the modernized Freelancer Dashboard root component. It orchestrates several child components to create a modular, maintainable, and premium user experience.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useFreelancerData } from '@/hooks/useFreelancer';
import { 
  Briefcase, 
  DollarSign, 
  Users, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Bell,
  Calendar,
  MessageCircle,
  Eye,
  Plus,
  Award,
  Star
} from 'lucide-react';

import KeyMetricsGrid from '@/app/freelancer/dashboard/components/KeyMetricsGrid/KeyMetricsGrid';
import RecentActivityFeed from '@/app/freelancer/dashboard/components/RecentActivityFeed/RecentActivityFeed';
import ProjectCard from '@/app/components/ProjectCard/ProjectCard';
import TransactionRow from '@/app/components/TransactionRow/TransactionRow';
import Button from '@/app/components/Button/Button';
import Card from '@/app/components/Card/Card';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

import commonStyles from './Dashboard.common.module.css';
import lightStyles from './Dashboard.light.module.css';
import darkStyles from './Dashboard.dark.module.css';

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const { analytics, jobs, transactions, loading, error } = useFreelancerData();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const renderJobItem = (job: any) => (
      <ProjectCard
        key={job.id}
        id={job.id ?? 'unknown'}
        title={job.title ?? 'Untitled Job'}
        status={job.status ?? 'Pending'}
        progress={job.progress ?? 0}
        budget={typeof job.budget === 'number' ? job.budget : 0}
        paid={job.paid ?? 0}
        freelancers={job.freancers ?? []}
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

  // Recent activity data
  const recentActivity = [
    { id: '1', title: 'New job posted', description: 'A new job matching your skills was posted', time: '30 minutes ago', icon: Briefcase },
    { id: '2', title: 'Payment received', description: 'Payment of $850 received for completed project', time: '2 hours ago', icon: DollarSign },
    { id: '3', title: 'Proposal accepted', description: 'Your proposal was accepted for Web Development project', time: '5 hours ago', icon: Award },
    { id: '4', title: 'New message', description: 'Client sent you a message about project updates', time: '1 day ago', icon: MessageCircle },
  ];

  // Stats data
  const statsData = [
    { title: 'Total Earnings', value: '$12,450', icon: DollarSign, trend: '+12%', positive: true },
    { title: 'Jobs Completed', value: '42', icon: Briefcase, trend: '+5%', positive: true },
    { title: 'Client Rating', value: '4.8/5', icon: Star, trend: '+0.2', positive: true },
    { title: 'Active Proposals', value: '8', icon: FileText, trend: '-2', positive: false },
  ];

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      {/* Welcome Banner */}
      <div className={commonStyles.welcomeBanner}>
        <div className={commonStyles.welcomeBannerContent}>
          <h1 className={commonStyles.welcomeBannerTitle}>Welcome back, Freelancer!</h1>
          <p className={commonStyles.welcomeBannerText}>Here&apos;s what&apos;s happening with your projects and earnings today.</p>
          <div className={commonStyles.quickActions}>
            <Button as="a" href="/jobs" variant="secondary" size="md" iconBefore={<Plus size={18} />}>
              Browse Jobs
            </Button>
            <Button as="a" href="/freelancer/proposals" variant="secondary" size="md" iconBefore={<FileText size={18} />}>
              Submit Proposal
            </Button>
          </div>
        </div>
      </div>

      <header className={cn(commonStyles.header, themeStyles.header)}>
        <h1 className={cn(commonStyles.title, themeStyles.title)}>Freelancer Dashboard</h1>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>Track your projects, earnings, and performance metrics.</p>
      </header>

      {error && (
        <div className={commonStyles.error}>
          <Bell size={20} />
          <span>Failed to load dashboard data. Please try again later.</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className={commonStyles.statsGrid}>
        {statsData.map((stat, index) => (
          <Card key={index} className={commonStyles.statCard}>
            <div className={commonStyles.statHeader}>
              <div className={commonStyles.statIcon}>
                <stat.icon size={20} />
              </div>
              <h3 className={commonStyles.statTitle}>{stat.title}</h3>
            </div>
            <div className={commonStyles.statValue}>{stat.value}</div>
            <div className={cn(commonStyles.statTrend, stat.positive ? commonStyles.positive : commonStyles.negative)}>
              {stat.positive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{stat.trend}</span>
            </div>
          </Card>
        ))}
      </div>

      <KeyMetricsGrid analytics={analytics} loading={loading} />

      <div className={cn(commonStyles.mainContent, themeStyles.mainContent)}>
        {/* Recent Activity */}
        <div className={commonStyles.gridSpanFull}>
          <Card title="Recent Activity" icon={Calendar}>
            <div className={commonStyles.activityList}>
              {recentActivity.map(activity => (
                <div key={activity.id} className={commonStyles.activityItem}>
                  <div className={commonStyles.activityIcon}>
                    <activity.icon size={20} />
                  </div>
                  <div className={commonStyles.activityContent}>
                    <h4 className={commonStyles.activityTitle}>{activity.title}</h4>
                    <p className={commonStyles.activityDescription}>{activity.description}</p>
                    <div className={commonStyles.activityTime}>{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

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
      </div>
    </div>
  );
};

export default Dashboard;