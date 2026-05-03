// @AI-HINT: Advanced password strength meter with real-time validation and visual feedback
'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import commonStyles from './PasswordStrengthMeter.common.module.css';
import lightStyles from './PasswordStrengthMeter.light.module.css';
import darkStyles from './PasswordStrengthMeter.dark.module.css';

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains number', test: (p) => /\d/.test(p) },
  { label: 'Contains special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const calculateStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  
  // Length scoring
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

  // Patterns
  if (!/(.)\1{2,}/.test(password)) score += 5; // No repeated characters
  if (!/^[0-9]+$/.test(password)) score += 5; // Not just numbers

  if (score <= 30) return { score, label: 'Weak', color: '#e81123' };
  if (score <= 60) return { score, label: 'Fair', color: '#F2C94C' };
  if (score <= 80) return { score, label: 'Good', color: '#ff9800' };
  return { score: 100, label: 'Excellent', color: '#27AE60' };
};

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showRequirements = true,
  className,
}) => {
  const { resolvedTheme } = useTheme();
  
  const styles = useMemo(() => {
    const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
    return {
      container: cn(commonStyles.container, themeStyles.container),
      strengthBar: cn(commonStyles.strengthBar, themeStyles.strengthBar),
      strengthFill: cn(commonStyles.strengthFill, themeStyles.strengthFill),
      strengthLabel: cn(commonStyles.strengthLabel, themeStyles.strengthLabel),
      requirements: cn(commonStyles.requirements, themeStyles.requirements),
      requirement: cn(commonStyles.requirement, themeStyles.requirement),
      requirementMet: cn(commonStyles.requirementMet, themeStyles.requirementMet),
      requirementIcon: cn(commonStyles.requirementIcon, themeStyles.requirementIcon),
    };
  }, [resolvedTheme]);

  const strength = useMemo(() => calculateStrength(password), [password]);

  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.strengthBar}>
        <div
          className={styles.strengthFill}
          style={{
            width: `${strength.score}%`,
            backgroundColor: strength.color,
            transition: 'width 0.3s ease, background-color 0.3s ease',
          }}
        />
      </div>
      
      {password && (
        <div className={styles.strengthLabel} style={{ color: strength.color }}>
          Password strength: {strength.label}
        </div>
      )}

      {showRequirements && password && (
        <ul className={styles.requirements}>
          {requirements.map((req, index) => {
            const isMet = req.test(password);
            return (
              <li
                key={index}
                className={cn(styles.requirement, isMet && styles.requirementMet)}
              >
                {isMet ? (
                  <Check size={14} className={styles.requirementIcon} />
                ) : (
                  <X size={14} className={styles.requirementIcon} />
                )}
                {req.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
