// @AI-HINT: Newsletter signup component with optimistic UI and basic validation.
'use client';
import React, { useState } from 'react';
import { useAnalytics } from '@/app/shared/analytics/AnalyticsProvider';

interface Props { compact?: boolean; }

const NewsletterSignup: React.FC<Props> = ({ compact }) => {
  const { track } = useAnalytics();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    track('newsletter_attempt');
    setTimeout(() => {
      setStatus('success');
      track('newsletter_subscribed');
    }, 800);
  };

  if (status === 'success') {
    return <p role="status" className="text-sm">Thanks! Check your inbox to confirm.</p>;
  }

  return (
    <form onSubmit={submit} className="flex gap-2 w-full max-w-sm" aria-label="Newsletter signup form">
      <input
        type="email"
        aria-label="Email address"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status==='error') setStatus('idle'); }}
        className="flex-1 rounded-md border px-3 py-2 text-sm bg-[var(--surface-elev)] border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        disabled={status==='loading'}
        required
      />
      <button
        type="submit"
        disabled={status==='loading'}
        className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--text-on-primary)] hover:brightness-105 disabled:opacity-50"
      >
        {status==='loading' ? '...' : compact ? 'Join' : 'Subscribe'}
      </button>
    </form>
  );
};

export default NewsletterSignup;
