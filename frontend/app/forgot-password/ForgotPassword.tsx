// @AI-HINT: This is the Forgot Password page root component. All styles are per-component only. See ForgotPassword.common.css, ForgotPassword.light.css, and ForgotPassword.dark.css for theming.
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import './ForgotPassword.common.css';
import './ForgotPassword.light.css';
import './ForgotPassword.dark.css';

interface ForgotPasswordProps {
  theme?: 'light' | 'dark';
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ theme = 'light' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Password reset requested for:', email);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className={`ForgotPassword ForgotPassword--${theme}`}>
      <div className="ForgotPassword-container">
        <h1 className="ForgotPassword-title">Forgot Password?</h1>
        {submitted ? (
          <p className="ForgotPassword-subtitle">If an account with that email exists, we&apos;ve sent instructions to reset your password.</p>
        ) : (
          <p className="ForgotPassword-subtitle">Enter your email address and we&apos;ll send you a link to reset your password.</p>
        )}
        {!submitted && (
          <form className="ForgotPassword-form" onSubmit={handleSubmit} noValidate>
            <Input
              theme={theme}
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button theme={theme} variant="primary" fullWidth type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}
        <p className="ForgotPassword-back-link">
          <Link href="/Login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
