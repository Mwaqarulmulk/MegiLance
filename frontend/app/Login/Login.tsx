// @AI-HINT: This is the Login page root component. All styles are per-component only. See Login.common.css, Login.light.css, and Login.dark.css for theming.
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaGoogle, FaGithub, FaBuilding } from 'react-icons/fa';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import './Login.common.css';
import './Login.light.css';
import './Login.dark.css';

interface LoginProps {
  theme?: 'light' | 'dark';
}

const Login: React.FC<LoginProps> = ({ theme = 'light' }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validate = () => {
    const newErrors = { email: '', password: '' };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      if (formData.email === MOCK_EMAIL && formData.password === MOCK_PASSWORD) {
        setTimeout(() => {
          setLoading(false);
          router.push('/dashboard');
        }, 1000);
      } else {
        setTimeout(() => {
          setLoading(false);
          setErrors({ ...errors, password: 'Invalid email or password (mock only)' });
        }, 1000);
      }
    }
  };

  return (
    <div className={`Login Login--${theme}`}>
      <div className="Login-panel Login-panel--brand">
        <div className="Login-brand-content">
            <FaBuilding className="Login-logo-icon" />
            <h1 className="Login-brand-title">MegiLance</h1>
            <p className="Login-brand-subtitle">The Future of Freelance Collaboration</p>
            <p className="Login-brand-text">Log in to access your projects, messages, and payments all in one place. Secure, fast, and reliable.</p>
        </div>
      </div>
      <div className="Login-panel Login-panel--form">
        <div className="Login-form-container">
          <h2 className="Login-title">Welcome Back</h2>
          <p className="Login-subtitle">Log in to continue to your MegiLance account.</p>
          
          <div className="Login-social-buttons">
            <Button variant="secondary" fullWidth><FaGoogle /> Sign in with Google</Button>
            <Button variant="secondary" fullWidth><FaGithub /> Sign in with GitHub</Button>
          </div>

          <div className="Login-divider"><span>OR</span></div>

          <form className="Login-form" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <div className="Login-forgot-password">
              <Link href="/forgot-password">Forgot Password?</Link>
            </div>
            <Button variant="primary" fullWidth type="submit" disabled={loading}>
              {loading ? 'Logging In...' : 'Log In'}
            </Button>
          </form>
          <p className="Login-signup-link">
            Don&apos;t have an account? <Link href="/Signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
