// @AI-HINT: This is the redesigned Signup page component. It supports role selection (Client or Freelancer), uses the global theme context via `next-themes`, and is styled with CSS Modules for a modern, scoped, and maintainable structure.
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { FaGoogle, FaGithub, FaBuilding, FaUserTie, FaBriefcase } from 'react-icons/fa';
import { cn } from '@/lib/utils';

import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import Checkbox from '@/app/components/Checkbox/Checkbox';

import commonStyles from './Signup.common.module.css';
import lightStyles from './Signup.light.module.css';
import darkStyles from './Signup.dark.module.css';

type Role = 'client' | 'freelancer';

const Signup: React.FC = () => {
  const { theme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<Role>('freelancer');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const styles = useMemo(() => {
    const themeStyles = theme === 'light' ? lightStyles : darkStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms and conditions.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      console.log('Submitting for role:', selectedRole, formData);
      // Mock API call
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const RoleButton = ({ role, label, icon: Icon }: { role: Role; label: string; icon: React.ElementType }) => (
    <button
      className={cn(styles.roleButton, selectedRole === role && styles.roleButtonSelected)}
      onClick={() => setSelectedRole(role)}
    >
      <Icon className={styles.roleIcon} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className={styles.signupContainer}>
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <Link href="/" className={styles.brandLogoLink}>
            <FaBuilding className={styles.brandLogoIcon} />
            <h1 className={styles.brandTitle}>MegiLance</h1>
          </Link>
          <p className={styles.brandSubtitle}>The Future of Decentralized Freelancing</p>
          <p className={styles.brandText}>
            Connect with top talent, manage projects with confidence, and transact securely using cryptocurrency.
          </p>
        </div>
      </div>
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <h2 className={styles.title}>Create an Account</h2>
          <p className={styles.subtitle}>Join a growing community of innovators and experts.</p>

          <div className={styles.roleSelector}>
            <RoleButton role="client" label="I'm a Client" icon={FaUserTie} />
            <RoleButton role="freelancer" label="I'm a Freelancer" icon={FaBriefcase} />
          </div>

          <div className={styles.socialButtons}>
            <Button variant="secondary" fullWidth><FaGoogle className="mr-2" /> Sign up with Google</Button>
            <Button variant="secondary" fullWidth><FaGithub className="mr-2" /> Sign up with GitHub</Button>
          </div>

          <div className={styles.divider}><span>OR</span></div>

          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            <Input label="Full Name" type="text" placeholder="John Doe" name="fullName" value={formData.fullName} onChange={handleChange} error={errors.fullName} required />
            <Input label="Email Address" type="email" placeholder="you@example.com" name="email" value={formData.email} onChange={handleChange} error={errors.email} required />
            <Input label="Password" type="password" placeholder="Minimum 8 characters" name="password" value={formData.password} onChange={handleChange} error={errors.password} required />
            <Input label="Confirm Password" type="password" placeholder="Re-enter your password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />
            <Checkbox name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} error={errors.agreedToTerms}>
              I agree to the <Link href="/terms" className={styles.link}>Terms of Service</Link> and <Link href="/privacy" className={styles.link}>Privacy Policy</Link>.
            </Checkbox>
            <Button variant="primary" fullWidth type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : `Create ${selectedRole === 'client' ? 'Client' : 'Freelancer'} Account`}
            </Button>
          </form>

          <p className={styles.loginLink}>
            Already have an account? <Link href="/Login" className={styles.link}>Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
