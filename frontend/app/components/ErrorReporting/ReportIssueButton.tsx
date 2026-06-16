// @AI-HINT: Manual "Report an issue" widget — lets any user file a bug/suggestion
// that lands in the admin issue monitor (/admin/issues) alongside auto-captured errors.
'use client';

import React, { useState } from 'react';
import { Flag, Send, Loader2 } from 'lucide-react';
import Modal from '@/app/components/organisms/Modal/Modal';
import Button from '@/app/components/atoms/Button/Button';
import Textarea from '@/app/components/atoms/Textarea/Textarea';
import Input from '@/app/components/atoms/Input/Input';
import Select from '@/app/components/molecules/Select/Select';
import { Label } from '@/app/components/atoms/Label/Label';
import { useToaster } from '@/app/components/molecules/Toast/ToasterProvider';
import { reportError, ErrorSeverity } from '@/lib/errorReporting';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'Bug', label: '🐞 Something is broken' },
  { value: 'UI/Visual', label: '🎨 Visual / layout problem' },
  { value: 'Performance', label: '🐢 Slow or unresponsive' },
  { value: 'Suggestion', label: '💡 Suggestion / improvement' },
  { value: 'Other', label: '❔ Something else' },
];

const SEVERITY: { value: ErrorSeverity; label: string }[] = [
  { value: 'low', label: 'Low — minor annoyance' },
  { value: 'medium', label: 'Medium — affects my work' },
  { value: 'high', label: 'High — blocks me' },
  { value: 'critical', label: 'Critical — site unusable' },
];

interface Props {
  /** Render style: 'link' (footer/menu text) or 'button' (filled). */
  variant?: 'link' | 'button';
  className?: string;
}

export default function ReportIssueButton({ variant = 'link', className }: Props) {
  const toaster = useToaster();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('Bug');
  const [severity, setSeverity] = useState<ErrorSeverity>('medium');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasUser =
    typeof window !== 'undefined' && !!localStorage.getItem('user');

  const submit = async () => {
    if (message.trim().length < 5) {
      toaster.notify({ title: 'Add a bit more detail', description: 'Please describe the issue (min 5 characters).', variant: 'info' });
      return;
    }
    setSubmitting(true);
    try {
      await reportError({
        source: 'manual',
        severity,
        error_type: category,
        message: message.trim(),
        user_email: email.trim() || undefined,
        context: { reported_via: 'report-issue-widget' },
      });
      toaster.notify({ title: 'Thank you!', description: 'Your report was sent to our team. We’re on it.', variant: 'success' });
      setMessage('');
      setEmail('');
      setOpen(false);
    } catch {
      toaster.notify({ title: 'Could not send', description: 'Please try again in a moment.', variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {variant === 'button' ? (
        <Button variant="secondary" onClick={() => setOpen(true)} className={className} type="button">
          <Flag size={16} /> Report an issue
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn('inline-flex items-center gap-1.5 hover:underline', className)}
        >
          <Flag size={14} /> Report an issue
        </button>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Report an issue" size="small">
        <div className="space-y-4">
          <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: 0 }}>
            Found a bug or have a suggestion? Tell us what happened — it goes straight to our team.
          </p>

          <div>
            <Label htmlFor="ri-category">What kind of issue?</Label>
            <Select
              id="ri-category"
              options={CATEGORIES}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="ri-severity">How serious is it?</Label>
            <Select
              id="ri-severity"
              options={SEVERITY}
              value={severity}
              onChange={(e) => setSeverity(e.target.value as ErrorSeverity)}
            />
          </div>

          <div>
            <Label htmlFor="ri-message">Describe the issue</Label>
            <Textarea
              id="ri-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What did you do, and what went wrong? Steps to reproduce help us fix it faster."
              rows={5}
            />
          </div>

          {!hasUser && (
            <div>
              <Label htmlFor="ri-email">Your email (optional)</Label>
              <Input
                id="ri-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com — so we can follow up"
                fullWidth
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="ghost" onClick={() => setOpen(false)} type="button">Cancel</Button>
            <Button variant="primary" onClick={submit} disabled={submitting} type="button">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {submitting ? 'Sending…' : 'Send report'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
