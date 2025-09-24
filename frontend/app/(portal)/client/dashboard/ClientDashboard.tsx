// @AI-HINT: Client Dashboard component. Theme-aware, accessible dashboard with KPIs, recent projects, and activity feed.
'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useClientData } from '@/hooks/useClient';
import KeyMetrics from './components/KeyMetrics/KeyMetrics';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  FileText, 
  DollarSign, 
  Users, 
  Bell,
  Calendar,
  MessageCircle,
  Eye
} from 'lucide-react';
import ProjectCard from '@/app/components/ProjectCard/ProjectCard';
import TransactionRow from '@/app/components/TransactionRow/TransactionRow';
import ProjectStatusChart from './components/ProjectStatusChart/ProjectStatusChart';
import SpendingChart from './components/SpendingChart/SpendingChart';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';
import Button from '@/app/components/Button/Button';
import Card from '@/app/components/Card/Card';
import common from './ClientDashboard.common.module.css';
import light from './ClientDashboard.light.module.css';
import dark from './ClientDashboard.dark.module.css';

const Trend: React.FC<{ value: number }> = ({ value }) => {
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  const color = value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-500';
  const sign = value > 0 ? '+' : '';

  return (
    <span className={`flex items-center text-sm ${color}`}>
      <Icon className="mr-1 h-4 w-4" />
      {sign}{value.toFixed(1)}%
    </span>
  );
};

const projectStatusData = [
  { name: 'In Progress', value: 4 },
  { name: 'Completed', value: 8 },
  { name: 'Pending', value: 2 },
  { name: 'Cancelled', value: 1 },
];

const spendingData = [
  { name: 'Jan', spending: 4000 },
  { name: 'Feb', spending: 3000 },
  { name: 'Mar', spending: 5000 },
  { name: 'Apr', spending: 4500 },
  { name: 'May', spending: 6000 },
  { name: 'Jun', spending: 5500 },
];

const ClientDashboard: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const { projects, payments, loading, error } = useClientData();

  const headerRef = useRef<HTMLDivElement | null>(null);
  const widgetsRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const metricCards = [
    { title: 'Total Projects', icon: Briefcase, trend: <Trend value={5.2} /> },
    { title: 'Active Projects', icon: CheckCircle, trend: <Trend value={-1.8} /> },
    { title: 'Total Spent', icon: DollarSign, trend: <Trend value={12.5} /> },
    { title: 'Pending Payments', icon: Clock, trend: <Trend value={0} /> },
  ];

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const widgetsVisible = useIntersectionObserver(widgetsRef, { threshold: 0.1 });
  const contentVisible = useIntersectionObserver(contentRef, { threshold: 0.1 });

  const metrics = useMemo(() => {
    const totalProjects = Array.isArray(projects) ? projects.length : 0;
    const activeProjects = Array.isArray(projects) ? projects.filter(p => p.status === 'In Progress').length : 0;
    const totalSpent = Array.isArray(payments) ? payments.reduce((sum, p) => {
      const amount = parseFloat(p.amount?.replace(/[$,]/g, '') || '0');
      return sum + amount;
    }, 0) : 0;
    const pendingPayments = Array.isArray(payments) ? payments.filter(p => p.status === 'Pending').length : 0;

    return {
      totalProjects,
      activeProjects,
      totalSpent: `$${totalSpent.toLocaleString()}`,
      pendingPayments,
    };
  }, [projects, payments]);

  const [liveRegionMessage, setLiveRegionMessage] = useState('Loading dashboard data.');

  useEffect(() => {
    if (loading) {
      setLiveRegionMessage('Loading dashboard data.');
    } else if (error) {
      setLiveRegionMessage('Failed to load dashboard data. Please try again later.');
    } else {
      setLiveRegionMessage(`Dashboard loaded. You have ${metrics.totalProjects} total projects and ${metrics.pendingPayments} pending payments.`);
    }
  }, [loading, error, metrics.totalProjects, metrics.pendingPayments]);

  const recentProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    return projects.slice(0, 3).map((p, idx) => ({
      id: String(p.id ?? idx),
      title: p.title ?? 'Untitled Project',
      clientName: p.client ?? 'Unknown Client',
      budget: typeof p.budget === 'number'
        ? p.budget
        : parseFloat(String(p.budget ?? '0').replace(/[$,]/g, '')) || 0,
      postedTime: p.updatedAt ?? p.updated ?? 'Unknown',
      tags: Array.isArray(p.skills) ? p.skills : [],
    }));
  }, [projects]);

  const recentTransactions = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    return payments.slice(0, 3).map((p, idx) => ({
      id: String(p.id ?? idx),
      amount: p.amount ?? '0',
      date: p.date ?? '',
      description: p.description ?? 'Unknown transaction',
    }));
  }, [payments]);

  // Recent activity data
  const recentActivity = [
    { id: '1', title: 'New proposal received', description: 'Freelancer submitted a proposal for your project', time: '2 hours ago', icon: FileText },
    { id: '2', title: 'Payment processed', description: 'Payment of $1,200 completed for project', time: '5 hours ago', icon: DollarSign },
    { id: '3', title: 'Project update', description: 'Progress updated to 75% complete', time: '1 day ago', icon: Eye },
    { id: '4', title: 'Message received', description: 'New message from freelancer', time: '1 day ago', icon: MessageCircle },
  ];

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.srOnly} aria-live="polite" role="status">
        {liveRegionMessage}
      </div>
      <div className={common.container}>
        {/* Welcome Banner */}
        <div className={common.welcomeBanner}>
          <div className={common.welcomeBannerContent}>
            <h1 className={common.welcomeBannerTitle}>Welcome back, Client!</h1>
            <p className={common.welcomeBannerText}>Here&apos;s what&apos;s happening with your projects and freelancers today.</p>
            <div className={common.quickActions}>
              <Button variant="secondary" size="md" iconBefore={<Plus size={18} />}>
                Post New Project
              </Button>
              <Button variant="secondary" size="md" iconBefore={<Users size={18} />}>
                Find Freelancers
              </Button>
            </div>
          </div>
        </div>

        <header ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)} role="region" aria-label="Dashboard Header">
          <div>
            <h1 className={common.title}>Client Dashboard</h1>
            <p className={cn(common.subtitle, themed.subtitle)}>Manage your projects, track spending, and monitor freelancer performance.</p>
          </div>
        </header>

        {loading && (
          <div className={common.loading} aria-busy="true">
            <Skeleton width={40} height={40} radius="50%" />
            <div>Loading dashboard...</div>
          </div>
        )}
        {error && (
          <div className={common.error}>
            <Bell size={20} />
            <span>Failed to load dashboard data.</span>
          </div>
        )}

        <div ref={widgetsRef} className={cn(common.widgetsGrid, widgetsVisible ? common.isVisible : common.isNotVisible)}>
          <KeyMetrics metrics={metrics} loading={loading} metricCards={metricCards} />
        </div>

        <div ref={contentRef} className={cn(common.dashboardGrid, contentVisible ? common.isVisible : common.isNotVisible)}>
          {/* Stats Grid */}
          <div className={common.gridSpanFull}>
            <div className={common.statsGrid}>
              <Card title="Active Projects" icon={Briefcase}>
                <div className={common.statValue}>12</div>
                <div className={cn(common.statTrend, common.positive)}>
                  <TrendingUp size={16} />
                  <span>+2 from last month</span>
                </div>
              </Card>
              <Card title="Total Spent" icon={DollarSign}>
                <div className={common.statValue}>$24,580</div>
                <div className={cn(common.statTrend, common.positive)}>
                  <TrendingUp size={16} />
                  <span>+12% from last month</span>
                </div>
              </Card>
              <Card title="Avg. Project Cost" icon={FileText}>
                <div className={common.statValue}>$2,048</div>
                <div className={cn(common.statTrend, common.negative)}>
                  <TrendingDown size={16} />
                  <span>-3% from last month</span>
                </div>
              </Card>
              <Card title="Active Freelancers" icon={Users}>
                <div className={common.statValue}>24</div>
                <div className={cn(common.statTrend, common.positive)}>
                  <TrendingUp size={16} />
                  <span>+5 from last month</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Charts */}
          <div className={common.chartsContainer}>
            <Card title="Spending Overview" icon={DollarSign}>
              <SpendingChart data={spendingData} />
            </Card>
            <Card title="Project Status" icon={Briefcase}>
              <ProjectStatusChart data={projectStatusData} />
            </Card>
          </div>

          {/* Recent Activity */}
          <div className={common.gridSpanFull}>
            <Card title="Recent Activity" icon={Calendar}>
              <div className={common.activityList}>
                {recentActivity.map(activity => (
                  <div key={activity.id} className={common.activityItem}>
                    <div className={common.activityIcon}>
                      <activity.icon size={20} />
                    </div>
                    <div className={common.activityContent}>
                      <h4 className={common.activityTitle}>{activity.title}</h4>
                      <p className={common.activityDescription}>{activity.description}</p>
                      <div className={common.activityTime}>{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Projects Section */}
          <section className={cn(common.section, common.gridSpan2)} aria-labelledby="recent-projects-title">
            <div className={common.sectionHeader}>
              <h2 id="recent-projects-title" className={common.sectionTitle}>
                <Briefcase size={24} />
                Recent Projects
              </h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className={common.projectList}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={common.cardSkeleton}>
                    <Skeleton height={16} width={'50%'} />
                    <Skeleton height={12} width={'70%'} />
                    <Skeleton height={12} width={120} />
                  </div>
                ))
              ) : (
                <>
                  {recentProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      title={project.title}
                      status={('In Progress')}
                      progress={0}
                      budget={project.budget}
                      paid={0}
                      freelancers={[]}
                      updatedAt={project.postedTime}
                      clientName={project.clientName}
                      postedTime={project.postedTime}
                      tags={project.tags}
                    />
                  ))}
                  {recentProjects.length === 0 && (
                    <div className={common.emptyState}>No projects found.</div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Transactions Section */}
          <section className={cn(common.section, common.gridSpanFull)} aria-labelledby="recent-transactions-title">
            <div className={common.sectionHeader}>
              <h2 id="recent-transactions-title" className={common.sectionTitle}>
                <DollarSign size={24} />
                Recent Transactions
              </h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className={common.transactionList}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={common.rowSkeleton}>
                    <Skeleton height={14} width={'30%'} />
                    <Skeleton height={12} width={'20%'} />
                    <Skeleton height={12} width={'40%'} />
                  </div>
                ))
              ) : (
                <>
                  {recentTransactions.map(txn => (
                    <TransactionRow
                      key={txn.id}
                      amount={txn.amount}
                      date={txn.date}
                      description={txn.description}
                    />
                  ))}
                  {recentTransactions.length === 0 && (
                    <div className={common.emptyState}>No transactions found.</div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ClientDashboard;