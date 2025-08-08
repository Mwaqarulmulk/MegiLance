// @AI-HINT: Client Hire flow. Theme-aware, accessible multi-step UI with animated sections.
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './Hire.common.module.css';
import light from './Hire.light.module.css';
import dark from './Hire.dark.module.css';

const STEPS = ['Freelancer', 'Scope', 'Terms', 'Review'] as const;

type Step = typeof STEPS[number];

const Hire: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const params = useSearchParams();

  const [step, setStep] = useState<Step>('Freelancer');
  const [freelancerId, setFreelancerId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rateType, setRateType] = useState<'Hourly' | 'Fixed'>('Hourly');
  const [rate, setRate] = useState('');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    const f = params.get('freelancer');
    if (f) setFreelancerId(f);
  }, [params]);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const sectionVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });

  const currentIndex = useMemo(() => STEPS.indexOf(step), [step]);

  const canNext = useMemo(() => {
    switch (step) {
      case 'Freelancer':
        return Boolean(freelancerId);
      case 'Scope':
        return title.trim().length > 2 && description.trim().length > 10;
      case 'Terms':
        return rate.trim().length > 0 && Number(rate) > 0 && Boolean(startDate);
      case 'Review':
        return true;
    }
  }, [step, freelancerId, title, description, rate, startDate]);

  const goNext = () => {
    if (!canNext) return;
    if (currentIndex < STEPS.length - 1) setStep(STEPS[currentIndex + 1]);
  };

  const goBack = () => {
    if (currentIndex > 0) setStep(STEPS[currentIndex - 1]);
  };

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <header ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <div>
            <h1 className={common.title}>Hire a Freelancer</h1>
            <p className={cn(common.subtitle, themed.subtitle)}>Complete the steps to send a hiring request.</p>
          </div>
          <nav className={common.steps} aria-label="Progress">
            {STEPS.map((s) => (
              <span
                key={s}
                className={cn(common.step, themed.step, s === step && cn(common.stepActive, themed.stepActive))}
                aria-current={s === step ? 'step' : undefined}
              >
                {s}
              </span>
            ))}
          </nav>
        </header>

        <section ref={sectionRef} className={cn(common.section, themed.section, sectionVisible ? common.isVisible : common.isNotVisible)}>
          {step === 'Freelancer' && (
            <div role="group" aria-labelledby="freelancer-title">
              <h2 id="freelancer-title" className={cn(common.sectionTitle, themed.sectionTitle)}>Select Freelancer</h2>
              <label htmlFor="freelancer" className={common.srOnly}>Freelancer ID</label>
              <input
                id="freelancer"
                className={cn(common.input, themed.input)}
                placeholder="Enter Freelancer ID or paste from profiles"
                value={freelancerId}
                onChange={(e) => setFreelancerId(e.target.value)}
                aria-invalid={freelancerId ? 'false' : 'true'}
              />
            </div>
          )}

          {step === 'Scope' && (
            <div role="group" aria-labelledby="scope-title">
              <h2 id="scope-title" className={cn(common.sectionTitle, themed.sectionTitle)}>Define Scope</h2>
              <label htmlFor="title" className={common.srOnly}>Title</label>
              <input
                id="title"
                className={cn(common.input, themed.input)}
                placeholder="e.g., Build a mobile app MVP"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={title.trim().length > 2 ? 'false' : 'true'}
              />
              <label htmlFor="desc" className={common.srOnly}>Description</label>
              <textarea
                id="desc"
                className={cn(common.textarea, themed.textarea)}
                placeholder="Describe scope, deliverables, timelines, and constraints."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                aria-invalid={description.trim().length > 10 ? 'false' : 'true'}
              />
            </div>
          )}

          {step === 'Terms' && (
            <div role="group" aria-labelledby="terms-title">
              <h2 id="terms-title" className={cn(common.sectionTitle, themed.sectionTitle)}>Terms</h2>
              <div className={common.row}>
                <div>
                  <label htmlFor="rateType" className={common.srOnly}>Rate Type</label>
                  <select id="rateType" className={cn(common.select, themed.select)} value={rateType} onChange={(e) => setRateType(e.target.value as any)}>
                    <option>Hourly</option>
                    <option>Fixed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="rate" className={common.srOnly}>Rate</label>
                  <input id="rate" className={cn(common.input, themed.input)} placeholder={rateType === 'Hourly' ? '$/hr' : 'Total $'} value={rate} onChange={(e) => setRate(e.target.value)} aria-invalid={Number(rate) > 0 ? 'false' : 'true'} />
                </div>
              </div>
              <div className={common.row}>
                <div>
                  <label htmlFor="start" className={common.srOnly}>Start Date</label>
                  <input id="start" className={cn(common.input, themed.input)} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-invalid={startDate ? 'false' : 'true'} />
                </div>
                <div aria-hidden="true" />
              </div>
            </div>
          )}

          {step === 'Review' && (
            <div role="group" aria-labelledby="review-title">
              <h2 id="review-title" className={cn(common.sectionTitle, themed.sectionTitle)}>Review & Confirm</h2>
              <ul role="list">
                <li role="listitem">Freelancer ID: {freelancerId || '—'}</li>
                <li role="listitem">Title: {title || '—'}</li>
                <li role="listitem">Rate: {rateType} {rate || '—'}</li>
                <li role="listitem">Start: {startDate || '—'}</li>
              </ul>
            </div>
          )}

          <div className={common.actions}>
            <button type="button" className={cn(common.button, 'secondary', themed.button)} onClick={goBack} disabled={currentIndex === 0} aria-disabled={currentIndex === 0 ? 'true' : 'false'}>
              Back
            </button>
            {step !== 'Review' ? (
              <button type="button" className={cn(common.button, 'primary', themed.button)} onClick={goNext} disabled={!canNext} aria-disabled={!canNext ? 'true' : 'false'}>
                Continue
              </button>
            ) : (
              <button type="button" className={cn(common.button, 'primary', themed.button)} onClick={() => alert('Request sent!')}>
                Send Request
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Hire;
