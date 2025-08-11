// @/app/(portal)/client/post-job/components/StepDetails/StepDetails.tsx
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Input from '@/app/components/Input/Input';
import Select from '@/app/components/Select/Select';
import { PostJobData, PostJobErrors } from '../../PostJob.types';

import common from './StepDetails.common.module.css';
import light from './StepDetails.light.module.css';
import dark from './StepDetails.dark.module.css';

const CATEGORIES = ['Web Development', 'Mobile Apps', 'UI/UX Design', 'Data Science', 'AI/ML', 'DevOps'] as const;

interface StepDetailsProps {
  data: PostJobData;
  updateData: (update: Partial<PostJobData>) => void;
  errors: PostJobErrors;
}

const StepDetails: React.FC<StepDetailsProps> = ({ data, updateData, errors }) => {
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
      <h2 className={cn(common.title, themed.title)}>Start with the basics</h2>
      <p className={cn(common.subtitle, themed.subtitle)}>What is the job you need to get done?</p>

      <div className={common.form_group}>
        <Input
          id="job-title"
          label="Job Title"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="e.g., Senior React Developer for Fintech App"
          error={errors.title}
          required
        />
      </div>

      <div className={common.form_group}>
        <Select
          id="job-category"
          label="Category"
          value={data.category}
          onChange={(e) => updateData({ category: e.target.value as any })}
          options={CATEGORIES.map(c => ({ value: c, label: c }))}
          placeholder="Select a category"
          error={errors.category}
          required
        />
      </div>
    </motion.div>
  );
};

export default StepDetails;
