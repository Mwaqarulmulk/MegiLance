// @/app/(portal)/client/post-job/components/StepScope/StepScope.tsx
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Textarea from '@/app/components/Textarea/Textarea';
import TagsInput from '@/app/components/TagsInput/TagsInput';
import { PostJobData, PostJobErrors } from '../../PostJob.types';

import common from './StepScope.common.module.css';
import light from './StepScope.light.module.css';
import dark from './StepScope.dark.module.css';

interface StepScopeProps {
  data: PostJobData;
  updateData: (update: Partial<PostJobData>) => void;
  errors: PostJobErrors;
}

const StepScope: React.FC<StepScopeProps> = ({ data, updateData, errors }) => {
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
      <h2 className={cn(common.title, themed.title)}>Define the Scope</h2>
      <p className={cn(common.subtitle, themed.subtitle)}>Provide a detailed description and the skills required.</p>

      <div className={common.form_group}>
        <Textarea
          id="job-description"
          label="Job Description"
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Describe the project scope, deliverables, timeline, and any other important details..."
          error={errors.description}
          required
          rows={8}
        />
      </div>

      <div className={common.form_group}>
        <TagsInput
          id="job-skills"
          label="Required Skills"
          tags={data.skills}
          onTagsChange={(newSkills) => updateData({ skills: newSkills })}
          placeholder="Add a skill and press Enter"
          error={errors.skills}
        />
        <p className={cn(common.help, themed.help)}>These skills will be used to match you with the best freelancers.</p>
      </div>
    </motion.div>
  );
};

export default StepScope;
