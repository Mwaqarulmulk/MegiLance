// @AI-HINT: 2FA settings page - enables/disables two-factor authentication
'use client';

import dynamic from 'next/dynamic';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

const TwoFactorAuth = dynamic(() => import('./TwoFactorAuth'), {
  loading: () => <Skeleton className="w-full h-96" />
});

export default function TwoFactorAuthPage() {
  return <TwoFactorAuth />;
}
