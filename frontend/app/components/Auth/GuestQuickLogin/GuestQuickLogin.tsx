'use client';

import React from 'react';
import { UserCheck, Briefcase, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './GuestQuickLogin.common.module.css';
import lightStyles from './GuestQuickLogin.light.module.css';
import darkStyles from './GuestQuickLogin.dark.module.css';

interface GuestQuickLoginProps {
  onAutoLogin: (email: string, password: string, role: 'admin' | 'freelancer' | 'client') => void;
  isLoading?: boolean;
}

const GuestQuickLogin: React.FC<GuestQuickLoginProps> = ({ onAutoLogin, isLoading }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const styles = React.useMemo(() => {
    const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
    const merge = (key: keyof typeof commonStyles) =>
      cn((commonStyles as any)[key], (themeStyles as any)[key]);
    return {
      container: merge('container'),
      header: merge('header'),
      title: merge('title'),
      subtitle: merge('subtitle'),
      buttonGrid: merge('buttonGrid'),
      roleButton: merge('roleButton'),
      roleIcon: merge('roleIcon'),
      roleLabel: merge('roleLabel'),
      sparkleIcon: merge('sparkleIcon'),
    } as const;
  }, [resolvedTheme]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Predefined guest accounts
  const guestFreelancerEmail = process.env.NEXT_PUBLIC_DEV_FREELANCER_EMAIL || 'freelancer1@example.com';
  const guestFreelancerPassword = process.env.NEXT_PUBLIC_DEV_FREELANCER_PASSWORD || 'password123';
  const guestClientEmail = process.env.NEXT_PUBLIC_DEV_CLIENT_EMAIL || 'client1@example.com';
  const guestClientPassword = process.env.NEXT_PUBLIC_DEV_CLIENT_PASSWORD || 'password123';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Sparkles className={styles.sparkleIcon} size={16} />
          <span>Explore as Guest</span>
        </div>
        <p className={styles.subtitle}>
          Access demo accounts instantly to review the freelancer or client dashboard portals.
        </p>
      </div>
      <div className={styles.buttonGrid}>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onAutoLogin(guestFreelancerEmail, guestFreelancerPassword, 'freelancer')}
          className={styles.roleButton}
          aria-label="Explore as Guest Freelancer"
        >
          <div className={styles.roleIcon}>
            <UserCheck size={20} />
          </div>
          <span className={styles.roleLabel}>Guest Freelancer</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => onAutoLogin(guestClientEmail, guestClientPassword, 'client')}
          className={styles.roleButton}
          aria-label="Explore as Guest Client"
        >
          <div className={styles.roleIcon}>
            <Briefcase size={20} />
          </div>
          <span className={styles.roleLabel}>Guest Client</span>
        </button>
      </div>
    </div>
  );
};

export default GuestQuickLogin;
