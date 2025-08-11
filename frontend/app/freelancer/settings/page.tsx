// @AI-HINT: This is the Account settings page for freelancers. It uses the reusable SettingsSection component for a consistent, premium layout.
'use client';

import React, { useState } from 'react';
import SettingsSection from '@/app/Settings/components/SettingsSection/SettingsSection';
import Input from '@/app/components/Input/Input';
import Button from '@/app/components/Button/Button';

const AccountSettingsPage = () => {
  const [fullName, setFullName] = useState('John Doe');
  const [email] = useState('john.doe@example.com');
  const [status, setStatus] = useState<string>('');
  const [errors, setErrors] = useState<{ fullName?: string } >({});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus('Please fix the highlighted fields');
      return;
    }
    setStatus('Account settings saved');
  };

  return (
    <SettingsSection
      title="Account"
      description="Update your account information."
    >
      <form onSubmit={onSubmit} noValidate>
        {status && (
          <div role="status" aria-live="polite" className="pb-4 text-sm text-muted-foreground">{status}</div>
        )}
        <div className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            id="fullName"
            defaultValue={fullName}
            aria-invalid={errors.fullName ? 'true' : undefined}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            className="max-w-md"
            onChange={(e) => setFullName(e.target.value)}
          />
          {errors.fullName && (
            <p id="fullName-error" className="text-sm text-red-600">{errors.fullName}</p>
          )}
          <Input
            label="Email Address"
            type="email"
            id="email"
            defaultValue={email}
            className="max-w-md"
            disabled
          />
        </div>
        <div className="pt-6">
          <Button variant="primary" type="submit" title="Save account changes">Save Changes</Button>
        </div>
      </form>
    </SettingsSection>
  );
};

export default AccountSettingsPage;

