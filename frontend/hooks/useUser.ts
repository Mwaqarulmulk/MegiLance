'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

// @AI-HINT: Hook to fetch current user profile from /api/auth/me endpoint.

/** Shape returned by /api/auth/me — includes optional legacy/alias fields */
interface MeResponse {
  id: number | string;
  name?: string;
  full_name?: string;
  email: string;
  role?: string;
  user_type?: string;
  profile_image_url?: string;
  avatar_url?: string;
  notification_count?: number;
}

export type CurrentUser = {
  id: number;
  name: string;
  fullName: string;
  email: string;
  avatar: string;
  profile_image_url?: string;
  user_type: string;
  notificationCount: number;
};

export function useUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const userData = await api.auth.me() as MeResponse;
        if (isMounted) {
          const name = userData.name || userData.full_name || 'User';
          setUser({
            id: Number(userData.id),
            name,
            fullName: name,
            email: userData.email,
            avatar: userData.profile_image_url || userData.avatar_url || '/images/avatars/avatar-1.png',
            profile_image_url: userData.profile_image_url,
            user_type: userData.role || userData.user_type || 'client',
            notificationCount: userData.notification_count || 0,
          });
        }
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load user');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  return { user, loading, error } as const;
} 