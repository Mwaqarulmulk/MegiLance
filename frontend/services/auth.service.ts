import api, { setAuthToken, clearAuthData } from '@/lib/api';

export interface User {
  id: number;
  email: string;
  name: string;
  user_type: 'client' | 'freelancer' | 'admin';
  role: string;
  bio?: string;
  skills?: string;
  hourly_rate?: number;
  profile_image_url?: string;
  avatar_url?: string;
  location?: string;
  title?: string;
  is_verified?: boolean;
  email_verified?: boolean;
  joined_at?: string;
  profile_completed?: boolean;
}

interface UserApiResponse {
  id: number | string;
  email: string;
  name?: string;
  full_name?: string;
  user_type?: string;
  role?: string;
  bio?: string;
  skills?: string;
  hourly_rate?: number;
  profile_image_url?: string;
  avatar_url?: string;
  location?: string;
  title?: string;
  is_verified?: boolean;
  email_verified?: boolean;
  notification_count?: number;
  joined_at?: string;
  profile_completed?: boolean;
}

export function normalizeUser(userData: UserApiResponse): User {
  if (!userData?.email || !userData.id) {
    throw new Error('Invalid user data received from API');
  }
  const loginRole = typeof window !== 'undefined'
    ? localStorage.getItem('ml_user_role')
    : null;
  const userType = (
    userData.user_type || userData.role || 'client'
  ).toLowerCase() as User['user_type'];
  const effectiveType =
    loginRole && ['admin', 'freelancer', 'client'].includes(loginRole)
      ? (loginRole as User['user_type'])
      : userType;

  return {
    id: Number(userData.id),
    email: userData.email,
    name: userData.name || userData.full_name || '',
    user_type: effectiveType,
    role: effectiveType,
    bio: userData.bio,
    skills: userData.skills,
    hourly_rate: userData.hourly_rate,
    profile_image_url: userData.profile_image_url || userData.avatar_url,
    avatar_url: userData.avatar_url,
    location: userData.location,
    title: userData.title,
    is_verified: userData.is_verified,
    email_verified: userData.email_verified,
    joined_at: userData.joined_at,
    profile_completed: userData.profile_completed,
  };
}

export interface CurrentUser {
  id: number;
  name: string;
  fullName: string;
  email: string;
  avatar: string;
  profile_image_url?: string;
  user_type: string;
  notificationCount: number;
}

export function normalizeCurrentUser(userData: UserApiResponse): CurrentUser {
  const name = userData.name || userData.full_name || 'User';
  return {
    id: Number(userData.id),
    name,
    fullName: name,
    email: userData.email,
    avatar: userData.profile_image_url || userData.avatar_url || '/images/avatars/avatar-1.png',
    profile_image_url: userData.profile_image_url,
    user_type: userData.role || userData.user_type || 'client',
    notificationCount: (userData as any).notification_count || 0,
  };
}

export function getRedirectPath(userType: string, returnTo?: string | null): string {
  if (returnTo?.startsWith('/') && !returnTo.startsWith('//')) {
    return returnTo;
  }
  if (userType === 'admin') return '/admin/dashboard';
  if (userType === 'freelancer') return '/freelancer/dashboard';
  const onboardingComplete = typeof window !== 'undefined'
    ? localStorage.getItem('onboarding_complete') === 'true'
    : false;
  return onboardingComplete ? '/client/dashboard' : '/onboarding/client';
}

export function setupTokenRefresh(refreshIntervalRef?: { current: ReturnType<typeof setInterval> | null }) {
  if (refreshIntervalRef?.current) clearInterval(refreshIntervalRef.current);
  const id = setInterval(async () => {
    try {
      const refreshed = await api.auth.refreshToken();
      if (refreshed?.access_token) {
        setAuthToken(refreshed.access_token);
      }
    } catch {
      // handled by 401 interceptor in core.ts
    }
  }, 25 * 60 * 1000);
  if (refreshIntervalRef) refreshIntervalRef.current = id;
  return id;
}

export function broadcastLogout() {
  localStorage.setItem('auth_logout_broadcast', 'true');
  localStorage.removeItem('auth_logout_broadcast');
}
