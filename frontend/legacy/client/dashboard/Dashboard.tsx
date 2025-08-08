'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import commonStyles from './Dashboard.common.module.css';
import lightStyles from './Dashboard.light.module.css';
import darkStyles from './Dashboard.dark.module.css';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// @AI-HINT: This is the main dashboard for clients. It has been fully refactored to use
// theme-aware CSS modules with camelCase conventions and modern import paths.

const mockProjects = [
  { id: 1, title: 'Develop AI-Powered Chatbot for E-commerce Site', budget: '$15,000', status: 'In Progress' },
  { id: 2, title: 'Brand Identity and Logo Design for Tech Startup', budget: '$8,000', status: 'Awaiting Feedback' },
  { id: 3, title: 'Full-Stack Development for SaaS Platform', budget: '$50,000', status: 'Completed' },
];

const getStatusClass = (status: string, styles: any) => {
  switch (status) {
    case 'In Progress':
      return styles.statusInProgress;
    case 'Awaiting Feedback':
      return styles.statusAwaitingFeedback;
    case 'Completed':
      return styles.statusCompleted;
    default:
      return '';
  }
};

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const styles = {
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  };  return (
    <div className={`${styles.dashboard} ${theme === 'dark' ? styles.dashboardDark : styles.dashboardLight}`}>
      <div className={styles.dashboardContainer}>
        <header className={styles.dashboardHeader}>
          <h1 className={styles.headerTitle}>Client Dashboard</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Post a New Project
          </Button>
        </header>

        <main className={styles.dashboardMainContent}>
          <section>
            <h2 className={styles.sectionTitle}>Active Projects</h2>
            <div className={styles.projectList}>
              {mockProjects.map((project) => (
                <div key={project.id} className={styles.projectListItem}>
                  <span className={styles.projectTitle}>{project.title}</span>
                  <span>{project.budget}</span>
                  <span className={`${styles.status} ${getStatusClass(project.status, styles)}`}>
                    {project.status}
                  </span>
                  <Button variant="secondary" size="sm" className="h-8 border-dashed">Manage</Button>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
