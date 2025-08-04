// @AI-HINT: This is the Freelancer Profile page component. It allows freelancers to view and edit their public profile. All styles are per-component only.
'use client';

import React from 'react';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import './Profile.common.css';
import './Profile.light.css';
import './Profile.dark.css';

interface ProfileProps {
  theme?: 'light' | 'dark';
}

const Profile: React.FC<ProfileProps> = ({ theme = 'light' }) => {
  // Mock data for the profile page
  const userProfile = {
    name: 'Alex Doe',
    title: 'Senior AI & Full-Stack Developer',
    rank: 'Top 5%',
    bio: '10+ years of experience building scalable web applications and AI-powered solutions. Expert in React, Node.js, Python, and cloud-native architectures. Passionate about creating intuitive user experiences.',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'],
    portfolioUrl: 'https://alexdoe.dev',
    hourlyRate: 95,
  };

  return (
    <div className={`Profile Profile--${theme}`}>
      <div className="Profile-container">
        <header className="Profile-header">
          <UserAvatar theme={theme} name={userProfile.name} size="large" />
          <div className="Profile-header-info">
            <h1>{userProfile.name}</h1>
            <p>{userProfile.title}</p>
            <span className="Profile-rank">Freelancer Rank: {userProfile.rank}</span>
          </div>
          <Button theme={theme} variant="outline">Edit Profile</Button>
        </header>

        <form className="Profile-form">
          <div className="Profile-section">
            <label htmlFor="bio-textarea">About Me</label>
            <textarea id="bio-textarea" defaultValue={userProfile.bio} rows={5} className={`Profile-textarea Profile-textarea--${theme}`} />
          </div>

          <div className="Profile-section">
            <Input theme={theme} label="Skills" type="text" defaultValue={userProfile.skills.join(', ')} />
            <small>Separate skills with a comma.</small>
          </div>

          <div className="Profile-section Profile-section--inline">
            <div className="Profile-form-group">
              <Input theme={theme} label="Hourly Rate ($/hr)" type="number" defaultValue={userProfile.hourlyRate} />
            </div>
            <div className="Profile-form-group">
              <Input theme={theme} label="Portfolio URL" type="text" defaultValue={userProfile.portfolioUrl} />
            </div>
          </div>

          <div className="Profile-actions">
            <Button theme={theme} variant="primary" type="submit">Save Changes</Button>
            <Button theme={theme} variant="secondary" type="button">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
