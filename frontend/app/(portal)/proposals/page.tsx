// @AI-HINT: Root proposals redirect - redirects to role-specific proposals page
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/app/components/atoms/Loading/Loading';

export default function ProposalsRedirect() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    // Redirect based on authenticated role
    const role = user.role?.toLowerCase();
    if (role === 'client') {
      router.replace('/client/projects');
    } else if (role === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/freelancer/proposals');
    }
  }, [user, isLoading, router]);

  return <Loading text="Redirecting to proposals..." />;
}
