// @AI-HINT: This component provides a queue for administrators to moderate job postings, allowing them to approve or reject submissions.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import Badge from '@/app/components/Badge/Badge';
import commonStyles from './JobModerationQueue.common.module.css';
import lightStyles from './JobModerationQueue.light.module.css';
import darkStyles from './JobModerationQueue.dark.module.css';

interface Job {
  id: string;
  title: string;
  clientName: string;
  dateSubmitted: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  riskLevel: 'Low' | 'Medium' | 'High';
}

const mockJobs: Job[] = [
  { id: 'job_001', title: 'Build a DeFi Staking Platform', clientName: 'CryptoCorp', dateSubmitted: '2025-08-08', status: 'Pending', riskLevel: 'High' },
  { id: 'job_002', title: 'Design a new company logo', clientName: 'Artisan Goods', dateSubmitted: '2025-08-08', status: 'Pending', riskLevel: 'Low' },
  { id: 'job_003', title: 'Develop a social media marketing campaign', clientName: 'Growth Inc.', dateSubmitted: '2025-08-07', status: 'Pending', riskLevel: 'Medium' },
  { id: 'job_004', title: 'Write technical documentation for API', clientName: 'TechSolutions', dateSubmitted: '2025-08-06', status: 'Approved', riskLevel: 'Low' },
];

const JobModerationQueue: React.FC = () => {
  const { theme } = useTheme();
  const [jobs, setJobs] = useState(mockJobs);

  const styles = {
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  };

  const handleModerate = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setJobs(jobs.map(job => (job.id === id ? { ...job, status: newStatus } : job)));
  };

  const pendingJobs = jobs.filter(job => job.status === 'Pending');

  return (
    <div className={styles.jobModerationQueueContainer}>
      <h2 className={styles.jobModerationQueueTitle}>Job Moderation Queue</h2>
      <div className={styles.jobModerationQueueTableWrapper}>
        <table className={styles.jobModerationQueue}>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Client</th>
              <th>Date Submitted</th>
              <th>AI Risk Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingJobs.map(job => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.clientName}</td>
                <td>{job.dateSubmitted}</td>
                <td>
                  <Badge 
                    variant={job.riskLevel === 'High' ? 'danger' : job.riskLevel === 'Medium' ? 'warning' : 'success'}
                  >
                    {job.riskLevel}
                  </Badge>
                </td>
                <td className={styles.jobModerationQueueActions}>
                  <Button variant="success" size="small" onClick={() => handleModerate(job.id, 'Approved')}>Approve</Button>
                  <Button variant="danger" size="small" onClick={() => handleModerate(job.id, 'Rejected')}>Reject</Button>
                </td>
              </tr>
            ))}
            {pendingJobs.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.jobModerationQueueEmpty}>The queue is empty.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobModerationQueue;
