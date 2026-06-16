// @AI-HINT: Error boundary for portal routes (dashboard, settings, etc.)
// Next.js error.js convention - catches runtime errors in the portal
'use client';

import React, { useEffect, useMemo } from 'react';
import { RefreshCw, Home } from 'lucide-react';
import { LottieAnimation, errorAlertAnimation } from '@/app/components/Animations/LottieAnimation';
import { reportError } from '@/lib/errorReporting';

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Portal error:', error);
    }
    reportError({
      source: 'frontend',
      severity: 'high',
      error_type: error.name || 'PortalRenderError',
      message: error.message || 'Render error (portal boundary)',
      stack: error.stack,
      context: { digest: error.digest, boundary: 'portal' },
    });
  }, [error]);

  const dashboardHref = useMemo(() => {
    if (typeof window === 'undefined') return '/client/dashboard';
    const role = localStorage.getItem('ml_user_role') || 'client';
    return `/${role}/dashboard`;
  }, []);

  return (
    <div
      className="flex items-center justify-center min-h-[60vh] p-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center max-w-lg space-y-5">
        <div className="flex justify-center">
          <LottieAnimation
            animationData={errorAlertAnimation}
            width={120}
            height={120}
            loop={false}
            keepLastFrame
            ariaLabel="Error illustration"
          />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm mx-auto">
          An unexpected error occurred while loading this section. Your data is safe.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs">
            <summary className="cursor-pointer text-gray-500 font-medium">Error details</summary>
            <pre className="mt-2 text-red-600 dark:text-red-400 whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          </details>
        )}
        
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4573df] text-white rounded-lg text-sm font-medium hover:bg-[#3a62c4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4573df] focus:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try again
          </button>
          <a
            href={dashboardHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
