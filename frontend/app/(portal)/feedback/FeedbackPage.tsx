'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/app/components/atoms/Button/Button';
import Input from '@/app/components/atoms/Input/Input';
import Textarea from '@/app/components/atoms/Textarea/Textarea';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import { ScrollReveal } from '@/app/components/Animations/ScrollReveal';
import {
  Bug,
  Lightbulb,
  MessageSquare,
  Star,
  CheckCircle2,
  Send,
  AlertTriangle,
  Zap,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { apiFetch } from '@/lib/api/core';

type FeedbackType = 'bug_report' | 'feature_request' | 'general' | 'improvement' | 'complaint';
type Priority = 'low' | 'medium' | 'high' | 'critical';

interface FeedbackTypeOption {
  value: FeedbackType;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const FEEDBACK_TYPES: FeedbackTypeOption[] = [
  {
    value: 'bug_report',
    label: 'Bug Report',
    icon: <Bug size={22} />,
    description: 'Something is broken or not working as expected',
    color: 'red',
  },
  {
    value: 'feature_request',
    label: 'Feature Request',
    icon: <Lightbulb size={22} />,
    description: 'Suggest a new feature or capability',
    color: 'amber',
  },
  {
    value: 'improvement',
    label: 'Improvement',
    icon: <Zap size={22} />,
    description: 'An existing feature could work better',
    color: 'blue',
  },
  {
    value: 'general',
    label: 'General Feedback',
    icon: <MessageSquare size={22} />,
    description: 'Share your thoughts or experience',
    color: 'green',
  },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-500' },
  { value: 'medium', label: 'Medium', color: 'text-amber-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'critical', label: 'Critical', color: 'text-red-500' },
];

export default function FeedbackPage() {
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const isDark = resolvedTheme === 'dark';

  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) { setError('Please choose a feedback type.'); return; }
    if (!title.trim()) { setError('Please provide a title.'); return; }
    if (!description.trim()) { setError('Please describe the issue or suggestion.'); return; }

    setSubmitting(true);
    setError('');
    try {
      await apiFetch('/user-feedback', {
        method: 'POST',
        body: JSON.stringify({
          feedback_type: selectedType,
          title: title.trim(),
          description: description.trim(),
          category: priority,
          rating: rating > 0 ? rating : null,
          page_url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cardBase = cn(
    'rounded-xl border p-5 cursor-pointer transition-all duration-200',
    isDark
      ? 'border-white/10 hover:border-indigo-500/50 bg-white/5'
      : 'border-gray-200 hover:border-indigo-400 bg-white hover:shadow-md'
  );

  const cardSelected = isDark
    ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/50'
    : 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-400 shadow-md';

  if (submitted) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="flex flex-col items-center gap-6"
          >
            <div className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center',
              isDark ? 'bg-green-500/20' : 'bg-green-50'
            )}>
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <div>
              <h1 className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>
                Thank you for your feedback!
              </h1>
              <p className={cn('text-base max-w-md', isDark ? 'text-white/60' : 'text-gray-500')}>
                We&apos;ve received your {selectedType?.replace('_', ' ')} and our team will review it shortly.
                Your input helps us build a better platform.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {
                setSubmitted(false); setSelectedType(null);
                setTitle(''); setDescription(''); setRating(0);
              }}>
                Submit Another
              </Button>
              <Button variant="primary" onClick={() => history.back()}>
                Back to Portal
              </Button>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ScrollReveal>
          <div className="mb-8">
            <h1 className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>
              Report an Issue or Share Feedback
            </h1>
            <p className={cn('text-sm', isDark ? 'text-white/60' : 'text-gray-500')}>
              Help us improve MegiLance. All reports are reviewed by our team within 24 hours.
            </p>
          </div>
        </ScrollReveal>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Type */}
          <ScrollReveal delay={0.05}>
            <div>
              <h2 className={cn('text-sm font-semibold uppercase tracking-wider mb-3', isDark ? 'text-white/50' : 'text-gray-400')}>
                1. What kind of feedback is this?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {FEEDBACK_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={cn(cardBase, selectedType === type.value && cardSelected)}
                  >
                    <div className="flex items-start gap-3 text-left">
                      <div className={cn(
                        'mt-0.5 p-2 rounded-lg flex-shrink-0',
                        type.color === 'red' && (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-500'),
                        type.color === 'amber' && (isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-500'),
                        type.color === 'blue' && (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-500'),
                        type.color === 'green' && (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-500'),
                      )}>
                        {type.icon}
                      </div>
                      <div>
                        <div className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-gray-900')}>
                          {type.label}
                        </div>
                        <div className={cn('text-xs mt-0.5', isDark ? 'text-white/50' : 'text-gray-500')}>
                          {type.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Step 2: Details */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-4">
              <h2 className={cn('text-sm font-semibold uppercase tracking-wider mb-3', isDark ? 'text-white/50' : 'text-gray-400')}>
                2. Describe the issue or suggestion
              </h2>
              <Input
                id="title"
                label="Title"
                placeholder={
                  selectedType === 'bug_report' ? 'e.g. Login button unresponsive on mobile' :
                  selectedType === 'feature_request' ? 'e.g. Add CSV export for earnings report' :
                  'Brief summary of your feedback'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                id="description"
                label="Description"
                placeholder={
                  selectedType === 'bug_report'
                    ? 'Steps to reproduce:\n1. \n2. \n\nExpected behavior:\n\nActual behavior:'
                    : 'Please provide as much detail as possible...'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                required
              />
            </div>
          </ScrollReveal>

          {/* Step 3: Priority & Rating */}
          <ScrollReveal delay={0.15}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className={cn('text-sm font-semibold uppercase tracking-wider mb-3', isDark ? 'text-white/50' : 'text-gray-400')}>
                  3. Priority
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                        priority === p.value
                          ? (isDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-600 border-indigo-600 text-white')
                          : (isDark ? 'border-white/10 text-white/60 hover:border-white/30' : 'border-gray-200 text-gray-500 hover:border-gray-400')
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className={cn('text-sm font-semibold uppercase tracking-wider mb-3', isDark ? 'text-white/50' : 'text-gray-400')}>
                  4. Overall experience
                </h2>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        size={28}
                        className={cn(
                          'transition-colors',
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : (isDark ? 'text-white/20' : 'text-gray-300')
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitting}
              iconBefore={<Send size={18} />}
            >
              Submit Feedback
            </Button>
            <p className={cn('text-xs', isDark ? 'text-white/40' : 'text-gray-400')}>
              Submitted as {user?.name || user?.email || 'anonymous'}
            </p>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
