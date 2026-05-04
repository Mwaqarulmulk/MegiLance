// @AI-HINT: Email verification page - verifies email with token from URL
'use client';

import dynamic from 'next/dynamic';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

const VerifyEmail = dynamic(() => import('./VerifyEmail'), {
  loading: () => <Skeleton className="w-full h-96" />
});

export default function VerifyEmailPage() {
  return <VerifyEmail />;
}
