// @AI-HINT: Entry point for gig creation wizard - protected route for freelancers
import { Suspense } from 'react';
import type { Metadata } from 'next';
import GigCreate from './GigCreate';
import styles from './GigCreatePage.common.module.css';

export const metadata: Metadata = {
  title: 'Create a Gig | MegiLance',
  description: 'Create a new gig and start selling your services on MegiLance. Set your packages, prices, and showcase your work.',
  openGraph: {
    title: 'Create a Gig | MegiLance',
    description: 'Create a new gig and start selling your services on MegiLance.',
  },
};

function GigCreateLoading() {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.loadingCenter}>
        <div className={styles.loadingSpinner} />
        <p>Loading gig creator...</p>
      </div>
    </div>
  );
}

export default function GigCreatePage() {
  return (
    <Suspense fallback={<GigCreateLoading />}>
      <GigCreate />
    </Suspense>
  );
}
