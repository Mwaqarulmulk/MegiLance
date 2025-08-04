// @AI-HINT: This is the Login page root component. All styles are per-component only. See Login.common.css, Login.light.css, and Login.dark.css for theming.
'use client';
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from "@/app/components/Button/Button";
import Input from "@/app/components/Input/Input";
import "./Login.common.css";
import "./Login.light.css";
import "./Login.dark.css";

interface LoginProps {
  theme?: "light" | "dark";
}

const Login: React.FC<LoginProps> = ({ theme = "light" }) => {
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
    setFormData(prev => ({ ...prev, [name]: value }));
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
          router.push('/dashboard'); // Redirect to dashboard after mock login
        }, 1000);
      } else {
        setTimeout(() => {
          setLoading(false);
          setErrors({ ...errors, password: 'Invalid email or password (mock only)' });
        }, 1000);
      }
      // Handle successful submission (e.g., redirect)

    }
  };
  return (
    <div className={`Login Login--${theme}`}>
      <div className="Login-container">
        <h1 className="Login-title">Welcome Back</h1>
        <p className="Login-subtitle">Log in to continue to your MegiLance account.</p>
        <div className="Login-mock-credentials">
          <strong>Mock Test Credentials</strong><br />
          Email: <code>testuser@example.com</code><br />
          Password: <code>testpass123</code>
        </div>
        <form className="Login-form" onSubmit={handleSubmit} noValidate>
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
          <Button theme={theme} variant="primary" fullWidth type="submit" disabled={loading}>
            {loading ? 'Logging In...' : 'Log In'}
          </Button>
        </form>
        <p className="Login-signup-link">
          Don&apos;t have an account? <Link href="/Signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
