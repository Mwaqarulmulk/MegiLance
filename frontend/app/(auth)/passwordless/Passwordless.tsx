// @AI-HINT: This is the Passwordless Authentication page, designed with the same premium two-panel layout as other auth pages for consistency. It allows users to sign in using only their email address without a password.
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FaMagic, FaUserTie, FaBriefcase, FaUserShield, FaLaptopCode, FaTasks, FaUserCog } from 'react-icons/fa';

import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import Tabs from '@/app/components/Tabs/Tabs';
import AuthBrandingPanel from '@/app/components/Auth/BrandingPanel/BrandingPanel';
import { isPreviewMode } from '@/app/utils/flags';

import commonStyles from './Passwordless.common.module.css';
import lightStyles from './Passwordless.light.module.css';
import darkStyles from './Passwordless.dark.module.css';

type UserRole = 'freelancer' | 'client' | 'admin';

const roleConfig = {
  freelancer: {
    id: 'freelancer' as UserRole,
    icon: FaUserTie,
    label: 'Freelancer',
    redirectPath: '/freelancer/dashboard',
    brandIcon: FaLaptopCode,
    brandTitle: 'Build the Future',
    brandText: 'Access exclusive projects, secure your payments with USDC, and collaborate with top-tier clients from around the world.',
  },
  client: {
    id: 'client' as UserRole,
    icon: FaBriefcase,
    label: 'Client',
    redirectPath: '/client/dashboard',
    brandIcon: FaTasks,
    brandTitle: 'Assemble Your Dream Team',
    brandText: 'Find, hire, and manage elite talent. Our AI-powered platform ensures you connect with the perfect freelancers for your projects.',
  },
  admin: {
    id: 'admin' as UserRole,
    icon: FaUserShield,
    label: 'Admin',
    redirectPath: '/admin/dashboard',
    brandIcon: FaUserCog,
    brandTitle: 'Oversee the Ecosystem',
    brandText: 'Manage platform operations, ensure quality and security, and empower our community of freelancers and clients.',
  },
};

const Passwordless: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('freelancer');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [errors, setErrors] = useState({ email: '', general: '' });

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (submitted && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [submitted, countdown]);

  const validate = () => {
    const newErrors = { email: '', general: '' };
    let isValid = true;
    if (!email) {
      newErrors.email = 'Email is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid.';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setErrors({ email: '', general: '' });
    
    try {
      // Simulate API call for passwordless login
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      if (isPreviewMode()) {
        try { window.localStorage.setItem('portal_area', selectedRole); } catch {}
        router.push(roleConfig[selectedRole].redirectPath);
        return;
      }
      
      console.log('Passwordless login requested for:', { email, role: selectedRole });
      setSubmitted(true);
      setCountdown(30);
    } catch (error) {
      setErrors({ email: '', general: 'Failed to send magic link. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      // Simulate API call for resend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Resending magic link to:', email);
      setCountdown(30);
    } catch (error) {
      setErrors({ email: '', general: 'Failed to resend magic link. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const styles = React.useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    const merge = (key: keyof typeof commonStyles) => cn((commonStyles as any)[key], (themeStyles as any)[key]);
    return {
      loginPage: merge('loginPage'),
      brandingSlot: merge('brandingSlot'),
      brandingPanel: merge('brandingPanel'),
      brandingContent: merge('brandingContent'),
      brandingIconWrapper: merge('brandingIconWrapper'),
      brandingIcon: merge('brandingIcon'),
      brandingTitle: merge('brandingTitle'),
      brandingText: merge('brandingText'),
      brandingFooter: merge('brandingFooter'),
      formPanel: merge('formPanel'),
      formContainer: merge('formContainer'),
      formHeader: merge('formHeader'),
      formTitle: merge('formTitle'),
      formSubtitle: merge('formSubtitle'),
      roleSelector: merge('roleSelector'),
      roleButton: merge('roleButton'),
      roleButtonSelected: merge('roleButtonSelected'),
      roleIcon: merge('roleIcon'),
      divider: merge('divider'),
      dividerText: merge('dividerText'),
      loginForm: merge('loginForm'),
      inputGroup: merge('inputGroup'),
      formOptions: merge('formOptions'),
      submitButton: merge('submitButton'),
      resendButton: merge('resendButton'),
      signupPrompt: merge('signupPrompt'),
      generalError: merge('generalError'),
      successMessage: merge('successMessage'),
      countdownText: merge('countdownText'),
    } as const;
  }, [theme]);

  return (
    <div className={styles.loginPage}>
      <div className={styles.brandingSlot}>
        <AuthBrandingPanel roleConfig={roleConfig[selectedRole]} />
      </div>
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          {isPreviewMode() && (
            <div role="status" aria-live="polite" className="mb-4 rounded-md border border-dashed border-[var(--border-color)] p-3 text-sm text-[var(--text-secondary)]">
              <strong>Preview Mode:</strong> Auth checks are disabled. Use the quick links below to jump into dashboards.
            </div>
          )}
          
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Passwordless Sign In</h1>
            {submitted ? (
              <p className={styles.formSubtitle}>
                Check your email for a magic link to sign in.
              </p>
            ) : (
              <p className={styles.formSubtitle}>
                Enter your email and we'll send you a magic link to sign in instantly.
              </p>
            )}
          </div>

          <Tabs defaultIndex={Object.keys(roleConfig).indexOf(selectedRole)} onTabChange={(index) => setSelectedRole(Object.keys(roleConfig)[index] as UserRole)}>
            <Tabs.List className={styles.roleSelector}>
              {Object.entries(roleConfig).map(([role, { label, icon: Icon }]) => (
                <Tabs.Tab key={role} icon={<Icon />}>
                  {label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          {submitted ? (
            <div className={styles.successMessage}>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-4">
                <FaMagic className="text-green-600 dark:text-green-400 text-2xl" />
              </div>
              <p className="text-center mb-4">
                We've sent a magic link to <strong>{email}</strong>. Click the link to sign in.
              </p>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                Didn't receive the email? Check your spam folder.
              </p>
              <Button 
                variant="secondary" 
                fullWidth 
                onClick={handleResend} 
                disabled={loading || countdown > 0}
                className={styles.resendButton}
              >
                {loading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Magic Link'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className={styles.loginForm}>
              {errors.general && <p className={styles.generalError}>{errors.general}</p>}
              <div className={styles.inputGroup}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                isLoading={loading} 
                disabled={loading} 
                className={styles.submitButton}
                iconBefore={<FaMagic />}
              >
                {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
              </Button>
            </form>
          )}

          <div className={styles.signupPrompt}>
            <p>Want to use a password instead? <Link href="/login">Sign In</Link></p>
            <p className="mt-1">Don't have an account? <Link href="/signup">Create one now</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Passwordless;