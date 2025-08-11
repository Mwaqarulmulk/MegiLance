// @/app/(portal)/client/post-job/components/StepIndicator/StepIndicator.tsx
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

import common from './StepIndicator.common.module.css';
import light from './StepIndicator.light.module.css';
import dark from './StepIndicator.dark.module.css';

interface StepIndicatorProps {
  steps: readonly string[];
  currentStep: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const currentIndex = steps.indexOf(currentStep);

  return (
    <nav className={common.nav} aria-label="Job posting steps">
      <ol className={common.list}>
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <li key={step} className={common.step}>
              <div className={cn(common.indicator, themed.indicator, isCompleted && themed.completed, isActive && themed.active)}>
                {isCompleted ? (
                  <svg className={common.icon} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className={cn(common.stepNumber, themed.stepNumber)}>{index + 1}</span>
                )}
              </div>
              <span className={cn(common.stepName, themed.stepName, isActive && themed.stepNameActive)}>
                {step}
              </span>
            </li>
          );
        })}
      </ol>
      <div className={cn(common.progressBarContainer, themed.progressBarContainer)}>
        <motion.div
          className={cn(common.progressBar, themed.progressBar)}
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          transition={{ ease: 'easeInOut', duration: 0.5 }}
        />
      </div>
    </nav>
  );
};

export default StepIndicator;
