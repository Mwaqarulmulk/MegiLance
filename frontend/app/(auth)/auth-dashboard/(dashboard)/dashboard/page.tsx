// @AI-HINT: This is the main Dashboard page. It's designed as a command center, providing a high-level overview of key metrics, recent activities, and upcoming tasks to give the user immediate insight into their account status.

'use client'

import React from 'react';
import { DollarSign, Zap, MessageSquare, Clock, ChevronRight, Briefcase, CheckCircle, Award } from 'lucide-react';
import styles from './Dashboard.module.css';
import Skeleton from '../../../../components/Animations/Skeleton/Skeleton';

// AI-HINT: Mock data for the dashboard. In a real-world application, this data would be fetched from various API endpoints and aggregated here.
const user = {
  name: 'Alexandra',
};

const kpiData = [
  {
    title: 'Active Projects',
    value: '5',
    icon: Zap,
    colorClass: 'kpiIconPrimary',
  },
  {
    title: 'Monthly Earnings',
    value: '$12,500',
    icon: DollarSign,
    colorClass: 'kpiIconSuccess',
  },
  {
    title: 'Unread Messages',
    value: '3',
    icon: MessageSquare,
    colorClass: 'kpiIconWarning',
  },
  {
    title: 'Pending Tasks',
    value: '8',
    icon: Clock,
    colorClass: 'kpiIconError',
  },
];

const recentProjects = [
    {
        id: 1,
        title: 'Project Alpha - UI/UX Overhaul',
        client: 'Innovate Inc.',
        status: 'In Progress',
        progress: 75,
        icon: Briefcase
    },
    {
        id: 2,
        title: 'Project Beta - Backend API',
        client: 'Tech Solutions Ltd.',
        status: 'Completed',
        progress: 100,
        icon: CheckCircle
    },
    {
        id: 3,
        title: 'Project Gamma - Marketing Campaign',
        client: 'Global Reach',
        status: 'On Hold',
        progress: 30,
        icon: Award
    },
];

const upcomingTasks = [
    { id: 1, title: 'Finalize logo concepts for Project Alpha', dueDate: 'Tomorrow' },
    { id: 2, title: 'Deploy staging server for Project Beta', dueDate: 'In 3 days' },
    { id: 3, title: 'Client feedback call for Project Gamma', dueDate: 'Next Week' },
];

// AI-HINT: Integrate premium Skeleton placeholders to represent loading states on real UI sections.
const DashboardPage = () => {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900); // quick demo loading
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <h1>Welcome back, {user.name}!</h1>
        <p>Here’s a snapshot of your freelance world today.</p>
      </header>

      <div className={styles.kpiGrid} aria-busy={loading || undefined}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.kpiCard}>
                <Skeleton width={60} height={60} radius={18} inline theme="light" />
                <div className={styles.kpiContent}>
                  <Skeleton width={120} height={14} radius={6} lines={1} theme="light" />
                  <Skeleton width={90} height={28} radius={8} lines={1} theme="light" />
                </div>
              </div>
            ))
          : kpiData.map((kpi, index) => (
              <div key={index} className={styles.kpiCard}>
                <div className={`${styles.kpiIcon} ${styles[kpi.colorClass as keyof typeof styles]}`}>
                  <kpi.icon size={28} color="white" />
                </div>
                <div className={styles.kpiContent}>
                  <span className={styles.kpiTitle}>{kpi.title}</span>
                  <span className={styles.kpiValue}>{kpi.value}</span>
                </div>
              </div>
            ))}
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.projectsSection} aria-busy={loading || undefined}>
          <div className={styles.sectionHeader}>
            <h2>Recent Projects</h2>
            <a href="/projects" className={styles.viewAllLink}>
              View All <ChevronRight size={18} />
            </a>
          </div>
          <div className={styles.projectList}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.projectCard}>
                  <div className={styles.projectInfo}>
                    <Skeleton width={40} height={40} radius={12} inline theme="light" />
                    <div>
                      <Skeleton width={280} height={18} radius={8} theme="light" />
                      <Skeleton width={180} height={14} radius={6} theme="light" />
                    </div>
                  </div>
                  <div className={styles.projectStatus}>
                    <Skeleton width={90} height={14} radius={6} theme="light" />
                    <div className={styles.progressBar}>
                      <Skeleton width={'100%'} height={8} radius={4} theme="light" />
                    </div>
                  </div>
                </div>
              ))
            ) : recentProjects.length === 0 ? (
              <div className={styles.emptyState}>
                <h4>No recent projects</h4>
                <p>Projects you’re working on will appear here.</p>
              </div>
            ) : recentProjects.map(project => (
              <div
                key={project.id}
                className={styles.projectCard}
                tabIndex={0}
                role="button"
                aria-label={`Open ${project.title}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); /* navigate or open modal */ } }}
              >
                <div className={styles.projectInfo}>
                    <div className={styles.projectIcon}>
                        <project.icon size={24} />
                    </div>
                    <div>
                        <h3 className={styles.projectTitle}>{project.title}</h3>
                        <p className={styles.projectClient}>{project.client}</p>
                    </div>
                </div>
                <div className={styles.projectStatus}>
                    <span>{project.status}</span>
                    <progress className={styles.progress} value={project.progress} max={100} aria-label={`Progress ${project.progress}%`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.tasksSection} aria-busy={loading || undefined}>
          <div className={styles.sectionHeader}>
            <h2>Upcoming Tasks</h2>
          </div>
          <div className={styles.taskList}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.taskItem}>
                  <div className={styles.taskInfo}>
                    <Skeleton width={36} height={36} radius={10} inline theme="light" />
                    <Skeleton width={300} height={16} radius={6} theme="light" />
                  </div>
                  <Skeleton width={100} height={24} radius={6} theme="light" />
                </div>
              ))
            ) : upcomingTasks.length === 0 ? (
              <div className={styles.emptyState}>
                <h4>No upcoming tasks</h4>
                <p>You’re all caught up. New tasks will appear here.</p>
              </div>
            ) : upcomingTasks.map(task => (
              <div key={task.id} className={styles.taskItem}>
                <div className={styles.taskInfo}>
                  <CheckCircle size={20} className={styles.taskIcon} />
                  <p>{task.title}</p>
                </div>
                <span className={styles.taskDueDate}>{task.dueDate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;