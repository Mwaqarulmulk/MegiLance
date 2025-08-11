// @AI-HINT: This is the Password settings page for freelancers. It uses the reusable SettingsSection component for a consistent, premium layout.
'use client';

import React, { useMemo, useState } from 'react';
import SettingsSection from '@/app/Settings/components/SettingsSection/SettingsSection';
import Input from '@/app/components/Input/Input';
import Button from '@/app/components/Button/Button';

const PasswordSettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [status, setStatus] = useState<string>('');
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmNewPassword?: string }>({});

  const strength = useMemo(() => {
    // Simple strength heuristic: length, casing, number, symbol
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score; // 0-4
  }, [newPassword]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!currentPassword) next.currentPassword = 'Current password is required';
    if (newPassword.length < 8) next.newPassword = 'New password must be at least 8 characters';
    if (strength < 3) next.newPassword = (next.newPassword ? next.newPassword + ' · ' : '') + 'Use upper/lowercase, a number, and a symbol';
    if (confirmNewPassword !== newPassword) next.confirmNewPassword = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus('Please fix the highlighted fields');
      return;
    }
    // Simulate save success
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setStatus('Password updated successfully');
  };

  return (
    <SettingsSection
      title="Password"
      description="Update your password. Choose a strong one!"
    >
      <form onSubmit={onSubmit} noValidate>
        {status && (
          <div role="status" aria-live="polite" className="pb-4 text-sm text-muted-foreground">{status}</div>
        )}
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            id="currentPassword"
            placeholder="Enter current password"
            className="max-w-md"
            aria-invalid={errors.currentPassword ? 'true' : undefined}
            aria-describedby={errors.currentPassword ? 'currentPassword-error' : undefined}
            onChange={(e) => setCurrentPassword(e.target.value)}
            value={currentPassword}
          />
          {errors.currentPassword && (
            <p id="currentPassword-error" className="text-sm text-red-600">{errors.currentPassword}</p>
          )}

          <Input
            label="New Password"
            type="password"
            id="newPassword"
            placeholder="Enter new password"
            className="max-w-md"
            aria-invalid={errors.newPassword ? 'true' : undefined}
            aria-describedby={errors.newPassword ? 'newPassword-error strength-hint' : 'strength-hint'}
            onChange={(e) => setNewPassword(e.target.value)}
            value={newPassword}
          />
          <p id="strength-hint" className="text-sm text-muted-foreground">Strength: {['Very Weak','Weak','Okay','Good','Strong'][strength]}</p>
          {errors.newPassword && (
            <p id="newPassword-error" className="text-sm text-red-600">{errors.newPassword}</p>
          )}

          <Input
            label="Confirm New Password"
            type="password"
            id="confirmNewPassword"
            placeholder="Confirm new password"
            className="max-w-md"
            aria-invalid={errors.confirmNewPassword ? 'true' : undefined}
            aria-describedby={errors.confirmNewPassword ? 'confirmNewPassword-error' : undefined}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            value={confirmNewPassword}
          />
          {errors.confirmNewPassword && (
            <p id="confirmNewPassword-error" className="text-sm text-red-600">{errors.confirmNewPassword}</p>
          )}
        </div>
        <div className="pt-6">
          <Button variant="primary" type="submit" title="Change password">Change Password</Button>
        </div>
      </form>
    </SettingsSection>
  );
};

export default PasswordSettingsPage;
