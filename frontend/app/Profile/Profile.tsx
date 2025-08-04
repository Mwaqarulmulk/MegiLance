// @AI-HINT: This is the Profile page root component. All styles are per-component only. See Profile.common.css, Profile.light.css, and Profile.dark.css for theming.
'use client';

import React from 'react';
import UserAvatar from '../components/UserAvatar/UserAvatar';
import ProjectCard from '../components/ProjectCard/ProjectCard';
import './Profile.common.css';
import './Profile.light.css';
import './Profile.dark.css';

interface ProfileProps {
  theme?: 'light' | 'dark';
}

const Profile: React.FC<ProfileProps> = ({ theme = 'light' }) => {
  const mockUser = {
    name: 'Jane Doe',
    bio: 'Freelance UI/UX Designer specializing in modern web applications. Passionate about creating intuitive and beautiful user experiences.',
    avatarUrl: '', // Placeholder
  };

  const mockProjects = [
    {
      title: 'E-commerce Platform Redesign',
      client: 'Global Retail Inc.',
      budget: '$25,000',
      status: 'active' as const,
    },
    {
      title: 'Data Analytics Dashboard',
      client: 'Tech Solutions LLC',
      budget: '$18,000',
      status: 'active' as const,
    },
  ];

  return (
    <div className={`Profile Profile--${theme}`}>
      <header className="Profile-header">
        <UserAvatar theme={theme} name={mockUser.name} imageUrl={mockUser.avatarUrl} size="large" />
        <h1 className="Profile-name">{mockUser.name}</h1>
        <p className="Profile-bio">{mockUser.bio}</p>
      </header>
      <main className="Profile-content">
        <h2>Active Projects</h2>
        <div className="Profile-projects-list">
          {mockProjects.map((project, index) => (
            <ProjectCard
              key={index}
              theme={theme}
              title={project.title}
              client={project.client}
              budget={project.budget}
              status={project.status}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Profile;
