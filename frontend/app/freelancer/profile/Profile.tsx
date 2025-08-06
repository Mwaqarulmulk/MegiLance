// @AI-HINT: This is the Freelancer Profile page component. It allows freelancers to view and edit their public profile. All styles are per-component only.
'use client';

import React from 'react';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import commonStyles from './Profile.common.module.css';
import lightStyles from './Profile.light.module.css';
import darkStyles from './Profile.dark.module.css';

// @AI-HINT: This is the Freelancer Profile page component. It allows freelancers to view and edit their public profile. All styles are per-component only. Now fully theme-switchable using global theme context.

const Profile: React.FC = () => {
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
    <div className={commonStyles.profile}>
      <div className={commonStyles.container}>
        <header className={commonStyles.header}>
          <UserAvatar name={userProfile.name} size="large" />
          <div className={commonStyles.headerInfo}>
            <h1>{userProfile.name}</h1>
            <p>{userProfile.title}</p>
            <span className={commonStyles.rank}>Freelancer Rank: {userProfile.rank}</span>
          </div>
          <Button variant="secondary">Edit Profile</Button>
        </header>

        <form className={commonStyles.form}>
          <div className={commonStyles.section}>
            <label htmlFor="bio-textarea">About Me</label>
            <textarea id="bio-textarea" defaultValue={userProfile.bio} rows={5} className={commonStyles.textarea} />
          </div>

          <div className={commonStyles.section}>
            <Input label="Skills" type="text" defaultValue={userProfile.skills.join(', ')} />
            <small>Separate skills with a comma.</small>
          </div>

          <div className={`${commonStyles.section} ${commonStyles.sectionInline}`}>
            <div className={commonStyles.formGroup}>
              <Input label="Hourly Rate ($/hr)" type="number" defaultValue={userProfile.hourlyRate} />
            </div>
            <div className={commonStyles.formGroup}>
              <Input label="Portfolio URL" type="text" defaultValue={userProfile.portfolioUrl} />
            </div>
          </div>

          <div className={commonStyles.actions}>
            <Button variant="primary" type="submit">Save Changes</Button>
            <Button variant="secondary" type="button">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
