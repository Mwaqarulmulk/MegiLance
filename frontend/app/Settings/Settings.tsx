// @AI-HINT: This is the Settings page root component. All styles are per-component only. See Settings.common.css, Settings.light.css, and Settings.dark.css for theming.
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import './Settings.common.css';
import './Settings.light.css';
import './Settings.dark.css';

interface SettingsProps {
    theme?: 'light' | 'dark';
}

const Settings: React.FC<SettingsProps> = ({ theme = 'light' }) => {
  const { setTheme } = useTheme();

  const [profile, setProfile] = React.useState({
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    bio: 'Freelance UI/UX Designer specializing in modern web applications.',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const [passwords, setPasswords] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`Settings Settings--${theme}`}>
      <div className="Settings-header">
        <h1>Account Settings</h1>
      </div>
      <div className="Settings-content">
        <div className="Settings-section">
          <h2>Profile Information</h2>
          <p>This information will be displayed on your public profile.</p>
          <form className="Settings-form">
            <Input
              theme={theme}
              label="Full Name"
              name="fullName"
              value={profile.fullName}
              onChange={handleProfileChange}
            />
            <Input
              theme={theme}
              label="Email Address"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleProfileChange}
            />
            <div className="Settings-form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                className={`Settings-textarea Settings-textarea--${theme}`}
                value={profile.bio}
                onChange={handleProfileChange}
                rows={4}
              />
            </div>
            <Button theme={theme} variant="primary">Save Changes</Button>
          </form>
        </div>
        <div className="Settings-section">
          <h2>Change Password</h2>
          <p>For your security, please enter your current password to make changes.</p>
          <form className="Settings-form">
            <Input
              theme={theme}
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
            />
            <Input
              theme={theme}
              label="New Password"
              name="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
            />
            <Input
              theme={theme}
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
            />
            <Button theme={theme} variant="primary">Change Password</Button>
          </form>
        </div>
        <div className="Settings-section">
          <h2>Theme Preferences</h2>
          <p>Choose between light and dark mode. The theme will be applied across the application.</p>
          <div className="Settings-theme-switcher">
            <Button
              theme={theme}
              variant={theme === 'light' ? 'primary' : 'secondary'}
              onClick={() => setTheme('light')}
            >
              Light Mode
            </Button>
            <Button
              theme={theme}
              variant={theme === 'dark' ? 'primary' : 'secondary'}
              onClick={() => setTheme('dark')}
            >
              Dark Mode
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
