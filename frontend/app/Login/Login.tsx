// @AI-HINT: Premium SaaS Login component for MegiLance platform. This is the main authentication interface that handles three user roles (Admin, Client, Freelancer) with investor-grade UI quality. Features secure login, role selection, social authentication, and responsive design following exact MegiLance brand guidelines. Uses per-component CSS architecture with .common.css, .light.css, .dark.css theming. Designed to match quality standards of Linear, Vercel, GitHub, and Upwork Pro.
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaGoogle, FaGithub, FaBuilding, FaUser, FaUserTie, FaCog, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import './Login.common.css';
import './Login.light.css';
import './Login.dark.css';

type UserRole = 'freelancer' | 'client' | 'admin';

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
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
    <div className="Login">
      {/* Premium Brand Panel */}
      <div className="Login-panel Login-panel--brand">
        <div className="Login-brand-content">
          <div className="Login-brand-header">
            <FaBuilding className="Login-logo-icon" />
            <h1 className="Login-brand-title">MegiLance</h1>
            <p className="Login-brand-subtitle">Empowering Freelancers with AI and Secure USDC Payments</p>
          </div>
          <div className="Login-brand-features">
            <div className="Login-feature">
              <FaShieldAlt className="Login-feature-icon" />
              <span>Secure Authentication</span>
            </div>
            <div className="Login-feature">
              <FaUser className="Login-feature-icon" />
              <span>Multi-Role Access</span>
            </div>
            <div className="Login-feature">
              <FaBuilding className="Login-feature-icon" />
              <span>Enterprise Ready</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Premium Login Form Panel */}
      <div className="Login-panel Login-panel--form">
        <div className="Login-form-container">
          
          {/* Premium Role Selection */}
          <div className="Login-role-selection">
            <h2 className="Login-form-title">Welcome Back</h2>
            <p className="Login-form-subtitle">Select your role and sign in to continue</p>
            
            <div className="Login-roles">
              {Object.entries(roleConfig).map(([role, config]) => {
                const IconComponent = config.icon;
                return (
                  <button
                    key={role}
                    type="button"
                    className={`Login-role-button ${
                      selectedRole === role ? 'Login-role-button--active' : ''
                    }`}
                    onClick={() => setSelectedRole(role as UserRole)}
                    disabled={loading}
                  >
                    <IconComponent className="Login-role-icon" />
                    <div className="Login-role-content">
                      <span className="Login-role-label">{config.label}</span>
                      <span className="Login-role-description">{config.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Premium Social Authentication */}
          <div className="Login-social-section">
            <div className="Login-social-buttons">
              <button
                type="button"
                className="Login-social-button Login-social-button--google"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
              >
                <FaGoogle className="Login-social-icon" />
                <span>Continue with Google</span>
              </button>
              <button
                type="button"
                className="Login-social-button Login-social-button--github"
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
              >
                <FaGithub className="Login-social-icon" />
                <span>Continue with GitHub</span>
              </button>
            </div>
            
            <div className="Login-divider">
              <span className="Login-divider-text">or continue with email</span>
            </div>
          </div>

          {/* Premium Login Form */}
          <form className="Login-form" onSubmit={handleSubmit} noValidate>
            {/* Premium Email Input */}
            <div className="Login-input-group">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                className="Login-input"
              />
            </div>
            
            {/* Premium Password Input with Show/Hide Toggle */}
            <div className="Login-input-group">
              <div className="Login-password-wrapper">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  className="Login-input"
                />
                <button
                  type="button"
                  className="Login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {/* Premium Form Options */}
            <div className="Login-form-options">
              <div className="Login-remember-group">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="Login-checkbox"
                />
                <label htmlFor="remember-me" className="Login-checkbox-label">
                  Remember me for 30 days
                </label>
              </div>
              <Link href="/forgot-password" className="Login-forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Premium Submit Button */}
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              isLoading={loading}
              className="Login-submit-button"
            >
              {loading ? `Signing in as ${roleConfig[selectedRole].label}...` : `Sign in as ${roleConfig[selectedRole].label}`}
            </Button>
          </form>
          
          {/* Premium Sign Up Link */}
          <div className="Login-signup-section">
            <p className="Login-signup-text">
              Don't have an account?
              <Link href="/signup" className="Login-signup-link">
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
