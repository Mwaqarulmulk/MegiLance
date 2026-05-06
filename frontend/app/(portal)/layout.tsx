// @AI-HINT: This is the layout for all authenticated user portals. It uses the AppLayout component to provide a consistent shell with a sidebar and navbar.
// CRITICAL: This layout requires authentication - unauthenticated users are redirected to login.

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AppLayout from '../components/templates/AppLayout/AppLayout';
import { getAuthToken, clearAuthData } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { UnreadCountProvider } from '@/contexts/UnreadCountContext';
import Loading from '@/app/components/atoms/Loading/Loading';
import dynamic from 'next/dynamic';

// Lazy-load notification bell so it doesn't block initial auth render
const RealTimeNotifications = dynamic(
  () => import('@/app/components/AdvancedFeatures/RealTimeNotifications/RealTimeNotifications'),
  { ssr: false }
);

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: hookUser, isAuthenticated: useAuthIsAuthed, isLoading: authLoading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Try to get user from hook, fallback to localStorage for immediate layout check during redirect/refresh
    let user = hookUser;
    if (!user && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        if (stored) user = JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse stored user', e);
      }
    }

    const isAuthed = !!user;

    // If hook is still loading and we have no cached user, wait
    if (authLoading && !isAuthed) return;

    if (!isAuthed) {
      const currentPath = pathname || '/client/dashboard';
      setIsAuthenticated(false);
      router.replace(`/login?returnTo=${encodeURIComponent(currentPath)}`);
      return;
    }

    // ml_user_role: set only at login time, never overwritten by AppLayout.
    // This is the authoritative source for the user's intended portal area.
    // portal_area is NOT used here because AppLayout overwrites it on every
    // navigation to match the URL — making it useless for role enforcement.
    let loginRole: string | null = null;
    try { loginRole = window.localStorage.getItem('ml_user_role'); } catch { /* ignore */ }

    const apiRole = (user!.user_type || user!.role || 'client').toLowerCase();
    const role = (loginRole && ['admin', 'freelancer', 'client'].includes(loginRole))
      ? loginRole
      : apiRole;

    // Strict portal-area access: each role stays in their own area.
    if (pathname?.startsWith('/admin') && role !== 'admin') {
      router.replace(`/${role}/dashboard`);
      return;
    }
    if (pathname?.startsWith('/client') && role !== 'client') {
      router.replace(`/${role}/dashboard`);
      return;
    }
    if (pathname?.startsWith('/freelancer') && role !== 'freelancer') {
      router.replace(`/${role}/dashboard`);
      return;
    }

    // Ensure session properties match
    window.localStorage.setItem('portal_area', role);
    setIsAuthenticated(true);
  }, [pathname, router, useAuthIsAuthed, authLoading, hookUser]);

  // Show loading while checking authentication
  const hasUser = !!hookUser || (typeof window !== 'undefined' && !!localStorage.getItem('user'));
  if ((authLoading && !hasUser) || isAuthenticated === null) {
    return <Loading size="lg" text="Verifying authentication..." fullscreen />;
  }

  // Don't render if not authenticated (redirecting)
  if (!isAuthenticated) {
    return null;
  }

  const user = hookUser || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null);

  return (
    <UnreadCountProvider>
      <AppLayout>
        {children}
        {/* Global real-time notification bell — mounts once for the entire portal */}
        {user?.id && (
          <RealTimeNotifications
            userId={String(user.id)}
            maxDisplayed={8}
            autoMarkAsRead={false}
          />
        )}
      </AppLayout>
    </UnreadCountProvider>
  );
}
