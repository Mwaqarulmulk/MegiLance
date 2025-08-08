// @AI-HINT: This is the 'Hire' page for clients to finalize hiring a freelancer for a project. All styles are per-component only.

'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import Button from '@/app/components/Button/Button';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import commonStyles from './Hire.common.module.css';
import lightStyles from './Hire.light.module.css';
import darkStyles from './Hire.dark.module.css';


// Mock data for the hiring confirmation
const hireDetails = {
  projectName: 'AI Chatbot Integration',
  freelancerName: 'Jane S.',
  rate: '$65/hr',
  estimatedHours: 80,
  firstMilestone: {
    description: 'Project Setup and Initial UI/UX Mockups',
    amount: 1300,
  },
};

const Hire: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const totalEstimate = 65 * 80;

  return (
    <div className={styles.hireWrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Confirm and Hire</h1>
          <p>
            You are about to hire <strong>{hireDetails.freelancerName}</strong> for the project: <strong>{hireDetails.projectName}</strong>.
          </p>
        </header>

        <div className={styles.card}>
          <div className={styles.freelancerInfo}>
            <UserAvatar name={hireDetails.freelancerName} />
            <h2>{hireDetails.freelancerName}</h2>
          </div>

          <div className={styles.terms}>
            <h3>Terms of Agreement</h3>
            <div className={styles.termsGrid}>
              <div className={styles.termItem}>
                <span>Rate</span>
                <strong>{hireDetails.rate}</strong>
              </div>
              <div className={styles.termItem}>
                <span>Est. Hours</span>
                <strong>{hireDetails.estimatedHours}</strong>
              </div>
              <div className={styles.termItem}>
                <span>Est. Total</span>
                <strong>${totalEstimate.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className={styles.milestone}>
            <h3>First Milestone</h3>
            <p>To begin the project, you need to fund the first milestone. The funds will be held in escrow and released upon your approval of the work.</p>
            <div className={styles.milestoneDetails}>
              <span>{hireDetails.firstMilestone.description}</span>
              <strong>${hireDetails.firstMilestone.amount.toLocaleString()}</strong>
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" size="large">Fund Milestone & Hire {hireDetails.freelancerName}</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hire;
