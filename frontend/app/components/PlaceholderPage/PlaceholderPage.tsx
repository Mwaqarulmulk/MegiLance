// @AI-HINT: This is a reusable placeholder component for pages that are under construction.

import React from 'react';
import { cn } from '@/lib/utils';
import styles from './PlaceholderPage.module.css';

// @AI-HINT: This is a reusable placeholder component for pages that are under construction. It uses CSS modules.

interface PlaceholderPageProps {
  title: string;
  description?: string;
  className?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description, className }) => {
  return (
    <div className={cn(styles.placeholderPage, className)}>
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>
          {description || 'This page is under construction. Content will be added soon.'}
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
