// @AI-HINT: This is the Notifications settings page for freelancers. It uses the reusable SettingsSection and the new premium ToggleSwitch component.
'use client';

import React, { useEffect, useState } from 'react';
import SettingsSection from '@/app/Settings/components/SettingsSection/SettingsSection';
import ToggleSwitch from '@/app/components/ToggleSwitch/ToggleSwitch';
import Button from '@/app/components/Button/Button';

const NotificationSettingsPage = () => {
  const [projectNotifications, setProjectNotifications] = useState(true);
  const [accountActivity, setAccountActivity] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(false);
  const [status, setStatus] = useState('');

  // Load saved preferences
  useEffect(() => {
    try {
      const raw = localStorage.getItem('ml.freelancer.notifications');
      if (raw) {
        const saved = JSON.parse(raw) as { projectNotifications: boolean; accountActivity: boolean; messageNotifications: boolean };
        setProjectNotifications(saved.projectNotifications);
        setAccountActivity(saved.accountActivity);
        setMessageNotifications(saved.messageNotifications);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const save = () => {
    const payload = { projectNotifications, accountActivity, messageNotifications };
    localStorage.setItem('ml.freelancer.notifications', JSON.stringify(payload));
    setStatus('Notification preferences saved');
  };

  return (
    <SettingsSection
      title="Notifications"
      description="Manage how you receive notifications from MegiLance."
    >
      {status && (
        <div role="status" aria-live="polite" className="pb-4 text-sm text-muted-foreground">{status}</div>
      )}
      <div className="space-y-6 max-w-md">
        <ToggleSwitch
          id="project-notifications"
          label="Email me about new projects"
          checked={projectNotifications}
          onChange={(val: boolean) => setProjectNotifications(val)}
        />
        <ToggleSwitch
          id="account-activity"
          label="Email me about account activity"
          checked={accountActivity}
          onChange={(val: boolean) => setAccountActivity(val)}
        />
        <ToggleSwitch
          id="message-notifications"
          label="Push notifications for new messages"
          checked={messageNotifications}
          onChange={(val: boolean) => setMessageNotifications(val)}
        />
      </div>
      <div className="pt-6 flex gap-3">
        <Button variant="secondary" type="button" title="Reset notification preferences" onClick={() => { setProjectNotifications(true); setAccountActivity(true); setMessageNotifications(false); setStatus('Preferences reset to defaults'); }}>Reset</Button>
        <Button variant="primary" type="button" title="Save notification preferences" onClick={save}>Save Preferences</Button>
      </div>
    </SettingsSection>
  );
};

export default NotificationSettingsPage;
