// @AI-HINT: Redirect page for client support — routes to the help page
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/components/atoms/Loading/Loading';

export default function ClientSupportPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/client/help');
  }, [router]);

  return <Loading text="Redirecting to help..." />;
}
