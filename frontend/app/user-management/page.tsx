// @AI-HINT: User Management page scaffold using premium EmptyState and global Toaster.

'use client';

import React from 'react';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
import styles from './UserManagement.common.module.css';

const UserManagementPage: React.FC = () => {
  const { notify } = useToaster();
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>Invite teammates, assign roles, and manage permissions.</p>
        </header>
        <EmptyState
          title="No users yet"
          description="Invite your team to collaborate with appropriate roles and permissions."
          action={
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={() => notify({ title: 'Invite user', description: 'Invitation flow coming soon.', variant: 'info', duration: 3000 })}
            >
              Invite User
            </button>
          }
        />
      </div>
    </main>
  );
};

export default UserManagementPage;
