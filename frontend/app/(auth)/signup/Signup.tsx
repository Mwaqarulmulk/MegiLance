// @AI-HINT: This is the fully redesigned Signup page, architected for a premium user experience. It features the same two-panel layout as the Login page for brand consistency and uses the sophisticated Tabs component for role selection.
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { FaGoogle, FaGithub, FaUserTie, FaBriefcase, FaEye, FaEyeSlash } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { isPreviewMode } from '@/app/utils/flags';

import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import Checkbox from '@/app/components/Checkbox/Checkbox';
import Tabs from '@/app/components/Tabs/Tabs';
import AuthBrandingPanel from '@/app/components/Auth/BrandingPanel/BrandingPanel';

import commonStyles from './Signup.common.module.css';
import lightStyles from './Signup.light.module.css';
import darkStyles from './Signup.dark.module.css';

type UserRole = 'client' | 'freelancer';

const roleConfig = {
  client: {
    id: 'client' as UserRole,
    label: 'Client',
    brandIcon: FaUserTie,
    brandTitle: 'Find Top-Tier Talent',
    brandText: 'Post projects, evaluate proposals, and collaborate with the world’s best freelancers, all in one place.',
  },
  freelancer: {
    id: 'freelancer' as UserRole,
    label: 'Freelancer',
    brandIcon: FaBriefcase,
    brandTitle: 'Build Your Freelance Career',
    brandText: 'Showcase your skills, bid on exciting projects, and get paid securely for your expert work.',
  },
};



const Signup: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('freelancer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid.';
    if (!formData.password) newErrors.password = 'Password is required.';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to the terms and conditions.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dev preview bypass: allow proceeding with empty credentials
    if (isPreviewMode()) {
      setLoading(true);
      console.log('Preview signup bypass:', { selectedRole, formData });
      setTimeout(() => {
        setLoading(false);
        router.push(selectedRole === 'client' ? '/client/dashboard' : '/dashboard');
      }, 300);
      return;
    }
    if (validate()) {
      setLoading(true);
      console.log('Creating account for:', selectedRole, formData);
      setTimeout(() => setLoading(false), 2000);
    }
  };

  // @AI-HINT: Social signup click handler. In preview mode, this simulates the auth flow and redirects to the appropriate dashboard. Replace with real provider logic when backend is ready.
  const handleSocialLogin = (provider: 'google' | 'github') => {
    if (isPreviewMode()) {
      setLoading(true);
      console.log(`Preview social signup via ${provider} as ${selectedRole}`);
      setTimeout(() => {
        setLoading(false);
        router.push(selectedRole === 'client' ? '/client/dashboard' : '/dashboard');
      }, 300);
      return;
    }
    console.log('Social signup clicked:', provider, 'role:', selectedRole);
  };

  const styles = useMemo(() => {
    const themeStyles = theme === 'light' ? lightStyles : darkStyles;
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
      socialAuth: merge('socialAuth'),
      divider: merge('divider'),
      dividerText: merge('dividerText'),
      loginForm: merge('loginForm'),
      inputGroup: merge('inputGroup'),
      passwordToggle: merge('passwordToggle'),
      formOptions: merge('formOptions'),
      forgotPasswordLink: merge('forgotPasswordLink'),
      submitButton: merge('submitButton'),
      signupPrompt: merge('signupPrompt'),
      generalError: merge('generalError'),
    } as const;
  }, [theme]);

  return (
    <div className={styles.loginPage}>
      <div className={styles.brandingSlot}>
        <AuthBrandingPanel roleConfig={roleConfig[selectedRole]} />
      </div>
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Create Your Account</h1>
            <p className={styles.formSubtitle}>Join the top-tier network of talent and clients.</p>
          </div>

          <Tabs defaultIndex={Object.keys(roleConfig).indexOf(selectedRole)} onTabChange={(index) => setSelectedRole(Object.keys(roleConfig)[index] as UserRole)}>
            <Tabs.List className={styles.roleSelector}>
              {Object.values(roleConfig).map((role) => (
                <Tabs.Tab key={role.id} icon={<role.brandIcon />}>
                  {role.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          <div className={styles.socialAuth}>
            <Button variant="social" provider="google" onClick={() => handleSocialLogin('google')} disabled={loading}><FaGoogle className="mr-2" /> Continue with Google</Button>
            <Button variant="social" provider="github" onClick={() => handleSocialLogin('github')} disabled={loading}><FaGithub className="mr-2" /> Continue with GitHub</Button>
          </div>

          <div className={styles.divider}><span className={styles.dividerText}>OR</span></div>

          <form onSubmit={handleSubmit} noValidate className={styles.loginForm}>
            <Input name="fullName" type="text" label="Full Name" placeholder="John Doe" value={formData.fullName} onChange={handleChange} error={errors.fullName} disabled={loading} />
            <Input name="email" type="email" label="Email" placeholder="you@example.com" value={formData.email} onChange={handleChange} error={errors.email} disabled={loading} />
            <Input 
              name="password" 
              type={showPassword ? 'text' : 'password'}
              label="Password" 
              placeholder="8+ characters" 
              value={formData.password} 
              onChange={handleChange} 
              error={errors.password} 
              disabled={loading} 
              iconAfter={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.passwordToggle} aria-label="Toggle password visibility">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              }
            />
            <Input 
              name="confirmPassword" 
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password" 
              placeholder="Re-enter password" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              error={errors.confirmPassword} 
              disabled={loading} 
              iconAfter={
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={styles.passwordToggle} aria-label="Toggle password visibility">
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              }
            />
            
            <Checkbox
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
              error={errors.agreedToTerms}
            >
              I agree to the <Link href="/terms" className={styles.forgotPasswordLink}>Terms</Link> & <Link href="/privacy" className={styles.forgotPasswordLink}>Privacy Policy</Link>.
            </Checkbox>

            <Button type="submit" variant="primary" fullWidth className={styles.submitButton} isLoading={loading} disabled={loading}>
              {loading ? 'Creating Account...' : `Create ${roleConfig[selectedRole].label} Account`}
            </Button>
          </form>

          <div className={styles.signupPrompt}>
            <p>Already have an account? <Link href="/login">Sign In</Link> or <Link href="/passwordless">use magic link</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
