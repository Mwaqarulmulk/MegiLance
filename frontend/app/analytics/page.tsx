// @AI-HINT: Analytics page scaffold using premium EmptyState and global Toaster.

'use client';

import React from 'react';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
import styles from './Analytics.common.module.css';

const AnalyticsPage: React.FC = () => {
  const { notify } = useToaster();
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>Track performance, revenue, and engagement trends.</p>
        </header>
        <EmptyState
          title="Analytics coming soon"
          description="We’re preparing insightful dashboards. Stay tuned for charts and reports."
          action={
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={() => notify({ title: 'Subscribe to updates', description: 'You will be notified when Analytics launches.', variant: 'info', duration: 3000 })}
            >
              Notify Me
            </button>
          }
        />
      </div>
    </main>
  );
};

export default AnalyticsPage;
