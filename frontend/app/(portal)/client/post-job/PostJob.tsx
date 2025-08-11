// @AI-HINT: Orchestrator for the multi-step job posting flow. Manages state, validation, and navigation between steps.
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle } from 'lucide-react';

import { PostJobData, PostJobErrors } from './PostJob.types';
import { loadDraft, saveDraft, submitJob, clearDraft } from '@/app/mocks/jobs';

import Button from '@/app/components/Button/Button';
import StepIndicator from './components/StepIndicator/StepIndicator';
import StepDetails from './components/StepDetails/StepDetails';
import StepScope from './components/StepScope/StepScope';
import StepBudget from './components/StepBudget/StepBudget';
import StepReview from './components/StepReview/StepReview';

import common from './PostJob.common.module.css';
import light from './PostJob.light.module.css';
import dark from './PostJob.dark.module.css';

const STEPS = ['Details', 'Scope', 'Budget', 'Review'] as const;
type Step = typeof STEPS[number];

const PostJob: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const [data, setData] = useState<PostJobData>({
    title: '',
    category: '',
    description: '',
    skills: [],
    budgetType: 'Fixed',
    budgetAmount: null,
    timeline: '1-2 weeks',
  });
  const [errors, setErrors] = useState<PostJobErrors>({});
  const [currentStep, setCurrentStep] = useState<Step>('Details');
  const [submitting, setSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setData(prev => ({ ...prev, ...draft }));
    }
  }, []);

  const updateData = useCallback((update: Partial<PostJobData>) => {
    setData(prev => {
      const newData = { ...prev, ...update };
      saveDraft(newData);
      return newData;
    });
  }, []);

  const validateStep = (step: Step): boolean => {
    const newErrors: PostJobErrors = {};
    switch (step) {
      case 'Details':
        if (!data.title.trim()) newErrors.title = 'Job title is required.';
        if (!data.category) newErrors.category = 'Please select a category.';
        break;
      case 'Scope':
        if (data.description.trim().length < 50) newErrors.description = 'Description must be at least 50 characters.';
        if (data.skills.length === 0) newErrors.skills = 'Please add at least one skill.';
        break;
      case 'Budget':
        if (!data.budgetAmount || data.budgetAmount <= 0) newErrors.budgetAmount = 'Please enter a valid budget amount.';
        if (!data.timeline) newErrors.timeline = 'Please select a timeline.';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const currentIndex = STEPS.indexOf(currentStep);
      if (currentIndex < STEPS.length - 1) {
        setCurrentStep(STEPS[currentIndex + 1]);
      }
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const goToStep = (step: Step) => {
    const currentIndex = STEPS.indexOf(currentStep);
    const targetIndex = STEPS.indexOf(step);
    if (targetIndex < currentIndex) {
      setCurrentStep(step);
    }
  };

  const onSubmit = async () => {
    for (const step of STEPS) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }
    setSubmitting(true);
    try {
      await submitJob(data);
      setSubmissionState('success');
      clearDraft();
    } catch (err) {
      setSubmissionState('error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'Details': return <StepDetails data={data} updateData={updateData} errors={errors} />;
      case 'Scope': return <StepScope data={data} updateData={updateData} errors={errors} />;
      case 'Budget': return <StepBudget data={data} updateData={updateData} errors={errors} />;
      case 'Review': return <StepReview data={data} />;
      default: return null;
    }
  };

  if (submissionState === 'success') {
    return (
      <div className={cn(common.centered_container, themed.centered_container)}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={common.result_card}>
          <CheckCircle className={cn(common.result_icon, common.success_icon, themed.success_icon)} size={48} />
          <h2 className={cn(common.result_title, themed.result_title)}>Job Posted Successfully!</h2>
          <p className={cn(common.result_message, themed.result_message)}>Your job is now live. You will be notified when freelancers start applying.</p>
          <Button onClick={() => window.location.reload()}>Post Another Job</Button>
        </motion.div>
      </div>
    );
  }

  if (submissionState === 'error') {
    return (
      <div className={cn(common.centered_container, themed.centered_container)}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={common.result_card}>
          <AlertTriangle className={cn(common.result_icon, common.error_icon, themed.error_icon)} size={48} />
          <h2 className={cn(common.result_title, themed.result_title)}>Submission Failed</h2>
          <p className={cn(common.result_message, themed.result_message)}>Something went wrong. Please try submitting again.</p>
          <Button onClick={() => setSubmissionState('idle')}>Try Again</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <main className={cn(common.main, themed.main)}>
      <div className={common.container}>
        <header className={common.header}>
          <h1 className={cn(common.title, themed.title)}>Post a Job</h1>
          <p className={cn(common.subtitle, themed.subtitle)}>Follow the steps to get your job posted and find the right talent.</p>
        </header>

        <div className={common.step_indicator_container}>
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        <div className={common.content_container}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className={cn(common.footer, themed.footer)}>
          <Button
            variant="secondary"
            onClick={prevStep}
            disabled={currentStep === 'Details'}
            className={cn(currentStep === 'Details' && common.hidden)}
          >
            Back
          </Button>
          {currentStep !== 'Review' ? (
            <Button onClick={nextStep}>
              {currentStep === 'Budget' ? 'Preview' : 'Next'}
            </Button>
          ) : (
            <Button onClick={onSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Job'}
            </Button>
          )}
        </footer>
      </div>
    </main>
  );
};

export default PostJob;
