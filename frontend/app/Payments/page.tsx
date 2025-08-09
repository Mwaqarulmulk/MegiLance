// @AI-HINT: Payments page scaffold using premium EmptyState and global Toaster.

'use client';

import React from 'react';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
import styles from './Payments.common.module.css';

const PaymentsPage: React.FC = () => {
  const { notify } = useToaster();
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Payments</h1>
          <p className={styles.subtitle}>Review payouts, invoices, and billing preferences.</p>
        </header>
        <EmptyState
          title="No payments yet"
          description="Once you start transacting, your payments history will appear here."
          action={
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={() => notify({ title: 'Add payout method', description: 'Billing settings coming soon.', variant: 'info', duration: 3000 })}
            >
              Add Payout Method
            </button>
          }
        />
      </div>
    </main>
  );
};

export default PaymentsPage;
