// @AI-HINT: Entry point for freelancer gigs management - protected route
import { Suspense } from 'react';
import type { Metadata } from 'next';
import GigsList from './GigsList';
import styles from './GigsPage.common.module.css';

export const metadata: Metadata = {
  title: 'My Gigs | MegiLance',
  description: 'Manage your gigs, track performance, and grow your freelance business on MegiLance.',
  openGraph: {
    title: 'My Gigs | MegiLance',
    description: 'Manage your gigs and track performance on MegiLance.',
  },
};

function GigsListLoading() {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.loadingCenter}>
        <div className={styles.loadingSpinner} />
        <p>Loading your gigs...</p>
      </div>
    </div>
  );
}

export default function GigsPage() {
  return (
    <Suspense fallback={<GigsListLoading />}>
      <GigsList />
    </Suspense>
  );
}
