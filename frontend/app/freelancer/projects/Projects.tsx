// @AI-HINT: This is the Freelancer Projects page. It allows freelancers to browse and search for jobs. All styles are per-component only.
'use client';

import React from 'react';
import ProjectCard from '@/app/components/ProjectCard/ProjectCard';
import Input from '@/app/components/Input/Input';
import Button from '@/app/components/Button/Button';
import './Projects.common.css';
import './Projects.light.css';
import './Projects.dark.css';

interface ProjectsProps {
  theme?: 'light' | 'dark';
}

const Projects: React.FC<ProjectsProps> = ({ theme = 'light' }) => {
  // Mock data for project listings
  const projects = [
    {
      title: 'AI Chatbot Integration',
      clientName: 'Innovate Inc.',
      budget: '$5,000',
      postedTime: '2 hours ago',
      tags: ['React', 'AI', 'NLP'],
    },
    {
      title: 'E-commerce Platform UI/UX',
      clientName: 'Shopify Plus Experts',
      budget: '$8,000',
      postedTime: '1 day ago',
      tags: ['UI/UX', 'Figma', 'Next.js'],
    },
    {
      title: 'Data Analytics Dashboard',
      clientName: 'DataDriven Co.',
      budget: '$12,000',
      postedTime: '3 days ago',
      tags: ['Python', 'Tableau', 'SQL'],
    },
    {
      title: 'Mobile App Backend (Node.js)',
      clientName: 'Appify',
      budget: '$7,500',
      postedTime: '5 days ago',
      tags: ['Node.js', 'Express', 'MongoDB'],
    },
  ];

  return (
    <div className={`Projects Projects--${theme}`}>
      <div className="Projects-container">
        <header className="Projects-header">
          <h1>Find Your Next Project</h1>
          <p>Browse thousands of jobs and find the perfect match for your skills.</p>
        </header>

        <div className="Projects-search-bar">
          <Input theme={theme} type="text" placeholder="Search by keyword (e.g., 'React', 'Python')" />
          <Button theme={theme} variant="primary">Search</Button>
        </div>

        <div className="Projects-list">
          {projects.map((project, index) => (
            <ProjectCard key={index} theme={theme} {...project} />
          ))}
        </div>

        {/* Add pagination controls here */}
      </div>
    </div>
  );
};

export default Projects;
