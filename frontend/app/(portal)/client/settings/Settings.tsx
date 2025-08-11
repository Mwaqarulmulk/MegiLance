// @AI-HINT: This is the modernized Client Settings page. It features a two-panel layout with sidebar navigation and uses the reusable SettingsSection component for each category.
'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { User, Shield, Bell, CreditCard, LifeBuoy } from 'lucide-react';

import SettingsSection from '@/app/components/SettingsSection/SettingsSection';
import Input from '@/app/components/Input/Input';
import Textarea from '@/app/components/Textarea/Textarea';
import Select from '@/app/components/Select/Select';
import Button from '@/app/components/Button/Button';
import ToggleSwitch from '@/app/components/ToggleSwitch/ToggleSwitch';

import common from './Settings.common.module.css';
import light from './Settings.light.module.css';
import dark from './Settings.dark.module.css';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'billing' | 'support';

const Settings: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? dark : light;
    return { ...common, ...themeStyles };
  }, [theme]);

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Mock data and state handlers
  const [name, setName] = useState('Acme Corporation');
  const [email, setEmail] = useState('billing@acme.corp');
  const [bio, setBio] = useState('Leading provider of innovative solutions for the modern web.');
  const [twoFactor, setTwoFactor] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [productAnnouncements, setProductAnnouncements] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <SettingsSection
            title="Public Profile"
            description="This information will be displayed publicly on your company profile."
            footerContent={<Button>Save Changes</Button>}
          >
            <div className={styles.formGrid}>
              <Input label="Company Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Contact Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
          <SettingsSection
            title="Security"
            description="Manage your account's security settings and password."
            footerContent={<Button>Save Changes</Button>}
          >
            <ToggleSwitch
              id="two-factor-auth"
              label="Two-Factor Authentication"
              checked={twoFactor}
              onChange={setTwoFactor}
              helpText="Enhance your account security by requiring a second verification step."
            />
            <div className={styles.actionRow}>
                <p className={styles.actionDescription}>Update your password by sending a reset link to your email.</p>
                <Button variant="secondary">Send Password Reset Link</Button>
            </div>
          </SettingsSection>
        );
      case 'notifications':
        return (
          <SettingsSection
            title="Notifications"
            description="Control how you receive notifications from MegiLance."
            footerContent={<Button>Save Changes</Button>}
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
            footerContent={<Button>Save Changes</Button>}
          >
              <div className={styles.formGrid}>
                <Select 
                  id="country-select"
                  label="Country" 
                  defaultValue="US"
                  options={[
                    { value: 'US', label: 'United States' },
                    { value: 'GB', label: 'United Kingdom' },
                    { value: 'CA', label: 'Canada' },
                    { value: 'DE', label: 'Germany' },
                  ]}
                />
                <Input label="Tax ID (Optional)" placeholder="e.g., EUVAT12345" helpText="Your business Tax ID for invoices."/>
              </div>
              <div className={styles.actionRow}>
                <p className={styles.actionDescription}>Update the credit card on file for your account.</p>
                <Button variant="secondary">Update Payment Method</Button>
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
                        <p>Can't find what you're looking for? <a href="/contact" className={styles.link}>Contact our support team</a> directly.</p>
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
    <div className={cn(styles.page, styles.theme)}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your client account settings and preferences.</p>
      </header>
      <div className={styles.container}>
        <nav className={styles.nav}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={cn(styles.navButton, activeTab === item.id && styles.navButtonActive)}
                onClick={() => setActiveTab(item.id as SettingsTab)}
                aria-current={activeTab === item.id ? 'page' : undefined}
              >
                <Icon size={18} className={styles.navIcon} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <main className={styles.content}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Settings;
