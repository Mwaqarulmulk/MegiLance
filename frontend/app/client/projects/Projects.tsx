// @AI-HINT: This is the 'My Projects' page for clients to view all their job postings. All styles are per-component only.
'use client';

import React from 'react';

import Button from '@/app/components/Button/Button';
import './Projects.common.css';
import './Projects.light.css';
import './Projects.dark.css';

interface ProjectsProps {
  theme?: 'light' | 'dark';
}

const Projects: React.FC<ProjectsProps> = ({ theme = 'light' }) => {
  // Mock data for client's projects
  const projects = [
    {
      id: '1',
      title: 'AI Chatbot Integration',
      status: 'In Progress',
      proposals: 12,
      hiredFreelancer: 'John D.',
    },
    {
      id: '2',
      title: 'Data Analytics Dashboard',
      status: 'Reviewing Proposals',
      proposals: 25,
      hiredFreelancer: null,
    },
    {
      id: '3',
      title: 'E-commerce Platform UI/UX',
      status: 'Completed',
      proposals: 8,
      hiredFreelancer: 'Mike R.',
    },
    {
      id: '4',
      title: 'Mobile App Backend (Node.js)',
      status: 'Open for Proposals',
      proposals: 5,
      hiredFreelancer: null,
    },
  ];

  return (
    <div className={`Projects Projects--${theme}`}>
      <div className="Projects-container">
        <header className="Projects-header">
          <h1>My Projects</h1>
          <p>View and manage all your job postings from one place.</p>
        </header>

        <div className="Projects-grid">
          {projects.map((project) => (
            <div key={project.id} className={`ClientProjectCard ClientProjectCard--${theme}`}>
              <h3 className="ClientProjectCard-title">{project.title}</h3>
              <div className={`ClientProjectCard-status status--${project.status.replace(/\s+/g, '-')}`}>
                {project.status}
              </div>
              <div className="ClientProjectCard-info">
                <p><strong>Proposals:</strong> {project.proposals}</p>
                {project.hiredFreelancer && <p><strong>Hired:</strong> {project.hiredFreelancer}</p>}
              </div>
              <div className="ClientProjectCard-actions">
                <Button theme={theme} variant="primary" size="small">View Details</Button>
                {project.status.includes('Proposals') && (
                  <Button theme={theme} variant="outline" size="small">Review Proposals</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
