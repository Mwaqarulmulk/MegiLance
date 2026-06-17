// @AI-HINT: This is the modernized Client Settings page. It features a two-panel layout with sidebar navigation and uses the reusable SettingsSection component for each category.
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { User, Shield, Bell, CreditCard, LifeBuoy, CheckCircle, AlertCircle, KeyRound, AtSign } from 'lucide-react';
import api, { apiFetch } from '@/lib/api';

import SettingsSection from '@/app/components/organisms/SettingsSection/SettingsSection';
import Input from '@/app/components/atoms/Input/Input';
import Textarea from '@/app/components/atoms/Textarea/Textarea';
import Select from '@/app/components/molecules/Select/Select';
import Button from '@/app/components/atoms/Button/Button';
import ToggleSwitch from '@/app/components/atoms/ToggleSwitch/ToggleSwitch';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import { ScrollReveal } from '@/app/components/Animations/ScrollReveal';

import common from './Settings.common.module.css';
import light from './Settings.light.module.css';
import dark from './Settings.dark.module.css';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'billing' | 'support';

const Settings: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = resolvedTheme === 'dark' ? dark : light;
    return { ...common, ...themeStyles };
  }, [resolvedTheme]);

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State handlers
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailConfirmPassword, setEmailConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [productAnnouncements, setProductAnnouncements] = useState(false);
  const [country, setCountry] = useState('US');
  const [taxId, setTaxId] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const user = await api.auth.me();
        setName(user.name || user.full_name || '');
        setEmail(user.email || '');
        setBio(user.bio || '');
        setCountry(user.billing_country || 'US');
        setTaxId(user.tax_id || '');
        // Set other preferences if available in user object
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error(err);
        }
        setError('Unable to load your profile. Please check your connection and refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      await api.auth.updateProfile({
        name,
        bio
        // Email update usually requires separate flow
      });
      
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error(err);
      }
      setError('Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('New passwords do not match'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    setSavingPassword(true); setError(null); setSuccessMessage(null);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setSuccessMessage('Password changed successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally { setSavingPassword(false); }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) { setError('Please enter a valid email address'); return; }
    setSavingEmail(true); setError(null); setSuccessMessage(null);
    try {
      await (api.auth as any).changeEmail(newEmail, emailConfirmPassword);
      setNewEmail(''); setEmailConfirmPassword('');
      setSuccessMessage('Verification email sent — check your new inbox to confirm');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change email');
    } finally { setSavingEmail(false); }
  };

  const handleSaveSecurity = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await api.auth.updateProfile({
        two_factor_enabled: twoFactor,
      });

      setSuccessMessage('Security settings updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error(err);
      }
      setError('Could not save security settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await api.users.updateNotificationPreferences({
        preferences: {
          email: { enabled: emailNotifications },
          marketing: { enabled: productAnnouncements },
        },
        digest: {
          frequency: 'daily',
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        },
      });

      setSuccessMessage('Notification preferences updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error(err);
      }
      setError('Could not save notification preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBilling = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          billing_country: country,
          tax_id: taxId || undefined,
        }),
      });

      setSuccessMessage('Billing settings updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error(err);
      }
      setError('Could not save billing settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      setSaving(true);
      setError(null);

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const result = await apiFetch<{ url?: string; session_id?: string; mode?: string; message?: string }>(
        '/stripe/create-checkout-session',
        {
          method: 'POST',
          body: JSON.stringify({
            amount: 0,
            currency: 'usd',
            success_url: `${origin}/client/settings?tab=billing&payment=success`,
            cancel_url: `${origin}/client/settings?tab=billing&payment=cancelled`,
            description: 'Payment method update',
          }),
        },
      );

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error(err);
      }
      setError('Could not start payment method update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className={styles.loading}>Loading your settings…</div>;
    }

    switch (activeTab) {
      case 'profile':
        return (
          <SettingsSection
            title="Public Profile"
            description="This information will be displayed publicly on your company profile."
            footerContent={
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            }
          >
            {successMessage && (
              <div className={cn(styles.alertBanner, styles.alertSuccess)} role="status">
                <CheckCircle size={18} aria-hidden="true" /> {successMessage}
              </div>
            )}
            {error && (
              <div className={cn(styles.alertBanner, styles.alertError)} role="alert">
                <AlertCircle size={18} aria-hidden="true" /> {error}
              </div>
            )}
            <div className={styles.formGrid}>
              <Input label="Company Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Contact Email" type="email" value={email} disabled helpText="Contact support to change email." />
              <Textarea
                label="Company Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={200}
                helpText="A brief description of your company. Max 200 characters."
                className={styles.fullSpan}
              />
            </div>
          </SettingsSection>
        );
      case 'security':
        return (
          <>
            <SettingsSection
              title="Two-Factor Authentication"
              description="Add an extra verification step to protect your account."
              footerContent={<Button onClick={handleSaveSecurity} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>}
            >
              {successMessage && <div className={cn(styles.alertBanner, styles.alertSuccess)} role="status"><CheckCircle size={18} /> {successMessage}</div>}
              {error && <div className={cn(styles.alertBanner, styles.alertError)} role="alert"><AlertCircle size={18} /> {error}</div>}
              <ToggleSwitch id="two-factor-auth" label="Two-Factor Authentication" checked={twoFactor} onChange={setTwoFactor} helpText="Enhance your account security by requiring a second verification step." />
            </SettingsSection>

            <SettingsSection
              title="Change Password"
              description="Update your account password. You'll need your current password to confirm."
              footerContent={<Button onClick={() => {}} disabled={savingPassword} type="submit" form="change-password-form">{savingPassword ? 'Changing...' : 'Change Password'}</Button>}
            >
              <form id="change-password-form" onSubmit={handleChangePassword}>
                <div className={styles.formGrid}>
                  <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className={styles.fullSpan} />
                  <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required />
                  <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" required />
                </div>
              </form>
            </SettingsSection>

            <SettingsSection
              title="Change Email"
              description="Update your account email. A verification link will be sent to the new address."
              footerContent={<Button onClick={() => {}} disabled={savingEmail} type="submit" form="change-email-form">{savingEmail ? 'Sending...' : 'Send Verification'}</Button>}
            >
              <form id="change-email-form" onSubmit={handleChangeEmail}>
                <div className={styles.formGrid}>
                  <Input label="New Email Address" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="your-new@email.com" required />
                  <Input label="Confirm with Password" type="password" value={emailConfirmPassword} onChange={(e) => setEmailConfirmPassword(e.target.value)} placeholder="Enter current password" required />
                </div>
              </form>
            </SettingsSection>
          </>
        );
      case 'notifications':
        return (
          <SettingsSection
            title="Notifications"
            description="Control how you receive notifications from MegiLance."
            footerContent={<Button onClick={handleSaveNotifications} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>}
          >
            <ToggleSwitch
              id="email-notifications"
              label="Email Notifications"
              checked={emailNotifications}
              onChange={setEmailNotifications}
              helpText="Receive important updates about your account and projects via email."
            />
            <ToggleSwitch
              id="product-announcements"
              label="Product Announcements"
              checked={productAnnouncements}
              onChange={setProductAnnouncements}
              helpText="Get notified about new features, updates, and special offers."
            />
          </SettingsSection>
        );
      case 'billing':
        return (
          <SettingsSection
            title="Billing"
            description="Manage your payment methods, subscription, and view invoices."
            footerContent={<Button onClick={handleSaveBilling} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>}
          >
              <div className={styles.formGrid}>
                <Select 
                  id="country-select"
                  label="Country" 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  options={[
                    { value: 'US', label: 'United States' },
                    { value: 'GB', label: 'United Kingdom' },
                    { value: 'CA', label: 'Canada' },
                    { value: 'DE', label: 'Germany' },
                  ]}
                />
                <Input label="Tax ID (Optional)" placeholder="e.g., EUVAT12345" helpText="Your business Tax ID for invoices." value={taxId} onChange={(e) => setTaxId(e.target.value)}/>
              </div>
              <div className={styles.actionRow}>
                <p className={styles.actionDescription}>Update the credit card on file for your account.</p>
                <Button variant="secondary" onClick={handleUpdatePaymentMethod} disabled={saving}>Update Payment Method</Button>
              </div>
          </SettingsSection>
        );
        case 'support':
            return (
                <SettingsSection
                    title="Support"
                    description="Get help with your account or contact our support team."
                >
                    <div className={styles.supportContent}>
                        <h4>Frequently Asked Questions</h4>
                        <p>Find answers to common questions in our <a href="/help" className={styles.link}>Help Center</a>.</p>
                        <h4>Contact Us</h4>
                        <p>Can&apos;t find what you&apos;re looking for? <a href="/contact" className={styles.link}>Contact our support team</a> directly.</p>
                        <Button iconBefore={<LifeBuoy size={16} />} className={styles.supportButton}>Open Support Ticket</Button>
                    </div>
                </SettingsSection>
            )
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Support', icon: LifeBuoy },
  ];

  return (
    <PageTransition>
      <div className={cn(styles.page, styles.theme)}>
        <ScrollReveal>
          <header className={styles.header}>
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>Manage your client account settings and preferences.</p>
          </header>
        </ScrollReveal>
        <div className={styles.container}>
          <ScrollReveal delay={0.1}>
            <nav className={styles.nav} role="tablist" aria-label="Settings sections">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    role="tab"
                    className={cn(styles.navButton, activeTab === item.id && styles.navButtonActive)}
                    onClick={() => setActiveTab(item.id as SettingsTab)}
                    aria-selected={activeTab === item.id}
                  >
                    <Icon size={18} className={styles.navIcon} aria-hidden="true" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </ScrollReveal>
          <ScrollReveal delay={0.2} className={styles.content}>
            <div role="tabpanel" aria-label={`${activeTab} settings`}>
              {renderContent()}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
