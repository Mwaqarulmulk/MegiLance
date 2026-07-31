// @AI-HINT: This is the Next.js route file for the profile page. Uses proper lowercase routing.
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStyles } from '@/app/hooks/useThemeMode';
import { cn } from '@/lib/utils';
import { getAuthToken } from '@/lib/api';
import Profile from './Profile';
import commonStyles from './ProfileRedirect.common.module.css';
import lightStyles from './ProfileRedirect.light.module.css';
import darkStyles from './ProfileRedirect.dark.module.css';

// @AI-HINT: Public /profile redirects to portal-scoped profile if a portal area is known
export default function ProfilePage() {
  const router = useRouter();
  const themeStyles = useThemeStyles(lightStyles, darkStyles);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and redirect to appropriate portal profile
    const checkAndRedirect = async () => {
      try {
        const area = window.localStorage.getItem('portal_area');
        const token = getAuthToken();
        
        if (token && area === 'client') {
          router.replace('/client/profile');
          return;
        } else if (token && area === 'freelancer') {
          router.replace('/freelancer/profile');
          return;
        } else if (token && area === 'admin') {
          router.replace('/admin/profile');
          return;
        } else if (token) {
          // Has token but no portal area - determine from user role or default to client
          router.replace('/client/profile');
          return;
        } else {
          // No token - redirect to login
          router.replace('/login?redirect=/profile');
          return;
        }
      } catch (_) {
        // On error, redirect to login
        router.replace('/login?redirect=/profile');
      }
      setChecking(false);
    };
    
    checkAndRedirect();
  }, [router]);

  // Show loading while checking authentication
  if (checking) {
    return (
      <div className={cn(commonStyles.loadingWrapper, themeStyles.loadingWrapper)}>
        <p>Redirecting to your profile...</p>
      </div>
    );
  }

  // Fallback: render profile component (should not reach here normally)
  return <Profile />;
}
