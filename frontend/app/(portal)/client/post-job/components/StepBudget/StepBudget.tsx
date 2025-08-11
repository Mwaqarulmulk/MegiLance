// @/app/(portal)/client/post-job/components/StepBudget/StepBudget.tsx
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Input from '@/app/components/Input/Input';
import Select from '@/app/components/Select/Select';
import RadioGroup from '@/app/components/RadioGroup/RadioGroup';
import { PostJobData, PostJobErrors, BudgetType } from '../../PostJob.types';

import common from './StepBudget.common.module.css';
import light from './StepBudget.light.module.css';
import dark from './StepBudget.dark.module.css';

const TIMELINE_OPTIONS = ['1-2 weeks', '2-4 weeks', '1-2 months', '3-6 months', 'Long-term'] as const;

interface StepBudgetProps {
  data: PostJobData;
  updateData: (update: Partial<PostJobData>) => void;
  errors: PostJobErrors;
}

const StepBudget: React.FC<StepBudgetProps> = ({ data, updateData, errors }) => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className={common.container}
    >
      <h2 className={cn(common.title, themed.title)}>Set your budget</h2>
      <p className={cn(common.subtitle, themed.subtitle)}>How would you like to pay your freelancer?</p>

      <div className={common.form_group}>
        <RadioGroup
          label="Budget Type"
          options={[{ value: 'Fixed', label: 'Fixed Price' }, { value: 'Hourly', label: 'Hourly Rate' }]}
          selectedValue={data.budgetType}
          onChange={(value) => updateData({ budgetType: value as BudgetType })}
        />
      </div>

      <div className={common.form_group}>
        <Input
          id="job-budget"
          label={data.budgetType === 'Fixed' ? 'Total Project Budget ($)' : 'Hourly Rate ($)'}
          type="number"
          value={data.budgetAmount === null ? '' : String(data.budgetAmount)}
          onChange={(e) => updateData({ budgetAmount: e.target.value ? Number(e.target.value) : null })}
          placeholder="e.g., 5000"
          error={errors.budgetAmount}
          required
        />
      </div>

      <div className={common.form_group}>
        <Select
          id="job-timeline"
          label="Estimated Timeline"
          value={data.timeline}
          onChange={(e) => updateData({ timeline: e.target.value })}
          options={TIMELINE_OPTIONS.map(t => ({ value: t, label: t }))}
          placeholder="Select a timeline"
          error={errors.timeline}
          required
        />
      </div>
    </motion.div>
  );
};

export default StepBudget;
