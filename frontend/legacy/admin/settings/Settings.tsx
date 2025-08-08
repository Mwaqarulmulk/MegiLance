'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import commonStyles from './Settings.common.module.css';
import lightStyles from './Settings.light.module.css';
import darkStyles from './Settings.dark.module.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input/input';
import SettingsSection from './SettingsSection';

// @AI-HINT: This is the Admin Settings page, providing controls for various platform settings.
// It has been fully refactored to use CSS modules and the global theme context.

const Settings: React.FC = () => {
  const { theme } = useTheme();
  const styles = {
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  };

  return (
    <div className={`${styles.settingsPage} ${theme === 'dark' ? styles.settingsPageDark : styles.settingsPageLight}`}>
      <header className={styles.header}>
        <h1>Admin Settings</h1>
        <p>Manage global platform configurations and preferences.</p>
      </header>

      <div className={styles.settingsGrid}>
        {/* Profile Settings Section */}
        <SettingsSection
  title="Profile Information"
  description="Update your admin profile details."
>
  <div className={styles.formRow}>
    <label htmlFor="adminName">Admin Name</label>
    <Input id="adminName" defaultValue="MegiLance Admin" />
  </div>
  <div className={styles.formRow}>
    <label htmlFor="adminEmail">Contact Email</label>
    <Input id="adminEmail" type="email" defaultValue="admin@megilance.com" />
  </div>
  <Button>Update Profile</Button>
</SettingsSection>

        {/* Security Settings Section */}
        <SettingsSection
  title="Security"
  description="Manage your admin password and security features."
>
  <div className={styles.formRow}>
    <label htmlFor="currentPassword">Current Password</label>
    <Input id="currentPassword" type="password" />
  </div>
  <div className={styles.formRow}>
    <label htmlFor="newPassword">New Password</label>
    <Input id="newPassword" type="password" />
  </div>
  <div className={styles.securityFeature}>
    <span>Two-Factor Authentication (2FA)</span>
    <Button variant="secondary">Enable 2FA</Button>
  </div>
  <Button>Update Security</Button>
</SettingsSection>

        {/* Notification Settings Section */}
        <section className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Notifications</h2>
          <div className={styles.notificationOption}>
            <p>Receive email notifications for critical system alerts.</p>
            <Input type="checkbox" className={styles.toggle} defaultChecked />
          </div>
          <div className={styles.notificationOption}>
            <p>Send weekly summary reports to the admin email.</p>
            <Input type="checkbox" className={styles.toggle} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
