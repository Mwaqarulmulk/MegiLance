// @AI-HINT: This is the main Dashboard page. It's designed as a command center, providing a high-level overview of key metrics, recent activities, and upcoming tasks to give the user immediate insight into their account status.

import React from 'react';
import { DollarSign, Zap, MessageSquare, Clock, ChevronRight, Briefcase, CheckCircle, Award } from 'lucide-react';
import styles from './Dashboard.module.css';

// AI-HINT: Mock data for the dashboard. In a real-world application, this data would be fetched from various API endpoints and aggregated here.
const user = {
  name: 'Alexandra',
};

const kpiData = [
  {
    title: 'Active Projects',
    value: '5',
    icon: Zap,
    color: 'var(--color-primary)',
  },
  {
    title: 'Monthly Earnings',
    value: '$12,500',
    icon: DollarSign,
    color: 'var(--color-success)',
  },
  {
    title: 'Unread Messages',
    value: '3',
    icon: MessageSquare,
    color: 'var(--color-warning-dark)',
  },
  {
    title: 'Pending Tasks',
    value: '8',
    icon: Clock,
    color: 'var(--color-error)',
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

const DashboardPage = () => {
  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <h1>Welcome back, {user.name}!</h1>
        <p>Here’s a snapshot of your freelance world today.</p>
      </header>

      <div className={styles.kpiGrid}>
        {kpiData.map((kpi, index) => (
          <div key={index} className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ backgroundColor: kpi.color }}>
              <kpi.icon size={24} color="white" />
            </div>
            <div className={styles.kpiContent}>
              <span className={styles.kpiTitle}>{kpi.title}</span>
              <span className={styles.kpiValue}>{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.projectsSection}>
          <div className={styles.sectionHeader}>
            <h2>Recent Projects</h2>
            <a href="/projects" className={styles.viewAllLink}>
              View All <ChevronRight size={16} />
            </a>
          </div>
          <div className={styles.projectList}>
            {recentProjects.map(project => (
              <div key={project.id} className={styles.projectCard}>
                <div className={styles.projectInfo}>
                    <div className={styles.projectIcon}>
                        <project.icon size={22} />
                    </div>
                    <div>
                        <h3 className={styles.projectTitle}>{project.title}</h3>
                        <p className={styles.projectClient}>{project.client}</p>
                    </div>
                </div>
                <div className={styles.projectStatus}>
                    <span>{project.status}</span>
                    <div className={styles.progressBar}>
                        <div style={{ width: `${project.progress}%` }}></div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.tasksSection}>
          <div className={styles.sectionHeader}>
            <h2>Upcoming Tasks</h2>
          </div>
          <div className={styles.taskList}>
            {upcomingTasks.map(task => (
              <div key={task.id} className={styles.taskItem}>
                <div className={styles.taskInfo}>
                  <CheckCircle size={18} className={styles.taskIcon} />
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

