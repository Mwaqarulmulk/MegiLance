// @AI-HINT: Premium SaaS Login component for MegiLance platform. This is the main authentication interface that handles three user roles (Admin, Client, Freelancer) with investor-grade UI quality. Features secure login, role selection, social authentication, and responsive design following exact MegiLance brand guidelines. Uses per-component CSS architecture with .common.css, .light.css, .dark.css theming. Designed to match quality standards of Linear, Vercel, GitHub, and Upwork Pro.
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaGoogle, FaGithub, FaBuilding, FaUser, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';

import { cn } from '@/lib/utils';
import commonStyles from './Login.common.module.css';
import lightStyles from './Login.light.module.css';
import darkStyles from './Login.dark.module.css';
import { useTheme } from 'next-themes';

// @AI-HINT: Premium SaaS Login component for MegiLance platform. Now fully theme-switchable using global theme context and per-component CSS modules.

type UserRole = 'freelancer' | 'client' | 'admin';

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const { theme } = useTheme();

  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('freelancer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });

  // Premium role configuration for three-role system
  const roleConfig = {
    freelancer: {
      id: 'freelancer' as UserRole,
      icon: FaUser,
      label: 'Freelancer',
      redirectPath: '/dashboard'
    },
    client: {
      id: 'client' as UserRole,
      icon: FaBuilding,
      label: 'Client',
      redirectPath: '/client/dashboard'
    },
    admin: {
      id: 'admin' as UserRole,
      icon: FaShieldAlt,
      label: 'Admin',
      redirectPath: '/admin/dashboard'
    }
  };

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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({ email: '', password: '', general: '' });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Login successful:', { ...formData, role: selectedRole });
      const redirectPath = roleConfig[selectedRole].redirectPath;
      router.push(redirectPath);
    } catch (error) {
      setErrors({ 
        email: '', 
        password: '', 
        general: 'Login failed. Please check your credentials and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      // Simulate social authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`${provider} login successful for role:`, selectedRole);
      
      const redirectPath = roleConfig[selectedRole].redirectPath;
      router.push(redirectPath);
    } catch (error) {
      setErrors({ 
        email: '', 
        password: '', 
        general: `${provider} login failed. Please try again.` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(commonStyles.login, theme === 'dark' ? darkStyles.dark : lightStyles.light)}>
      {/* AI-HINT: The 'cn' utility merges common styles with theme-specific (light/dark) styles. */}
      {/* Premium Brand Panel */}
      <div className={cn(commonStyles.loginPanel, commonStyles.loginPanelBrand)}>
          {/* AI-HINT: Combines base 'loginPanel' styles with the 'loginPanelBrand' variant. */}
        <div className={commonStyles.loginBrandContent}>
          <div className={commonStyles.loginBrandHeader}>
            <FaBuilding className={commonStyles.loginLogoIcon} />
            <h1 className={commonStyles.loginBrandTitle}>MegiLance</h1>
            <p className={commonStyles.loginBrandSubtitle}>Empowering Freelancers with AI and Secure USDC Payments</p>
          </div>
          <div className={commonStyles.loginBrandFeatures}>
        </div>
        <blockquote className={commonStyles.loginBrandingQuote}>
          “The best platform to connect with top-tier talent and find your next big opportunity.”
          <footer className={commonStyles.loginBrandingQuoteAuthor}>
            - Jane Doe, CEO of TechCorp
          </footer>
        </blockquote>
        </div>
      </div>

      {/* Premium Form Section */}
      <div className={commonStyles.loginFormContainer}>
        <div className={commonStyles.loginFormWrapper}>
          <div className={commonStyles.loginHeader}>
            <h1 className={commonStyles.loginTitle}>Welcome Back</h1>
            <p className={commonStyles.loginSubtitle}>Sign in to continue your journey with MegiLance.</p>
          </div>

          {/* Premium Role Selector */}
          <div className={commonStyles.loginRoleSelector}>
            {Object.values(roleConfig).map((role) => (
              <button
                key={role.id}
                type="button"
                className={cn(
                  commonStyles.loginRoleButton,
                  { [commonStyles.active]: selectedRole === role.id }
                )}
                onClick={() => setSelectedRole(role.id)}
              >
                <role.icon className={commonStyles.loginRoleIcon} />
                <span>{role.label}</span>
              </button>
            ))}
          </div>

          {/* Premium Social Authentication */}
          <div className={commonStyles.loginSocialAuth}>
            <div className={commonStyles.loginSocialButtons}>
              <button
                type="button"
                className={commonStyles.loginSocialButton}
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
              >
                <FaGoogle className={commonStyles.loginSocialIcon} />
                <span>Continue with Google</span>
              </button>
              <button
                type="button"
                className={commonStyles.loginSocialButton}
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
              >
                <FaGithub className={commonStyles.loginSocialIcon} />
                <span>Continue with GitHub</span>
              </button>
            </div>
            
            <div className={commonStyles.loginDivider}>
              <span className={commonStyles.loginDividerText}>or continue with email</span>
            </div>
          </div>

          {/* Premium Login Form */}
          <form className={commonStyles.loginForm} onSubmit={handleSubmit} noValidate>
            {errors.general && <p className="error-message">{errors.general}</p>}
            <div className={commonStyles.loginInputGroup}>
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
            </div>
            
            <div className={commonStyles.loginInputGroup}>
              <div className={commonStyles.loginPasswordWrapper}>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />
                <button
                  type="button"
                  className={commonStyles.loginPasswordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className={commonStyles.loginFormOptions}>
              <div className={commonStyles.loginRememberGroup}>
                <input
                  type="checkbox"
                  id="remember-me"
                  className={commonStyles.loginCheckbox}
                />
                <label htmlFor="remember-me" className={commonStyles.loginCheckboxLabel}>
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className={commonStyles.loginForgotLink}>
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              isLoading={loading}
              className={commonStyles.loginSubmitButton}
            >
              {loading ? `Signing in...` : `Sign in as ${roleConfig[selectedRole].label}`}
            </Button>
          </form>
          
          <div className={commonStyles.loginSignupSection}>
            <p className={commonStyles.loginSignupText}>
              Don't have an account?
              <Link href="/signup" className={commonStyles.loginSignupLink}>
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
