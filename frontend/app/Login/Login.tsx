// @AI-HINT: Premium SaaS Login component for MegiLance platform. This is the main authentication interface that handles three user roles (Admin, Client, Freelancer) with investor-grade UI quality. Features secure login, role selection, social authentication, and responsive design following exact MegiLance brand guidelines. Uses per-component CSS architecture with .common.css, .light.css, .dark.css theming. Designed to match quality standards of Linear, Vercel, GitHub, and Upwork Pro.
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaGoogle, FaGithub, FaBuilding, FaUser, FaUserTie, FaCog, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
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
      icon: FaUser,
      label: 'Freelancer',
      description: 'Find projects and grow your career',
      color: 'var(--primary)',
      redirectPath: '/dashboard'
    },
    client: {
      icon: FaBuilding,
      label: 'Client',
      description: 'Hire talented freelancers',
      color: 'var(--success)',
      redirectPath: '/client/dashboard'
    },
    admin: {
      icon: FaShieldAlt,
      label: 'Admin',
      description: 'Platform administration',
      color: 'var(--warning)',
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

  const MOCK_EMAIL = 'testuser@example.com';
  const MOCK_PASSWORD = 'testpass123';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({ email: '', password: '', general: '' });

    try {
      // Simulate API call with role-based authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login with role-based routing
      console.log('Login successful:', { ...formData, role: selectedRole });
      
      // Premium role-based navigation
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
    <div className={cn(commonStyles.login, theme === 'light' ? lightStyles.light : darkStyles.dark)}>
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
            <div className={commonStyles.loginFeature}>
              <FaShieldAlt className={commonStyles.loginFeatureIcon} />
              <span>Secure Authentication</span>
            </div>
            <div className={commonStyles.loginFeature}>
              <FaUser className={commonStyles.loginFeatureIcon} />
              <span>Multi-Role Access</span>
            </div>
            <div className={commonStyles.loginFeature}>
              <FaBuilding className={commonStyles.loginFeatureIcon} />
              <span>Enterprise Ready</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Premium Login Form Panel */}
      <div className={cn(commonStyles.loginPanel, commonStyles.loginPanelForm)}>
        <div className={commonStyles.loginFormContainer}>
        
          
          {/* Premium Role Selection */}
          <div className={commonStyles.loginRoleSelection}>
            <h2 className={commonStyles.loginFormTitle}>Welcome Back</h2>
            <p className={commonStyles.loginFormSubtitle}>Select your role and sign in to continue</p>
            
            <div className={commonStyles.loginRoles}>
              {Object.entries(roleConfig).map(([role, config]) => {
                const IconComponent = config.icon;
                return (
                  <button
                    key={role}
                    type="button"
                    className={cn(
                      commonStyles.loginRoleButton,
                      selectedRole === role && commonStyles.loginRoleButtonActive
                    )}
                    onClick={() => setSelectedRole(role as UserRole)}
                    disabled={loading}
                  >
                    <IconComponent className={commonStyles.loginRoleIcon} />
                    <div className={commonStyles.loginRoleContent}>
                      <span className={commonStyles.loginRoleLabel}>{config.label}</span>
                      <span className={commonStyles.loginRoleDescription}>{config.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Premium Social Authentication */}
          <div className={commonStyles.loginSocialSection}>
            <div className={commonStyles.loginSocialButtons}>
              <button
                type="button"
                className={cn(commonStyles.loginSocialButton, commonStyles.loginSocialButtonGoogle)}
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
              >
                <FaGoogle className={commonStyles.loginSocialIcon} />
                <span>Continue with Google</span>
              </button>
              <button
                type="button"
                className={cn(commonStyles.loginSocialButton, commonStyles.loginSocialButtonGithub)}
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
            {/* Premium Email Input */}
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
                className={commonStyles.loginInput}
              />
            </div>
            
            {/* Premium Password Input with Show/Hide Toggle */}
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
                  className={commonStyles.loginInput}
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
            {/* Premium Form Options */}
            <div className={commonStyles.loginFormOptions}>
              <div className={commonStyles.loginRememberGroup}>
                <input
                  type="checkbox"
                  id="remember-me"
                  className={commonStyles.loginCheckbox}
                />
                <label htmlFor="remember-me" className={commonStyles.loginCheckboxLabel}>
                  Remember me for 30 days
                </label>
              </div>
              <Link href="/forgot-password" className={commonStyles.loginForgotLink}>
                Forgot password?
              </Link>
            </div>

            {/* Premium Submit Button */}
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              isLoading={loading}
              className={commonStyles.loginSubmitButton}
            >
              {loading ? `Signing in as ${roleConfig[selectedRole].label}...` : `Sign in as ${roleConfig[selectedRole].label}`}
            </Button>
          </form>
          
          {/* Premium Sign Up Link */}
          <div className={commonStyles.loginSignupSection}>
            <p className={commonStyles.loginSignupText}>
              Don't have an account?
              <Link href="/signup" className={commonStyles.loginSignupLink}>
                Create your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
