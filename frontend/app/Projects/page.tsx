// @AI-HINT: Projects page scaffold using premium EmptyState and global Toaster for consistent UX.

'use client';

import React from 'react';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
import styles from './Projects.common.module.css';

const ProjectsPage: React.FC = () => {
  const { notify } = useToaster();

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>Create and manage your client engagements with milestones and invoices.</p>
        </header>
        <EmptyState
          title="No projects yet"
          description="Create your first project to start collaborating with experts and track progress."
          action={
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={() =>
                notify({ title: 'New project', description: 'Project creation flow coming soon.', variant: 'info', duration: 3000 })
              }
            >
              New Project
            </button>
          }
        />
      </div>
    </main>
  );
};

export default ProjectsPage;
