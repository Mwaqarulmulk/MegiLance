// @AI-HINT: Profile page uses per-component CSS modules with theme variants and accessible landmarks.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import UserAvatar from '../components/UserAvatar/UserAvatar';
import ProjectCard, { ProjectCardProps } from '../components/ProjectCard/ProjectCard';
import commonStyles from './Profile.common.module.css';
import lightStyles from './Profile.light.module.css';
import darkStyles from './Profile.dark.module.css';

const Profile: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const mockUser = {
    name: 'Jane Doe',
    bio: 'Freelance UI/UX Designer specializing in modern web applications. Passionate about creating intuitive and beautiful user experiences.',
    avatarUrl: '', // Placeholder
  };

  const mockProjects: ProjectCardProps[] = [
    {
      id: '1',
      title: 'E-commerce Platform Redesign',
      status: 'In Progress',
      progress: 50,
      budget: 25000,
      paid: 10000,
      freelancers: [],
      updatedAt: 'Just now',
      clientName: 'Global Retail Inc.',
      postedTime: 'Just now',
      tags: ['Design', 'Web'],
    },
    {
      id: '2',
      title: 'Data Analytics Dashboard',
      status: 'In Progress',
      progress: 30,
      budget: 18000,
      paid: 5000,
      freelancers: [],
      updatedAt: '2 days ago',
      clientName: 'Tech Solutions LLC',
      postedTime: '2 days ago',
      tags: ['Design', 'Web'],
    },
  ];

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <header className={cn(commonStyles.header, themeStyles.header)}>
        <UserAvatar name={mockUser.name} src={mockUser.avatarUrl} size="large" />
        <h1 className={cn(commonStyles.name, themeStyles.name)}>{mockUser.name}</h1>
        <p className={cn(commonStyles.bio, themeStyles.bio)}>{mockUser.bio}</p>
      </header>
      <main className={cn(commonStyles.content, themeStyles.content)} role="main" aria-labelledby="section-projects">
        <h2 id="section-projects" className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Active Projects</h2>
        <div className={cn(commonStyles.projectsList, themeStyles.projectsList)}>
          {mockProjects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Profile;
