// @AI-HINT: This is the Signup page root component. All styles are per-component only. See Signup.common.css, Signup.light.css, and Signup.dark.css for theming.
'use client';
import React, { useState } from "react";
import Link from 'next/link';
import Button from "@/app/components/Button/Button";
import Input from "@/app/components/Input/Input";
import "./Signup.common.css";
import "./Signup.light.css";
import "./Signup.dark.css";

interface SignupProps {
  theme?: "light" | "dark";
}

const Signup: React.FC<SignupProps> = ({ theme = "light" }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validate = () => {
    const newErrors = { fullName: '', email: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required.';
      isValid = false;
    }

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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
      isValid = false;
    }

    if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
        isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
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
      console.log('Form submitted:', formData);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        // Handle successful submission (e.g., redirect)
      }, 2000);
    }
  };
  return (
    <div className={`Signup Signup--${theme}`}>
      <div className="Signup-container">
        <h1 className="Signup-title">Create Your Account</h1>
        <p className="Signup-subtitle">Join MegiLance to find work and get paid in crypto.</p>
        <form className="Signup-form" onSubmit={handleSubmit} noValidate>
          <Input
            theme={theme}
            label="Full Name"
            type="text"
            placeholder="John Doe"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            required
          />
          <Input
            theme={theme}
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
            theme={theme}
            label="Password"
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
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />
          <Button theme={theme} variant="primary" fullWidth type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        <p className="Signup-login-link">
          Already have an account? <Link href="/Login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
