// @AI-HINT: Admin Settings page. Theme-aware, accessible, animated sections, forms, toggles, and sticky save bar.
'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useAdminData } from '@/hooks/useAdmin';
import baseStyles from './AdminSettings.base.module.css';
import lightStyles from './AdminSettings.light.module.css';
import darkStyles from './AdminSettings.dark.module.css';
import AdminTopbar from '@/app/components/Admin/Layout/AdminTopbar';

const AdminSettings: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const { loading, error } = useAdminData();

  const headerRef = useRef<HTMLDivElement | null>(null);
  const generalRef = useRef<HTMLDivElement | null>(null);
  const securityRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const generalVisible = useIntersectionObserver(generalRef, { threshold: 0.1 });
  const securityVisible = useIntersectionObserver(securityRef, { threshold: 0.1 });
  const notificationsVisible = useIntersectionObserver(notificationsRef, { threshold: 0.1 });

  const [companyName, setCompanyName] = useState('MegiLance');
  const [supportEmail, setSupportEmail] = useState('support@megilance.com');
  const [allow2FA, setAllow2FA] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const onSave = () => {
    // No backend calls per project constraints. Display a subtle confirmation.
    // eslint-disable-next-line no-alert
    alert('Settings saved (mock).');
  };

  return (
    <main className={cn(baseStyles.page, themeStyles.themeWrapper)}>
      <div className={baseStyles.container}>
        <div ref={headerRef} className={cn(baseStyles.header, headerVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}>
          <AdminTopbar
            title="Admin Settings"
            subtitle="Configure organization preferences, security policies, and notifications."
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Settings' },
            ]}
          />
        </div>

        {loading && <div className={baseStyles.skeletonRow} aria-busy="true" />}
        {error && <div className={baseStyles.error}>Failed to load settings.</div>}

        <section
          ref={generalRef}
          className={cn(baseStyles.section, themeStyles.section, generalVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}
          aria-labelledby="general-settings-title"
        >
          <h2 id="general-settings-title" className={cn(baseStyles.sectionTitle, themeStyles.sectionTitle)}>General</h2>
          <div className={baseStyles.row}>
            <div className={baseStyles.field}>
              <label htmlFor="company" className={baseStyles.label}>Company Name</label>
              <input id="company" className={cn(baseStyles.input, themeStyles.input)} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <div className={cn(baseStyles.help, themeStyles.help)}>Shown in emails and invoices.</div>
            </div>
            <div className={baseStyles.field}>
              <label htmlFor="email" className={baseStyles.label}>Support Email</label>
              <input id="email" type="email" className={cn(baseStyles.input, themeStyles.input)} value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
              <div className={cn(baseStyles.help, themeStyles.help)}>Used for outbound notifications.</div>
            </div>
          </div>
          <div className={baseStyles.field}>
            <label htmlFor="desc" className={baseStyles.label}>Organization Description</label>
            <textarea id="desc" rows={3} className={cn(baseStyles.textarea, themeStyles.textarea)} placeholder="Brief description…" />
          </div>
        </section>

        <section
          ref={securityRef}
          className={cn(baseStyles.section, themeStyles.section, securityVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}
          aria-labelledby="security-settings-title"
        >
          <h2 id="security-settings-title" className={cn(baseStyles.sectionTitle, themeStyles.sectionTitle)}>Security</h2>
          <div className={baseStyles.row}>
            <div className={baseStyles.field}>
              <label className={baseStyles.label}>Require 2FA</label>
              <div className={baseStyles.toggle}>
                <input id="twofa" type="checkbox" checked={allow2FA} onChange={(e) => setAllow2FA(e.target.checked)} aria-labelledby="twofa-label" />
                <span id="twofa-label">Enabled</span>
              </div>
              <div className={cn(baseStyles.help, themeStyles.help)}>Enforces two-factor authentication for all admins.</div>
            </div>
            <div className={baseStyles.field}>
              <label htmlFor="whitelist" className={baseStyles.label}>IP Whitelist</label>
              <textarea id="whitelist" rows={3} className={cn(baseStyles.textarea, themeStyles.textarea)} placeholder="One CIDR per line" value={ipWhitelist} onChange={(e) => setIpWhitelist(e.target.value)} />
              <div className={cn(baseStyles.help, themeStyles.help)}>Example: 203.0.113.0/24</div>
            </div>
          </div>
        </section>

        <section
          ref={notificationsRef}
          className={cn(baseStyles.section, themeStyles.section, notificationsVisible ? baseStyles.isVisible : baseStyles.isNotVisible)}
          aria-labelledby="notifications-settings-title"
        >
          <h2 id="notifications-settings-title" className={cn(baseStyles.sectionTitle, themeStyles.sectionTitle)}>Notifications</h2>
          <div className={baseStyles.row}>
            <div className={baseStyles.field}>
              <label className={baseStyles.label}>Email Alerts</label>
              <div className={baseStyles.toggle}>
                <input id="email-alerts" type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} aria-labelledby="email-alerts-label" />
                <span id="email-alerts-label">Enabled</span>
              </div>
              <div className={cn(baseStyles.help, themeStyles.help)}>Receive critical system alerts via email.</div>
            </div>
            <div className={baseStyles.field}>
              <label className={baseStyles.label}>SMS Alerts</label>
              <div className={baseStyles.toggle}>
                <input id="sms-alerts" type="checkbox" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} aria-labelledby="sms-alerts-label" />
                <span id="sms-alerts-label">Enabled</span>
              </div>
              <div className={cn(baseStyles.help, themeStyles.help)}>Receive high-priority alerts via SMS.</div>
            </div>
          </div>
        </section>

        <div className={baseStyles.saveBar}>
          <button type="button" className={cn(baseStyles.button, 'secondary', themeStyles.button)} onClick={() => window.history.back()}>Cancel</button>
          <button type="button" className={cn(baseStyles.button, 'primary', themeStyles.button)} onClick={onSave}>Save Changes</button>
        </div>
      </div>
    </main>
  );
};

export default AdminSettings;
