// @AI-HINT: This is the refactored Freelancer Profile page, featuring a premium layout, custom components, and full theme support.
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import Textarea from '@/app/components/Textarea/Textarea'; // Using the reusable Textarea component
import commonStyles from './Profile.common.module.css';
import lightStyles from './Profile.light.module.css';
import darkStyles from './Profile.dark.module.css';

// Mock data for the profile page
const userProfile = {
  name: 'Alexandria Doe',
  title: 'Senior AI & Full-Stack Developer',
  rank: 'Top 5%',
  bio: '10+ years of experience building scalable web applications and AI-powered solutions. Expert in React, Node.js, Python, and cloud-native architectures. Passionate about creating intuitive user experiences that are both beautiful and functional.',
  skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Prisma'],
  portfolioUrl: 'https://alexandriadoe.dev',
  hourlyRate: 95,
};

const Profile: React.FC = () => {
  const { theme } = useTheme();
  const [name, setName] = useState(userProfile.name);
  const [title, setTitle] = useState(userProfile.title);
  const [bio, setBio] = useState(userProfile.bio);
  const [skills, setSkills] = useState(userProfile.skills.join(', '));
  const [portfolioUrl, setPortfolioUrl] = useState(userProfile.portfolioUrl);
  const [hourlyRate, setHourlyRate] = useState<number | string>(userProfile.hourlyRate);
  const [errors, setErrors] = useState<{ portfolioUrl?: string; hourlyRate?: string }>({});
  const [status, setStatus] = useState<string>('');

  // Draft load
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('freelancer_profile_draft') : null;
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.name) setName(draft.name);
        if (draft.title) setTitle(draft.title);
        if (typeof draft.bio === 'string') setBio(draft.bio);
        if (typeof draft.skills === 'string') setSkills(draft.skills);
        if (draft.portfolioUrl) setPortfolioUrl(draft.portfolioUrl);
        if (draft.hourlyRate !== undefined) setHourlyRate(draft.hourlyRate);
        setStatus('Loaded draft');
      }
    } catch {
      // ignore
    }
  }, []);

  const saveDraft = () => {
    try {
      const payload = { name, title, bio, skills, portfolioUrl, hourlyRate };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('freelancer_profile_draft', JSON.stringify(payload));
        setStatus('Draft saved');
      }
    } catch {
      setStatus('Failed to save draft');
    }
  };

  const resetForm = () => {
    setName(userProfile.name);
    setTitle(userProfile.title);
    setBio(userProfile.bio);
    setSkills(userProfile.skills.join(', '));
    setPortfolioUrl(userProfile.portfolioUrl);
    setHourlyRate(userProfile.hourlyRate);
    setErrors({});
    setStatus('Reset to defaults');
  };

  const validate = () => {
    const next: typeof errors = {};
    // URL validation
    try {
      if (portfolioUrl && String(portfolioUrl).trim().length > 0) {
        // eslint-disable-next-line no-new
        new URL(String(portfolioUrl));
      }
    } catch {
      next.portfolioUrl = 'Please enter a valid URL';
    }
    // hourly rate
    const rateNum = Number(hourlyRate);
    if (Number.isNaN(rateNum) || rateNum <= 0) {
      next.hourlyRate = 'Hourly rate must be a positive number';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setStatus('Please fix the highlighted fields');
      return;
    }
    // Simulate save
    setStatus('Profile saved');
    // Clear draft after successful save
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('freelancer_profile_draft');
    }
  };

  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  return (
    <div className={styles.profileContainer}>
      <header className={styles.header}>
        <UserAvatar name={name} size="large" />
        <div className={styles.headerInfo}>
          <h1 className={styles.name}>{name}</h1>
          <p className={styles.title}>{title}</p>
          <span className={styles.rank}>Freelancer Rank: {userProfile.rank}</span>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" type="button" onClick={saveDraft} title="Save profile draft">Save Draft</Button>
        </div>
      </header>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {status && <div className={styles.status} role="status" aria-live="polite">{status}</div>}

        <div className={styles.inlineSection}>
          <Input
            label="Full Name"
            type="text"
            defaultValue={name}
            title="Enter your full name"
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Professional Title"
            type="text"
            defaultValue={title}
            title="Enter your professional headline (publicly visible)"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>About Me</h2>
          <Textarea
            id="bio-textarea"
            defaultValue={bio}
            rows={6}
            label="Profile Bio"
            hideLabel
            title="Write a short bio (publicly visible)"
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <Input
            label="Skills"
            type="text"
            defaultValue={skills}
            hideLabel
            title="Enter comma-separated skills"
            aria-describedby="skills-help"
            onChange={(e) => setSkills(e.target.value)}
          />
          <small id="skills-help" className={styles.skillsInfo}>Separate skills with a comma.</small>
        </div>

        <div className={styles.inlineSection}>
          <Input
            label="Hourly Rate ($/hr)"
            type="number"
            defaultValue={hourlyRate}
            aria-invalid={errors.hourlyRate ? 'true' : undefined}
            aria-describedby={errors.hourlyRate ? 'hourlyRate-error' : undefined}
            title="Enter your hourly rate in USD"
            onChange={(e) => setHourlyRate(e.target.value)}
          />
          <Input
            label="Portfolio URL"
            type="text"
            defaultValue={portfolioUrl}
            aria-invalid={errors.portfolioUrl ? 'true' : undefined}
            aria-describedby={errors.portfolioUrl ? 'portfolioUrl-error' : undefined}
            title="Link to your portfolio or website"
            onChange={(e) => setPortfolioUrl(e.target.value)}
          />
        </div>

        {(errors.hourlyRate || errors.portfolioUrl) && (
          <div className={styles.errors} role="alert">
            {errors.hourlyRate && <p id="hourlyRate-error" className={styles.errorText}>{errors.hourlyRate}</p>}
            {errors.portfolioUrl && <p id="portfolioUrl-error" className={styles.errorText}>{errors.portfolioUrl}</p>}
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" type="button" onClick={resetForm} title="Reset to defaults">Reset</Button>
          <Button variant="primary" type="submit" title="Save profile changes">Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
