// @AI-HINT: Notification preferences - multi-channel settings with granular controls
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  FaBell, FaEnvelope, FaMobileAlt, FaSms,
  FaSave, FaCheckCircle 
} from 'react-icons/fa';
import Button from '@/app/components/Button/Button';
import Select from '@/app/components/Select/Select';

import commonStyles from './NotificationPreferences.common.module.css';
import lightStyles from './NotificationPreferences.light.module.css';
import darkStyles from './NotificationPreferences.dark.module.css';

interface NotificationChannel {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

interface NotificationPrefs {
  projectUpdates: NotificationChannel;
  proposals: NotificationChannel;
  messages: NotificationChannel;
  payments: NotificationChannel;
  reviews: NotificationChannel;
  marketing: NotificationChannel;
}

interface DigestSettings {
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  quietHoursStart: string;
  quietHoursEnd: string;
}

const NotificationPreferences: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [preferences, setPreferences] = useState<NotificationPrefs>({
    projectUpdates: { email: true, push: true, sms: false, inApp: true },
    proposals: { email: true, push: true, sms: true, inApp: true },
    messages: { email: true, push: true, sms: false, inApp: true },
    payments: { email: true, push: true, sms: true, inApp: true },
    reviews: { email: true, push: false, sms: false, inApp: true },
    marketing: { email: false, push: false, sms: false, inApp: false },
  });

  const [digest, setDigest] = useState<DigestSettings>({
    frequency: 'realtime',
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
  const styles = {
    container: cn(commonStyles.container, themeStyles.container),
    header: cn(commonStyles.header, themeStyles.header),
    title: cn(commonStyles.title, themeStyles.title),
    subtitle: cn(commonStyles.subtitle, themeStyles.subtitle),
    section: cn(commonStyles.section, themeStyles.section),
    sectionTitle: cn(commonStyles.sectionTitle, themeStyles.sectionTitle),
    table: cn(commonStyles.table, themeStyles.table),
    tableHeader: cn(commonStyles.tableHeader, themeStyles.tableHeader),
    tableRow: cn(commonStyles.tableRow, themeStyles.tableRow),
    categoryCell: cn(commonStyles.categoryCell, themeStyles.categoryCell),
    checkbox: cn(commonStyles.checkbox, themeStyles.checkbox),
    digestSettings: cn(commonStyles.digestSettings, themeStyles.digestSettings),
    actions: cn(commonStyles.actions, themeStyles.actions),
    successMessage: cn(commonStyles.successMessage, themeStyles.successMessage),
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/backend/api/users/me/notification-preferences', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) setPreferences(data.preferences);
        if (data.digest) setDigest(data.digest);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = (category: keyof NotificationPrefs, channel: keyof NotificationChannel) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel],
      },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/backend/api/users/me/notification-preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences, digest }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { key: 'projectUpdates' as const, label: 'Project Updates', description: 'New bids, status changes, deadlines' },
    { key: 'proposals' as const, label: 'Proposals', description: 'Proposal submissions, acceptances, rejections' },
    { key: 'messages' as const, label: 'Messages', description: 'New messages, chat notifications' },
    { key: 'payments' as const, label: 'Payments', description: 'Payment confirmations, invoices, disputes' },
    { key: 'reviews' as const, label: 'Reviews & Ratings', description: 'New reviews, rating updates' },
    { key: 'marketing' as const, label: 'Marketing & Tips', description: 'Platform updates, tips, newsletters' },
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="text-center py-12">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <FaBell className="mr-3" />
          Notification Preferences
        </h1>
        <p className={styles.subtitle}>
          Control how and when you receive notifications
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Notification Channels</h2>
        
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.categoryCell}>Category</div>
            <div><FaEnvelope /> Email</div>
            <div><FaBell /> Push</div>
            <div><FaSms /> SMS</div>
            <div><FaMobileAlt /> In-App</div>
          </div>

          {categories.map(category => (
            <div key={category.key} className={styles.tableRow}>
              <div className={styles.categoryCell}>
                <strong>{category.label}</strong>
                <span className="text-sm opacity-75">{category.description}</span>
              </div>
              <div>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={preferences[category.key].email}
                  onChange={() => handleChannelToggle(category.key, 'email')}
                  aria-label={`Email notifications for ${category.label}`}
                />
              </div>
              <div>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={preferences[category.key].push}
                  onChange={() => handleChannelToggle(category.key, 'push')}
                  aria-label={`Push notifications for ${category.label}`}
                />
              </div>
              <div>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={preferences[category.key].sms}
                  onChange={() => handleChannelToggle(category.key, 'sms')}
                  aria-label={`SMS notifications for ${category.label}`}
                />
              </div>
              <div>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={preferences[category.key].inApp}
                  onChange={() => handleChannelToggle(category.key, 'inApp')}
                  aria-label={`In-app notifications for ${category.label}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Digest Settings</h2>
        <div className={styles.digestSettings}>
          <Select
            id="digestFrequency"
            label="Digest Frequency"
            value={digest.frequency}
            onChange={(e) => setDigest({ ...digest, frequency: e.target.value as any })}
            options={[
              { value: 'realtime', label: 'Real-time (Instant notifications)' },
              { value: 'hourly', label: 'Hourly (Summary every hour)' },
              { value: 'daily', label: 'Daily (Once per day)' },
              { value: 'weekly', label: 'Weekly (Once per week)' },
            ]}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Quiet Hours Start</label>
              <input
                type="time"
                value={digest.quietHoursStart}
                onChange={(e) => setDigest({ ...digest, quietHoursStart: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Quiet Hours End</label>
              <input
                type="time"
                value={digest.quietHoursEnd}
                onChange={(e) => setDigest({ ...digest, quietHoursEnd: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <p className="text-sm opacity-75 mt-2">
            No notifications will be sent during quiet hours (except urgent payments)
          </p>
        </div>
      </div>

      {saved && (
        <div className={styles.successMessage}>
          <FaCheckCircle className="mr-2" />
          Preferences saved successfully!
        </div>
      )}

      <div className={styles.actions}>
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={saving}
          disabled={saving}
        >
          <FaSave className="mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
