// @AI-HINT: Enhanced first step in proposal submission with AI-powered writing assistance and real-time validation.
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, CheckCircle, AlertCircle, Clock, Sparkles, Loader2, TrendingUp } from 'lucide-react';

import { ProposalData, ProposalErrors } from '../../SubmitProposal.types';
import Textarea from '@/app/components/atoms/Textarea/Textarea';
import Input from '@/app/components/atoms/Input/Input';
import { Label } from '@/app/components/atoms/Label/Label';
import Select from '@/app/components/molecules/Select/Select';
import { AIProposalAssistant } from '@/app/components/AI';
import { aiApi, aiWritingApi } from '@/lib/api/ai';
import Button from '@/app/components/atoms/Button/Button';

import common from './StepDetails.common.module.css';
import light from './StepDetails.light.module.css';
import dark from './StepDetails.dark.module.css';

interface JobDetails {
  id: number;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  skills?: string[];
}

interface StepDetailsProps {
  data: ProposalData;
  updateData: (update: Partial<ProposalData>) => void;
  errors: ProposalErrors;
  job?: JobDetails | null;
}

const MIN_COVER_LETTER = 100;
const MAX_COVER_LETTER = 5000;

const availabilityOptions = [
  { value: 'immediate', label: 'Immediate - Can start today' },
  { value: '1-2_weeks', label: '1-2 Weeks - Need to wrap up current work' },
  { value: '1_month', label: '1 Month - Finishing another project' },
  { value: 'flexible', label: 'Flexible - Open to discussion' },
];

const StepDetails: React.FC<StepDetailsProps> = ({ data, updateData, errors, job }) => {
  const { resolvedTheme } = useTheme();
  const themed = resolvedTheme === 'dark' ? dark : light;
  const [rateLoading, setRateLoading] = useState(false);
  const [rateSuggestion, setRateSuggestion] = useState<{ low: number; high: number; estimate: number } | null>(null);

  // Character count and progress
  const charCount = data.coverLetter.length;
  const charProgress = Math.min((charCount / MIN_COVER_LETTER) * 100, 100);
  const isOverLimit = charCount > MAX_COVER_LETTER;
  const isValidLength = charCount >= MIN_COVER_LETTER && charCount <= MAX_COVER_LETTER;

  // Calculate estimated total
  const estimatedTotal = useMemo(() => {
    return (data.hourlyRate || 0) * (data.estimatedHours || 0);
  }, [data.hourlyRate, data.estimatedHours]);

  // Generate or improve the cover letter via the proposal-writer AI endpoint.
  // Returns the generated text so AIProposalAssistant can preview it before insert.
  const handleAIGenerate = useCallback(
    async (type: 'generate' | 'improve'): Promise<string> => {
      let skills: string[] = job?.skills || [];
      let yearsExperience: number | undefined;
      try {
        const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const user = userRaw ? JSON.parse(userRaw) : null;
        if (user) {
          if (typeof user.skills === 'string' && user.skills.trim()) {
            skills = user.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
          } else if (Array.isArray(user.skills) && user.skills.length) {
            skills = user.skills;
          }
          yearsExperience = user.years_experience || user.years_of_experience || undefined;
        }
      } catch {
        // fall back to job skills
      }

      // "Improve" rewrites the freelancer's existing draft via the LLM; "generate"
      // writes a fresh proposal from the job context. Both use the AI writing gateway.
      if (type === 'improve' && data.coverLetter.trim()) {
        const res = await aiWritingApi.improveText({
          content: data.coverLetter.trim(),
          content_type: 'proposal',
          improvements: ['clarity', 'persuasiveness', 'professionalism', 'grammar'],
        });
        return res.content || data.coverLetter;
      }

      const res = await aiWritingApi.generateProposal({
        project_title: job?.title || 'Untitled Project',
        project_description:
          job?.description || 'Please review the job requirements and write a compelling proposal.',
        user_skills: skills,
        user_experience: yearsExperience ? `${yearsExperience} years of experience` : undefined,
        tone: 'professional',
      });
      return res.content || '';
    },
    [job, data.coverLetter],
  );

  const handleSuggestRate = useCallback(async () => {
    if (!job) return;
    setRateLoading(true);
    setRateSuggestion(null);
    try {
      const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userRaw ? JSON.parse(userRaw) : null;
      const result = await aiApi.estimatePrice({
        category: job.title,
        skills_required: job.skills || [],
        description: job.description,
        complexity: 'medium',
      });
      setRateSuggestion({
        low: Math.round(result.low_estimate / Math.max(result.estimated_hours, 1)),
        high: Math.round(result.high_estimate / Math.max(result.estimated_hours, 1)),
        estimate: result.estimated_hourly_rate,
      });
    } catch {
      // Silently ignore — user can set rate manually
    } finally {
      setRateLoading(false);
    }
  }, [job]);

  return (
    <div className={cn(common.container, themed.container)}>
      <div className={common.header}>
        <h2 className={cn(common.title, themed.title)}>Project Details</h2>
        <p className={cn(common.description, themed.description)}>
          Craft a compelling proposal that showcases your skills and experience.
        </p>
      </div>

      <div className={common.form}>
        {/* Cover Letter Section */}
        <div className={common.formGroup}>
          <div className={cn(common.labelRow, themed.labelRow)}>
            <Label htmlFor="coverLetter">Cover Letter</Label>
          </div>

          <div className="mb-4">
            <AIProposalAssistant
              onGenerate={handleAIGenerate}
              onInsert={(text) => updateData({ coverLetter: text })}
            />
          </div>

          <Textarea
            id="coverLetter"
            value={data.coverLetter}
            onChange={(e) => updateData({ coverLetter: e.target.value })}
            placeholder="Explain why you're the best fit for this project. Highlight relevant experience and skills..."
            rows={8}
            aria-invalid={!!errors.coverLetter}
            aria-describedby={errors.coverLetter ? "coverLetter-error" : "coverLetter-hint"}
          />
          
          {/* Character Counter */}
          <div className={cn(common.charCounter, themed.charCounter)}>
            <div className={cn(common.charProgress, themed.charProgress)}>
              <motion.div 
                className={cn(
                  common.charProgressFill, 
                  themed.charProgressFill,
                  isValidLength && common.charProgressValid,
                  isOverLimit && common.charProgressError
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(charProgress, 100)}%` }}
              />
            </div>
            <span className={cn(
              common.charCount, 
              themed.charCount,
              isOverLimit && common.charCountError
            )}>
              {isValidLength && <CheckCircle size={12} />}
              {isOverLimit && <AlertCircle size={12} />}
              {charCount}/{MAX_COVER_LETTER} characters
              {charCount < MIN_COVER_LETTER && ` (min ${MIN_COVER_LETTER})`}
            </span>
          </div>
          
          {errors.coverLetter && (
            <p id="coverLetter-error" className={cn(common.error, themed.error)}>
              {errors.coverLetter}
            </p>
          )}
        </div>

        {/* Pricing Section */}
        <div className={cn(common.pricingSection, themed.pricingSection)}>
          <h3 className={cn(common.sectionTitle, themed.sectionTitle)}>
            <Calculator size={18} />
            Pricing & Timeline
          </h3>
          
          <div className={common.row}>
            <div className={common.formGroup}>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="1"
                value={data.estimatedHours || ''}
                onChange={(e) => updateData({ estimatedHours: e.target.value ? Number(e.target.value) : null })}
                placeholder="e.g., 40"
                aria-invalid={!!errors.estimatedHours}
                aria-describedby={errors.estimatedHours ? "estimatedHours-error" : undefined}
              />
              {errors.estimatedHours && (
                <p id="estimatedHours-error" className={cn(common.error, themed.error)}>
                  {errors.estimatedHours}
                </p>
              )}
            </div>

            <div className={common.formGroup}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                {job && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSuggestRate}
                    disabled={rateLoading}
                    type="button"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', height: 'auto' }}
                  >
                    {rateLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />}
                    {rateLoading ? 'Estimating...' : 'AI Suggest'}
                  </Button>
                )}
              </div>
              <Input
                id="hourlyRate"
                type="number"
                min="5"
                max="500"
                value={data.hourlyRate || ''}
                onChange={(e) => updateData({ hourlyRate: e.target.value ? Number(e.target.value) : null })}
                placeholder="e.g., 50"
                aria-invalid={!!errors.hourlyRate}
                aria-describedby={errors.hourlyRate ? "hourlyRate-error" : undefined}
              />
              <AnimatePresence>
                {rateSuggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      background: 'var(--color-primary-subtle, rgba(69,115,223,0.08))',
                      border: '1px solid var(--color-primary-light, rgba(69,115,223,0.2))',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                    }}
                  >
                    <TrendingUp size={14} style={{ color: 'var(--color-primary, #4573df)', flexShrink: 0 }} />
                    <span>
                      AI suggests <strong>${rateSuggestion.low}–${rateSuggestion.high}/hr</strong>
                      {' '}for this project type.{' '}
                      <button
                        type="button"
                        onClick={() => updateData({ hourlyRate: rateSuggestion.estimate })}
                        style={{ color: 'var(--color-primary, #4573df)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                      >
                        Apply ${rateSuggestion.estimate}/hr
                      </button>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              {errors.hourlyRate && (
                <p id="hourlyRate-error" className={cn(common.error, themed.error)}>
                  {errors.hourlyRate}
                </p>
              )}
            </div>
          </div>

          {/* Estimated Total */}
          {estimatedTotal > 0 && (
            <motion.div 
              className={cn(common.estimatedCard, themed.estimatedCard)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={cn(common.estimatedRow, themed.estimatedRow)}>
                <span>Estimated Total</span>
                <span className={cn(common.estimatedTotal, themed.estimatedTotal)}>
                  ${estimatedTotal.toLocaleString()}
                </span>
              </div>
              <div className={cn(common.estimatedBreakdown, themed.estimatedBreakdown)}>
                <span>{data.estimatedHours} hours × ${data.hourlyRate}/hr</span>
                <span className={cn(common.serviceFee, themed.serviceFee)}>
                  Platform fee (8%): ${(estimatedTotal * 0.08).toFixed(2)}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Availability Section */}
        <div className={common.formGroup}>
          <Label htmlFor="availability">
            <Clock size={16} className={common.inlineIcon} />
            Availability
          </Label>
          <Select
            id="availability"
            options={availabilityOptions}
            value={data.availability}
            onChange={(e) => updateData({ availability: e.target.value as any })}
          />
          <p id="availability-hint" className={cn(common.hint, themed.hint)}>
            Let the client know when you can start working on their project.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepDetails;
