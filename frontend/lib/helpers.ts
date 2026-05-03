// @AI-HINT: Type-safe fetch utilities following Next.js App Router patterns
// Includes error handling, request deduplication hints, and proper typing

/**
 * Custom error class for API errors with status codes
 */
export class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

/**
 * Type-safe fetch wrapper with automatic JSON parsing and error handling
 * 
 * Usage:
 * ```ts
 * const data = await fetchJSON<User[]>('/api/users');
 * const user = await fetchJSON<User>('/api/users/1', { cache: 'no-store' });
 * ```
 */
export async function fetchJSON<T>(
  url: string,
  options?: RequestInit & { 
    timeout?: number;
  }
): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options || {};
  
  // Use AbortController for timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions?.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        // Response body is not JSON
      }
      
      const message = 
        (errorData as any)?.detail || 
        (errorData as any)?.message || 
        `HTTP ${response.status}: ${response.statusText}`;
      
      throw new FetchError(message, response.status, errorData);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof FetchError) throw error;
    if ((error as Error).name === 'AbortError') {
      throw new FetchError('Request timed out', 408);
    }
    throw new FetchError(
      (error as Error).message || 'Network error',
      0
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Format a date string for display
 * Uses the user's locale for proper formatting
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format a relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(d);
}

/**
 * Format currency values
 */
export function formatCurrency(
  amount: number, 
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format large numbers (1000 -> 1K, 1000000 -> 1M)
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Debounce function for search inputs, scroll handlers, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Generate initials from a name (for avatars)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/**
 * Safe JSON parse with fallback
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Check if we're running on the server
 */
export const isServer = typeof window === 'undefined';

/**
 * Check if we're in production
 */
export const isProd = process.env.NODE_ENV === 'production';
