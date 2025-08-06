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
    return <div className="DashboardSection-loading">Loading projects...</div>;
  }

  if (error) {
    return <div className="DashboardSection-error">Error: {error}</div>;
  }

  return (
    <div className="DashboardSection">
      <div className="DashboardSection-header">
        <h2>Recent Projects</h2>
        <a href="/projects" className="DashboardSection-view-all">View All</a>
      </div>
      <div className="DashboardRecentProjects-list">
        {projects.map((project) => (
          <div key={project.id} className={`ProjectCard ${getStatusClass(project.status)}`}>
            <div className="ProjectCard-header">
              <h3 className="ProjectCard-title">{project.title}</h3>
              <span className={`ProjectCard-status ${getStatusClass(project.status)}`}>{project.status}</span>
            </div>
            <div className="ProjectCard-client">{project.client}</div>
            <div className="ProjectCard-progress">
              <div 
                className="ProjectCard-progress-bar"
                style={{ '--progress-width': `${project.progress}%` } as React.CSSProperties}
              >
                <div className="ProjectCard-progress-fill"></div>
              </div>
              <span className="ProjectCard-progress-label">{project.progress}%</span>
            </div>
            <div className="ProjectCard-footer">
              <span className="ProjectCard-deadline">Deadline: {project.deadline}</span>
              <span className="ProjectCard-budget">{project.budget}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardRecentProjects;
