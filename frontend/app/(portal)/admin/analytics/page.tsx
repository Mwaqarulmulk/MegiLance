// @AI-HINT: Admin analytics dashboard page
'use client';

import dynamic from 'next/dynamic';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

const AnalyticsDashboard = dynamic(() => import('./AnalyticsDashboard'), {
  loading: () => <Skeleton className="w-full h-96" />
});

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
