// @AI-HINT: This is the Reset Password page root component. All styles are per-component only. See ResetPassword.common.css, ResetPassword.light.css, and ResetPassword.dark.css for theming.
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import './ResetPassword.common.css';
import './ResetPassword.light.css';
import './ResetPassword.dark.css';

interface ResetPasswordProps {
  theme?: 'light' | 'dark';
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ theme = 'light' }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = { password: '', confirmPassword: '' };
    let isValid = true;

    if (!formData.password) {
      newErrors.password = 'Password is required.';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      console.log('Password reset submitted');
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
      }, 1500);
    }
  };

  return (
    <div className={`ResetPassword ResetPassword--${theme}`}>
      <div className="ResetPassword-container">
        <h1 className="ResetPassword-title">Reset Your Password</h1>
        {submitted ? (
          <p className="ResetPassword-subtitle">Your password has been successfully reset. You can now log in with your new password.</p>
        ) : (
          <p className="ResetPassword-subtitle">Create a new, strong password.</p>
        )}
        {!submitted ? (
          <form className="ResetPassword-form" onSubmit={handleSubmit} noValidate>
            <Input
              theme={theme}
              label="New Password"
              type="password"
              placeholder="••••••••"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <Input
              theme={theme}
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
            <Button theme={theme} variant="primary" fullWidth type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        ) : (
          <Link href="/Login">
            <Button theme={theme} variant="primary" fullWidth>Back to Login</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
