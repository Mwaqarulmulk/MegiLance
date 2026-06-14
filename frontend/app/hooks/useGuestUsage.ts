'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '@/lib/api/core';

const STORAGE_KEY = 'megilance_ai_guest_usage';
const DAILY_LIMIT = 15;

interface GuestUsage {
  count: number;
  date: string;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function loadUsage(): GuestUsage {
  if (typeof window === 'undefined') return { count: 0, date: getToday() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, date: getToday() };
    const data = JSON.parse(raw);
    if (data.date !== getToday()) return { count: 0, date: getToday() };
    return data;
  } catch {
    return { count: 0, date: getToday() };
  }
}

function saveUsage(usage: GuestUsage) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch { /* ignore */ }
}

export function useGuestUsage() {
  const [usage, setUsage] = useState<GuestUsage>({ count: 0, date: getToday() });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!getAuthToken());
    setUsage(loadUsage());
  }, []);

  const trackUsage = useCallback(() => {
    if (isAuthenticated) return true;
    const current = loadUsage();
    if (current.count >= DAILY_LIMIT) return false;
    const updated = { count: current.count + 1, date: getToday() };
    saveUsage(updated);
    setUsage(updated);
    return true;
  }, [isAuthenticated]);

  const remaining = isAuthenticated ? Infinity : Math.max(0, DAILY_LIMIT - usage.count);
  const isLimitReached = !isAuthenticated && usage.count >= DAILY_LIMIT;

  return {
    isAuthenticated,
    usage: usage.count,
    remaining,
    isLimitReached,
    trackUsage,
    dailyLimit: DAILY_LIMIT,
  };
}
