import { APIError } from '@/lib/api/core';

/**
 * Wraps an async operation with a fallback value. If the promise rejects,
 * returns the fallback and logs a warning. Prevents dashboard-wide failures
 * from a single failed API call.
 */
export async function fetchWithFallback<T>(
  promise: Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    if (context) {
      console.warn(`[${context}] Fetch failed, using fallback:`, err);
    }
    return fallback;
  }
}

/**
 * Extracts items from various API list response shapes.
 * Handles paginated { items, total, page } and bare array responses.
 */
export function unwrapResponse<T>(response: unknown, field?: string): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response as T[];
  if (field && typeof response === 'object' && response !== null) {
    const val = (response as Record<string, unknown>)[field];
    if (Array.isArray(val)) return val as T[];
  }
  const obj = response as Record<string, unknown>;
  for (const key of ['items', 'data', 'results', 'projects', 'users', 'notifications']) {
    if (Array.isArray(obj[key])) return obj[key] as T[];
  }
  return [];
}

/**
 * Extract a user-friendly error message from any thrown value.
 */
export function errorToString(err: unknown, fallback = 'An unexpected error occurred'): string {
  if (err instanceof APIError) return err.message;
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

/**
 * Extract a total count from a paginated API response.
 */
export function getTotalCount(response: unknown): number {
  if (!response || typeof response !== 'object') return 0;
  const obj = response as Record<string, unknown>;
  if (typeof obj.total === 'number') return obj.total;
  if (typeof obj.count === 'number') return obj.count;
  if (typeof obj.total_count === 'number') return obj.total_count;
  if (Array.isArray(obj.items)) return obj.items.length;
  return 0;
}
