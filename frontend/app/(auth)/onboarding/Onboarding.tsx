'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Loader2, Sparkles, Plus, X } from 'lucide-react';
import api from '@/lib/api';

import common from './Onboarding.common.module.css';
import light from './Onboarding.light.module.css';
import dark from './Onboarding.dark.module.css';

type Role = 'freelancer' | 'client';

const FREELANCER_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'FastAPI',
  'PostgreSQL', 'UI/UX Design', 'Figma', 'GraphQL', 'AWS', 'Docker',
  'Flutter', 'iOS', 'Android', 'Django', 'Vue.js', 'Go', 'Rust', 'PHP',
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level', desc: '< 1 year' },
  { value: 'intermediate', label: 'Intermediate', desc: '1–3 years' },
  { value: 'expert', label: 'Expert', desc: '3–7 years' },
  { value: 'senior', label: 'Senior', desc: '7+ years' },
];

const BUDGET_OPTIONS = [
  { value: 'small', label: 'Small Projects', range: '$500–$2k' },
  { value: 'medium', label: 'Mid-size', range: '$2k–$10k' },
  { value: 'large', label: 'Large Projects', range: '$10k–$50k' },
  { value: 'enterprise', label: 'Enterprise', range: '$50k+' },
];

const INDUSTRIES = [
  'Technology', 'E-commerce', 'Healthcare', 'Finance', 'Education',
  'Marketing', 'Media', 'Retail', 'Real Estate', 'Other',
];

interface FreelancerForm {
  title: string;
  bio: string;
  location: string;
  hourlyRate: string;
  experienceLevel: string;
  skills: string[];
  customSkill: string;
}

interface ClientForm {
  companyName: string;
  website: string;
  industry: string;
  budgetRange: string;
  hiringNeeds: string;
}

const Onboarding: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const themed = resolvedTheme === 'dark' ? dark : light;
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') || 'freelancer') as Role;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [freelancerForm, setFreelancerForm] = useState<FreelancerForm>({
    title: '', bio: '', location: '', hourlyRate: '',
    experienceLevel: '', skills: [], customSkill: '',
  });

  const [clientForm, setClientForm] = useState<ClientForm>({
    companyName: '', website: '', industry: '', budgetRange: '', hiringNeeds: '',
  });

  const totalSteps = role === 'freelancer' ? 2 : 2;
  const progress = (step / totalSteps) * 100;
  const dashboardPath = role === 'client' ? '/client/dashboard' : '/freelancer/dashboard';

  const toggleSkill = useCallback((skill: string) => {
    setFreelancerForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : prev.skills.length < 8 ? [...prev.skills, skill] : prev.skills,
    }));
  }, []);

  const addCustomSkill = useCallback(() => {
    const s = freelancerForm.customSkill.trim();
    if (s && !freelancerForm.skills.includes(s) && freelancerForm.skills.length < 8) {
      setFreelancerForm(prev => ({ ...prev, skills: [...prev.skills, s], customSkill: '' }));
    }
  }, [freelancerForm.customSkill, freelancerForm.skills]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = role === 'freelancer'
        ? {
            title: freelancerForm.title || undefined,
            bio: freelancerForm.bio || undefined,
            location: freelancerForm.location || undefined,
            hourly_rate: freelancerForm.hourlyRate ? parseFloat(freelancerForm.hourlyRate) : undefined,
            experience_level: freelancerForm.experienceLevel || undefined,
            skills: freelancerForm.skills.join(', ') || undefined,
          }
        : {
            company: clientForm.companyName || undefined,
            website: clientForm.website || undefined,
            bio: clientForm.hiringNeeds || undefined,
          };

      await api.auth.updateProfile(payload);
    } catch {
      // Non-blocking: profile update failure shouldn't prevent dashboard access
    } finally {
      setLoading(false);
      router.push(dashboardPath);
    }
  };

  const handleSkip = () => router.push(dashboardPath);

  const stepVariants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  const renderFreelancerStep1 = () => (
    <div className={common.form}>
      <div className={common.field}>
        <label className={cn(common.label, themed.label)}>Professional Title</label>
        <input
          className={cn(common.input, themed.input)}
          placeholder="e.g., Full-Stack Developer, UI/UX Designer"
          value={freelancerForm.title}
          onChange={e => setFreelancerForm(p => ({ ...p, title: e.target.value }))}
          maxLength={100}
        />
      </div>
      <div className={common.field}>
        <label className={cn(common.label, themed.label)}>Short Bio</label>
        <textarea
          className={cn(common.input, common.textarea, themed.input)}
          placeholder="Tell clients about your expertise, what you love building, and what makes you stand out..."
          value={freelancerForm.bio}
          onChange={e => setFreelancerForm(p => ({ ...p, bio: e.target.value }))}
          maxLength={500}
          rows={3}
        />
      </div>
      <div className={common.row}>
        <div className={common.field}>
          <label className={cn(common.label, themed.label)}>Location</label>
          <input
            className={cn(common.input, themed.input)}
            placeholder="e.g., Lahore, Pakistan"
            value={freelancerForm.location}
            onChange={e => setFreelancerForm(p => ({ ...p, location: e.target.value }))}
          />
        </div>
        <div className={common.field}>
          <label className={cn(common.label, themed.label)}>Hourly Rate (USD)</label>
          <input
            className={cn(common.input, themed.input)}
            type="number"
            min="5"
            max="500"
            placeholder="e.g., 45"
            value={freelancerForm.hourlyRate}
            onChange={e => setFreelancerForm(p => ({ ...p, hourlyRate: e.target.value }))}
          />
        </div>
      </div>
      <div className={common.field}>
        <label className={cn(common.label, themed.label)}>Experience Level</label>
        <div className={common.budget_options}>
          {EXPERIENCE_LEVELS.map(lvl => (
            <button
              key={lvl.value}
              type="button"
              className={cn(
                common.budget_option,
                themed.budget_option,
                freelancerForm.experienceLevel === lvl.value && [common.budget_option_selected, themed.budget_option_selected],
              )}
              onClick={() => setFreelancerForm(p => ({ ...p, experienceLevel: lvl.value }))}
            >
              <span className={cn(common.budget_option_label, themed.budget_option_label)}>{lvl.label}</span>
              <span className={cn(common.budget_option_range, themed.budget_option_range)}>{lvl.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFreelancerStep2 = () => (
    <div className={common.form}>
      <div className={common.field}>
        <label className={cn(common.label, themed.label)}>
          Your Skills <span style={{ fontWeight: 400, opacity: 0.6 }}>({freelancerForm.skills.length}/8 selected)</span>
        </label>
        <div className={common.skills_grid}>
          {FREELANCER_SKILLS.map(skill => (
            <button
              key={skill}
              type="button"
              className={cn(
                common.skill_chip,
                themed.skill_chip,
                freelancerForm.skills.includes(skill) && [common.skill_chip_selected, themed.skill_chip_selected],
              )}
              onClick={() => toggleSkill(skill)}
            >
              {freelancerForm.skills.includes(skill) && <Check size={11} />}
              {skill}
            </button>
          ))}
        </div>
        {freelancerForm.skills.filter(s => !FREELANCER_SKILLS.includes(s)).map(s => (
          <span
            key={s}
            className={cn(common.skill_chip, themed.skill_chip, common.skill_chip_selected, themed.skill_chip_selected)}
            style={{ display: 'inline-flex', marginTop: '0.25rem' }}
          >
            {s}
            <button type="button" onClick={() => toggleSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className={common.field}>
        <label className={cn(common.label, themed.label)}>Add a custom skill</label>
        <div className={common.skill_input_row}>
          <input
            className={cn(common.input, themed.input)}
            placeholder="e.g., Solidity, Rust, Blender..."
            value={freelancerForm.customSkill}
            onChange={e => setFreelancerForm(p => ({ ...p, customSkill: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
          />
          <button
            type="button"
            onClick={addCustomSkill}
            className={cn(common.skill_chip, themed.skill_chip)}
            style={{ padding: '0 0.75rem', borderRadius: '10px', whiteSpace: 'nowrap' }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );

  const renderClientStep1 = () => (
    <div className={common.form}>
      <div className={common.row}>
        <div className={common.field}>
          <label className={cn(common.label, themed.label)}>Company / Organization</label>
          <input
            className={cn(common.input, themed.input)}
            placeholder="e.g., Acme Corp"
            value={clientForm.companyName}
            onChange={e => setClientForm(p => ({ ...p, companyName: e.target.value }))}
          />
        </div>
        <div className={common.field}>
          <label className={cn(common.label, themed.label)}>Website (optional)</label>
          <input
            className={cn(common.input, themed.input)}
            placeholder="https://yoursite.com"
            value={clientForm.website}
            onChange={e => setClientForm(p => ({ ...p, website: e.target.value }))}
          />
        </div>
      </div>
      <div className={common.field}>
        <label className={cn(common.label, themed.label)}>Industry</label>
        <select
          className={cn(common.input, themed.input)}
          value={clientForm.industry}
          onChange={e => setClientForm(p => ({ ...p, industry: e.target.value }))}
        >
          <option value="">Select your industry...</option>
          {INDUSTRIES.map(ind => (
            <option key={ind} value={ind.toLowerCase()}>{ind}</option>
          ))}
        </select>
      </div>
      <div className={common.field}>
        <label className={cn(common.label, themed.label)}>What are you hiring for?</label>
        <textarea
          className={cn(common.input, common.textarea, themed.input)}
          placeholder="e.g., Building a SaaS product, redesigning our website, building a mobile app..."
          value={clientForm.hiringNeeds}
          onChange={e => setClientForm(p => ({ ...p, hiringNeeds: e.target.value }))}
          rows={3}
          maxLength={500}
        />
      </div>
    </div>
  );

  const renderClientStep2 = () => (
    <div className={common.form}>
      <div className={common.field}>
        <label className={cn(common.label, themed.label)}>Typical Project Budget</label>
        <div className={common.budget_options}>
          {BUDGET_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={cn(
                common.budget_option,
                themed.budget_option,
                clientForm.budgetRange === opt.value && [common.budget_option_selected, themed.budget_option_selected],
              )}
              onClick={() => setClientForm(p => ({ ...p, budgetRange: opt.value }))}
            >
              <span className={cn(common.budget_option_label, themed.budget_option_label)}>{opt.label}</span>
              <span className={cn(common.budget_option_range, themed.budget_option_range)}>{opt.range}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={common.field} style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(69,115,223,0.06)', border: '1px solid rgba(69,115,223,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={16} style={{ color: '#4573df' }} />
          <span className={cn(common.label, themed.label)} style={{ margin: 0 }}>What's next?</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.75 }}>
          After setup, you'll be able to post your first project and our AI will match you with the best freelancers for your needs.
        </p>
      </div>
    </div>
  );

  const canProceed = useMemo(() => {
    if (role === 'freelancer') {
      return step === 1 ? freelancerForm.title.trim().length > 0 : true;
    }
    return step === 1 ? clientForm.industry.length > 0 : true;
  }, [role, step, freelancerForm.title, clientForm.industry]);

  const isLastStep = step === totalSteps;

  const stepTitles: Record<Role, string[]> = {
    freelancer: ['Build your profile', 'Add your skills'],
    client: ['Tell us about you', 'Project preferences'],
  };

  const stepSubtitles: Record<Role, string[]> = {
    freelancer: ['Help clients discover you with a standout profile.', 'Choose up to 8 skills that best represent your expertise.'],
    client: ['Help freelancers understand your business.', 'Set your preferences so we can surface the right talent.'],
  };

  return (
    <div className={cn(common.page, themed.page)}>
      <div className={cn(common.card, themed.card)}>
        <div className={common.header}>
          <div className={cn(common.logo, themed.logo)}>
            Megi<span>Lance</span>
          </div>
          <div className={cn(common.step_badge, themed.step_badge)}>
            Step {step} of {totalSteps}
          </div>
          <h1 className={cn(common.title, themed.title)}>{stepTitles[role][step - 1]}</h1>
          <p className={cn(common.subtitle, themed.subtitle)}>{stepSubtitles[role][step - 1]}</p>
        </div>

        <div className={common.progress_bar} style={{ background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
          <motion.div
            className={common.progress_fill}
            initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${role}-step-${step}`}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {role === 'freelancer'
              ? step === 1 ? renderFreelancerStep1() : renderFreelancerStep2()
              : step === 1 ? renderClientStep1() : renderClientStep2()
            }
          </motion.div>
        </AnimatePresence>

        {error && <p className={cn(common.error, themed.error)}>{error}</p>}

        <div className={common.actions}>
          <button
            type="button"
            className={cn(common.submit_btn, themed.submit_btn)}
            disabled={loading || !canProceed}
            onClick={isLastStep ? handleSubmit : () => setStep(s => s + 1)}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
            ) : isLastStep ? (
              <><Check size={18} /> Complete Setup</>
            ) : (
              <>Continue <ArrowRight size={18} /></>
            )}
          </button>
          <button
            type="button"
            className={cn(common.skip_btn, themed.skip_btn)}
            onClick={handleSkip}
          >
            {isLastStep ? 'Skip and go to dashboard' : 'Skip for now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
