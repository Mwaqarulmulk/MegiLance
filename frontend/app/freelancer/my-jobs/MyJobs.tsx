// @AI-HINT: This is the 'My Jobs' page for freelancers to track active and completed projects. All styles are per-component only.
'use client';

import React from 'react';
import ProjectCard from '@/app/components/ProjectCard/ProjectCard'; // Re-using ProjectCard for consistency
import ProgressBar from '@/app/components/ProgressBar/ProgressBar';
import { cn } from '@/lib/utils';
import commonStyles from './MyJobs.common.module.css';
import lightStyles from './MyJobs.light.module.css';
import darkStyles from './MyJobs.dark.module.css';

// @AI-HINT: This is the 'My Jobs' page for freelancers to track active and completed projects. All styles are per-component only. Now fully theme-switchable using global theme context.

const MyJobs: React.FC = () => {
  // Mock data for active and completed jobs
  const activeJobs = [
    {
      title: 'AI Chatbot Integration',
      client: 'Innovate Inc.',
      budget: '$5,000',
      status: 'In Progress',
      progress: 75,
    },
    {
      title: 'Data Analytics Dashboard',
      client: 'DataDriven Co.',
      budget: '$12,000',
      status: 'Awaiting Feedback',
      progress: 90,
    },
  ];

  const completedJobs = [
    {
      title: 'E-commerce Platform UI/UX',
      client: 'Shopify Plus Experts',
      budget: '$8,000',
      status: 'Completed',
      completionDate: '2025-07-15',
    },
  ];

  
  return (
    <div className={cn(commonStyles.myJobs, theme === 'light' ? lightStyles.light : darkStyles.dark)}>
      {/* AI-HINT: The 'cn' utility is used here to merge the base component styles with the correct theme-specific styles (light or dark) based on the current theme context. */}
      <div className={commonStyles.myJobsContainer}>
        <header className={commonStyles.myJobsHeader}>
          <h1>My Jobs</h1>
          <p>Track the status of all your active and completed projects.</p>
        </header>

        <section className={commonStyles.myJobsSection}>
          <h2>Active Jobs</h2>
          <div className={commonStyles.myJobsList}>
            {activeJobs.map((job, index) => (
              <div key={index} className={commonStyles.jobItem}>
                <ProjectCard
                  title={job.title}
                  clientName={job.client}
                  budget={job.budget}
                  postedTime={"In Progress"}
                  tags={['Active']}
                />
                <div className={commonStyles.jobItemStatus}>
                  <span>{job.status}</span>
                  <ProgressBar progress={job.progress} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={commonStyles.myJobsSection}>
          <h2>Completed Jobs</h2>
          <div className={commonStyles.myJobsList}>
            {completedJobs.map((job, index) => (
              <div key={index} className={commonStyles.jobItem}>
                <ProjectCard
                  title={job.title}
                  clientName={job.client}
                  budget={job.budget}
                  postedTime={`Completed on ${job.completionDate}`}
                  tags={['Completed']}
                />
                <div className={commonStyles.jobItemStatus}>
                  <span>Completed on {job.completionDate}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyJobs;
