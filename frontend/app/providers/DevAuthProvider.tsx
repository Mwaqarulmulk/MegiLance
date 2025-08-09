// @AI-HINT: DevAuthProvider enables a development-only credential-less auth bypass with mock user + role switching.
// It is activated when NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true'. In production builds it is inert.
'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

export type DevRole = 'admin' | 'client' | 'freelancer' | 'guest';
export type DevUser = {
  id: string;
  name: string;
  email: string;
  role: DevRole;
};

interface DevAuthContextValue {
  enabled: boolean;
  user: DevUser | null;
  setRole: (role: DevRole) => void;
  logout: () => void;
}

const DevAuthContext = createContext<DevAuthContextValue | undefined>(undefined);

function makeUser(role: DevRole): DevUser {
  const display = role.charAt(0).toUpperCase() + role.slice(1);
  return {
    id: `dev-${role}`,
    name: `Dev ${display}`,
    email: `${role}@dev.megi.lance`,
    role,
  };
}

export const DevAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const enabled = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';
  const [role, setRole] = useState<DevRole>('guest');

  // Persist role in localStorage for convenience during dev
  useEffect(() => {
    if (!enabled) return;
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('dev-role') : null;
    if (stored === 'admin' || stored === 'client' || stored === 'freelancer' || stored === 'guest') {
      setRole(stored);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    try {
      window.localStorage.setItem('dev-role', role);
    } catch {}
  }, [enabled, role]);

  const user = useMemo(() => (enabled ? makeUser(role) : null), [enabled, role]);

  const value = useMemo<DevAuthContextValue>(() => ({
    enabled,
    user,
    setRole: (r) => setRole(r),
    logout: () => setRole('guest'),
  }), [enabled, user]);

  return (
    <DevAuthContext.Provider value={value}>
      {children}
    </DevAuthContext.Provider>
  );
};

export function useDevAuth() {
  const ctx = useContext(DevAuthContext);
  if (!ctx) {
    throw new Error('useDevAuth must be used within DevAuthProvider');
  }
  return ctx;
}
