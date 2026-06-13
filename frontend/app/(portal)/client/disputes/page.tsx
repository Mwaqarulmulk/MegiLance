// @AI-HINT: Redirect page for client disputes — routes to the shared disputes center
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/components/atoms/Loading/Loading';

export default function ClientDisputesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/disputes');
  }, [router]);

  return <Loading text="Redirecting to disputes..." />;
}
