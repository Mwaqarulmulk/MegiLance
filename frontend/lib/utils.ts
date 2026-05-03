import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// @AI-HINT: This is a standard utility function for combining CSS classes with Tailwind CSS.
// It uses `clsx` to handle conditional classes and `tailwind-merge` to resolve conflicting styles.

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a monetary amount with proper currency symbol and locale.
 * Uses Intl.NumberFormat for consistent display across the platform.
 */
export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
