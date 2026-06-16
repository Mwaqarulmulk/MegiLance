// @AI-HINT: Client-side error/issue reporting. Auto-captures runtime errors (window
// errors, unhandled rejections, React error boundaries) and powers the manual
// "Report an issue" widget. Posts to /api/v1/error-reports. Always fire-and-forget.
import { getAuthToken } from './api/core';

export type ErrorSource = 'frontend' | 'manual';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ReportPayload {
  source?: ErrorSource;
  severity?: ErrorSeverity;
  error_type?: string;
  message: string;
  stack?: string;
  path?: string;
  context?: Record<string, unknown>;
  user_email?: string;
}

// Session-level throttle so a noisy loop can't flood the backend.
const _sent = new Set<string>();
let _count = 0;
const MAX_PER_SESSION = 30;

function fingerprint(p: ReportPayload): string {
  return `${p.source || 'frontend'}|${p.error_type || ''}|${(p.message || '').slice(0, 120)}|${p.path || ''}`;
}

/** Report an error/issue. Never throws; safe to call from anywhere. */
export async function reportError(payload: ReportPayload): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    if (!payload.message) return;

    const fp = fingerprint(payload);
    // Manual reports always go through; auto reports are de-duped per session.
    if (payload.source !== 'manual') {
      if (_sent.has(fp)) return;
      if (_count >= MAX_PER_SESSION) return;
      _sent.add(fp);
      _count += 1;
    }

    const body = {
      source: payload.source || 'frontend',
      severity: payload.severity || 'medium',
      error_type: payload.error_type || 'Error',
      message: payload.message.slice(0, 2000),
      stack: payload.stack?.slice(0, 8000),
      path: payload.path || window.location?.pathname,
      context: {
        ...(payload.context || {}),
        href: window.location?.href,
        viewport:
          typeof window.innerWidth === 'number'
            ? `${window.innerWidth}x${window.innerHeight}`
            : undefined,
      },
      user_email: payload.user_email,
    };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/v1/error-reports', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
      keepalive: true, // survive page unload
    }).catch(() => {});
  } catch {
    // Reporting must never break the app.
  }
}

let _installed = false;

/** Install global handlers for uncaught errors + unhandled promise rejections. */
export function installGlobalErrorHandlers(): void {
  if (_installed || typeof window === 'undefined') return;
  _installed = true;

  window.addEventListener('error', (event) => {
    const err = event.error;
    reportError({
      source: 'frontend',
      severity: 'high',
      error_type: err?.name || 'WindowError',
      message: err?.message || event.message || 'Uncaught error',
      stack: err?.stack,
      context: {
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason: any = event.reason;
    reportError({
      source: 'frontend',
      severity: 'high',
      error_type: reason?.name || 'UnhandledRejection',
      message:
        (typeof reason === 'string' ? reason : reason?.message) || 'Unhandled promise rejection',
      stack: reason?.stack,
    });
  });
}
