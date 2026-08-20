// @AI-HINT: Create Project page with AI Price Estimation & Direct Talent Invitation flow
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useTheme } from 'next-themes';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import api, { aiApi, talentInvitationsApi } from '@/lib/api';
import Input from '@/app/components/atoms/Input/Input';
import Select from '@/app/components/molecules/Select/Select';
import Button from '@/app/components/atoms/Button/Button';
import { AIPriceEstimator } from '@/app/components/AI';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import common from './CreateProject.common.module.css';
import light from './CreateProject.light.module.css';
import dark from './CreateProject.dark.module.css';

const CATEGORIES = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'design', label: 'Design & Creative' },
  { value: 'writing', label: 'Writing & Translation' },
  { value: 'admin-support', label: 'Admin Support' },
  { value: 'data-science', label: 'Data Science & Analytics' },
  { value: 'marketing', label: 'Sales & Marketing' },
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' },
];

function CreateProjectContent() {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'light' ? light : dark;
  const router = useRouter();
  const searchParams = useSearchParams();

  const inviteFreelancerId = searchParams.get('invite');
  const paramTitle = searchParams.get('title');
  const paramCategory = searchParams.get('category');
  const paramSkills = searchParams.get('skills');
  const paramBudgetMin = searchParams.get('budget_min');
  const paramBudgetMax = searchParams.get('budget_max');

  const [formData, setFormData] = useState({
    title: paramTitle || '',
    description: '',
    category: paramCategory || '',
    budget_min: paramBudgetMin || '',
    budget_max: paramBudgetMax || '',
    experience_level: 'intermediate',
    skills: paramSkills || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);

  // Sync params if they change dynamically
  useEffect(() => {
    if (paramTitle || paramCategory || paramSkills || paramBudgetMin || paramBudgetMax) {
      setFormData(prev => ({
        ...prev,
        title: paramTitle || prev.title,
        category: paramCategory || prev.category,
        skills: paramSkills || prev.skills,
        budget_min: paramBudgetMin || prev.budget_min,
        budget_max: paramBudgetMax || prev.budget_max,
      }));
    }
  }, [paramTitle, paramCategory, paramSkills, paramBudgetMin, paramBudgetMax]);

  // Debounce logic for AI estimation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.description.length > 50 && formData.category) {
        getAiEstimate();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.description, formData.category, formData.skills]);

  const getAiEstimate = async () => {
    setIsEstimating(true);
    try {
      const skillsList = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      const result = await aiApi.estimatePrice({
        category: formData.category,
        skills_required: skillsList,
        description: formData.description,
        complexity: formData.experience_level,
      });
      setEstimate(result);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to get estimate:', error);
      }
    } finally {
      setIsEstimating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const skillsString = formData.skills.split(',').map(s => s.trim()).filter(Boolean).join(',');
      const createdProject: any = await api.projects.create({
        ...formData,
        budget_min: Number(formData.budget_min) || 0,
        budget_max: Number(formData.budget_max) || 0,
        skills: skillsString,
      } as any);

      // If this project was created from a talent invite link, dispatch the direct invitation
      if (inviteFreelancerId && createdProject?.id) {
        try {
          await talentInvitationsApi.create({
            project_id: Number(createdProject.id),
            freelancer_id: Number(inviteFreelancerId),
            message: 'Hello! I posted this project specifically to invite you based on your profile and skills.',
            suggested_rate: Number(formData.budget_max) || undefined,
          });
        } catch (inviteErr) {
          console.warn('Could not auto-dispatch invitation:', inviteErr);
        }
      }

      router.push('/client/projects');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create project. Please try again.');
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create project:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyEstimate = () => {
    if (estimate) {
      setFormData(prev => ({
        ...prev,
        budget_min: estimate.low_estimate.toString(),
        budget_max: estimate.high_estimate.toString(),
      }));
    }
  };

  return (
    <PageTransition>
      <div className={cn(common.container, theme.theme)}>
        <header className={common.header}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            iconBefore={<ArrowLeft size={16} />}
            className="mb-4"
          >
            Back to Projects
          </Button>
          <h1 className={common.title}>Post a New Project</h1>
          <p className={common.subtitle}>Describe your project and get matched with top talent.</p>
        </header>

        {/* Direct Talent Invitation Banner */}
        {inviteFreelancerId && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.1))',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 12,
              padding: '0.85rem 1.1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <UserPlus size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                Direct Talent Invitation Active
                <span
                  style={{
                    background: 'rgba(16,185,129,0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: 12,
                    padding: '1px 7px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  Candidate #{inviteFreelancerId}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', opacity: 0.85, marginTop: 2 }}>
                As soon as this project is published, a direct private invitation will automatically be delivered to this specialist.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={common.form}>
          <div className={cn(common.section, theme.section)}>
            <h2 className={common.sectionTitle}>Project Details</h2>

            <Input
              label="Project Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Build a React Native App for Food Delivery"
              required
            />

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full p-3 rounded-md border bg-transparent focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="Describe your project in detail..."
                required
              />
            </div>

            <div className={common.row}>
              <div className={common.col}>
                <Select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  options={[{ value: '', label: 'Select Category' }, ...CATEGORIES]}
                  required
                />
              </div>
              <div className={common.col}>
                <Select
                  label="Experience Level"
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                  options={EXPERIENCE_LEVELS}
                />
              </div>
            </div>

            <Input
              label="Required Skills (comma separated)"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, TypeScript"
            />
          </div>

          {/* AI Price Estimation */}
          <AIPriceEstimator
            estimate={estimate}
            isLoading={isEstimating}
            onApply={applyEstimate}
            onDismiss={() => setEstimate(null)}
            className="mb-6"
          />

          <div className={cn(common.section, theme.section)}>
            <h2 className={common.sectionTitle}>Budget</h2>
            <div className={common.row}>
              <div className={common.col}>
                <Input
                  label="Minimum Budget ($)"
                  name="budget_min"
                  type="number"
                  value={formData.budget_min}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className={common.col}>
                <Input
                  label="Maximum Budget ($)"
                  name="budget_max"
                  type="number"
                  value={formData.budget_max}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          {submitError && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {submitError}
            </p>
          )}

          <div className={common.actions}>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              iconBefore={<Save size={16} />}
            >
              Post Project
            </Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}

export default function CreateProjectPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading project form...</div>}>
      <CreateProjectContent />
    </Suspense>
  );
}
