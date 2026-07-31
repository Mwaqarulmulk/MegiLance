// @AI-HINT: Next.js route file for Onboarding. Dynamically routes to ClientOnboarding or Freelancer Onboarding based on user role.
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Onboarding from './Onboarding';
import ClientOnboarding from './client/ClientOnboarding';

const OnboardingPage = () => {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<'client' | 'freelancer' | null>(null);

  useEffect(() => {
    // 1. Check URL search param
    const urlRole = searchParams.get('role');
    if (urlRole === 'client' || urlRole === 'freelancer') {
      setRole(urlRole);
      return;
    }

    // 2. Check localStorage session indicators
    try {
      const portalArea = localStorage.getItem('portal_area');
      const userRole = localStorage.getItem('ml_user_role');
      const userStr = localStorage.getItem('user');

      if (portalArea === 'client' || userRole === 'client') {
        setRole('client');
        return;
      }

      if (userStr) {
        const user = JSON.parse(userStr);
        const type = (user.user_type || user.role || '').toLowerCase();
        if (type === 'client') {
          setRole('client');
          return;
        }
      }
    } catch {
      /* storage errors fallback */
    }

    setRole('freelancer');
  }, [searchParams]);

  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400" />
      </div>
    );
  }

  return role === 'client' ? <ClientOnboarding /> : <Onboarding />;
};

export default OnboardingPage;

