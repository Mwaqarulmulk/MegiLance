// @AI-HINT: This is the 'My Jobs' page for freelancers to track active and completed projects. All styles are per-component only.
'use client';

import React from 'react';
import ProjectCard from '@/app/components/ProjectCard/ProjectCard'; // Re-using ProjectCard for consistency
import './MyJobs.common.css';
import './MyJobs.light.css';
import './MyJobs.dark.css';

interface MyJobsProps {
  theme?: 'light' | 'dark';
}

const MyJobs: React.FC<MyJobsProps> = ({ theme = 'light' }) => {
  // Mock data for active and completed jobs
  const activeJobs = [
    {
      title: 'AI Chatbot Integration',
      clientName: 'Innovate Inc.',
      budget: '$5,000',
      status: 'In Progress',
      progress: 75,
    },
    {
      title: 'Data Analytics Dashboard',
      clientName: 'DataDriven Co.',
      budget: '$12,000',
      status: 'Awaiting Feedback',
      progress: 90,
    },
  ];

  const completedJobs = [
    {
      title: 'E-commerce Platform UI/UX',
      clientName: 'Shopify Plus Experts',
      budget: '$8,000',
      status: 'Completed',
      completionDate: '2025-07-15',
    },
  ];

  return (
    <div className={`MyJobs MyJobs--${theme}`}>
      <div className="MyJobs-container">
        <header className="MyJobs-header">
          <h1>My Jobs</h1>
          <p>Track the status of all your active and completed projects.</p>
        </header>

        <section className="MyJobs-section">
          <h2>Active Jobs</h2>
          <div className="MyJobs-list">
            {activeJobs.map((job, index) => (
              <div key={index} className={`JobItem JobItem--${theme}`}>
                <ProjectCard theme={theme} title={job.title} clientName={job.clientName} budget={job.budget} />
                <div className="JobItem-status">
                  <span>{job.status}</span>
                  <div className="JobItem-progress-bar">
                    <div className="JobItem-progress" style={{ width: `${job.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="MyJobs-section">
          <h2>Completed Jobs</h2>
          <div className="MyJobs-list">
            {completedJobs.map((job, index) => (
              <div key={index} className={`JobItem JobItem--${theme}`}>
                <ProjectCard theme={theme} title={job.title} clientName={job.clientName} budget={job.budget} />
                <div className="JobItem-status">
                  <span>{job.status} on {job.completionDate}</span>
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
