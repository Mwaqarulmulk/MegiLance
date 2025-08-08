// @AI-HINT: This component displays a list of recent projects in a premium, sortable table. It's designed for a scannable overview of project status, progress, and deadlines, a key feature in investor-grade project management dashboards.

'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { mockRecentProjects } from '../../mock-data';
import { RecentProject } from '../../types';

import commonStyles from './DashboardRecentProjects.common.module.css';
import lightStyles from './DashboardRecentProjects.light.module.css';
import darkStyles from './DashboardRecentProjects.dark.module.css';

const statusStyles: Record<RecentProject['status'], string> = {
  'In Progress': 'inProgress',
  'Review': 'review',
  'Completed': 'completed',
  'Overdue': 'overdue',
};

const DashboardRecentProjects: React.FC = () => {
  const { theme } = useTheme();

  const styles = React.useMemo(() => {
    const themeStyles = theme === 'light' ? lightStyles : darkStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  return (
    <div className={styles.recentProjectsCard}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Recent Projects</h2>
        <Link href="/projects" className={styles.viewAllLink}>
          View All
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Client</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          {mockRecentProjects.map((project) => (
            <tr key={project.id}>
              <td>{project.title}</td>
              <td>{project.client}</td>
              <td>
                <span className={cn(styles.statusBadge, styles[statusStyles[project.status]])}>
                  <span className={cn(styles.statusDot, styles[`${statusStyles[project.status]}Dot`])}></span>
                  {project.status}
                </span>
              </td>
              <td>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ '--progress-width': `${project.progress}%` } as React.CSSProperties}
                  ></div>
                </div>
              </td>
              <td>{project.deadline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardRecentProjects;
