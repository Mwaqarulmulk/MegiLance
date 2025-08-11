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
import { loadHireDraft, saveHireDraft, submitHire, clearHireDraft } from '@/app/mocks/hires';

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
  const sectionRef = useRef<HTMLFormElement | null>(null);
  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const sectionVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });

  const currentIndex = useMemo(() => STEPS.indexOf(step), [step]);
  const progress = useMemo(() => Math.round(((currentIndex + 1) / STEPS.length) * 100), [currentIndex]);

  const canNext = useMemo(() => {
    switch (step) {
      case 'Freelancer':
        return Boolean(freelancerId.trim());
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

  // Draft persistence via mock API
  const [liveMessage, setLiveMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const d = loadHireDraft();
    if (d) {
      if (d.freelancerId) setFreelancerId(d.freelancerId);
      if (d.title) setTitle(d.title);
      if (d.description) setDescription(d.description);
      if (d.rateType) setRateType(d.rateType);
      if (typeof d.rate === 'number' && !Number.isNaN(d.rate)) setRate(String(d.rate));
      if (d.startDate) setStartDate(d.startDate);
      setLiveMessage('Loaded your saved draft.');
    }
  }, []);

  const saveDraft = () => {
    saveHireDraft({
      freelancerId,
      title,
      description,
      rateType,
      rate: rate ? Number(rate) : null,
      startDate,
      status: 'draft',
    });
    setLiveMessage('Draft saved.');
  };

  const resetForm = () => {
    setFreelancerId('');
    setTitle('');
    setDescription('');
    setRateType('Hourly');
    setRate('');
    setStartDate('');
    setStep('Freelancer');
    clearHireDraft();
    setLiveMessage('Draft cleared.');
  };

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <header ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)} role="region" aria-labelledby="hire-page-title">
          <div>
            <h1 id="hire-page-title" className={common.title}>Hire a Freelancer</h1>
            <p className={cn(common.subtitle, themed.subtitle)}>Complete the steps to send a hiring request.</p>
          </div>
          <div
            className={common.progressBar}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Step ${currentIndex + 1} of ${STEPS.length}: ${step}`}
            title={`Step ${currentIndex + 1} of ${STEPS.length}: ${step}`}
            style={{ '--progress-width': `${progress}%` } as React.CSSProperties}
          >
            <div className={cn(common.progressIndicator, themed.progressIndicator)} />
          </div>
          <nav className={common.stepIndicator} aria-label="Form Steps">
            {STEPS.map((s, i) => (
              <button
                key={s}
                type="button"
                className={cn(common.step, themed.step, s === step && themed.stepActive, s === step && common.stepActive)}
                onClick={() => setStep(s)}
                disabled={i > currentIndex && !canNext}
                aria-current={s === step ? 'step' : undefined}
                title={`Go to ${s} step`}
              >
                {s}
              </button>
            ))}
          </nav>
        </header>

        <form
          ref={sectionRef}
          className={cn(common.form, sectionVisible ? common.isVisible : common.isNotVisible)}
          aria-labelledby="hire-page-title"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="srOnly" aria-live="polite" role="status">
            {liveMessage}
          </div>

          {step === 'Freelancer' && (
            <section aria-labelledby="freelancer-title">
              <h2 id="freelancer-title" className={cn(common.sectionTitle, themed.sectionTitle)}>Select Freelancer</h2>
              <div className={common.row}>
                <div className={common.field}>
                  <label htmlFor="freelancerId" className={common.srOnly}>Freelancer ID</label>
                  <input
                    id="freelancerId"
                    className={cn(common.input, themed.input)}
                    placeholder="Enter Freelancer ID (e.g., from profile URL)"
                    value={freelancerId}
                    onChange={(e) => setFreelancerId(e.target.value)}
                    aria-invalid={!freelancerId.trim()}
                    title="Enter the ID of the freelancer you want to hire"
                  />
                </div>
              </div>
            </section>
          )}

          {step === 'Scope' && (
            <section aria-labelledby="scope-title">
              <h2 id="scope-title" className={cn(common.sectionTitle, themed.sectionTitle)}>Project Scope</h2>
              <div className={common.row}>
                <div className={common.field}>
                  <label htmlFor="title" className={common.srOnly}>Project Title</label>
                  <input
                    id="title"
                    className={cn(common.input, themed.input)}
                    placeholder="Project Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    aria-invalid={title.trim().length < 3}
                    aria-describedby="title-help"
                    title="Enter a short, descriptive project title"
                  />
                  <div id="title-help" className={common.help}>At least 3 characters</div>
                </div>
              </div>
              <div className={common.row}>
                <div className={common.field}>
                  <label htmlFor="description" className={common.srOnly}>Project Description</label>
                  <textarea
                    id="description"
                    className={cn(common.textarea, themed.textarea)}
                    placeholder="Project Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    aria-invalid={description.trim().length < 11}
                    aria-describedby="desc-help"
                    title="Describe the project deliverables, requirements, and timeline"
                  />
                  <div id="desc-help" className={common.help}>At least 10 characters. You have {500 - description.length} characters remaining.</div>
                </div>
              </div>
            </section>
          )}

          {step === 'Terms' && (
            <section aria-labelledby="terms-title">
              <h2 id="terms-title" className={cn(common.sectionTitle, themed.sectionTitle)}>Payment Terms</h2>
              <div className={common.row}>
                <div className={common.field}>
                  <label htmlFor="rateType" className={common.srOnly}>Rate Type</label>
                  <select id="rateType" className={cn(common.select, themed.select)} value={rateType} onChange={(e) => setRateType(e.target.value as 'Hourly' | 'Fixed')} title="Select the payment rate type">
                    <option>Hourly</option>
                    <option>Fixed</option>
                  </select>
                </div>
                <div className={common.field}>
                  <label htmlFor="rate" className={common.srOnly}>Rate</label>
                  <input
                    id="rate"
                    className={cn(common.input, themed.input)}
                    placeholder={rateType === 'Hourly' ? '$/hr' : 'Total $'}
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    aria-describedby="rate-help"
                    aria-invalid={!rate.trim() || Number(rate) <= 0}
                    inputMode="decimal"
                    title={rateType === 'Hourly' ? 'Enter the hourly rate' : 'Enter the total fixed price'}
                  />
                  <div id="rate-help" className={common.help}>Enter a positive number. Example: 45 or 1500</div>
                </div>
              </div>
              <div className={common.row}>
                <div className={common.field}>
                  <label htmlFor="start" className={common.srOnly}>Start Date</label>
                  <input id="start" className={cn(common.input, themed.input)} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-invalid={!startDate} title="Select the project start date" />
                </div>
              </div>
            </section>
          )}

          {step === 'Review' && (
            <section aria-labelledby="review-title">
              <h2 id="review-title" className={cn(common.sectionTitle, themed.sectionTitle)}>Review & Confirm</h2>
              <ul role="list" className={common.reviewList}>
                <li role="listitem"><span>Freelancer ID:</span> <span>{freelancerId || '—'}</span></li>
                <li role="listitem"><span>Title:</span> <span>{title || '—'}</span></li>
                <li role="listitem"><span>Rate:</span> <span>{rateType} {rate || '—'}</span></li>
                <li role="listitem"><span>Start:</span> <span>{startDate || '—'}</span></li>
              </ul>
            </section>
          )}

          <div className={common.actions}>
            <button type="button" className={cn(common.button, themed.button)} onClick={saveDraft} title="Save your progress as a draft">Save Draft</button>
            <button type="button" className={cn(common.button, 'secondary', themed.button)} onClick={resetForm} title="Clear the form and start over">Reset</button>
            <button type="button" className={cn(common.button, 'secondary', themed.button)} onClick={goBack} disabled={currentIndex === 0} title="Go to the previous step">Back</button>
            {step !== 'Review' ? (
              <button type="button" className={cn(common.button, 'primary', themed.button)} onClick={goNext} disabled={!canNext} title="Continue to the next step">Continue</button>
            ) : (
              <button
                type="submit"
                className={cn(common.button, 'primary', themed.button)}
                onClick={async () => {
                  if (!canNext) return;
                  setSubmitting(true);
                  setLiveMessage('Sending hire request…');
                  try {
                    const res = await submitHire({
                      freelancerId,
                      title,
                      description,
                      rateType,
                      rate: Number(rate),
                      startDate,
                    });
                    setLiveMessage(`Success: ${res.message} (id: ${res.id})`);
                    resetForm();
                  } catch (e) {
                    setLiveMessage('Error sending request. Please try again.');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
                aria-busy={submitting}
                title="Submit your hiring request to the freelancer"
              >
                {submitting ? 'Sending…' : 'Send Request'}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
};


export default Hire;



