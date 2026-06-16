// @AI-HINT: Mounts once (in AppChrome) to install global JS error + promise-rejection
// handlers that auto-report to the admin issue monitor. Renders nothing.
'use client';

import { useEffect } from 'react';
import { installGlobalErrorHandlers } from '@/lib/errorReporting';

export default function GlobalErrorReporter() {
  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);
  return null;
}
