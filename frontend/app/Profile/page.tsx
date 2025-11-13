// @AI-HINT: This is the Next.js route file for the profile page. Uses proper lowercase routing.
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Profile from '../components/Profile/UserProfile/UserProfile';

// @AI-HINT: Public /Profile redirects to portal-scoped profile if a portal area is known
export default function ProfilePage() {
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    try {
      const area = window.localStorage.getItem('portal_area');
      if (area === 'client') {
        router.replace('/client/profile');
        setRedirected(true);
      } else if (area === 'freelancer') {
        router.replace('/freelancer/profile');
        setRedirected(true);
      } else if (area === 'admin') {
        router.replace('/admin/profile');
        setRedirected(true);
      }
    } catch (_) {
      // ignore
    }
  }, [router]);

  // Fallback: render public profile if no portal area
  if (redirected) return null;
  return <Profile userId="0" />;
}
