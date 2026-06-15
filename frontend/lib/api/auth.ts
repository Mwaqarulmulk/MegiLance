// @AI-HINT: Authentication API — login, register, 2FA, social auth
import { apiFetch, setAuthToken, setRefreshToken, clearAuthData } from './core';
import type { ResourceId } from './core';

interface AuthUser {
  id: string | number;
  email: string;
  name: string;
  full_name?: string;
  role: string;
  user_type?: string;
  requires_2fa?: boolean;
  bio?: string;
  skills?: string;
  hourly_rate?: number;
  profile_image_url?: string;
  avatar_url?: string;
  location?: string;
  title?: string;
  is_verified?: boolean;
  joined_at?: string;
  notification_count?: number;
  phone?: string;
  company?: string;
  website?: string;
  experience_level?: string;
  headline?: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  requires_2fa?: boolean;
  temp_token?: string;
}

interface RefreshResponse {
  access_token: string;
}

interface TwoFactorStatus {
  enabled: boolean;
}

interface TwoFactorEnableResponse {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const data = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.access_token);
    setRefreshToken(data.refresh_token);
    return data;
  },

  register: async (userData: { email: string; password: string; name: string; role: string }): Promise<LoginResponse> => {
    const data = await apiFetch<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    // Auto-login: store tokens so the user is authenticated immediately
    // after signup (the backend returns tokens on registration).
    setAuthToken(data.access_token);
    setRefreshToken(data.refresh_token);
    return data;
  },

  logout: async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Still clear local data even if backend call fails
    }
    clearAuthData();
  },

  refreshToken: async (): Promise<RefreshResponse> => {
    const data = await apiFetch<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    setAuthToken(data.access_token);
    return data;
  },

  me: (): Promise<AuthUser> => apiFetch<AuthUser>('/auth/me'),

  updateProfile: (data: Partial<AuthUser>): Promise<AuthUser> => apiFetch<AuthUser>('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  changePassword: (currentPassword: string, newPassword: string): Promise<{ message: string }> =>
    apiFetch<{ message: string }>('/users/me/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),

  get2FAStatus: (): Promise<TwoFactorStatus> => apiFetch<TwoFactorStatus>('/auth/2fa/status'),

  enable2FA: (code: string): Promise<TwoFactorEnableResponse> => apiFetch<TwoFactorEnableResponse>('/auth/2fa/enable', { 
    method: 'POST',
    body: JSON.stringify({ token: code }),
  }),

  setup2FA: (): Promise<{ secret: string; qr_uri: string }> => apiFetch('/auth/2fa/setup', { method: 'POST' }),

  verify2FA: (code: string) => apiFetch('/auth/2fa/verify', { 
    method: 'POST', 
    body: JSON.stringify({ token: code, is_backup_code: false }) 
  }),

  verify2FALogin: (code: string, tempToken: string, isBackupCode = false) => apiFetch<LoginResponse>('/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({ token: code, temp_token: tempToken, is_backup_code: isBackupCode }),
  }),

  verifyEmail: (token: string) => apiFetch('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }),

  resendVerification: () => apiFetch('/auth/resend-verification', { method: 'POST' }),

  disable2FA: () => apiFetch('/auth/2fa/disable', { method: 'POST' }),

  forgotPassword: (email: string): Promise<{ message: string }> =>
    apiFetch<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string): Promise<{ message: string }> =>
    apiFetch<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    }),
};

export const socialAuthApi = {
  getProviders: () => apiFetch('/social-auth/providers'),

  start: (provider: string, redirectUri: string, portalArea?: string, intent?: string) =>
    apiFetch('/social-auth/start', {
      method: 'POST',
      body: JSON.stringify({
        provider,
        redirect_uri: redirectUri,
        ...(portalArea ? { portal_area: portalArea } : {}),
        ...(intent ? { intent } : {}),
      }),
    }),

  complete: (code: string, state: string) =>
    apiFetch('/social-auth/complete', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    }),

  selectRole: (role: string) =>
    apiFetch('/social-auth/select-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  getLinkedAccounts: () => apiFetch<{ accounts: LinkedAccount[] }>('/social-auth/linked-accounts'),

  unlinkAccount: (provider: string) =>
    apiFetch(`/social-auth/linked-accounts/${provider}`, { method: 'DELETE' }),

  syncProfile: (provider: string, fields?: string[]) =>
    apiFetch('/social-auth/sync-profile', {
      method: 'POST',
      body: JSON.stringify({ provider, fields }),
    }),
};

export interface LinkedAccount {
  id: string;
  provider: string;
  provider_user_id: string;
  email: string;
  name: string;
  avatar_url?: string;
  linked_at: string;
}

export const twoFactorApi = {
  getStatus: () => apiFetch('/auth/2fa/status'),
  setup: () => apiFetch<{ secret: string; qr_uri: string }>('/auth/2fa/setup', { method: 'POST' }),
  enable: (code: string) => apiFetch('/auth/2fa/enable', { 
    method: 'POST',
    body: JSON.stringify({ token: code }),
  }),
  verify: (code: string) =>
    apiFetch('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ token: code, is_backup_code: false }),
    }),
  disable: () => apiFetch('/auth/2fa/disable', { method: 'POST' }),
  getBackupCodes: () => apiFetch('/auth/2fa/backup-codes'),
  regenerateBackupCodes: () => apiFetch('/auth/2fa/regenerate-backup-codes', { method: 'POST' }),
  verifyBackupCode: (code: string) =>
    apiFetch('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ token: code, is_backup_code: true }),
    }),
};
