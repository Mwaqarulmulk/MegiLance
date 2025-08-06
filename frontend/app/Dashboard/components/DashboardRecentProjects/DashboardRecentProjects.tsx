// @AI-HINT: This component displays a list of recent projects. It's designed to provide a quick, scannable overview of project status, progress, and deadlines, a key feature in premium project management dashboards.

'use client';

import React, { useState, useEffect } from 'react';
import { RecentProject } from '../../types';
import commonStyles from './DashboardRecentProjects.common.module.css';
import lightStyles from './DashboardRecentProjects.light.module.css';
import darkStyles from './DashboardRecentProjects.dark.module.css';

const getStatusClass = (status: RecentProject['status']) => {
  switch (status) {
    case 'In Progress':
      return 'status--in-progress';
    case 'Review':
      return 'status--review';
    case 'Completed':
      return 'status--completed';
    case 'Overdue':
      return 'status--overdue';
    default:
      return '';
  }
};

// @AI-HINT: This component displays a list of recent projects. It's designed to provide a quick, scannable overview of project status, progress, and deadlines, a key feature in premium project management dashboards. Now fully theme-switchable.


const DashboardRecentProjects: React.FC = () => {
  const [projects, setProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setProjects(data.recentProjects || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

    if (loading) {
    return <div className={commonStyles.loading}>Loading projects...</div>;
  }

  if (error) {
    return <div className={commonStyles.error}>Error: {error}</div>;
  }

  return (
    <div className={commonStyles.recentProjectsCard}>
      <div className={commonStyles.cardHeader}>
        <h2 className={commonStyles.cardTitle}>Recent Projects</h2>
        <a href="/projects" className={commonStyles.viewAllLink}>View All</a>
      </div>
      <div className={commonStyles.listContainer}>
        {projects.map((project) => (
          <div key={project.id} className={`${commonStyles.projectCard} ${getStatusClass(project.status)}`}>
            <div className={commonStyles.projectHeader}>
              <h3 className={commonStyles.projectTitle}>{project.title}</h3>
              <span className={`${commonStyles.statusBadge} ${getStatusClass(project.status)}`}>{project.status}</span>
            </div>
            <div className={commonStyles.clientName}>{project.client}</div>
            <div className={commonStyles.progressContainer}>
              <div className={commonStyles.progressBar}>
                                {/* eslint-disable-next-line react/no-inline-styles */}
                <div 
                  className={commonStyles.progressFill}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <span className={commonStyles.progressLabel}>{project.progress}%</span>
            </div>
            <div className={commonStyles.projectFooter}>
              <span className={commonStyles.deadline}>Deadline: {project.deadline}</span>
              <span className={commonStyles.budget}>{project.budget}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardRecentProjects;
