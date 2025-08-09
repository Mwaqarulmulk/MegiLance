// @AI-HINT: Premium SaaS Login component for MegiLance platform. This is the main authentication interface that handles three user roles (Admin, Client, Freelancer) with investor-grade UI quality. Features secure login, role selection, social authentication, and responsive design following exact MegiLance brand guidelines. Uses per-component CSS architecture with .common.css, .light.css, .dark.css theming. Designed to match quality standards of Linear, Vercel, GitHub, and Upwork Pro.
// @AI-HINT: Premium SaaS Login component for MegiLance. Redesigned for investor-grade UI/UX quality, matching standards of Vercel, Linear, and Toptal. Features a modern two-panel layout, role-based dynamic content, and pixel-perfect implementation of the official brand playbook.
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaGoogle, FaGithub, FaUserTie, FaBriefcase, FaUserShield } from 'react-icons/fa';
import Tabs from '@/app/components/Tabs/Tabs';
import { FaEye, FaEyeSlash, FaLaptopCode, FaTasks, FaUserCog } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import AuthBrandingPanel from '@/app/components/Auth/BrandingPanel/BrandingPanel';
import Checkbox from '@/app/components/Checkbox/Checkbox';
import commonStyles from './Login.common.module.css';
import lightStyles from './Login.light.module.css';
import darkStyles from './Login.dark.module.css';
import { isPreviewMode } from '@/app/utils/flags';

type UserRole = 'freelancer' | 'client' | 'admin';

// @AI-HINT: Role-specific configuration. Defines icons, labels, and dynamic content for the branding panel. This approach makes the UI feel more tailored and intelligent.
const roleConfig = {
  freelancer: {
    id: 'freelancer' as UserRole,
    icon: FaUserTie,
    label: 'Freelancer',
    redirectPath: '/dashboard',
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



// @AI-HINT: The main Login component, orchestrating the layout and state. It's structured for clarity, separating the branding panel from the login form.
const Login: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('freelancer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });

  const styles = theme === 'dark' ? { ...commonStyles, ...darkStyles } : { ...commonStyles, ...lightStyles };

  const validate = () => {
    const newErrors = { email: '', password: '', general: '' };
    let isValid = true;
    if (!formData.email) {
      newErrors.email = 'Email is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreviewMode()) {
      // Preview mode: bypass validation and go straight to the role destination
      router.push(roleConfig[selectedRole].redirectPath);
      return;
    }
    if (!validate()) return;
    setLoading(true);
    setErrors({ email: '', password: '', general: '' });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Login successful:', { ...formData, role: selectedRole });
      router.push(roleConfig[selectedRole].redirectPath);
    } catch (error) {
      setErrors({ email: '', password: '', general: 'Login failed. Please check your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`${provider} login successful for role:`, selectedRole);
      router.push(roleConfig[selectedRole].redirectPath);
    } catch (error) {
      setErrors({ email: '', password: '', general: `Sign in with ${provider} failed.` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <AuthBrandingPanel roleConfig={roleConfig[selectedRole]} />
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          {isPreviewMode() && (
            <div role="status" aria-live="polite" className="mb-4 rounded-md border border-dashed border-[var(--border-color)] p-3 text-sm text-[var(--text-secondary)]">
              <strong>Preview Mode:</strong> Auth checks are disabled. Use the quick links below to jump into dashboards.
            </div>
          )}
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Sign in to MegiLance</h1>
            <p className={styles.formSubtitle}>Enter your details to access your account.</p>
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

          <div className={styles.socialAuth}>
            <Button variant="outline" fullWidth onClick={() => handleSocialLogin('google')} disabled={loading}>
              <FaGoogle className="mr-2" /> Continue with Google
            </Button>
            <Button variant="outline" fullWidth onClick={() => handleSocialLogin('github')} disabled={loading}>
              <FaGithub className="mr-2" /> Continue with GitHub
            </Button>
          </div>

          {isPreviewMode() && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              <Button variant="secondary" onClick={() => router.push(roleConfig.freelancer.redirectPath)}>Freelancer Dashboard</Button>
              <Button variant="secondary" onClick={() => router.push(roleConfig.client.redirectPath)}>Client Dashboard</Button>
              <Button variant="secondary" onClick={() => router.push(roleConfig.admin.redirectPath)}>Admin Dashboard</Button>
            </div>
          )}

          <div className={styles.divider}>
            <span className={styles.dividerText}>OR</span>
          </div>

          <form onSubmit={handleSubmit} noValidate className={styles.loginForm}>
            {errors.general && <p className={styles.generalError}>{errors.general}</p>}
            <div className={styles.inputGroup}>
              <Input
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                disabled={loading}
              />
            </div>
            <div className={styles.inputGroup}>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Enter your password"
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
            </div>

            <div className={styles.formOptions}>
              <Checkbox
                name="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              >
                Remember me
              </Checkbox>
              <Link href="/forgot-password" className={styles.forgotPasswordLink}>
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" variant="primary" fullWidth isLoading={loading} className={styles.submitButton}>
              {loading ? 'Signing In...' : `Sign In as ${roleConfig[selectedRole].label}`}
            </Button>
          </form>

          <div className={styles.signupPrompt}>
            <p>Don&apos;t have an account? <Link href="/signup">Create one now</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
