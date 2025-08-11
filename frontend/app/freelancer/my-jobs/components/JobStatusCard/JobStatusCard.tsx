// @AI-HINT: This component is a specialized card for displaying the status of a freelancer's job, including title, client, and an integrated progress bar.
'use client';

import React, { useMemo, useId } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './JobStatusCard.common.module.css';
import lightStyles from './JobStatusCard.light.module.css';
import darkStyles from './JobStatusCard.dark.module.css';

export interface JobStatusCardProps {
  title: string;
  client: string;
  status: string;
  progress?: number; // Optional: 0-100
  completionDate?: string;
}

const JobStatusCard: React.FC<JobStatusCardProps> = ({ title, client, status, progress, completionDate }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const isCompleted = progress === 100 || !!completionDate;
  const titleId = useId();
  const clientId = useId();
  const statusId = useId();
  const completionId = useId();
  const progressId = useId();

  const cardTitle = useMemo(() => {
    const suffix = isCompleted
      ? (completionDate ? ` • Completed on ${completionDate}` : '')
      : (typeof progress === 'number' ? ` • ${progress}%` : '');
    return `${title} for ${client} — ${status}${suffix}`;
  }, [title, client, status, isCompleted, progress, completionDate]);

  return (
    <div
      className={styles.card}
      role="group"
      aria-labelledby={titleId}
      aria-describedby={[clientId, statusId, (!isCompleted && typeof progress === 'number') ? progressId : undefined, (isCompleted && completionDate) ? completionId : undefined].filter(Boolean).join(' ')}
      title={cardTitle}
    >
      <div className={styles.cardHeader}>
        <h3 id={titleId} className={styles.title}>{title}</h3>
        <p id={clientId} className={styles.client}>for {client}</p>
      </div>
      <div className={styles.cardBody}>
        <div id={statusId} className={styles.statusContainer}>
          <span className={styles.statusLabel}>Status:</span>
          <span className={cn(styles.status, isCompleted ? styles.completedStatus : styles.activeStatus)}>{status}</span>
        </div>
        {progress !== undefined && !isCompleted && (
          <div className={styles.progressWrapper}>
            <progress
              id={progressId}
              className={styles.progress}
              value={progress}
              max={100}
              aria-label={`Progress ${progress}%`}
              aria-valuetext={`${progress}% complete`}
            />
            <span className={styles.progressText}>{progress}%</span>
          </div>
        )}
        {isCompleted && completionDate && (
            <p id={completionId} className={styles.completionDate}>Completed on: {completionDate}</p>
        )}
      </div>
    </div>
  );
};

export default JobStatusCard;
