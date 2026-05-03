// @AI-HINT: This component is a specialized card for displaying the status of a freelancer's job, including title, client, and an integrated progress bar, now with a fully modernized, theme-aware design.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Briefcase, CheckCircle, Clock } from 'lucide-react';

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
  const { resolvedTheme } = useTheme();
  const styles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
  const isCompleted = status.toLowerCase() === 'completed' || !!completionDate;

  return (
    <div className={cn(commonStyles.card, styles.card)}>
      <div className={cn(commonStyles.cardHeader, styles.cardHeader)}>
        <div className={cn(commonStyles.iconWrapper, styles.iconWrapper)}>
          <Briefcase size={20} />
        </div>
        <h3 className={cn(commonStyles.title, styles.title)}>{title}</h3>
      </div>
      <p className={cn(commonStyles.client, styles.client)}>Client: {client}</p>
      
      <div className={cn(commonStyles.statusSection, styles.statusSection)}>
        <div className={cn(commonStyles.statusItem, styles.statusItem)}>
          <span className={cn(commonStyles.statusLabel, styles.statusLabel)}>Status</span>
          <span className={cn(commonStyles.statusValue, styles.statusValue, isCompleted ? commonStyles.completed : commonStyles.active)}>
            {isCompleted ? <CheckCircle size={14} /> : <Clock size={14} />}
            {status}
          </span>
        </div>
        {isCompleted && completionDate && (
          <div className={cn(commonStyles.statusItem, styles.statusItem)}>
            <span className={cn(commonStyles.statusLabel, styles.statusLabel)}>Completed</span>
            <span className={cn(commonStyles.statusValue, styles.statusValue)}>{completionDate}</span>
          </div>
        )}
      </div>

      {typeof progress === 'number' && !isCompleted && (
        <div className={cn(commonStyles.progressContainer, styles.progressContainer)}>
          <div className={cn(commonStyles.progressBarWrapper, styles.progressBarWrapper)}>
            <div 
              className={cn(commonStyles.progressBar, styles.progressBar)} 
              data-progress={progress}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Job progress`}
            ></div>
          </div>
          <span className={cn(commonStyles.progressText, styles.progressText)}>{progress}%</span>
        </div>
      )}
    </div>
  );
};

export default JobStatusCard;
